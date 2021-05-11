/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	IGroup,
	DetailsList,
	FontIcon,
	Modal,
	IDropdownOption,
	IColumn,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useEffect, useCallback, useRef } from 'react'
import { updateRootLocationQualifiers } from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'
import AddQualifierForm from './AddQualiferForm'

import './QualifierPanel.scss'

export default observer(function QualifierPanel() {
	const {
		currentLanguage,
		isEditable,
		isDataRefreshing,
		repoFileData,
		breadCrumbs
	} = getAppStore()

	const [qualifierGroup, setQualifierGroup] = useState<IGroup[]>([])
	const [qualifierGroupItems, setQualifierGroupItems] = useState<any[]>([])
	const [
		isAddQualifierModalOpen,
		{ setTrue: openAddQualifierModal, setFalse: dismissAddQualifierModal },
	] = useBoolean(false)
	const formItem = useRef<any>(null)
	const rootLocationKey = useRef<string>(Object.keys(breadCrumbs)[0])

	useEffect(() => {
		if (repoFileData) {

			const groupKeys: any[] = []
			const questionItemKeys: any[] = []

			const tempQualifierGroup: IGroup[] = []
			const tempQualifierGroupItems: any[] = []

			const contentObj = repoFileData[rootLocationKey.current].strings.content
			const questionKeys = Object.keys(contentObj)
				.filter((k) => k.includes('eligibility.question/'))
				.sort((a, b) => (a > b ? 1 : -1))

			questionKeys.forEach((key) => {
				const questionGroupKey = key.split('/')[1].split('.')

				if (!groupKeys.includes(questionGroupKey[0])) {
					groupKeys.push(questionGroupKey[0])

					tempQualifierGroup.push({
						key: questionGroupKey[0],
						name: toProperCase(questionGroupKey[0]),
						startIndex: tempQualifierGroupItems.length,
						count: 1,
						isCollapsed: true,
					})
				} else {
					const groupIdx = tempQualifierGroup.findIndex(
						(obj) => obj.key === questionGroupKey[0]
					)
					tempQualifierGroup[groupIdx].count++
				}

				if (!questionItemKeys.includes(key)) {
					questionItemKeys.push(key)

					const smsKey = key.replace('.question/','.question.sms/')
					const voiceKey = key.replace('.question/','.question.voice/')

					tempQualifierGroupItems.push({
						key: key,
						label: contentObj[key][currentLanguage]
							? contentObj[key][currentLanguage]
							: `${t(
									'QualifierPanel.translationNotFound'
							)} (${currentLanguage})`,
						text: contentObj[key]?.[currentLanguage] || '',
						sms: contentObj[smsKey]?.[currentLanguage] || '',
						voice: contentObj[voiceKey]?.[currentLanguage] || '',
					})
				}
			})

			setQualifierGroup(tempQualifierGroup)
			setQualifierGroupItems(tempQualifierGroupItems)
		}
	}, [rootLocationKey, repoFileData, currentLanguage, setQualifierGroup, setQualifierGroupItems])

	const columns = [
		{
			key: 'questionColKey',
			name: t('QualifierPanel.columns.question'),
			fieldName: 'label',
			minWidth: 100,
			isResizable: false,
		},
		{
			key: 'editCol',
			name: '',
			fieldName: 'editQualifier',
			minWidth: 50,
			isResizable: false,
		},
	].filter((loc) => (isEditable ? true : loc.key !== 'editCol'))

	const onAddQualifierFormOpen = useCallback(
		(item?: any) => {
			formItem.current = item ?? null
			openAddQualifierModal()
		},
		[openAddQualifierModal, formItem]
	)

	const addQualifierSubmit = useCallback(
		(newQualifier) => {
			updateRootLocationQualifiers({
				rootLocationKey: rootLocationKey.current,
				newQualifier
			})
			setTimeout(() => dismissAddQualifierModal(), 100)
		},
		[dismissAddQualifierModal]
	)

	const onRenderItemColumn = useCallback(
		(item?: any, _index?: number, column?: IColumn) => {
			const fieldContent = item[column?.fieldName as keyof any] as string

			if (column?.key === 'editCol') {
				return isEditable ? (
					<FontIcon
						iconName="Edit"
						className="editIcon"
						onClick={() => onAddQualifierFormOpen(item)}
					/>
				) : null
			} else {
				return <span>{fieldContent}</span>
			}
		},
		[onAddQualifierFormOpen, isEditable]
	)

	const tagsOptions: IDropdownOption[] = qualifierGroup.map((tag) => {
		return {
			key: tag.key,
			text: tag.name,
		}
	})

	return (
		<div className="qualifierPanelContainer">
			<div className="panelHeader">
				<div className="panelHeaderTitle">{t('QualifierPanel.title')}</div>
			</div>
			<div className="panelBody">
				{!isDataRefreshing && (
					<section>
						{!!repoFileData[rootLocationKey.current]?.strings?.content && (
							<div className="searchRow">
								<div></div>
								<div
									className="addQualiferHeaderButton"
									onClick={() => onAddQualifierFormOpen(null)}
								>
									<FontIcon
										iconName="CircleAdditionSolid"
										className="addQualifierIcon"
									/>
									{t('QualifierPanel.addQualifierLabel')}
								</div>
							</div>
						)}
						{qualifierGroupItems.length > 0 ? (
							<DetailsList
								items={qualifierGroupItems}
								groups={qualifierGroup}
								columns={columns}
								groupProps={{
									showEmptyGroups: false,
								}}
								compact={true}
								isHeaderVisible={false}
								checkboxVisibility={2}
								className="qualifierGroupItem"
								onRenderItemColumn={onRenderItemColumn}
							/>
						) : (
							<div className="noQualifiers">No qualifiers available</div>
						)}
					</section>
				)}
			</div>
			<Modal
				isOpen={isAddQualifierModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}
			>
				<AddQualifierForm
					rootLocationKey={rootLocationKey.current}
					item={formItem.current}
					tagsOptions={tagsOptions}
					onSubmit={addQualifierSubmit}
					onCancel={dismissAddQualifierModal}
				/>
			</Modal>
		</div>
	)
})

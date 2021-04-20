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
import { updateGlobalQualifiers } from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'
import AddQualifierForm from './AddQualiferForm'

import './QualifierPanel.scss'

export default observer(function QualifierPanel() {
	const {
		globalFileData,
		currentLanguage,
		isEditable,
		isDataRefreshing,
	} = getAppStore()
	const [qualifierGroup, setQualifierGroup] = useState<IGroup[]>([])
	const [qualifierGroupItems, setQualifierGroupItems] = useState<any[]>([])
	const [
		isAddQualifierModalOpen,
		{ setTrue: openAddQualifierModal, setFalse: dismissAddQualifierModal },
	] = useBoolean(false)
	const formItem = useRef<any>(null)

	useEffect(() => {
		if (globalFileData?.customStrings) {
			const groupKeys: any[] = []
			const questionItemKeys: any[] = []

			const tempQualifierGroup: IGroup[] = []
			const tempQualifierGroupItems: any[] = []

			const contentObj = globalFileData.customStrings.content
			const questionKeys = Object.keys(contentObj)
				.filter((k) => k.includes('eligibility.question'))
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

					tempQualifierGroupItems.push({
						key: key,
						text: contentObj[key][currentLanguage]
							? contentObj[key][currentLanguage]
							: `${t(
									'QualifierPanel.translationNotFound'
							  )} (${currentLanguage})`,
					})
				}
			})

			setQualifierGroup(tempQualifierGroup)
			setQualifierGroupItems(tempQualifierGroupItems)
		}
	}, [globalFileData, currentLanguage, setQualifierGroup, setQualifierGroupItems])

	const columns = [
		{
			key: 'questionColKey',
			name: t('QualifierPanel.columns.question'),
			fieldName: 'text',
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
			updateGlobalQualifiers(newQualifier)
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
						{!!globalFileData?.customStrings?.content && (
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
					item={formItem.current}
					tagsOptions={tagsOptions}
					onSubmit={addQualifierSubmit}
					onCancel={dismissAddQualifierModal}
				/>
			</Modal>
		</div>
	)
})

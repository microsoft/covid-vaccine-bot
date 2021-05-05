/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	DetailsListLayoutMode,
	FontIcon,
	IColumn,
	Modal,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useEffect, useCallback, useRef } from 'react'
import { addPhase, updatePhase } from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getLocationPhaseData } from '../selectors/locationSelectors'
import { getAppStore } from '../store/store'
import { formatId } from '../utils/textUtils'

import './Locations.scss'
import PhaseForm from './PhaseForm'

export interface LocationsPhaseListProp {
	currentLocation: any
	onItemClicked?: (item: any) => void
}

export default observer(function LocationsPhaseList(
	props: LocationsPhaseListProp
) {
	const { currentLocation, onItemClicked } = props
	const state = getAppStore()
	const [phaseItemList, setPhaseItemList] = useState<any[]>([])
	const [
		isPhaseModalOpen,
		{ setTrue: openPhaseModal, setFalse: dismissPhaseModal },
	] = useBoolean(false)
	const selectedPhaseItem = useRef<any>(null)

	const phaseColumns = [
		{
			key: 'nameCol',
			name: t('LocationsRegions.PhaseOverview.columns.name'),
			fieldName: 'name',
			minWidth: 200,
			isResizable: false,
		},
		{
			key: 'qualCol',
			name: t('LocationsRegions.PhaseOverview.columns.qualifications'),
			fieldName: 'qualifications',
			minWidth: 200,
			isResizable: false,
		},
		{
			key: 'editCol',
			name: '',
			fieldName: 'editPhase',
			minWidth: 50,
			isResizable: false,
		},
	].filter((loc) => (state.isEditable ? true : loc.key !== 'editCol'))
	const activeText = t('App.active')

	useEffect(() => {
		if (currentLocation) {
			const newList = setInitialPhaseItems({
				key: currentLocation.info.content.id,
				value: currentLocation,
			}, activeText)
			setPhaseItemList(newList)
		}
	}, [currentLocation, setPhaseItemList, activeText])

	const onPhaseFormOpen = useCallback(
		(item?: any) => {
			selectedPhaseItem.current = item
			openPhaseModal()
		},
		[openPhaseModal]
	)

	const onRenderItemColumn = useCallback(
		(item?: any, _index?: number, column?: IColumn) => {
			if (!column) return null

			const fieldContent = item[column.fieldName as keyof any] as string

			if (column.key === 'editCol') {
				return state.isEditable ? (
					<span>
						<FontIcon
							iconName="Edit"
							className="editIcon"
							onClick={() => onPhaseFormOpen(item)}
						/>
					</span>
				) : null
			} else {
				return <span>{fieldContent}</span>
			}
		},
		[state.isEditable, onPhaseFormOpen]
	)

	const onPhaseFormSubmit = useCallback(
		(phaseData: any) => {
			dismissPhaseModal()
			const { activePhase } = getLocationPhaseData(currentLocation)
			let newList = []

			// Update Phase
			if (phaseData.phaseId) {
				const phaseId = phaseData.phaseId
					.toLowerCase()
					.replace(` (${t('LocationsRegions.active')})`, '')
					.trim()
									
				updatePhase(currentLocation, phaseId, phaseData.name)
			}
			// Add Phase
			else {
				addPhase({
					currentLocation,
					id: formatId(phaseData.name),
					label: phaseData.name,
				})
			}

			newList = generateUIPhaseList(
				currentLocation.vaccination.content.phases,
				activePhase, activeText
			)
			setPhaseItemList(newList)
		},
		[currentLocation, dismissPhaseModal, activeText]
	)

	return (
		<>
			<section className="LocationPhaseListComponent">
				<div className="locationPhaseOverviewSectionHeader">
					<div>{t('LocationsRegions.PhaseOverview.title')}</div>
					{state.isEditable && (
						<div
							className="addPhaseHeaderButton"
							onClick={() => onPhaseFormOpen()}
						>
							<FontIcon
								iconName="CircleAdditionSolid"
								style={{ color: '#0078d4' }}
							/>
							{t('LocationsRegions.PhaseOverview.AddPhaseButton')}
						</div>
					)}
				</div>
				{phaseItemList.length > 0 ? (
					<DetailsList
						items={phaseItemList}
						columns={phaseColumns}
						setKey="set"
						layoutMode={DetailsListLayoutMode.justified}
						checkboxVisibility={2}
						onItemInvoked={(item) => onItemClicked?.(item)}
						onRenderItemColumn={onRenderItemColumn}
						className="locationDetailsList"
					/>
				) : (
					<div className="emptyPhaseOverview">
						{t('LocationsRegions.PhaseOverview.empty')}
					</div>
				)}
			</section>
			<Modal
				isOpen={isPhaseModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}
			>
				<PhaseForm
					item={selectedPhaseItem.current}
					onCancel={dismissPhaseModal}
					onSubmit={onPhaseFormSubmit}
				/>
			</Modal>
		</>
	)
})

const setInitialPhaseItems = (currentLocation: any, activeText: string): any[] => {
	const result = getLocationPhaseData(currentLocation)
	return generateUIPhaseList(result.phases, result.activePhase, activeText)
}

const generateUIPhaseList = (phases: any[], activePhase: string, activeText: string) => {
	return phases.map((phase: any, idx: number) => {
		return {
			key: String(phase.id) + idx,
			keyId:
				String(phase.id) +
				(phase.id === activePhase ? ` (${activeText})` : ''),
			name:
				(phase.label || phase.id) +
				(phase.id === activePhase ? ` (${activeText})` : ''),
			qualifications: phase.qualifications.length,
			value: phase,
			isNew: false,
		}
	})
}

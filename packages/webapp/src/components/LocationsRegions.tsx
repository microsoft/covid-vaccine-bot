/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	DetailsListLayoutMode,
	IColumn,
	FontIcon,
	Modal,
	SearchBox,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useRef, useEffect, useCallback } from 'react'
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'
import LocationForm from './LocationForm'
import LocationsPhases from './LocationsPhases'
import PhaseForm from './PhaseForm'
import { updateLocationList, addPhase, updatePhase } from '../mutators/repoMutators'

import './Locations.scss'

export interface LocationsRegionsProp {
	selectedState: any
	onNavigateBack: () => void
}

export default observer(function LocationsRegions(props: LocationsRegionsProp) {
	const [filteredRegionsList, setFilteredRegionsList] = useState<any[]>([])
	const stateRegionsFullList = useRef<any[]>([])
	const [selectedPhaseItem, setSelectedPhaseItem] = useState<{
		isRegion: boolean
		value: any
		selectedState: any
	}>({ isRegion: false, value: null, selectedState: null })
	const [isLocationModalOpen, { setTrue: openLocationModal, setFalse: dismissLocationModal }] = useBoolean(
		false
	)
	const [isPhaseModalOpen, { setTrue: openPhaseModal, setFalse: dismissPhaseModal }] = useBoolean(
		false
	)
	const selectedModalFormItem = useRef<any>(null)

	const state = getAppStore()

	const { selectedState, onNavigateBack } = props

	const subLocationsColumns = [
		{
			key: 'regionCol',
			name: 'Region',
			fieldName: 'name',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'activePhaseCol',
			name: 'Active Phase ID',
			fieldName: 'phase',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'editCol',
			name: '',
			fieldName: 'editLocation',
			minWidth: 50,
			isResizable: false,
		},
	].filter((loc) => (state.isEditable ? true : loc.key !== 'editCol'))

	const phaseColumns = [
		{
			key: 'idCol',
			name: 'Phase ID',
			fieldName: 'keyId',
			minWidth: 50,
			maxWidth: 200,
			isResizable: false,
		},
		{
			key: 'nameCol',
			name: 'Name',
			fieldName: 'name',
			minWidth: 200,
			isResizable: false,
		},
		{
			key: 'qualCol',
			name: '# of qualifications',
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
		}
	].filter(loc => state.isEditable ? true : loc.key !== 'editCol')

	const [phaseItemList, setPhaseItemList] = useState<any[]>([])

	useEffect(() => {
		const selectedStateObj = state.repoFileData[selectedState.key]
		const regions = selectedStateObj?.regions ?? {}
		if (Object.keys(regions).length > 0) {
			const tempList: any[] = []
			Object.entries(regions).forEach(([key, value]) => {
				const valObj = value as any
				tempList.push({
					key: key,
					name: toProperCase(key),
					value: value,
					phase: valObj.vaccination.content.activePhase
						? valObj.vaccination.content.activePhase
						: selectedStateObj.vaccination.content.activePhase,
				})
			})
			setFilteredRegionsList(tempList)
			stateRegionsFullList.current = tempList
		}

		if (selectedStateObj) {
			const newList = setInitialPhaseItems({key: selectedStateObj.info.content.id ,value: selectedStateObj})
			setPhaseItemList(newList)
		}
	}, [state.repoFileData, selectedState, stateRegionsFullList, setInitialPhaseItems, setPhaseItemList])

	const selectedPhase = useCallback(
		(isRegion: boolean, value: any) => {
			setSelectedPhaseItem({ isRegion, value, selectedState })
		},
		[selectedState]
	)

	const onLocationFormSubmit = useCallback(
		(locationData) => {
			dismissLocationModal()
			updateLocationList(locationData, true, selectedState)
		},
		[dismissLocationModal, selectedState]
	)

	const onLocationFormOpen = useCallback((item?: any) => {
		selectedModalFormItem.current = item ?? null
		openLocationModal()
	},[openLocationModal])

	const onRenderItemColumn = useCallback(
		(item?: any, _index?: number, column?: IColumn) => {
			const fieldContent = item[column?.fieldName as keyof any] as string

			if (column?.key === 'editCol') {
				return state.isEditable ? (
					<FontIcon
						iconName="Edit"
						className="editIcon"
						onClick={() =>
							column?.fieldName === 'editLocation'
							? onLocationFormOpen(item)
							: onPhaseFormOpen(item)}
					/>) : null
		} else {
			return <span>{fieldContent}</span>;
		}
	},[onLocationFormOpen, state.isEditable])


	const onRegionFilter = useCallback(
		(_event: any, text?: string | undefined) => {
			if (text) {
				setFilteredRegionsList(
					stateRegionsFullList.current.filter(
						(region) => region.name.toLowerCase().indexOf(text) > -1
					)
				)
			} else {
				setFilteredRegionsList(stateRegionsFullList.current)
			}
		},
		[stateRegionsFullList]
	)

	const onPhaseFormSubmit =  	(phaseData:any) => {
	 		dismissPhaseModal()

	 		if(phaseData.phaseId){
	 			updatePhase({
				locationKey: selectedState.key,
				item: phaseData,
			})
	 		} else {
	 			addPhase({
				locationKey: selectedState.key,
				item: phaseData,
			})
	 		}

	 		

	 }

	const onPhaseFormOpen = useCallback((item?: any) => {
		selectedModalFormItem.current = item ?? null
		openPhaseModal()
	},[openPhaseModal])

	return (
		<div className="bodyContainer">
			<div className="bodyHeader subContent">
				<div className="bodyHeaderTitle">
					<div className="breadCrumbs">
						<span className="crumbLink" onClick={onNavigateBack}>
							/ Locations{' '}
						</span>
						{selectedPhaseItem.value ? (
							<>
								<span
									className="crumbLink"
									onClick={() =>
										setSelectedPhaseItem({
											isRegion: false,
											value: null,
											selectedState: null,
										})
									}
								>
									/ {selectedState.text + ' '}
								</span>
								{selectedPhaseItem.isRegion ? (
									<>/ {selectedPhaseItem.value.name}</>
								) : (
									<>/ Phase Overview</>
								)}
							</>
						) : (
							<>/ {selectedState.text}</>
						)}
					</div>
					<div className="mainTitle">
						{selectedPhaseItem.value ? (
							<>
								{selectedPhaseItem.isRegion ? (
									<>{selectedPhaseItem.value.name} Region Phase Overview</>
								) : (
									<>{selectedState.text} Phase Overview</>
								)}
							</>
						) : (
							<>{selectedState.text}</>
						)}
					</div>
				</div>
			</div>
			{selectedPhaseItem.value ? (
				<div className="bodyContent">
					<section>
						<LocationsPhases
							isRegion={selectedPhaseItem.isRegion}
							value={selectedPhaseItem.value}
							selectedState={selectedState}
						/>
					</section>
				</div>
			) : (
				<div className="bodyContent">
					<section>
						<div className="listTitle">Phases</div>
						<div className="searchRow">
							<div></div>
							{state.isEditable && (
								<div className="addLocationHeaderButton" onClick={() => onPhaseFormOpen(null)}>
									<FontIcon
										iconName="CircleAdditionSolid"
										style={{ color: '#0078d4' }}
									/>
									Add Phase
								</div>
							)}
						</div>
						{selectedState.value.vaccination.content.phases && selectedState.value.vaccination.content.phases.length > 0 ? (
							<DetailsList
								items={phaseItemList}
								columns={phaseColumns}
								setKey="set"
								layoutMode={DetailsListLayoutMode.justified}
								checkboxVisibility={2}
								onItemInvoked={(item) => selectedPhase(false, item)}
								onRenderItemColumn={onRenderItemColumn}
								className="locationDetailsList"
							/>
						) : (
							<div>No phases available at this time.</div>
						)}
					</section>
					<section>
						<div className="listTitle">Sublocation</div>
						<div className="searchRow">
							{stateRegionsFullList.current.length > 0 ? (
								<SearchBox
									styles={{ root: { width: 400 } }}
									placeholder="Search"
									onChange={(ev, text) => onRegionFilter(ev, text)}
								/>
							): (
								<div></div>
							)}
							{state.isEditable && (
								<div
									className="addLocationHeaderButton"
									onClick={() => onLocationFormOpen(null)}
								>
									<FontIcon
										iconName="CircleAdditionSolid"
										style={{ color: '#0078d4' }}
									/>
									Add Sublocation
								</div>
							)}
						</div>
						{stateRegionsFullList.current.length > 0 ? (
							<DetailsList
								items={filteredRegionsList}
								columns={subLocationsColumns}
								setKey="set"
								layoutMode={DetailsListLayoutMode.justified}
								selectionPreservedOnEmptyClick={true}
								ariaLabelForSelectionColumn="Toggle selection"
								ariaLabelForSelectAllCheckbox="Toggle selection for all items"
								checkButtonAriaLabel="Row checkbox"
								checkboxVisibility={2}
								onItemInvoked={(item) => selectedPhase(true, item)}
								onRenderItemColumn={onRenderItemColumn}
								className="locationDetailsList"
							/>
						) : (
							<div>No regions available at this time.</div>
						)}
					</section>
				</div>
			)}
			<Modal
				isOpen={isLocationModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}>
					<LocationForm
						item={selectedModalFormItem.current}
						onCancel={dismissLocationModal}
						onSubmit={onLocationFormSubmit}
						isRegion={true}
					/>
			</Modal>
			<Modal
				isOpen={isPhaseModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}>
					<PhaseForm
						item={selectedModalFormItem.current}
						onCancel={dismissPhaseModal}
						onSubmit={onPhaseFormSubmit}
					/>
			</Modal>
		</div>
	)
})

const setInitialPhaseItems = (selectedState: any): any[] => {
	if(!selectedState.value.vaccination.content.phases){
		return []
	}
	return selectedState.value.vaccination.content.phases.map(
		(phase: any, idx: number) => {
			const activePhase: string =
				selectedState.value.vaccination.content.activePhase
			return {
				key: String(phase.id) + idx,
				keyId: String(phase.id) + (phase.id === activePhase ? ' (active)' : ''),
				name:
					toProperCase(phase.label ?? phase.id) +
					(phase.id === activePhase ? ' (active)' : ''),
				qualifications: phase.qualifications.length,
				value: phase,
				isNew: false,
			}
		}
	)
}

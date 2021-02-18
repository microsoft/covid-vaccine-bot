/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { DetailsList, DetailsListLayoutMode } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useState, useRef, useEffect, useCallback } from 'react'
import { toProperCase } from '../utils/textUtils'
import LocationsPhases from './LocationsPhases'

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
	]

	const phaseColumns = [
		{
			key: 'idCol',
			name: 'Phase ID',
			fieldName: 'key',
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
	]

	useEffect(() => {
		if (selectedState?.regions > 0) {
			const tempList: any[] = []
			Object.entries(selectedState.value.regions).forEach(([key, value]) => {
				const valObj = value as any
				tempList.push({
					key: key,
					name: toProperCase(key),
					value: value,
					phase: valObj.vaccination.content.activePhase
						? valObj.vaccination.content.activePhase
						: selectedState.value.vaccination.content.activePhase,
				})
			})
			setFilteredRegionsList(tempList)
			stateRegionsFullList.current = tempList
		}
	}, [selectedState, stateRegionsFullList])

	const phaseItems: any[] = selectedState.value.vaccination.content.phases.map(
		(phase: any) => {
			const activePhase: string =
				selectedState.value.vaccination.content.activePhase
			return {
				key: String(phase.id) + (phase.id === activePhase ? ' (active)' : ''),
				name:
					toProperCase(phase.label ?? phase.id) +
					(phase.id === activePhase ? ' (active)' : ''),
				qualifications: phase.qualifications.length,
				value: phase,
			}
		}
	)

	const selectedPhase = useCallback(
		(isRegion: boolean, value: any) => {
			setSelectedPhaseItem({ isRegion, value, selectedState })
		},
		[selectedState]
	)

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
						{selectedState.value.vaccination.content.phases.length > 0 ? (
							<DetailsList
								items={phaseItems}
								columns={phaseColumns}
								setKey="set"
								layoutMode={DetailsListLayoutMode.justified}
								checkboxVisibility={2}
								onItemInvoked={(item) => selectedPhase(false, item)}
							/>
						) : (
							<div>No phases available at this time.</div>
						)}
					</section>

					<section>
						{selectedState.regions > 0 ? (
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
							/>
						) : (
							<div>No regions available at this time.</div>
						)}
					</section>
				</div>
			)}
		</div>
	)
})

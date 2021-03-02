/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	DetailsListLayoutMode,
	ProgressIndicator,
	FontIcon,
	Modal,
	IColumn,
	SearchBox,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useRef, useEffect, useCallback } from 'react'
import { getAppStore } from '../store/store'
import LocationForm from './LocationForm'
import { updateLocationList } from '../mutators/repoMutators'

import './Locations.scss'

export interface LocationsStatesProp {
	onSelectedItem: (item: any) => void
}

export default observer(function LocationsStates(props: LocationsStatesProp) {
	const { onSelectedItem } = props

	const [
		isLocationModalOpen,
		{ setTrue: openLocationModal, setFalse: dismissLocationModal },
	] = useBoolean(false)
	const [filteredStateList, setFilteredStateList] = useState<any[]>([])
	const stateRepoFullList = useRef<any[]>([])
	const selectedLocationItem = useRef<any>(null)

	const state = getAppStore()

	const locationColumns = [
		{
			key: 'stateCol',
			name: 'State',
			fieldName: 'text',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'regionCol',
			name: 'Sublocations',
			fieldName: 'regions',
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

	useEffect(() => {
		if (state.repoFileData) {
			const tempList: any[] = []
			Object.entries(state.repoFileData).forEach(([key, value]: [string, any]) => {
				const stateId = value?.info?.content.id
				const stateNames = state?.globalFileData?.cdcStateNames.content

				const stateLabel =
					stateNames[`cdc/${stateId}/state_name`] &&
					stateNames[`cdc/${stateId}/state_name`][state.currentLanguage] &&
					stateNames[`cdc/${stateId}/state_name`][
						state.currentLanguage
					].trim() !== ''
						? stateNames[`cdc/${stateId}/state_name`][state.currentLanguage]
						: `*Translation Not Found* (${stateId})`

				tempList.push({
					key: key,
					text: stateLabel,
					regions: value?.regions ? Object.keys(value.regions).length : 0,
					value: value,
				})
			})
			setFilteredStateList(tempList)
			stateRepoFullList.current = tempList
		}
	}, [state.repoFileData, state.globalFileData, state.currentLanguage, stateRepoFullList])

	const onStateFilter = useCallback(
		(_event: any, text?: string | undefined) => {
			if (text) {
				setFilteredStateList(
					stateRepoFullList.current.filter(
						(state) => state.text.toLowerCase().indexOf(text) > -1
					)
				)
			} else {
				setFilteredStateList(stateRepoFullList.current)
			}
		},
		[stateRepoFullList]
	)

	const openSelection = useCallback(
		(item: any) => {
			onSelectedItem(item)
		},
		[onSelectedItem]
	)

	const onLocationFormSubmit = useCallback(
		(locationData) => {
			console.log(locationData)
			// dismissLocationModal()
			// updateLocationList(locationData, false)
		},
		[dismissLocationModal]
	)

	const onLocationFormOpen = useCallback(
		(item?: any) => {
			selectedLocationItem.current = item ?? null
			openLocationModal()
		},
		[openLocationModal]
	)

	const onRenderItemColumn = useCallback(
		(item?: any, _index?: number, column?: IColumn) => {
			const fieldContent = item[column?.fieldName as keyof any] as string

			if (column?.key === 'editCol') {
				return state.isEditable ? (
					<FontIcon
						iconName="Edit"
						className="editIcon"
						onClick={() => onLocationFormOpen(item)}
					/>
				) : null
			} else {
				return <span>{fieldContent}</span>
			}
		},
		[onLocationFormOpen, state.isEditable]
	)

	return (
		<div className="bodyContainer">
			<div className="bodyHeader">
				<div className="bodyHeaderTitle">
					<div className="breadCrumbs">/ Locations</div>
					<div className="mainTitle">Locations</div>
				</div>
			</div>
			<div className="bodyContent">
				{state.repoFileData ? (
					<section>
						<div className="searchRow">
							<SearchBox
								styles={{ root: { width: 400 } }}
								placeholder="Search"
								onChange={(ev, text) => onStateFilter(ev, text)}
							/>
							{state.isEditable && (
								<div
									className="addLocationHeaderButton"
									onClick={() => onLocationFormOpen(null)}
								>
									<FontIcon
										iconName="CircleAdditionSolid"
										style={{ color: '#0078d4' }}
									/>
									Add Location
								</div>
							)}
						</div>
						<DetailsList
							items={filteredStateList}
							columns={locationColumns}
							setKey="set"
							layoutMode={DetailsListLayoutMode.justified}
							selectionPreservedOnEmptyClick={true}
							ariaLabelForSelectionColumn="Toggle selection"
							ariaLabelForSelectAllCheckbox="Toggle selection for all items"
							checkButtonAriaLabel="Row checkbox"
							checkboxVisibility={2}
							onItemInvoked={openSelection}
							onRenderItemColumn={onRenderItemColumn}
							className="locationDetailsList"
						/>
					</section>
				) : (
					<section>
						<ProgressIndicator description="Loading content..." />
					</section>
				)}
			</div>
			<Modal
				isOpen={isLocationModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}
			>
				<LocationForm
					item={selectedLocationItem.current}
					onCancel={dismissLocationModal}
					onSubmit={onLocationFormSubmit}
				/>
			</Modal>
		</div>
	)
})

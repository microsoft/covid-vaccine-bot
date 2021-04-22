/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	DetailsListLayoutMode,
	FontIcon,
	Modal,
	IColumn,
	SearchBox,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
	addLocation,
	updateLocationData,
	deleteLocation,
} from '../mutators/repoMutators'
import {
	getCustomString,
} from '../selectors/locationSelectors'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'
import DeleteLocationForm from './DeleteLocationForm'
import LocationForm from './LocationForm'

import './Locations.scss'

export interface LocationsStatesProp {
	locationList: any
	currentLocation:any
	onSelectedItem: (item: any) => void
}

export default observer(function LocationsStates(props: LocationsStatesProp) {
	const { onSelectedItem, locationList, currentLocation } = props

	const [
		isLocationModalOpen,
		{ setTrue: openLocationModal, setFalse: dismissLocationModal },
	] = useBoolean(false)
	const [
		isDeleteLocationModalOpen,
		{ setTrue: openDeleteLocationModal, setFalse: dismissDeleteLocationModal },
	] = useBoolean(false)
	const [filteredStateList, setFilteredStateList] = useState<any[]>([])
	const stateRepoFullList = useRef<any[]>([])
	const selectedLocationItem = useRef<any>(null)
	const selectedLocationPath = useRef<any>(null)

	const state = getAppStore()

	const filterEditable = (col: any) => {
		if (state.isEditable) return true
		else return col.key !== 'editCol' && col.key !== 'delete'
	}
	const locationColumns = [
		{
			key: 'stateCol',
			name: t('LocationsStates.locationColumns.text'),
			fieldName: 'text',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'regionCol',
			name: t('LocationsStates.locationColumns.regions'),
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
	].filter(filterEditable)

	useEffect(() => {
		if (locationList) {
			const nextFilteredStateList: any[] = []
			Object.entries(locationList).forEach(([locKey, locDetails]: [string, any]) => {
				const locationName = getCustomString(locDetails, locDetails.info.content.name) || toProperCase(locDetails.info.content.name)
				nextFilteredStateList.push({
					key: locKey,
					text: locationName,
					regions: locDetails?.regions ? Object.keys(locDetails.regions).length : 0,
					value: locDetails
				})
			})
			setFilteredStateList(nextFilteredStateList)
			stateRepoFullList.current = nextFilteredStateList
		}
	},[locationList, state.currentLanguage, state.repoFileData ])

	const onStateFilter = useCallback(
		(_event: any, text?: string) => {
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
		(locationFormData, prevItem, initPath) => {
			dismissLocationModal()

			if(prevItem){
				updateLocationData(locationFormData, initPath )
			} else {
				addLocation(locationFormData, initPath)
			}
		},
		[dismissLocationModal]
	)

	const onDeleteLocationFormSubmit = useCallback(
		(locationData) => {
			dismissDeleteLocationModal()
			deleteLocation(locationData)
		},
		[dismissDeleteLocationModal]
	)

	const onLocationFormOpen = useCallback(
		(item?: any) => {
			selectedLocationItem.current = item?.value
			selectedLocationPath.current = item?.value.info.path ?? currentLocation?.info.path
			openLocationModal()
		},
		[openLocationModal, currentLocation]
	)

	const onLocationDeleteFormOpen = useCallback(
		(item?: any) => {
			selectedLocationItem.current = item ?? null
			openDeleteLocationModal()
		},
		[openDeleteLocationModal]
	)

	const onRenderItemColumn = useCallback(
		(item?: any, _index?: number, column?: IColumn) => {
			if (!column) return null

			const fieldContent = item[column.fieldName as keyof any] as string

			if (column.key === 'editCol') {
				return state.isEditable ? (
					<span>
						<FontIcon
							iconName="Cancel"
							className="deleteIcon"
							onClick={() => onLocationDeleteFormOpen(item)}
						/>
						<FontIcon
							iconName="Edit"
							className="editIcon"
							onClick={() => onLocationFormOpen(item)}
						/>
					</span>
				) : null
			} else {
				return <span>{fieldContent}</span>
			}
		},
		[onLocationFormOpen, onLocationDeleteFormOpen, state.isEditable]
	)

	return (
		<>
			<section className="LocationsStatesComponent">
				<div className="locationsStatesSectionHeader">
					<div>
						{t('LocationsRegions.Sublocations.title')}
					</div>
					{state.isEditable && (
						<div
							className="addLocationHeaderButton"
							onClick={() => onLocationFormOpen(null)}
						>
							<FontIcon
								iconName="CircleAdditionSolid"
								style={{ color: '#0078d4' }}
							/>
							{t('LocationsStates.addLocation')}
						</div>
					)}
				</div>
				<div className="searchRow">
					<SearchBox
						styles={{ root: { width: 400 } }}
						placeholder={t('LocationsStates.SearchBox.placeholder')}
						onChange={(ev, text) => onStateFilter(ev, text)}
					/>
				</div>
				<DetailsList
					items={filteredStateList}
					columns={locationColumns}
					setKey="set"
					layoutMode={DetailsListLayoutMode.justified}
					selectionPreservedOnEmptyClick={true}
					ariaLabelForSelectionColumn={t('LocationsStates.addLocation')}
					ariaLabelForSelectAllCheckbox={t('LocationsStates.addLocation')}
					checkButtonAriaLabel={t('LocationsStates.addLocation')}
					checkboxVisibility={2}
					onItemInvoked={openSelection}
					onRenderItemColumn={onRenderItemColumn}
					className="locationDetailsList"
				/>
			</section>
			<Modal
				isOpen={isLocationModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}
			>
				<LocationForm
					currentLocation={selectedLocationItem.current}
					currentPath={selectedLocationPath.current}
					onCancel={dismissLocationModal}
					onSubmit={onLocationFormSubmit}
				/>
			</Modal>
			<Modal
				isOpen={isDeleteLocationModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}
			>
				<DeleteLocationForm
					location={selectedLocationItem.current}
					onCancel={dismissDeleteLocationModal}
					onSubmit={onDeleteLocationFormSubmit}
				/>
			</Modal>
		</>
	)
})

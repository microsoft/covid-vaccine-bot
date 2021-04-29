/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { MessageBar, ProgressIndicator } from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useEffect } from 'react'
import { getLocationData } from '../actions/repoActions'
import {
	addPhaseOverviewCrumb,
	deleteCrumbs,
	setBreadcrumbs,
	updatePhaseOverviewTitle,
} from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getCustomString } from '../selectors/locationSelectors'
import { getAppStore } from '../store/store'
import { pathFind } from '../utils/dataUtils'
import { toProperCase } from '../utils/textUtils'
import LocationDetails from './LocationDetails'
import LocationPhaseList from './LocationPhaseList'
import LocationPhaseQualifiers from './LocationPhaseQualifiers'
import LocationsBreadcrumbs from './LocationsBreadcrumbs'
import LocationStates from './LocationsStates'

import './Locations.scss'
import { getParentLocationData, isPhaseDataOverridden } from '../selectors/phaseSelectors'

export default observer(function LocationsV2() {
	const {
		isDataRefreshing,
		repoFileData,
		currentLanguage,
		breadCrumbs,
	} = getAppStore()
	const [currentLocationList, setCurrentLocationList] = useState<any>(
		repoFileData
	)
	const [currentLocation, setCurrentLocation] = useState<any>()
	const [
		isPhaseSelected,
		{ setTrue: showPhaseComponent, setFalse: hidePhaseComponent },
	] = useBoolean(false)
	const [currentLocationTitle, setCurrentLocationTitle] = useState<
		string | null
	>(null)

	const phaseOverviewText = t('LocationsRegions.PhaseOverview.title')

	const updateCurrentLocation = useCallback(() => {
		if (currentLocation) {
			const locationName =
				getCustomString(currentLocation, currentLocation.info.content.name) ||
				toProperCase(currentLocation.info.content.name)
			let newTitle = locationName

			if (breadCrumbs.phase_overview) {
				newTitle = `${locationName} ${phaseOverviewText}`
				updatePhaseOverviewTitle(newTitle)
			}
			currentLocation?.regions
				? setCurrentLocationList(currentLocation.regions)
				: setCurrentLocationList([])
			setCurrentLocationTitle(newTitle as string)
		} else {
			setBreadcrumbs(undefined)
			setCurrentLocationTitle(null)
		}
	}, [currentLocation, breadCrumbs.phase_overview, phaseOverviewText])

	useEffect(() => {
		updateCurrentLocation()
	}, [currentLocation, currentLanguage, breadCrumbs.phase_overview, phaseOverviewText, repoFileData, updateCurrentLocation])

	const getLocationsData = useCallback(
		async (item: any) => {
			const pathArray = item.value.info.path.split('/')
			pathArray.splice(-1, 1)

			const currLocation = pathFind(repoFileData, pathArray)

			if (currLocation?.regions) {
				for (const value of Object.values(currLocation?.regions)) {
					const location = value as any
					if (
						!location.info.content ||
						!location.strings.content ||
						!location.vaccination.content
					) {
						await getLocationData(location)
					}
					setCurrentLocationList(currLocation.regions)
				}
			} else {
				setCurrentLocationList([])
			}
			setCurrentLocation(currLocation)
			setBreadcrumbs(currLocation)
		},
		[repoFileData]
	)

	const navigateBack = useCallback(
		(item: any) => {
			if (item === 'root') {
				setCurrentLocationList(repoFileData)
				setCurrentLocation(null)
				setBreadcrumbs(undefined)
				setCurrentLocationTitle(null)
			} else {
				deleteCrumbs(item)
				getLocationsData(item)
			}

			hidePhaseComponent()
		},
		[getLocationsData, repoFileData, hidePhaseComponent]
	)

	const openPhaseItem = useCallback(() => {
		addPhaseOverviewCrumb(currentLocation)
		showPhaseComponent()
	}, [showPhaseComponent, currentLocation])

	let locationName = 'this'
	let parentLocationName = 'the parent location'
	if (currentLocation?.info) {
		const parentData = getParentLocationData(currentLocation)
		locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)

		if (parentData?.info) {
			parentLocationName = getCustomString(parentData, parentData.info.content.name) || toProperCase(parentData.info.content.name)
		}
	}
	return (
		<div className="locationPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<LocationsBreadcrumbs
							breadcrumbs={breadCrumbs}
							currentLocationTitle={currentLocationTitle}
							navigateBack={navigateBack}
						/>
					</div>
				</div>
				<div className="bodyContent">
					{!isDataRefreshing ? (
						!isPhaseSelected ? (
							<>
								{currentLocation && (
									<>
										{Object.keys(breadCrumbs).length > 1 && (
											<MessageBar messageBarType={5}>
											{isPhaseDataOverridden(currentLocation) ? (
												<div>
													Phase information below is specific to {locationName} only.
												</div>
											):(
												<div>
													Currently adopting the phase information of {parentLocationName}. Applying changes will make the phase data specific to {locationName} only.
												</div>
											)}
										</MessageBar>
										)}
										<LocationDetails currentLocation={currentLocation} />
										<LocationPhaseList
											currentLocation={currentLocation}
											onItemClicked={openPhaseItem}
										/>
									</>
								)}
								<LocationStates
									currentLocation={currentLocation}
									locationList={currentLocationList}
									onSelectedItem={(item) => getLocationsData(item)}
								/>
							</>
						) : (
							<LocationPhaseQualifiers currentLocation={currentLocation} />
						)
					) : (
						<section>
							<ProgressIndicator description={t('LocationsStates.loading')} />
						</section>
					)}
				</div>
			</div>
		</div>
	)
})

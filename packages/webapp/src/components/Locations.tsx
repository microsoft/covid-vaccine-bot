/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ProgressIndicator } from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useEffect } from 'react'
import { loadAllLocationData } from '../actions/repoActions'
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
import LocationPhaseOverrideBar from './LocationPhaseOverrideBar'
import LocationPhaseQualifiers from './LocationPhaseQualifiers'
import LocationsBreadcrumbs from './LocationsBreadcrumbs'
import LocationStates from './LocationsStates'

import './Locations.scss'

export default observer(function Locations() {
	const {
		isDataRefreshing,
		repoFileData,
		currentLanguage,
		breadCrumbs,
	} = getAppStore()

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
				getCustomString(
					currentLocation,
					currentLocation?.info?.content?.name
				) || toProperCase(currentLocation?.info?.content?.id)
			let newTitle = locationName

			if (breadCrumbs.phase_overview) {
				newTitle = `${locationName} ${phaseOverviewText}`
				updatePhaseOverviewTitle(newTitle)
			}
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
			if (pathArray.length === 1 && !currLocation.dataLoaded) {
				loadAllLocationData(currLocation)
			}

			setCurrentLocation(currLocation)
			setBreadcrumbs(currLocation)
		},
		[repoFileData]
	)

	const navigateBack = useCallback(
		(item: any) => {
			if (item === 'root') {
				setCurrentLocation(null)
				setBreadcrumbs(undefined)
				setCurrentLocationTitle(null)
			} else {
				deleteCrumbs(item)
				getLocationsData(item)
			}

			hidePhaseComponent()
		},
		[getLocationsData, hidePhaseComponent]
	)

	const openPhaseItem = useCallback(() => {
		addPhaseOverviewCrumb(currentLocation)
		showPhaseComponent()
	}, [showPhaseComponent, currentLocation])

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
										<LocationPhaseOverrideBar
											currentLocation={currentLocation}
											breadcrumbs={breadCrumbs}
										/>
										<LocationDetails currentLocation={currentLocation} />
										<LocationPhaseList
											currentLocation={currentLocation}
											onItemClicked={openPhaseItem}
										/>
									</>
								)}
								<LocationStates
									currentLocation={currentLocation}
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

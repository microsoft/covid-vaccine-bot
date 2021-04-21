/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import {
	ProgressIndicator
} from '@fluentui/react'
import { getText as t } from '../selectors/intlSelectors'
import LocationDetails from './LocationDetails'
import LocationStates from './LocationsStates'
import LocationPhaseList from './LocationPhaseList'
import LocationsBreadcrumbs from './LocationsBreadcrumbs'
import LocationPhaseQualifiers from './LocationPhaseQualifiers'
import { getAppStore } from '../store/store'
import { useCallback, useState, useRef, useEffect } from 'react'
import { getLocationData } from '../actions/repoActions'
import { pathFind } from '../utils/dataUtils'
import { useBoolean } from '@uifabric/react-hooks'
import { getCustomString } from '../selectors/locationSelectors'

import './Locations.scss'
import { toProperCase } from '../utils/textUtils'

export default observer(function LocationsV2() {

	const { isDataRefreshing, repoFileData, currentLanguage } = getAppStore()
	const [ currentLocationList, setCurrentLocationList ] = useState<any>(repoFileData)
	const [ currentLocation, setCurrentLocation ] = useState<any>()
	const [ breadcrumbs, setBreadcrumbs ] = useState<any>({})
	const [ isPhaseSelected, { setTrue: showPhaseComponent, setFalse: hidePhaseComponent }] = useBoolean(
		false
	)
	const [ currentLocationTitle, setCurrentLocationTitle ] = useState<string| null>(null)

	useEffect(() => {
		if (currentLocation) {
			if (breadcrumbs?.phase_overview) {
				const locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)
				const phase_overview_crumbs = {
					...breadcrumbs,
					[currentLocation.info.content.id]: {
						value: currentLocation
					},
					phase_overview: {
						value: {
							info: {
								content: {
									name: `${locationName} Phase Overview`
								},
								path: currentLocation.info.path.replace('info.json', 'regions/phase_overview/info.json')
							}
						}
					}
				}
				setBreadcrumbs(phase_overview_crumbs)
				setCurrentLocationTitle(phase_overview_crumbs.phase_overview.value.info.content.name)
			} else {
				const locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)
				setCurrentLocationTitle(locationName as string)
			}
		}
	},[currentLocation, currentLanguage])

	const getLocationsData = useCallback(async (item: any) => {
		const pathArray = item.value.info.path.split("/")
		pathArray.splice(-1,1)

		const currLocation = pathFind(repoFileData, pathArray)

		if (currLocation?.regions) {
			for (const [key, value] of Object.entries(currLocation?.regions)) {
				const location = value as any
				if(!location.info.content || !location.strings.content || !location.vaccination.content )
				{
					await getLocationData(location)
				}
				setCurrentLocationList(currLocation.regions)
			}
		} else {
			setCurrentLocationList([])
		}
		setCurrentLocation(currLocation)
		setBreadcrumbs((crumbs: any) => ({...crumbs, [currLocation.info.content.id]: {value: currLocation}}))
	},[repoFileData])

	const navigateBack = useCallback((item: any) => {
		if (item === 'root') {
			setCurrentLocationList(repoFileData)
			setCurrentLocation(null)
			setBreadcrumbs({})
			setCurrentLocationTitle(null)
		} else {
			const pathArray = item.value.info.path.split("/")
			pathArray.splice(-1,1)
			pathArray.push("regions")
			const parentPath = pathArray.join("/")
			const newCrumbs = {...breadcrumbs}
			for (const item in newCrumbs) {
				if (newCrumbs[item].value.info.path.startsWith(parentPath)) {
					delete newCrumbs[item]
				}
			}
			setBreadcrumbs(newCrumbs)
			getLocationsData(item)

			const locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)
			setCurrentLocationTitle(locationName as string)
		}

		hidePhaseComponent()
	},[breadcrumbs, getLocationsData, repoFileData, hidePhaseComponent, currentLocation])

	const openPhaseItem = useCallback((item: any) => {
		const locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)
		const phase_overview_crumbs = {
			...breadcrumbs,
			[currentLocation.info.content.id]: {
				value: currentLocation
			},
			phase_overview: {
				value: {
					info: {
						content: {
							name: `${locationName} Phase Overview`
						},
						path: currentLocation.info.path.replace('info.json', 'regions/phase_overview/info.json')
					}
				}
			}
		}
		setBreadcrumbs(phase_overview_crumbs)
		showPhaseComponent()
		setCurrentLocationTitle(phase_overview_crumbs.phase_overview.value.info.content.name)
	},[currentLocation, showPhaseComponent, breadcrumbs])

	

	return (
		<div className="locationPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<LocationsBreadcrumbs breadcrumbs={breadcrumbs} currentLocationTitle={currentLocationTitle} navigateBack={navigateBack} />
					</div>
				</div>
				<div className="bodyContent">
					{!isDataRefreshing ? (
						!isPhaseSelected ? (
							<>
								{ currentLocation && (
									<>
										<LocationDetails currentLocation={currentLocation} />
										<LocationPhaseList currentLocation={currentLocation} onItemClicked={openPhaseItem} />
									</>
								)}
									<LocationStates currentLocation={currentLocation} locationList={currentLocationList} onSelectedItem={(item) => getLocationsData(item)}/>
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

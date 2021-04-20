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
import { useCallback, useState, useRef } from 'react'
import { getLocationData } from '../actions/repoActions'
import { pathFind } from '../utils/dataUtils'
import { useBoolean } from '@uifabric/react-hooks'

import './Locations.scss'

export default observer(function LocationsV2() {

	const { isDataRefreshing, repoFileData } = getAppStore()
	const [ currentLocationList, setCurrentLocationList ] = useState<any>(repoFileData)
	const [ currentLocation, setCurrentLocation ] = useState<any>()
	const [ breadcrumbs, setBreadcrumbs ] = useState<any>({})
	const [ isPhaseSelected, { setTrue: showPhaseComponent, setFalse: hidePhaseComponent }] = useBoolean(
		false
	)
	const currentLocationTitle = useRef<string| null>(null)

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
		}
		setCurrentLocation(currLocation)
		setBreadcrumbs((crumbs: any) => ({...crumbs, [currLocation.info.content.id]: {value: currLocation}}))
		currentLocationTitle.current = currLocation.info.content.name as string

	},[repoFileData])

	const navigateBack = useCallback((item: any) => {
		if (item === 'root') {
			setCurrentLocationList(repoFileData)
			setCurrentLocation(null)
			setBreadcrumbs({})
			currentLocationTitle.current = null
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
		}

		hidePhaseComponent()
	},[breadcrumbs, getLocationsData, repoFileData, hidePhaseComponent])

	const openPhaseItem = useCallback((item: any) => {
		const phase_overview_crumbs = {
			...breadcrumbs,
			[currentLocation.info.content.id]: {
				value: currentLocation
			},
			phase_overview: {
				value: {
					info: {
						content: {
							name: `${currentLocation.info.content.name} Phase Overview`
						},
						path: currentLocation.info.path.replace('info.json', 'regions/phase_overview/info.json')
					}
				}
			}
		}
		setBreadcrumbs(phase_overview_crumbs)
		showPhaseComponent()
		currentLocationTitle.current = phase_overview_crumbs.phase_overview.value.info.content.name
	},[currentLocation, showPhaseComponent, breadcrumbs, currentLocationTitle])

	return (
		<div className="locationPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<LocationsBreadcrumbs breadcrumbs={breadcrumbs} currentLocationTitle={currentLocationTitle.current} navigateBack={navigateBack} />
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
								{!currentLocation || currentLocation?.regions ? (
									<LocationStates locationList={currentLocationList} onSelectedItem={(item) => getLocationsData(item)}/>
								): null}
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

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
import { getAppStore } from '../store/store'
import { useCallback, useState } from 'react'
import { getLocationData } from '../actions/repoActions'
import {pathFind} from '../utils/dataUtils'

import './Locations.scss'

export default observer(function LocationsV2() {

	const { isDataRefreshing, repoFileData } = getAppStore()
	const [ currentLocationList, setCurrentLocationList ] = useState<any>(repoFileData)
	const [ currentLocation, setCurrentLocation ] = useState<any>()
	const [ breadcrumbs, setBreadcrumbs ] = useState<any>({})

	const getLocationsData = useCallback(async (item: any) => {
		const pathArray = item.value.info.path.split("/")
		pathArray.splice(-1,1)

		const currLocation = pathFind(repoFileData, pathArray)

		console.log("currLocation", currLocation)
		// if (!currLocation.info.content) {
		// 		getLocationData(currLocation, pathArray, () => {
		// 			console.log('data loaded')
		// 		})
		// }

		if (currLocation?.regions) {
			for (const [key, value] of Object.entries(currLocation?.regions)) {
				const location = value as any
				if(!location.info.content || !location.strings.content || !location.vaccination.content )
				{
					console.log(location)
					await getLocationData(location)
				}
				setCurrentLocationList(currLocation.regions)
			}
		}
		setCurrentLocation(currLocation)
		setBreadcrumbs((crumbs: any) => ({...crumbs, [currLocation.info.content.id]: {value: currLocation}}))

	},[repoFileData])

	return (
		<div className="locationPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						{Object.keys(breadcrumbs).length > 0 ? (
							<div className="breadCrumbs">
								{Object.keys(breadcrumbs).map((key: any, idx: number) => {
									if (Object.keys(breadcrumbs).length - 1 === idx) {
										return <div className="breadCrumbsNonLink" key={idx}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
									}
									return <div className="breadCrumbsLink" key={idx} onClick={() => getLocationsData(breadcrumbs[key])}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
								})}
							</div>
						) : (
							<div className="breadCrumbs">/ {t('LocationsStates.title')}</div>
						)}
						<div className="mainTitle">{t('LocationsStates.title')}</div>
					</div>
				</div>
				<div className="bodyContent">
					{!isDataRefreshing ? (
						<>
							<LocationStates locationList={currentLocationList} onSelectedItem={(item) => getLocationsData(item)}/>
						</>
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

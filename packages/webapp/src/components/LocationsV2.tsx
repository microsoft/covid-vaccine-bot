/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
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

	const getLocationsData = useCallback((item: any) => {
		const pathArray = item.value.info.path.split("/")
		pathArray.splice(-1,1)

		const currLocation = pathFind(repoFileData, pathArray)
			// check all region objects to see if data is loaded
				// load if not already loaded
		if (!currLocation.info.content) {
				getLocationData(currLocation, pathArray, () => {
					console.log('data loaded')
				})
		}
		
		console.log(currLocation)
		if (currLocation?.regions) {
			setCurrentLocationList(currLocation.regions)
		}

	},[repoFileData])

	return (
		<div className="locationPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ {t('LocationsStates.title')}</div>
						<div className="mainTitle">{t('LocationsStates.title')}</div>
					</div>
				</div>
				<div className="bodyContent">
					<LocationDetails/>
					<LocationStates locationList={currentLocationList} onSelectedItem={(item) => getLocationsData(item)}/>
				</div>
			</div>
		</div>
	)
})

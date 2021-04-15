/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'
import LocationDetails from './LocationDetails'
import LocationStates from './LocationsStates'
import { getAppStore } from '../store/store'
import { useCallback } from 'react'
import { getLocationData } from '../actions/repoActions'

import './Locations.scss'
import { getLocationsData } from '../selectors/locationSelectors'


export default observer(function LocationsV2() {
	const { locationsData } = getAppStore()

	const getLocationsData = useCallback((item: any) => {
		getLocationData(item)
	},[])

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
					<LocationStates onSelectedItem={(item) => getLocationsData(item)}/>
				</div>
			</div>
		</div>
	)
})

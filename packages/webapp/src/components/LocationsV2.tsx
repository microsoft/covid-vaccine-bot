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

	const navigateBack = useCallback((item: any) => {
		if (item === 'root') {
			setCurrentLocationList(repoFileData)
			setCurrentLocation(null)
			setBreadcrumbs({})
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
	},[breadcrumbs, getLocationsData, repoFileData])

	return (
		<div className="locationPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						{Object.keys(breadcrumbs).length > 0 ? (
							<div className="breadCrumbs">
								{Object.keys(breadcrumbs).map((key: any, idx: number) => {
									if (idx === 0) {
										console.log(idx, Object.keys(breadcrumbs).length)
										return (
											<>
												<div className="breadCrumbsLink" onClick={() => navigateBack('root')}>/ Locations</div>
												{Object.keys(breadcrumbs).length < 2 ? (
													<div className="breadCrumbsNonLink" key={idx}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
												): (
													<div className="breadCrumbsLink" onClick={() => navigateBack(breadcrumbs[key])}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
												)}
											</>
										)
									}

									if (breadcrumbs[key].value.info.content.name === currentLocation.info.content.name) {
										return <div className="breadCrumbsNonLink" key={idx}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
									} else {
										return <div className="breadCrumbsLink" key={idx} onClick={() => navigateBack(breadcrumbs[key])}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
									}
								})}
							</div>
						) : (
							<div className="breadCrumbs">/ {t('LocationsStates.title')}</div>
						)}
						{currentLocation ? (
							<div className="mainTitle">{currentLocation.info.content.name}</div>
						) : (
							<div className="mainTitle">{t('LocationsStates.title')}</div>
						)}
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

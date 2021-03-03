/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { deepDiffMapper } from '../utils/dataUtils'
import { getAppStore } from '../store/store'
import { DefaultButton } from 'office-ui-fabric-react'
import {createPR} from '../actions/repoActions'



import { useState, useEffect } from 'react'

import './Review.scss'

export default observer(function Review() {

	const [changesList, setChangesList] = useState<any[]>([])
	const [locationUpdates, setLocationUpdates] = useState<any[]>([])
	const [globalUpdates, setGlobalUpdates] = useState<any[]>([])

	const state = getAppStore()
	useEffect(() => {
	const tempChangesList:any[] = []
	const tempLocationUpdates:any[] = []
	const tempGlobalUpdates:any[] = []

	if(JSON.stringify(state.initGlobalFileData.customStrings).toLowerCase() != JSON.stringify(state.globalFileData.customStrings).toLowerCase()){

		tempChangesList.push({"label": `Global strings information updated`, "value":state.globalFileData.customStrings})
		tempGlobalUpdates.push(state.globalFileData.customStrings)

	}

	if(JSON.stringify(state.initGlobalFileData.cdcStateNames).toLowerCase() != JSON.stringify(state.globalFileData.cdcStateNames).toLowerCase()){

		tempChangesList.push({"label": `State names information updated`, "value":state.globalFileData.cdcStateNames})
		tempGlobalUpdates.push(state.globalFileData.cdcStateNames)

	}

	if(JSON.stringify(state.initGlobalFileData.cdcStateLinks).toLowerCase() != JSON.stringify(state.globalFileData.cdcStateLinks).toLowerCase()){

		tempChangesList.push({"label": `State links information updated`, "value":state.globalFileData.cdcStateLinks})
		tempGlobalUpdates.push(state.globalFileData.cdcStateLinks)

	}

	Object.keys(state.repoFileData).forEach( (location:any) => {
		if(state.initRepoFileData){
		if( !state.initRepoFileData[location]){
			tempChangesList.push({ "label": `New location added - ${location}`, "value":state.repoFileData[location] })
			tempLocationUpdates.push(state.repoFileData[location])

		}else{
			let addChanges = false
			if( JSON.stringify(state.initRepoFileData[location].info).toLowerCase() != JSON.stringify(state.repoFileData[location].info).toLowerCase() ){
				tempChangesList.push({"label": `Updated information for ${location}`, "value":state.repoFileData[location]})
				addChanges = true
			}
			if( state.repoFileData[location].regions && JSON.stringify(state.initRepoFileData[location].regions)?.toLowerCase() != JSON.stringify(state.repoFileData[location].regions).toLowerCase() ){
				tempChangesList.push({"label": `Updated regions for ${location}`, "value":state.repoFileData[location]})
				addChanges = true
			}
			if( JSON.stringify(state.initRepoFileData[location].vaccination).toLowerCase() != JSON.stringify(state.repoFileData[location].vaccination).toLowerCase() ){
				tempChangesList.push({"label": `Updated phase information for ${location}`, "value":state.repoFileData[location]})
				addChanges = true
			}
			if(addChanges){
				tempLocationUpdates.push({ 'key':location, 'data':state.repoFileData[location]})
			}

		}
	}

	} )

	setLocationUpdates(tempLocationUpdates)
	setChangesList(tempChangesList)
	setGlobalUpdates(tempGlobalUpdates)


}, [state.initRepoFileData, state.repoFileData, state.initGlobalFileData, state.globalFileData] )

	return (
		<div className="reviewPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ Review</div>
						<div className="mainTitle">Changes</div>
					</div>
				</div>
				<div className="bodyContent">
					<section><ul>
						{ changesList.map( item => ( <li key={item.label} >{item.label}</li> ) ) }
						</ul>
						<DefaultButton text="Submit changes" onClick={ () => createPR([ globalUpdates, locationUpdates ]) } />
						
					</section>
				</div>
			</div>
		</div>
	)
})

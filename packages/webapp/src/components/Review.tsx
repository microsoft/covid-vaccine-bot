/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { deepDiffMapper } from '../utils/dataUtils'
import { getAppStore } from '../store/store'


import { useState, useEffect } from 'react'

import './Review.scss'

export default observer(function Review() {

	const [changesList, setChangesList] = useState<any[]>([])

	const state = getAppStore()
	useEffect(() => {
	const tempChangesList:any[] = []
	Object.keys(state.repoFileData).forEach( (location:any) => {
		if(state.initRepoFileData){
		if( !state.initRepoFileData[location]){
			tempChangesList.push({ "label": `New location added - ${location}`, "value":state.repoFileData[location] })
		}else{
			if( JSON.stringify(state.initRepoFileData[location].info) != JSON.stringify(state.repoFileData[location].info) ){
				tempChangesList.push({"label": `Updated information for ${location}`, "value":state.repoFileData[location]})
			}
			if( JSON.stringify(state.initRepoFileData[location].regions) != JSON.stringify(state.repoFileData[location].regions) ){
				tempChangesList.push({"label": `Updated regions for ${location}`, "value":state.repoFileData[location]})

			}
			if( JSON.stringify(state.initRepoFileData[location].vaccination) != JSON.stringify(state.repoFileData[location].vaccination) ){
				tempChangesList.push({"label": `Updated phase information for ${location}`, "value":state.repoFileData[location]})

			}

		}
	}

	} )

	setChangesList(tempChangesList)

}, [state.initRepoFileData, state.repoFileData] )

	console.log(changesList)

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
					<section>
						{ changesList.map( item => ( <div key={item.label} >{item.label}</div> ) ) }
					</section>
				</div>
			</div>
		</div>
	)
})

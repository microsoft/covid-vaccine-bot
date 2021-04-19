/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getAppStore } from '../store/store'
import { useState, useEffect } from 'react'
import {
	DetailsList,
	DetailsListLayoutMode
} from '@fluentui/react'

import './Locations.scss'

export interface LocationsDetailsProp {
	currentLocation: any
}

export default observer(function LocationsDetails(props: LocationsDetailsProp) {

	const {currentLocation} = props
	const { isDataRefreshing } = getAppStore()
	const [ locationItems, setLocationItems ] = useState<any>([])

	useEffect(() => {
		const items = []

		items.push({ label:'details','value': currentLocation.info.content.name })
		items.push({ label:'regionType','value': currentLocation.info.content.type})

		setLocationItems(items)

	}, [currentLocation])

	// const locationItems = [


	// 		{ label:'info','value': currentLocation.vaccination?.content.links.info?.url || ''},
	// 		{ label:'workflow','value': currentLocation.vaccination?.content.links.workflow?.url || ''},
	// 		{ label:'scheduling','value': currentLocation.vaccination?.content.links.scheduling?.url || ''},
	// 		{ label:'providers','value': currentLocation.vaccination?.content.links.providers?.url || ''},
	// 		{ label:'eligibility','value': currentLocation.vaccination?.content.links.eligibility?.url || ''},
	// 		{ label:'eligibilityPlan','value': currentLocation.vaccination?.content.links.eligibility_plan?.url || ''},
	// 		{ label:'schedulingPhone','value': currentLocation.vaccination?.content.links.scheduling_phone?.text || ''},
	// 		{ label:'schedulingPhoneDesc','value': currentLocation.vaccination?.content.links.scheduling_phone?.description ||''},
	// 		{ label:'noPhaseLabel','value': currentLocation.vaccination?.content.noPhaseLabel || false}
	// 	]
	
	// console.log(locationItems)
	return (
        <>
			<section>
                <div className="locationDetailsSectionHeader">Location Details</div>
                <DetailsList
					items={locationItems}
					setKey="set"
					layoutMode={DetailsListLayoutMode.justified}
					selectionPreservedOnEmptyClick={true}
					checkboxVisibility={2}
				/>
           	</section>
         </>
	)
})

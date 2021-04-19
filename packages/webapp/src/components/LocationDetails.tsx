/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'

import './Locations.scss'

export interface LocationsDetailsProp {
	currentLocation: any
}

export default observer(function LocationsDetails(props: LocationsDetailsProp) {

	const {currentLocation} = props

	return (
        <>
			<section>
                <div className="locationDetailsSectionHeader">Location Details</div>
           	</section>
         </>
	)
})

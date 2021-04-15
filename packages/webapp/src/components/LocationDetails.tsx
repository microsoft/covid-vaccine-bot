/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'

import './Locations.scss'

export default observer(function LocationsDetails() {

	return (
        <div className="bodyContainer">
            <div className="bodyContent">
                <div className="locationDetailsSectionHeader">Location Details</div>
            </div>
        </div>
	)
})

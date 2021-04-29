/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { MessageBar } from '@fluentui/react'
import { getCustomString } from '../selectors/locationSelectors'
import { getParentLocationData, isPhaseDataOverridden } from '../selectors/phaseSelectors'
import { toProperCase } from '../utils/textUtils'

export interface LocationsPhaseOverrideBarProp {
	currentLocation: any
    breadcrumbs: any
}

export default observer(function LocationsPhaseOverrideBar(props: LocationsPhaseOverrideBarProp) {
	const {currentLocation, breadcrumbs} = props

    let locationName = 'this'
	let parentLocationName = 'the parent location'
	if (currentLocation?.info) {
		const parentData = getParentLocationData(currentLocation)
		locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)

		if (parentData?.info) {
			parentLocationName = getCustomString(parentData, parentData.info.content.name) || toProperCase(parentData.info.content.name)
		}
	}

	return (
        <>
            {Object.keys(breadcrumbs).length > 1 && (
                <MessageBar messageBarType={5}>
                {isPhaseDataOverridden(currentLocation) ? (
                    <div>
                        Phase information below is specific to {locationName} only.
                    </div>
                ):(
                    <div>
                        Currently adopting the phase information of {parentLocationName}. Applying changes will make the phase data specific to {locationName} only.
                    </div>
                )}
            </MessageBar>
            )}
        </>
	)
})
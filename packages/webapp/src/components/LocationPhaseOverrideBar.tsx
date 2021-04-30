/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { MessageBar } from '@fluentui/react'
import { getCustomString } from '../selectors/locationSelectors'
import { getParentLocationData, isPhaseDataOverridden } from '../selectors/phaseSelectors'
import { StringFormat, toProperCase } from '../utils/textUtils'
import { getText as t } from '../selectors/intlSelectors'

export interface LocationsPhaseOverrideBarProp {
	currentLocation: any
    breadcrumbs: any
}

export default observer(function LocationsPhaseOverrideBar(props: LocationsPhaseOverrideBarProp) {
	const {currentLocation, breadcrumbs} = props

    let locationName = t('LocationPhaseOverrideBar.messageBar.locationNamePlaceholder')
	let parentLocationName = t('LocationPhaseOverrideBar.messageBar.parentLocationNamePlaceholder')
    let messageBarSpecific = ''
    let messageBarAdopted = ''
	if (currentLocation?.info) {
		const parentData = getParentLocationData(currentLocation)
		locationName = getCustomString(currentLocation, currentLocation.info.content.name) || toProperCase(currentLocation.info.content.name)
        messageBarSpecific = StringFormat(t('LocationPhaseOverrideBar.messageBar.specificText'), locationName)

		if (parentData?.info) {
			parentLocationName = getCustomString(parentData, parentData.info.content.name) || toProperCase(parentData.info.content.name)
            messageBarAdopted = StringFormat(t('LocationPhaseOverrideBar.messageBar.adoptedText'), parentLocationName, locationName)
		}
	}

	return (
        <>
            {Object.keys(breadcrumbs).length > 1 && (
                <MessageBar messageBarType={5}>
                {isPhaseDataOverridden(currentLocation) ? (
                    <div>
                        {messageBarSpecific}
                    </div>
                ):(
                    <div>
                        {messageBarAdopted}
                    </div>
                )}
            </MessageBar>
            )}
        </>
	)
})
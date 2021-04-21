/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'
import { getCustomString } from '../selectors/locationSelectors'
import { toProperCase } from '../utils/textUtils'

import './Locations.scss'

export interface LocationsBreadcrumbsProp {
	currentLocationTitle: string | null
    breadcrumbs: any
    navigateBack: (itemKey: string) => void
}

export default observer(function LocationsBreadcrumbs(props: LocationsBreadcrumbsProp) {
	const {currentLocationTitle, breadcrumbs, navigateBack} = props

	return (
        <>
            {Object.keys(breadcrumbs).length > 0 ? (
                <div className="breadCrumbs">
                     <div key={'root'} className="breadCrumbsLink" onClick={() => navigateBack('root')}>/ {t('LocationsStates.title')}</div>
                    {Object.keys(breadcrumbs).map((key: any, idx: number) => {
                        const locationName = getCustomString(breadcrumbs[key].value, breadcrumbs[key].value.info.content.name) || toProperCase(breadcrumbs[key].value.info.content.name)
                        if (locationName === currentLocationTitle) {
                            return <div key={idx} className="breadCrumbsNonLink">{`/ ${locationName}`}</div>
                        } else {
                            return <div key={idx} className="breadCrumbsLink" onClick={() => navigateBack(breadcrumbs[key])}>{`/ ${locationName}`}</div>
                        }
                    })}
                </div>
            ) : (
                <div className="breadCrumbs">/ {t('LocationsStates.title')}</div>
            )}
            {currentLocationTitle ? (
                <div className="mainTitle">{currentLocationTitle}</div>
            ) : (
                <div className="mainTitle">{t('LocationsStates.title')}</div>
            )}
        </>
	)
})
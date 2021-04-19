/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'

import './Locations.scss'

export interface LocationsBreadcrumbsProp {
	currentLocation: any
    breadcrumbs: any
    navigateBack: (itemKey: string) => void
}

export default observer(function LocationsBreadcrumbs(props: LocationsBreadcrumbsProp) {
	const {currentLocation, breadcrumbs, navigateBack} = props

	return (
        <>
            {Object.keys(breadcrumbs).length > 0 ? (
                <div className="breadCrumbs">
                    {Object.keys(breadcrumbs).map((key: any, idx: number) => {
                        if (idx === 0) {
                            return (
                                <>
                                    <div key={'root'} className="breadCrumbsLink" onClick={() => navigateBack('root')}>/ Locations</div>
                                    {Object.keys(breadcrumbs).length < 2 ? (
                                        <div className="breadCrumbsNonLink" key={idx}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
                                    ): (
                                        <div key={idx} className="breadCrumbsLink" onClick={() => navigateBack(breadcrumbs[key])}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
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
        </>
	)
})
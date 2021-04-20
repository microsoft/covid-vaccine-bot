/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'

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
                     <div key={'root'} className="breadCrumbsLink" onClick={() => navigateBack('root')}>/ Locations</div>
                    {Object.keys(breadcrumbs).map((key: any, idx: number) => {
                        if (breadcrumbs[key].value.info.content.name === currentLocationTitle) {
                            return <div key={idx} className="breadCrumbsNonLink">{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
                        } else {
                            return <div key={idx} className="breadCrumbsLink" onClick={() => navigateBack(breadcrumbs[key])}>{`/ ${breadcrumbs[key].value.info.content.name}`}</div>
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
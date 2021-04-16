/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { useState, useCallback } from 'react'
import LocationsRegions from './LocationsRegions'
import LocationsStates from './LocationsStates'

import './Locations.scss'

export default observer(function Locations() {
	const [selectedState, setSelectedState] = useState<any>(null)

	const onNavigateBack = useCallback(() => {
		setSelectedState(null)
	}, [])

	return (
		<div className="locationPageContainer">
			{!selectedState ? (
				<LocationsStates locationList={null} onSelectedItem={setSelectedState} />
			) : (
				<LocationsRegions
					selectedState={selectedState}
					onNavigateBack={onNavigateBack}
				/>
			)}
		</div>
	)
})

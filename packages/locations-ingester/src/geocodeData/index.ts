/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { geocodeData } from './geocodeData'

geocodeData()
	.then(() => console.log('finished geocoding'))
	.catch((err) => console.error('geocoding error', err))

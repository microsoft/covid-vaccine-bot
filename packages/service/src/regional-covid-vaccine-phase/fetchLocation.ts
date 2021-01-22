/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import fetch from 'node-fetch'
import { config } from './config'

export async function fetchLocation(zipcode: string) {
	const url = `${config.locationsApi}?query=${zipcode}&key=${config.locationsApiKey}`

	const results = await fetch(url).then((res) => res.json())
	return results.resourceSets[0].resources[0].address
}

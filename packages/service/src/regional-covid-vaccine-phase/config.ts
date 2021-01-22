/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import path from 'path'

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
export const config = {
	locationsApi: 'https://dev.virtualearth.net/REST/v1/Locations',
	locationsApiKey: process.env.BING_MAPS_API_KEY || '',
}

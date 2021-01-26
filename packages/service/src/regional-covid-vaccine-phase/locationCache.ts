/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import LRU from 'lru-cache'
import { Location } from './fetchLocation'

export const locationCache = new LRU<string, Location>({
	max: 1000,
	maxAge: 1000 * 60 * 60,
})

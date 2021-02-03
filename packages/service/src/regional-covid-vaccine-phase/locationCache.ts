/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import LRU from 'lru-cache'
import { BingLocation } from '@ms-covidbot/policy-locator'

export const locationCache = new LRU<string, BingLocation>({
	max: 1000,
	maxAge: 1000 * 60 * 60,
})

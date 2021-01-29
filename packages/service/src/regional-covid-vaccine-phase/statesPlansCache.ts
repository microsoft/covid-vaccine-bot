/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import LRU from 'lru-cache'
import { Region } from '@ms-covidbot/state-plan-schema'

export const statesPlansCache = new LRU<string, Region[]>({
	max: 1,
	maxAge: 1000 * 60 * 60,
})

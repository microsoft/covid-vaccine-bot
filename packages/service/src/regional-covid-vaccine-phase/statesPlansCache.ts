/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

// @ts-ignore
import LRU from 'lru-cache'

export const statesPlansCache = new LRU<string, any>({
	max: 1,
	maxAge: 1000 * 60 * 60,
})

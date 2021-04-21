/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { QueryArgUtil } from './QueryArgUtil'
import { Locator } from './Locator'
import { ProviderLocationsStore } from './ProviderLocationsStore'
import { getCosmosContainer, getCosmosLocationCacheContainer } from './cosmos'

export const locator = new Locator(getCosmosLocationCacheContainer())
export const queryArgUtil = new QueryArgUtil(locator)
export const providerLocationsStore = new ProviderLocationsStore(
	getCosmosContainer()
)

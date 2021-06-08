/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Locator } from './Locator'
import { ProviderLocationsStore } from './ProviderLocationsStore'
import { QueryArgUtil } from './QueryArgUtil'
import { getCosmosContainer, getCosmosLocationCacheContainer } from './cosmos'

export const locator = new Locator(getCosmosLocationCacheContainer())
export const queryArgUtil = new QueryArgUtil(locator)
export const providerLocationsStore = new ProviderLocationsStore(
	getCosmosContainer()
)

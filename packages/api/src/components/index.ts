/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ProviderLocationsStore } from './ProviderLocationsStore'
import { getCosmosContainer } from './cosmos'

export const providerLocationsStore = new ProviderLocationsStore(
	getCosmosContainer()
)

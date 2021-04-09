/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Localizer } from './Localizer'
import { Locator } from './Locator'
import { ProviderLocationsStore } from './ProviderLocationsStore'
import { getCosmosContainer } from './cosmos'

export const locator = new Locator()
export const localizer = new Localizer()
export const providerLocationsStore = new ProviderLocationsStore(
	getCosmosContainer()
)

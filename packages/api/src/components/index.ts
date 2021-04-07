/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Localizer } from './Localizer'
import { Locator } from './Locator'
import { getCosmosContainer } from './cosmos'

export const providersCosmosContainer = getCosmosContainer()
export const locator = new Locator()
export const localizer = new Localizer()

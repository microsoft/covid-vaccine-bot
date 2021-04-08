/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'

export const setLocalization = mutatorAction(
	'setLocalization',
	(localization: any) => {
		const store = getAppStore()
		if (localization) {
			store.localization = localization
		}
	}
)

export const setDefaultLanguage = mutatorAction(
	'setDefaultLanguage',
	(defaultLanguage: any) => {
		const store = getAppStore()
		store.defaultLanguage = defaultLanguage
	}
)

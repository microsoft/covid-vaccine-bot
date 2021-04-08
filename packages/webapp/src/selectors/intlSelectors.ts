/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { get } from 'lodash'

export const getText = (key: string) => {
	const { localization, defaultLanguage } = getAppStore()

	return (
		get(localization, key) ?? get(defaultLanguage, key) ?? `NO COPY FOR ${key}`
	)
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { action } from 'satcheljs'

export const setAppLanguage = action('setAppLanguage', (language: string) => ({
	language,
}))

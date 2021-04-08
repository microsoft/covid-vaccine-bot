/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import { setAppLanguage } from '../actions/intlActions'
import { setLocalization } from '../mutators/intlMutators'

orchestrator(setAppLanguage, async (message) => {
	const localization = require(`../localizations/${message.language}.json`)
	setLocalization(localization)
})

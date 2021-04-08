/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import { setAppLanguage } from '../actions/intlActions'
import { setLocalization } from '../mutators/intlMutators'

orchestrator(setAppLanguage, async (message) => {
	let localization: any = {}
	try {
		localization = require(`../localizations/${message.language}.json`)
	} catch {
		localization = require('../localizations/en-us.json')
	}

	setLocalization(localization)
})

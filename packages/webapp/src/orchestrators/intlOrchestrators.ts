/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import { isRtlLang } from 'rtl-detect'
import { setAppLanguage } from '../actions/intlActions'
import { setLocalization, setDefaultLanguage } from '../mutators/intlMutators'
import { getAppStore } from '../store/store'
import { isEmpty } from 'lodash'
import config from '../config'

orchestrator(setAppLanguage, async (message) => {
	const state = getAppStore()
	let localization: any = {}
	let defaultLanguage: any = state.defaultLanguage

	if (isEmpty(defaultLanguage)) {
		defaultLanguage = {
			language: config.defaultLanguage,
			rtl: isRtlLang(config.defaultLanguage),
			...require(`../intl/${config.defaultLanguage}.json`),
		}

		setDefaultLanguage(defaultLanguage)
	}

	try {
		localization = {
			language: message.language,
			rtl: isRtlLang(message.language),
			...require(`../intl/${message.language}.json`),
		}
	} catch {
		localization = {
			language: message.language,
			rtl: isRtlLang(message.language),
		}
	}

	setLocalization(localization)
})

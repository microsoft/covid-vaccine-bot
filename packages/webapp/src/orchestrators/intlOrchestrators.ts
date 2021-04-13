/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { isEmpty } from 'lodash'
import { isRtlLang } from 'rtl-detect'
import { orchestrator } from 'satcheljs'
import { setAppLanguage } from '../actions/intlActions'
import configs from '../config'
import { setLocalization, setDefaultLanguage } from '../mutators/intlMutators'
import { getAppStore } from '../store/store'

orchestrator(setAppLanguage, async (message) => {
	const state = getAppStore()
	let localization: any = {}
	let defaultLanguage: any = state.defaultLanguage

	if (isEmpty(defaultLanguage)) {
		defaultLanguage = {
			language: configs.defaultLanguage,
			rtl: isRtlLang(configs.defaultLanguage),
			...await import(`../intl/${configs.defaultLanguage}.json`),
		}

		setDefaultLanguage(defaultLanguage)
	}

	try {
		localization = {
			language: message.language,
			rtl: isRtlLang(message.language),
			...await import(`../intl/${message.language}.json`),
		}
	} catch {
		localization = {
			language: message.language,
			rtl: isRtlLang(message.language),
		}
	}

	setLocalization(localization)
})

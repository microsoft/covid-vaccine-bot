/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

//import configs from '../config'

const configs = {
	languageKeys:
		'en-us,ko-kr,vi-vn,zh-cn,es-us,de-de,es-es,fi-fi,fr-fr,he-il,it-it,ja-jp,pt-pt,sv-se,th-th',
	defaultLanguage: 'en-us',
}


export const toProperCase = (text: string): string => {
	const res = text
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b[a-z](?=[a-z]{2})/g, function (letter) {
			return letter.toUpperCase()
		})

	if (res.startsWith('us ')) {
		return res.replace('us ', 'US ')
	}

	if (res.startsWith('st. ')) {
		return res.replace('st. ', 'St. ')
	}
	return res
}

export const formatId = (text: string): string => {
	return text
		?.trim()
		.replace(/[^a-z0-9\s]/gi, '')
		.replace(/\s+/g, '_')
		.toLowerCase()
}

export const getLanguageKeys = (): string[] => {
	return configs.languageKeys.split(',')
}

export const getLanguageOptions = (excludeLanguage?: string): any[] => {
	return getLanguageKeys()
		.map((key) => {
			return {
				key: key,
				text: getLanguageDisplayText(key, key),
			}
		})
		.filter((l) => l.key !== excludeLanguage)
}

export const getLanguageDisplayText = (
	currentLanguage: string,
	languageCode: string
): string => {
	// @ts-expect-error DisplayNames not on Intl
	const languageName = new Intl.DisplayNames([currentLanguage], {
		type: 'language',
	})
	return languageName.of(languageCode)
}

export const utf8_to_b64 = (str: string): string => {
	return btoa(unescape(encodeURIComponent(str)))
}

export const b64_to_utf8 = (str: string): string => {
	return decodeURIComponent(escape(atob(str)))
}

export const getLanguageKeysWithSMSVoice = (): string[] => {
	const languageKeys: any[] = []
	getLanguageKeys().forEach((l) => {
		languageKeys.push(l)
		languageKeys.push(`${l}-sms`)
		languageKeys.push(`${l}-voice`)
	})
	return languageKeys
}

export const createCSVDataString = (contentObj: any): string => {
	const languageKeys = getLanguageKeysWithSMSVoice()
	const contentKeys = Object.keys(contentObj)

	let result = 'String ID,' + languageKeys.join(',') + '\n'

	for (const key of contentKeys) {
		const rowValues = [key]
		languageKeys.forEach((lang: string) => {
			if (contentObj[key][lang]) {
				rowValues.push(`"${contentObj[key][lang].replace(/"/g, '""')}"`)
			} else {
				rowValues.push('')
			}
		})

		result += rowValues.join(',') + '\n'
	}
	return result
}

/**
 *
 * @param str String to inject arguments into
 * @param args Arguments to inject into string
 * @returns string with arguments injected
 */
export const StringFormat = (str: string, ...args: string[]): string => {
	return str.toString().replace(/{(\d+)}/g, (match, index) => args[index] || '')
}

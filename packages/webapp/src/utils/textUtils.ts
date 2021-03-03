/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
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
	return res
}

export const getLanguageOptions = (excludeLanguage?: string) => {
	const languageKeys = 'en-us,ko-kr,vi-vn,zh-cn,es-us,de-de,es-es,fi-fi,fr-fr,he-il,it-it,ja-jp,pt-pt,sv-se,th-th'.split(
		','
	)

	return languageKeys.map((key) => {
		return {
			key: key,
			text: getLanguageDisplayText(key, key),
		}
	}).filter(l => l.key !== excludeLanguage)
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

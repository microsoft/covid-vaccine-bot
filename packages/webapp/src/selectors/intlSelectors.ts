/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { get } from 'lodash'
import { ReactNode } from 'react'
import ReactHtmlParser from 'react-html-parser'

import { getAppStore } from '../store/store'
import { StringFormat } from '../utils/textUtils'

/**
 *
 * @param key translation json key
 * @param isHtml true if getText parses translation string to html
 * @param insertStrings array of strings to inject into translation
 * @returns string or html
 */
export function getText(
	key: string,
	isHtml: true,
	...insertStrings: any[]
): ReactNode
export function getText(key: string): string
export function getText(
	key: string,
	isHtml?: true,
	...insertStrings: any[]
): any {
	const { localization, defaultLanguage } = getAppStore()

	let res =
		get(localization, key) ?? get(defaultLanguage, key) ?? `NO COPY FOR ${key}`

	if (!isHtml) return res.toString()

	if (insertStrings.length)
		res = ReactHtmlParser(StringFormat(res, ...insertStrings))
	else res = ReactHtmlParser(res)

	return res
}

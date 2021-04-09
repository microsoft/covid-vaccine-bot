/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import React from 'react'
import { getAppStore } from '../store/store'
import { get } from 'lodash'

export const getText = (key: string) => {
	const { localization, defaultLanguage } = getAppStore()
	let res = get(localization, key) ?? get(defaultLanguage, key) ?? `NO COPY FOR ${key}`
	res = res.split('\n')

	if(res.length > 1) 
		res = res.reduce((sentence: any[], nextLine: string) => {
			return [...sentence, React.createElement('br'), nextLine]
		}, [])
	else 
		res = res.join('')

	return res
}

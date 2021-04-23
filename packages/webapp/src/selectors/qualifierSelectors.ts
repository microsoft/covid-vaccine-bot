/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'

export const isQualifierTextDuplicate = (qualifierText: string): boolean => {
    const store = getAppStore()
    const { content } = store.globalFileData.customStrings
	const newQualifier = qualifierText.toLowerCase().replaceAll(' ','')

    const existingQualifierTexts = Object.entries(content)
        .filter(([key, _value]: [string, any]) => key.startsWith('c19.eligibility.question/'))
        .map(([_key, value]: [string, any]) => {
            return value[store.currentLanguage].toLowerCase().replaceAll(' ','')
        })

    return existingQualifierTexts.includes(newQualifier)
}

export const getGlobalQualifierValidationTexts = (rootLocationKey: string): string[] => {
    const store = getAppStore()
    const { content } = store.repoFileData[rootLocationKey].strings

    return Object.entries(content)
        .filter(([key, _value]: [string, any]) => key.startsWith('c19.eligibility.question/'))
        .map(([_key, value]: [string, any]) => {
            return value[store.currentLanguage].toLowerCase().replaceAll(' ','')
        })
}
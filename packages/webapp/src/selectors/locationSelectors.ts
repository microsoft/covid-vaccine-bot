/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'

export const getCustomStrings = (selectedState: any, keyFilter: string) => {
    const { globalFileData, currentLanguage } = getAppStore();

    const customStringsList: any[] = selectedState
        ? [...Object.entries(selectedState.value.strings.content), ...Object.entries(globalFileData.customStrings.content)]
        : [...Object.entries(globalFileData.customStrings.content)]

    const filteredList = keyFilter ? customStringsList.filter(([key, _value]:[string, any]) => key.includes(keyFilter.toLowerCase())) : customStringsList

    return filteredList
        .map(([key, value]:[string, any]) => {
            return {
                key: key,
                text: value[currentLanguage]
            }
        })[0].text
}
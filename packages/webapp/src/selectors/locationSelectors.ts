/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'

export const getStateCustomStrings = (
	selectedState: any,
	keyFilter: string
): string => {
	const returnVal = getCustomStrings(selectedState.value, keyFilter)
	if (returnVal.length > 0) return returnVal[0].text

	return ''
}

export const getRegionCustomStrings = (
	selectedRegion: any,
	keyFilter: string
): string => {
	const { repoFileData } = getAppStore()
	const selectedState =
		repoFileData?.[selectedRegion.value.info.path.split('/')[0]]

	const returnVal = getCustomStrings(selectedState, keyFilter)
	if (returnVal.length > 0) return returnVal[0].text

	return ''
}

const getCustomStrings = (selectedState: any, keyFilter: string): any[] => {
	const { globalFileData, currentLanguage } = getAppStore()

	const customStringsList: any[] = selectedState
		? [
				...Object.entries(selectedState?.strings?.content ?? {}),
				...Object.entries(globalFileData.customStrings.content),
		  ]
		: [...Object.entries(globalFileData.customStrings.content)]
	const filteredList = keyFilter
		? customStringsList.filter(([key, _value]: [string, any]) =>
				key.includes(keyFilter.toLowerCase())
		  )
		: customStringsList

	return filteredList.map(([key, value]: [string, any]) => {
		return {
			key: key,
			text: value[currentLanguage],
		}
	})
}


export const getLocationsData = (location?: string): any => {
	const { locationsData } = getAppStore()
	if (locationsData) {
		if (location) {
			return locationsData[location]
		} else {
			return locationsData
		}
	}
	return undefined
}
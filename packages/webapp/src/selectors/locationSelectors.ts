/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { cloneDeep as clone } from 'lodash'
import { getAppStore } from '../store/store'
import { pathFind } from '../utils/dataUtils'
import { getParentLocationVaccinationData } from './phaseSelectors'

export const getCustomString = (
	currentLocation: any,
	keyFilter: string
): string => {
	const { repoFileData, currentLanguage } = getAppStore()
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	const rootRepo = repoFileData[currentLocationRoot]

	const stringsList: any[] = currentLocation
		? [
				...Object.entries(currentLocation.strings?.content ?? {}),
				...Object.entries(rootRepo.strings.content),
		  ]
		: [...Object.entries(rootRepo.strings.content)]

	const stringSearch = stringsList.find(
		([key, _value]: [string, any]) => 
			key.toLowerCase() === keyFilter.toLowerCase()
	)
	if (stringSearch) {
		return stringSearch[1][currentLanguage]
	}
	return ''
}

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

export const getCurrentLocationObj = (currentLocation: any): any => {
	const { repoFileData } = getAppStore()
	const pathArray = currentLocation.info.path.split('/')
	pathArray.splice(-1, 1)

	return {
		locationData: pathFind(repoFileData, pathArray),
		pathKey: pathArray.join('.'),
		name: pathArray.slice(-1)[0]
	}
}

export const getLocationPhaseData = (
	currentLocation: any
): { phases: any[]; activePhase: string } => {
	const currLocation = currentLocation.value || currentLocation

	let phases: any[] = currLocation.vaccination.content.phases
	let activePhase: string = currLocation.vaccination.content.activePhase

	if (!phases || phases.length === 0) {
		const parentLocationVaccinationData = getParentLocationVaccinationData(
			currLocation
		)

		if (parentLocationVaccinationData) {
			phases = clone(parentLocationVaccinationData.content.phases)
			activePhase = clone(parentLocationVaccinationData.content.activePhase)
		} else {
			return { phases: [], activePhase: '' }
		}
	}

	return { phases, activePhase }
}

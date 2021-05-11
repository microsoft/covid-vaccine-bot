/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { isEqual } from 'lodash'
import { getAppStore } from '../store/store'
import { pathFind } from '../utils/dataUtils'
import { toProperCase } from '../utils/textUtils'

const getCustomStrings = (currentLocation?: any, keyFilter?: string) => {
	const { repoFileData, currentLanguage } = getAppStore()
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	const rootRepo = repoFileData[currentLocationRoot]
	const isCurrentLocationRoot = currentLocation.info.path === rootRepo.info.path

	const qualifierList: any[] =
		currentLocation && !isCurrentLocationRoot
			? [
					...Object.entries(currentLocation.strings?.content ?? {}),
					...Object.entries(rootRepo.strings.content),
			  ]
			: [...Object.entries(rootRepo.strings.content)]

	const filteredList = keyFilter
		? qualifierList.filter(([key, _value]: [string, any]) =>
				key.includes(keyFilter)
		  )
		: qualifierList
	return filteredList
		.map(([key, value]: [string, any]) => {
			return {
				key: key,
				text: value[currentLanguage],
			}
		})
		.sort((a, b) => (a.text > b.text ? 1 : -1))
}

export const getExactCustomStrings = (
	currentLocation?: any,
	keyFilter?: string
): any[] => {
	const { repoFileData, currentLanguage } = getAppStore()
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	const rootRepo = repoFileData[currentLocationRoot]
	const isCurrentLocationRoot = currentLocation.info.path === rootRepo.info.path

	const qualifierList: any[] =
		currentLocation && !isCurrentLocationRoot
			? [
					...Object.entries(currentLocation.strings?.content ?? {}),
					...Object.entries(rootRepo.strings.content),
			  ]
			: [...Object.entries(rootRepo.strings.content)]

	const filteredList = keyFilter
		? qualifierList.filter(
				([key, _value]: [string, any]) => key.toLowerCase() === keyFilter
		  )
		: qualifierList
	return filteredList
		.map(([key, value]: [string, any]) => {
			return {
				key: key,
				text: value[currentLanguage],
			}
		})
		.sort((a, b) => (a.text > b.text ? 1 : -1))
}

export const getPhaseQualifierItems = (currentLocation?: any): any => {
	return getCustomStrings(currentLocation, 'eligibility.question/')
}

export const getPhaseTagItems = (
	currentLocation?: any
): { key: string; text: string }[] => {
	const phaseQualifiers = getPhaseQualifierItems(currentLocation)

	const tagKeys: any[] = []
	const tagList: any[] = []
	phaseQualifiers.forEach((qualifier: any) => {
		const baseKey = qualifier.key.split('/')
		const tagKey = baseKey[1].split('.')[0]

		if (!tagKeys.includes(tagKey)) {
			tagKeys.push(tagKey)
			tagList.push({
				key: tagKey,
				text: toProperCase(tagKey),
			})
		}
	})

	return tagList.sort((a, b) => (a.text > b.text ? 1 : -1))
}

export const getPhaseQualifierItemsByKey = (
	currentLocation?: any,
	selectedKey?: any
): any[] => {
	return getPhaseQualifierItems(currentLocation).filter((qualifier: any) => {
		return (
			qualifier.key.startsWith(`c19.eligibility.question/${selectedKey}.`) ||
			qualifier.key.endsWith(`c19.eligibility.question/${selectedKey}`)
		)
	})
}

export const getPhaseMoreInfoItems = (currentLocation?: any): any[] => {
	return getCustomStrings(currentLocation, 'eligibility.moreinfo')
}

export const getPhaseMoreInfoTextByKey = (
	currentLocation?: any,
	selectedKey?: any
): string => {
	if (selectedKey) {
		const res = getExactCustomStrings(currentLocation, selectedKey)
		if (res.length > 0) {
			return res[0].text
		}
	}

	return ''
}

export const getPhaseMoreInfoUrl = (rowItem: any): string => {
	const locationPhases = rowItem.location.vaccination.content.phases
	const currPhase = locationPhases?.find(
		(phase: { id: any }) => phase.id === rowItem.groupId
	)
	if (currPhase) {
		const currQualification = currPhase?.qualifications.find(
			(qualification: { question: any }) =>
				qualification.question === rowItem.qualifierId
		)
		if (currQualification) {
			return currQualification.moreInfoUrl
		}
	}

	return rowItem.moreInfoUrl
}

export const getParentLocationData = (currentLocation: any): any => {
	const { repoFileData } = getAppStore()
	const pathArray = currentLocation.info.path.split('/')
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	pathArray.splice(-1, 1) //remove info.json
	pathArray.splice(-2, 2) //remove current location level

	if (pathArray.length === 0) {
		return repoFileData[currentLocationRoot]
	} else {
		return pathFind(repoFileData, pathArray)
	}
}

export const getParentLocationVaccinationData = (currentLocation: any): any => {
	const { repoFileData } = getAppStore()
	const pathArray = currentLocation.info.path.split('/')
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	pathArray.splice(-1, 1) //remove info.json
	pathArray.splice(-2, 2) //remove current location level
	const vaccinationData = null

	if (pathArray.length === 0) {
		return repoFileData[currentLocationRoot].vaccination
	}

	for (let i = pathArray.length; i >= 0; i--) {
		const parentLocation = pathFind(repoFileData, pathArray)

		if (i === 0 || pathArray.length === 0) {
			return repoFileData[currentLocationRoot].vaccination
		}

		if (
			!parentLocation.vaccination?.content?.phases ||
			parentLocation.vaccination.content.phases.length === 0
		) {
			pathArray.splice(-2, 2)
		} else {
			return parentLocation.vaccination
		}
	}

	return vaccinationData
}

export const isPhaseDataOverridden = (currentLocation: any): boolean => {
	const parentVacData = getParentLocationVaccinationData(currentLocation)
	if (
		!currentLocation.vaccination.content?.phases ||
		currentLocation.vaccination.content?.phases.length === 0
	) {
		return false
	} else {
		return !isEqual(currentLocation.vaccination.content, parentVacData.content)
	}
}

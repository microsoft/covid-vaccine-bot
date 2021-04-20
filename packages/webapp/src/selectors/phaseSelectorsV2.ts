/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'
import { pathFind } from '../utils/dataUtils'

const getCustomStrings = (currentLocation?: any, keyFilter?: string) => {
	const { repoFileData, currentLanguage } = getAppStore()
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	const rootRepo = repoFileData[currentLocationRoot]

	const qualifierList: any[] = currentLocation
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

const getExactCustomStrings = (currentLocation?: any, keyFilter?: string) => {
	const { repoFileData, currentLanguage } = getAppStore()
	const currentLocationRoot = currentLocation.info.path.split('/')[0]
	const rootRepo = repoFileData[currentLocationRoot]

	const qualifierList: any[] = currentLocation
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
	return getCustomStrings(currentLocation, 'eligibility.question')
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

export const getPhaseMoreInfoUrl = (
	rowItem: any
): string => {
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

export const getParentLocationVaccinationData = (currentLocation: any): any => {
	const { repoFileData } = getAppStore()
	const pathArray = currentLocation.info.path.split("/")
	pathArray.splice(-1,1) //remove info.json
	pathArray.splice(-2,2) //remove current location level
	let vaccinationData = null

	while (vaccinationData === null) {
		const parentLocation = pathFind(repoFileData, pathArray)

		if (!parentLocation.vaccination.content.phases) {
			pathArray.splice(-2,2)
		} else {
			vaccinationData = parentLocation.vaccination
		}

		if (pathArray.length === 0) {
			const currentLocationRoot = currentLocation.info.path.split('/')[0]
			vaccinationData = repoFileData[currentLocationRoot].vaccination
		}
	}

	return vaccinationData
}
/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { compare } from '../utils/dataUtils'
import { toProperCase } from '../utils/textUtils'

// export const getChanges = (): any => {
// 	const state = getAppStore()
// 	const changesList: any[] = []
// 	const locationUpdates: any[] = []
// 	const globalUpdates: any[] = []
// 	const { globalFileData } = state
// 	const repoFileData = { ...state.repoFileData }
// 	if (
// 		!isEqual(
// 			state.initGlobalFileData.customStrings,
// 			globalFileData.customStrings
// 		)
// 	) {
// 		changesList.push({
// 			label: `Global strings information updated`,
// 			value: globalFileData.customStrings,
// 		})
// 		globalUpdates.push(globalFileData.customStrings)
// 	}

// 	if (
// 		!isEqual(
// 			state.initGlobalFileData.cdcStateNames,
// 			globalFileData.cdcStateNames
// 		)
// 	) {
// 		changesList.push({
// 			label: `State names information updated`,
// 			value: globalFileData.cdcStateNames,
// 		})
// 		globalUpdates.push(globalFileData.cdcStateNames)
// 	}

// 	if (
// 		!isEqual(
// 			state.initGlobalFileData.cdcStateLinks,
// 			globalFileData.cdcStateLinks
// 		)
// 	) {
// 		changesList.push({
// 			label: `State links information updated`,
// 			value: globalFileData.cdcStateLinks,
// 		})
// 		globalUpdates.push(globalFileData.cdcStateLinks)
// 	}

// 	Object.keys(state.initRepoFileData)
// 		.filter((location: string) => {
// 			return !state.repoFileData[location]
// 		})
// 		.forEach((location: string) => {
// 			changesList.push({
// 				label: `Location removed - ${location}`,
// 				value: state.initRepoFileData[location],
// 			})
// 			locationUpdates.push({
// 				key: location,
// 				data: {
// 					...state.initRepoFileData[location],
// 					delete: true,
// 				},
// 			})
// 		})

// 	Object.keys(repoFileData).forEach((location: string) => {
// 		if (state.initRepoFileData) {
// 			if (!state.initRepoFileData[location]) {
// 				changesList.push({
// 					label: `New location added - ${location}`,
// 				})
// 				locationUpdates.push({
// 					key: location,
// 				})
// 			} else {
// 				let addChanges = false
// 				if (
// 					!isEqual(
// 						state.initRepoFileData[location].info,
// 						repoFileData[location].info
// 					)
// 				) {
// 					changesList.push({
// 						label: `Updated information for ${location}`,
// 						value: repoFileData[location],
// 					})
// 					addChanges = true
// 				}
// 				if (
// 					!isEqual(
// 						state.initRepoFileData[location].regions,
// 						repoFileData[location].regions
// 					)
// 				) {
// 					changesList.push({
// 						label: `Updated regions for ${location}`,
// 						value: repoFileData[location],
// 					})

// 					Object.keys(state.initRepoFileData[location].regions)
// 						.filter((subLocation: string) => {
// 							return !repoFileData[location].regions?.[subLocation]
// 						})
// 						.forEach((subLocation: string) => {
// 							changesList.push({
// 								label: `Removed region ${subLocation}`,
// 								value: state.initRepoFileData[location].regions[subLocation],
// 							})
// 							repoFileData[location].regions = {
// 								...repoFileData[location].regions,
// 								[subLocation]: {
// 									...state.initRepoFileData[location].regions[subLocation],
// 									delete: true,
// 								}
// 							}
// 						})

// 					addChanges = true
// 				}
// 				if (
// 					!isEqual(
// 						state.initRepoFileData[location].vaccination,
// 						repoFileData[location].vaccination
// 					)
// 				) {
// 					changesList.push({
// 						label: `Updated phase information for ${location}`,
// 						value: repoFileData[location],
// 					})
// 					addChanges = true
// 				}
// 				if (
// 					!isEqual(
// 						state.initRepoFileData[location].strings,
// 						repoFileData[location].strings
// 					)
// 				) {
// 					changesList.push({
// 						label: `Updated strings information for ${location}`,
// 						value: repoFileData[location],
// 					})
// 					addChanges = true
// 				}
// 				if (addChanges) {
// 					locationUpdates.push({
// 						key: location,
// 						data: repoFileData[location],
// 					})
// 				}
// 			}
// 		}
// 	})

// 	return { globalUpdates, locationUpdates, changesList }
// }

export const getChanges = (): {changesList: any, locationUpdates: any} => {
	const {initRepoFileData, repoFileData} = getAppStore()
	const changesList: any[] = []
	const locationUpdates: any[] = []
	const repoDiffs = compare(initRepoFileData, repoFileData)
	const { different: updated, missing_from_first: added, missing_from_second: removed } = repoDiffs

	let locationKey = ''
	let changeDesc = ''
	if (updated.length > 0) {
		updated.forEach((item:string) => {
			if (item.includes('state_name')) {
				locationKey = item.split('/state_name')[0].replaceAll('/','.')
				changeDesc = 'Updated location data for'
			}
			if (item.includes('.vaccination.content')) {
				locationKey = item.split('.vaccination.content')[0]
				changeDesc = 'Updated phase data for'
			}

			let locationName = toProperCase(locationKey.split('.').pop() as string)
			if (locationName && changesList.findIndex(c => c.value === locationName) === -1) {
				changesList.push({label: `${changeDesc} ${locationName}`, value: locationName})
			}

			if (locationKey && !locationUpdates.includes(locationKey)) {
				locationUpdates.push(locationKey)
			}
		})
	}

	if (added.length > 0) {
		added.forEach((item:string) => {
			if (item.includes('.vaccination.content')) {
				locationKey = item.split('.vaccination.content')[0]
				changeDesc = 'Updated phase data for'
			}

			if (!item.includes('.vaccination.content') && !item.endsWith('.strings') && item.endsWith('regions')) {
				locationKey = item.endsWith('regions') ? item.split('.').slice(0,-1).join('.') : item
				changeDesc = 'Updated location data for'
			}

			let locationName = toProperCase(locationKey.split('.').pop() as string)
			if (locationName && changesList.findIndex(c => c.value === locationName) === -1) {
				changesList.push({label: `${changeDesc} ${locationName}`, value: locationName})
			}

			if (locationKey && !locationUpdates.includes(locationKey)) {
				locationUpdates.push(locationKey)
			}
		})
	}

	if (removed.length > 0) {
		removed.forEach((item:string) => {
			if (item.endsWith('.strings')) {
				locationKey = item.split('.strings')[0]
			}

			if (item.includes('.vaccination.content')) {
				locationKey = item.split('.vaccination.content')[0]
			}

			if (!item.includes('.vaccination.content') && !item.endsWith('.strings')) {
				locationKey = item
				changeDesc = 'Removed location data for'
			}

			let locationName = toProperCase(locationKey.split('.').pop() as string)
			if (locationName && changesList.findIndex(c => c.value === locationName) === -1) {
				changesList.push({label: `${changeDesc} ${locationName}`, value: locationName})
			}

			if (locationKey && !locationUpdates.includes(locationKey)) {
				locationUpdates.push(locationKey)
			}
		})
	}

	return {changesList, locationUpdates}
}
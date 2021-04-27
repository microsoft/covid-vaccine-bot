/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { compare } from '../utils/dataUtils'
import { toProperCase } from '../utils/textUtils'

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
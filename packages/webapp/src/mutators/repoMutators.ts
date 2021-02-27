/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'
import { createLocationDataObj } from '../utils/dataUtils'

export const setBranchList = mutatorAction(
	'setBranchList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.branches = data
			const mainBranch = data.find((branch) => branch.name === 'main')
			store.mainBranch = mainBranch
		}
	}
)

export const setIssuesList = mutatorAction(
	'setIssuesList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.issues = data
		}
	}
)

export const handleCreatePR = mutatorAction(
	'handleCreatePR',
	(data: any[] | undefined) => {
		if (data) {
			alert('Checkout Github!')
		}
	}
)

export const setRepoFileData = mutatorAction(
	'setRepoFileData',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.repoFileData = data[0]
			store.initRepoFileData = data[0]
			store.globalFileData = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
		}
	}
)

export const setCurrentLanguage = mutatorAction(
	'setCurrentLanguage',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.currentLanguage = data.key
		}
	}
)

export const updateLocationList = mutatorAction('updateLocationList', (locationData: any, isRegion: boolean, selectedState?: any) => {
	if (locationData) {
		const store = getAppStore()
		const newLocObj = createLocationDataObj(locationData)

		if (!isRegion) {
			store.globalFileData.cdcStateNames.content[`cdc/${newLocObj.info.content.id}/state_name`] = {
				"en-us": locationData.details,
				"es-us": locationData.details,
				"vi-vn": locationData.details,
			}

			store.repoFileData[newLocObj.info.content.id] = newLocObj
			store.repoFileData = {...store.repoFileData}
		} else {
			newLocObj.info.path = `${selectedState.key}/regions/${newLocObj.info.path}`
			newLocObj.vaccination.path = `${selectedState.key}/regions/${newLocObj.vaccination.path}`

			if (store.repoFileData[selectedState.key].regions) {
				store.repoFileData[selectedState.key].regions[newLocObj.info.content.id] = newLocObj
			} else {
				store.repoFileData[selectedState.key].regions = {
					[newLocObj.info.content.id]: newLocObj
				}
			}

			store.repoFileData = {...store.repoFileData}
		}
	}
})

export const updatePhaseList = mutatorAction('updatePhaseList', (phaseItems: any[], isRegion: boolean, selectedState: any) => {
	if (phaseItems) {
		const store = getAppStore()
		store.repoFileData[selectedState.key].vaccination.content.phases = phaseItems.map(item => {
			return {
				id: item.keyId,
				label: item.name,
				qualifications: []
			}
		})

		store.repoFileData = {...store.repoFileData}
	}
})
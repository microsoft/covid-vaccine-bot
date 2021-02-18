/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'

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
			store.globalFileData = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
			console.log(data)
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

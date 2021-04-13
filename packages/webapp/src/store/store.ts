/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { autorun } from 'mobx'
import { createStore, getRootStore } from 'satcheljs'
import { loadState, saveState } from './localStorage'
import { AppState } from './schema/AppState'

export const initialStore = {
	isAuthenticated: false,
	isAuthorized: true,
	accessToken: undefined,
	username: undefined,
	email: undefined,
	userDisplayName: undefined,
	branches: undefined,
	issues: [],
	repoFileData: undefined,
	initRepoFileData: undefined,
	globalFileData: undefined,
	initGlobalFileData: undefined,
	mainBranch: undefined,
	currentLanguage: 'en-us',
	toggleQualifier: false,
	isEditable: true,
	pendingChanges: false,
	isDataRefreshing: false,
	prChanges: undefined,
	userWorkingBranch: undefined,
	userWorkingBranches: [],
	userAccessExpired: false,
	isDataStale: false,
	isSavingCommits: false,
	localization: {},
	defaultLanguage: {},
	committedDeletes: [],
	repoFileChanges: {},
	globalFileChanges: {}
}

export const getAppState = (): AppState => {
	const localState = loadState()

	return {
		...initialStore,
		...localState,
	}
}

export const getAppStore = createStore<AppState>('appState', getAppState())

const store = getRootStore().get('appState')

autorun(() => {
	if (store.accessToken)
		saveState({
			accessToken: store.accessToken,
			isAuthorized: store.isAuthorized,
			isAuthenticated: store.isAuthenticated,
			userDisplayName: store.userDisplayName,
			username: store.username,
			email: store.email,
			userAccessExpired: store.userAccessExpired,
			localization: store.localization,
			currentLanguage: store.currentLanguage,
		})
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { createStore } from 'satcheljs'
import { AppState } from './schema/AppState'

export const getAppState = (): AppState => {
	return {
		isAuthenticated: false,
		isAuthorized: true,
		accessToken: undefined,
		username: undefined,
		email: undefined,
		userDisplayName: undefined,
		branches: undefined,
		issues: undefined,
		repoFileData: undefined,
		initRepoFileData: undefined,
		globalFileData: undefined,
		initGlobalFileData: undefined,
		mainBranch: undefined,
		currentLanguage: 'en-us',
		toggleQualifier: false,
		isEditable: true,
		pendingChanges: false,
		isDataRefreshing: false
	}
}

export const getAppStore = createStore<AppState>('appState', getAppState())

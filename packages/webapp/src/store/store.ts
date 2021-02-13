import { createStore } from 'satcheljs'
import { AppState } from './schema/AppState'

export const getAppState = (): AppState => {
	return {
		isAuthenticated: false,
		accessToken: undefined,
		username: undefined,
		email: undefined,
		userDisplayName: undefined,
		branches: undefined,
		repoFileData: undefined,
		globalFileData: undefined,
		mainBranch: undefined,
		fileChanges: [],
		currentLanguage: 'en-us',
		toggleAddLocation: false,
		toggleQualifier: false,
	}
}

export const getAppStore = createStore<AppState>('appState', getAppState())

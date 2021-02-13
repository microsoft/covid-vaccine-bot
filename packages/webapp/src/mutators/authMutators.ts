import { mutatorAction } from 'satcheljs'
import { AppState } from '../store/schema/AppState'
import { getAppStore } from '../store/store'

export const setUserAuthData = mutatorAction(
	'setUserAuthData',
	(data: AppState | undefined) => {
		if (data) {
			const store = getAppStore()
			store.accessToken = data.accessToken
			store.email = data.email
			store.isAuthenticated = data.isAuthenticated
			store.userDisplayName = data.userDisplayName
			store.username = data.username
		}
	}
)

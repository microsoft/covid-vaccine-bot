/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { AppState } from '../store/schema/AppState'
import { getAppStore } from '../store/store'
import { clearState } from '../store/localStorage'

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

export const setUserNoAccess = mutatorAction('setUserNoAccess', () => {
	const store = getAppStore()
	store.isAuthorized = false
})

export const logoutUser = mutatorAction('logoutUser', () => {
	clearState()

	window.location.reload()
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { AppState } from './schema/AppState'

export const LOCAL_STORE_KEY = 'dataComposer'

export const loadState = (): AppState | undefined => {
	try {
		const serializedState = localStorage.getItem(LOCAL_STORE_KEY)

		if (!serializedState) return undefined

		return JSON.parse(serializedState)
	} catch (err) {
		console.warn('Error loading state', err)
		clearState()
		return undefined
	}
}

export const saveState = (state: any): void => {
	try {
		const local = loadState()
		const serializedState = JSON.stringify({
			...local,
			...state,
		})

		localStorage.setItem(LOCAL_STORE_KEY, serializedState)
	} catch (err) {
		console.warn('Error saving state', err)
		clearState()
	}
}

export const clearState = (): void => {
	localStorage.removeItem(LOCAL_STORE_KEY)
}

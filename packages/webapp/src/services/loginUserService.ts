/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import firebase from 'firebase/app'
import 'firebase/auth'
import { AppState } from '../store/schema/AppState'

export const loginUserService = async (): Promise<AppState | undefined> => {
	let authResp = undefined

	if (!firebase.apps.length) {
		firebase.initializeApp({
			apiKey: process.env.REACT_APP_FIREBASE_KEY,
			authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
		})
	}

	const provider = new firebase.auth.GithubAuthProvider()
	provider.addScope('repo')

	const response = await firebase.auth().signInWithPopup(provider)

	if (response) {
		const oauthCreds = response.credential as firebase.auth.OAuthCredential
		authResp = {
			isAuthenticated: true,
			accessToken: oauthCreds.accessToken,
			email: response.user?.email,
			userDisplayName: response.user?.displayName,
			username: response.additionalUserInfo?.username,
		} as AppState
	}

	return authResp
}

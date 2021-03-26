/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import { loginUser } from '../actions/authActions'
import { initializeGitData } from '../actions/repoActions'
import { setUserAuthData, setUserNoAccess } from '../mutators/authMutators'
import { loginUserService } from '../services/loginUserService'
import { repoServices } from '../services/repoServices'
import { getAppStore } from '../store/store'

orchestrator(loginUser, async () => {
	try {
		let resp: any
		const state = getAppStore()

		if (state.accessToken) {
			resp = {
				accessToken: state.accessToken,
				email: state.email,
				isAuthenticated: state.isAuthenticated,
				userDisplayName: state.userDisplayName,
				username: state.username,
			}
		} else {
			resp = await loginUserService()
		}

		if (resp) {
			setUserAuthData(resp)
			const accessResp = await repoServices('checkAccess')
			if (accessResp.ok) {
				initializeGitData()
			} else {
				setUserNoAccess()
			}
		}
	} catch (error) {
		console.warn('Error logging in', error)
	}
})

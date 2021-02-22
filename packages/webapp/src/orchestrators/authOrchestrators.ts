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

orchestrator(loginUser, async () => {
	const resp = await loginUserService()
	if (resp) {
		setUserAuthData(resp)
		const accessResp = await repoServices('checkAccess')
		if (accessResp.ok) {
			initializeGitData()
		} else {
			setUserNoAccess()
		}
	}
})

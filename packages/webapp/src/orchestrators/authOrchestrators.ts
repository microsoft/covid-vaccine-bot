/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import { loginUser } from '../actions/authActions'
import { initializeGitData } from '../actions/repoActions'
import { setUserAuthData } from '../mutators/authMutators'
import { loginUserService } from '../services/loginUserService'

orchestrator(loginUser, async () => {
	const resp = await loginUserService()
	if (resp) {
		setUserAuthData(resp)
		initializeGitData()
	}
})

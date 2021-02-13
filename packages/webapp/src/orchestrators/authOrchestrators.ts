import { orchestrator } from 'satcheljs'
import { loginUser } from '../actions/authActions'
import { loginUserService } from '../services/loginUserService'
import { setUserAuthData } from '../mutators/authMutators'
import { initializeGitData } from '../actions/repoActions'

orchestrator(loginUser, async () => {
	const resp = await loginUserService()
	if (resp) {
		setUserAuthData(resp)
		initializeGitData()
	}
})

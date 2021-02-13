import { orchestrator } from 'satcheljs'
import {
	getBranches,
	createPR,
	getRepoFileData,
	initializeGitData,
} from '../actions/repoActions'
import { repoServices } from '../services/repoServices'
import {
	setBranchList,
	handleCreatePR,
	setRepoFileData,
} from '../mutators/repoMutators'

orchestrator(getBranches, async () => {
	const resp = await repoServices('getBranches')
	setBranchList(resp)
})

orchestrator(createPR, async (message) => {
	const { fileData } = message
	const resp = await repoServices('createPR', fileData)
	handleCreatePR(resp)
})

orchestrator(getRepoFileData, async () => {
	const resp = await repoServices('getRepoFileData')
	setRepoFileData(resp)
})

orchestrator(initializeGitData, async () => {
	let resp = await repoServices('getBranches')
	setBranchList(resp)

	resp = await repoServices('getRepoFileData')
	setRepoFileData(resp)

	//Load permissions for User
})

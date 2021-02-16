/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import {
	getBranches,
	createPR,
	getRepoFileData,
	initializeGitData,
} from '../actions/repoActions'
import {
	setBranchList,
	handleCreatePR,
	setRepoFileData,
} from '../mutators/repoMutators'
import { repoServices } from '../services/repoServices'

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
})

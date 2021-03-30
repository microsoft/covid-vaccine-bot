/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import {
	createPR,
	getRepoFileData,
	initializeGitData,
	loadPR,
	saveContinue
} from '../actions/repoActions'
import {
	setBranchList,
	handleCreatePR,
	setRepoFileData,
	setIssuesList,
	initStoreData,
	setLoadedPRData,
	setUserWorkingBranch
} from '../mutators/repoMutators'
import { repoServices } from '../services/repoServices'
import { getAppStore } from '../store/store'
import { getChanges } from '../selectors/changesSelectors'


orchestrator(createPR, async (message) => {
	const { fileData } = message
	let resp = await repoServices('createPR', fileData)

	if(resp){

		resp = await repoServices('getBranches')
		setBranchList(resp)

		resp = await repoServices('getRepoFileData')
		setRepoFileData(resp)

		resp = await repoServices('getIssues')
		setIssuesList(resp, fileData[2]())

		handleCreatePR()
	}
})

orchestrator(getRepoFileData, async () => {
	const resp = await repoServices('getRepoFileData')
	setRepoFileData(resp)
})

orchestrator(initializeGitData, async () => {
	initStoreData(true)

	let resp = await repoServices('getBranches')
	setBranchList(resp)

	resp = await repoServices('getRepoFileData')
	setRepoFileData(resp)

	resp = await repoServices('getIssues')
	setIssuesList(resp)

	handleCreatePR()

	initStoreData(false)
})

orchestrator(loadPR, async (message) => {
	const { prNumber } = message

	if (prNumber) {
		const prResp = await repoServices('getPullRequests', prNumber)
		setLoadedPRData(prResp)

		const resp = await repoServices('getRepoFileData', prResp.data.head.ref)
		setRepoFileData(resp)
	}
})

orchestrator(saveContinue, async () => {
	const store = getAppStore()
	if (store.userWorkingBranch) {
		await repoServices('commitChanges', getChanges())
	} else {
		const resp = await repoServices('createWorkingBranch')
		if (resp) {
			setUserWorkingBranch(resp)
			await repoServices('commitChanges', getChanges())
		}
	}
})
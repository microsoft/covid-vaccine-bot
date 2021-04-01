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
	loadBranch,
	saveContinue,
} from '../actions/repoActions'
import {
	setBranchList,
	clearLoadedPRData,
	setInitRepoFileData,
	setRepoFileData,
	setIssuesList,
	initStoreData,
	setLoadedPRData,
	setUserWorkingBranch,
	setPendingChanges,
	setUserWorkingBranches,
} from '../mutators/repoMutators'
import { getChanges } from '../selectors/changesSelectors'
import { repoServices } from '../services/repoServices'
import { getAppStore } from '../store/store'

orchestrator(createPR, async (message) => {
	const { fileData } = message
	let resp = await repoServices('createPR', fileData)
	const store = getAppStore()
	const nextWorkingBranches = store.userWorkingBranches.filter(
		(b) => b.name !== store.userWorkingBranch
	)

	if (resp) {
		resp = await repoServices('getBranches')
		setBranchList(resp)

		resp = await repoServices('getUserWorkingBranches', [resp])
		setUserWorkingBranches(nextWorkingBranches)
		setUserWorkingBranch(undefined)

		resp = await repoServices('getRepoFileData')
		setInitRepoFileData(resp)

		resp = await repoServices('getIssues')
		setIssuesList(resp, fileData[2]())

		clearLoadedPRData()
	}
})

orchestrator(getRepoFileData, async () => {
	const resp = await repoServices('getRepoFileData')
	setInitRepoFileData(resp)
})

orchestrator(initializeGitData, async () => {
	initStoreData(true)
	setUserWorkingBranch(undefined)

	let resp = await repoServices('getBranches')
	setBranchList(resp)

	const userWorkingBranches = await repoServices('getUserWorkingBranches', [
		resp,
	])
	setUserWorkingBranches(userWorkingBranches)

	resp = await repoServices('getRepoFileData')
	setInitRepoFileData(resp)

	resp = await repoServices('getIssues')
	setIssuesList(resp)

	clearLoadedPRData()

	initStoreData(false)
})

orchestrator(loadBranch, async (message) => {
	const { branch } = message
	initStoreData(true)

	const resp = await repoServices(
		'getRepoFileData',
		`refs/heads/${branch.name}`
	)

	if (resp) {
		setUserWorkingBranch(branch.name)
		setRepoFileData(resp)
		clearLoadedPRData()
	}
	initStoreData(false)
})

orchestrator(loadPR, async (message) => {
	const { prNumber } = message

	if (prNumber) {
		const prResp = await repoServices('getPullRequests', prNumber)
		setLoadedPRData(prResp)

		const resp = await repoServices('getRepoFileData', prResp.data.head.ref)
		setInitRepoFileData(resp)

		setUserWorkingBranch(undefined)
	}
})

orchestrator(saveContinue, async () => {
	const store = getAppStore()
	const changes = getChanges()
	let branch = store.userWorkingBranch
	if (!branch) {
		const resp = await repoServices('createWorkingBranch')
		if (resp) {
			branch = resp.ref.split('refs/heads/').join('')
			setUserWorkingBranch(branch)
		}
	}
	await repoServices('commitChanges', {
		...changes,
		branchName: `refs/heads/${branch}`,
	})
	setPendingChanges(false)
})

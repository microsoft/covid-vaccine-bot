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
	saveContinue
} from '../actions/repoActions'
import {
	setBranchList,
	handleCreatePR,
	setRepoFileData,
	setIssuesList,
	initStoreData,
	setLoadedPRData,
	setUserWorkingBranch,
	setPendingChanges,
	setGlobalAndRepoChanges,
	setUserWorkingBranches
} from '../mutators/repoMutators'
import { repoServices } from '../services/repoServices'
import { getAppStore } from '../store/store'
import { getChanges } from '../selectors/changesSelectors'


orchestrator(createPR, async (message) => {
	const { fileData } = message
	let resp = await repoServices('createPR', fileData)
	const store = getAppStore()

	if(resp){

		resp = await repoServices('getBranches')
		setBranchList(resp)

		
		resp = await repoServices('getUserWorkingBranches', [resp])
		setUserWorkingBranches(store.userWorkingBranches)
	
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
	setUserWorkingBranch(undefined)
	
	let resp = await repoServices('getBranches')
	setBranchList(resp)

	const userWorkingBranches = await repoServices('getUserWorkingBranches', [resp])
	setUserWorkingBranches(userWorkingBranches)

	resp = await repoServices('getRepoFileData')
	setRepoFileData(resp)

	resp = await repoServices('getIssues')
	setIssuesList(resp)

	handleCreatePR()

	initStoreData(false)
})

orchestrator(loadBranch, async (message) => {
	const { branch } = message
	initStoreData(true)

	const resp = await repoServices('getRepoFileData', `refs/heads/${branch.name}`)

	if (resp) {
		setUserWorkingBranch(branch.name)
		setRepoFileData(resp)
	}
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
	const changes = getChanges()
	if (store.userWorkingBranch) {
		await repoServices('commitChanges', {...changes, branchName: `refs/heads/${store.userWorkingBranch}`})
		setPendingChanges(false)
		setGlobalAndRepoChanges()
	} else {
		const resp = await repoServices('createWorkingBranch')
		if (resp) {
			setUserWorkingBranch(resp.ref.split('refs/heads/').join(''))
			await repoServices('commitChanges', {...changes, branchName: `refs/heads/${store.userWorkingBranch}`})
			setPendingChanges(false)
			setGlobalAndRepoChanges()
		}
	}

	// after draft branch was created
	// x commit changes to draft branch, 
	// x reset pending changes to false.
	// - update init global and repo with the commited version as base.
	// user should be able to continue commiting to draft branch
	// once user submitted for review, create pr should use draft branch. However, Review tab will only show if there's a diff in the repo.
	// Review tab should show if working branch is present or pending changes is still true.
})
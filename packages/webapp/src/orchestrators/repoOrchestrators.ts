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
import {setUserAccessExpired, setUserAccessToken} from '../mutators/authMutators'
import {
	setBranchList,
	clearLoadedPRData,
	setInitRepoFileData,
	setRepoFileData,
	setIssuesList,
	setLoadedPRData,
	setPendingChanges,
	setUserWorkingBranch,
	setUserWorkingBranches,
	setIsDataRefreshing,
} from '../mutators/repoMutators'
import { getChanges } from '../selectors/changesSelectors'
import { repoServices } from '../services/repoServices'
import { getAppStore } from '../store/store'

orchestrator(createPR, async (message) => {
	const { fileData } = message

	let resp = await repoServices('createPR', fileData)
	if(resp.status === 401) {
		setUserAccessExpired(true)
		setUserAccessToken()
		fileData[2]({error: true})
		return
	}
	const store = getAppStore()
	const nextWorkingBranches = store.userWorkingBranches.filter(
		(b) => b.name !== store.userWorkingBranch
	)

	if(resp){
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
	setIsDataRefreshing(true)
	setUserWorkingBranch(undefined)
	clearLoadedPRData()

	let resp = await repoServices('getBranches')
	if(resp.status === 401) {
		setUserAccessExpired(true)
		setUserAccessToken()
		return
	}
	setBranchList(resp)

	const userWorkingBranches = await repoServices('getUserWorkingBranches', [
		resp,
	])
	setUserWorkingBranches(userWorkingBranches)

	resp = await repoServices('getRepoFileData')
	setInitRepoFileData(resp)

	resp = await repoServices('getIssues')
	setIssuesList(resp)

	setIsDataRefreshing(false)
})

orchestrator(loadBranch, async (message) => {
	const { branch } = message
	setIsDataRefreshing(true)

	const resp = await repoServices(
		'getRepoFileData',
		`refs/heads/${branch.name}`
	)

	if (resp) {
		setUserWorkingBranch(branch.name)
		setRepoFileData(resp)
		clearLoadedPRData()
	}

	setIsDataRefreshing(false)
})

orchestrator(loadPR, async (message) => {
	const { prNumber } = message
	setIsDataRefreshing(true)
	if (prNumber) {
		const prResp = await repoServices('getPullRequests', prNumber)
		if(prResp.status === 401) {
			setUserAccessExpired(true)
			setUserAccessToken()
			return
		}
	
		setLoadedPRData(prResp)

		const resp = await repoServices('getRepoFileData', prResp.data.head.ref)
		setInitRepoFileData(resp)

		setUserWorkingBranch(undefined)
	}
	setIsDataRefreshing(false)
})

orchestrator(saveContinue, async () => {
	const store = getAppStore()
	const changes = getChanges()
	let branch = store.userWorkingBranch
	debugger
	if (!branch) {
		const resp = await repoServices('createWorkingBranch')
		if(resp.status === 401) {
			setUserAccessExpired(true)
			setUserAccessToken()
			return
		}
			
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

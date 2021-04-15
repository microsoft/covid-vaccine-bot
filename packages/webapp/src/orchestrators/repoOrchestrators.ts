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
	getLocationData,
} from '../actions/repoActions'
import {
	setUserAccessExpired,
	setUserAccessToken,
} from '../mutators/authMutators'
import {
	setBranchList,
	clearLoadedPRData,
	setInitRepoFileData,
	setInitLocationsData,
	setRepoFileData,
	setRepoFileChanges,
	setIssuesList,
	setLoadedPRData,
	setPendingChanges,
	setUserWorkingBranch,
	setUserWorkingBranches,
	setCommittedDeletes,
	setIsDataRefreshing,
	setIsDataStale,
	setSavingCommitsFlag,
} from '../mutators/repoMutators'
import { getChanges } from '../selectors/changesSelectors'
import { repoServices } from '../services/repoServices'
import { getAppStore } from '../store/store'

const handleError = (error: any, callback?: () => void) => {
	switch (error.status) {
		case 401:
			setUserAccessExpired(true)
			setUserAccessToken()
			break
		case 'DATA_IS_STALE':
		case 422:
			setIsDataStale(true)
			break
	}

	setSavingCommitsFlag(false)
	callback?.()
}

orchestrator(createPR, async (message) => {
	const { fileData } = message

	let resp = await repoServices('createPR', fileData)
	if (resp.ok === false) {
		handleError(resp, () => fileData[2]({ error: true }))
	} else {
		const store = getAppStore()
		const nextWorkingBranches = store.userWorkingBranches.filter(
			(b) => b.name !== store.userWorkingBranch
		)

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
	setIsDataStale(false)

	let resp = await repoServices('getBranches')
	if (resp.ok === false) {
		handleError(resp)
		return
	}

	setBranchList(resp)

	const userWorkingBranches = await repoServices('getUserWorkingBranches', [
		resp,
	])

	if (resp.ok === false) {
		handleError(resp)
		return
	}

	setUserWorkingBranches(userWorkingBranches)

	resp = await repoServices('getLocations')
	if (resp.ok === false) {
		handleError(resp)
		return
	}

	setInitLocationsData(resp)

	resp = await repoServices('getIssues')
	if (resp.ok === false) {
		handleError(resp)
		return
	}

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

	const date = new Date(parseInt(branch.name.split('-policy-')[1])).toISOString()
	
	const commitResp = await repoServices(
		'getCommits',
		{
			since: date,
			sha: branch.name
		}
	) 
	setCommittedDeletes(commitResp)
	if (resp.ok === false) {
		handleError(
			resp.status === 404 ? { ...resp, status: 'DATA_IS_STALE' } : resp
		)
	} else {
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
		if (prResp.ok === false) {
			handleError(prResp)
			return
		}
		setLoadedPRData(prResp)
		setCommittedDeletes(prResp.commits)
		const resp = await repoServices('getRepoFileData', prResp.data.head.sha)
		if (resp.ok === false) {
			handleError(resp)
		} else {
			setRepoFileChanges(resp)
			setRepoFileData(resp)
		}
		setUserWorkingBranch(undefined)
	}
	setIsDataRefreshing(false)
})

orchestrator(saveContinue, async () => {
	setSavingCommitsFlag(true)
	const store = getAppStore()
	const changes = getChanges()
	let branch = store.userWorkingBranch
	let resp

	if (!branch) {
		resp = await repoServices('createWorkingBranch')
		if (resp.ok === false) {
			handleError(resp)
			return
		}

		branch = resp.ref.split('refs/heads/').join('')
		setUserWorkingBranch(branch)
	}

	resp = await repoServices('commitChanges', {
		...changes,
		branchName: `refs/heads/${branch}`,
	})
	if (resp.ok === false) {
		handleError(resp)
	} else {
		resp = await repoServices('getRepoFileData', resp)
		if (resp.ok === false) {
			handleError(resp)
		} else {
			// latency :(
			setRepoFileData(resp)
			setPendingChanges(false)
		}
	}

	setSavingCommitsFlag(false)
})


orchestrator(getLocationData, async (message) => {
	const { location } = message
	console.log(location)
	const resp = await repoServices('getLocationContents', location.value)
	console.log(resp)
})
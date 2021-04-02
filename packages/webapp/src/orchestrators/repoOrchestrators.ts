/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { orchestrator } from 'satcheljs'
import {
	createPR,
	getRepoFileData,
	initializeGitData,
	loadPR
} from '../actions/repoActions'
import {
	setBranchList,
	handleCreatePR,
	setRepoFileData,
	setIssuesList,
	setIsDataRefreshing,
	setLoadedPRData
} from '../mutators/repoMutators'
import {setUserAccessExpired, setUserAccessToken} from '../mutators/authMutators'
import { repoServices } from '../services/repoServices'

orchestrator(createPR, async (message) => {
	const { fileData } = message

	let resp = await repoServices('createPR', fileData)
	if(resp.status === 401) {
		setUserAccessExpired(true)
		setUserAccessToken()
		fileData[2]({error: true})
		return
	}
	
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
	setIsDataRefreshing(true)

		let resp = await repoServices('getBranches')
		setBranchList(resp)
		
		resp = await repoServices('getRepoFileData')
		if(resp.status === 401) {
			setUserAccessExpired(true)
			setUserAccessToken()
			return
		}

		setRepoFileData(resp)
		
		resp = await repoServices('getIssues')
		setIssuesList(resp)
		
		handleCreatePR()
		
		setIsDataRefreshing(false)
})

orchestrator(loadPR, async (message) => {
	const { prNumber } = message

	if (prNumber) {
		const prResp = await repoServices('getPullRequests', prNumber)
		if(prResp.status === 401) {
			setUserAccessExpired(true)
			setUserAccessToken()
			return
		}
	
		setLoadedPRData(prResp)

		const resp = await repoServices('getRepoFileData', prResp.data.head.ref)
		setRepoFileData(resp)
	}
})
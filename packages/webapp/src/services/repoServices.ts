/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import parse from 'csv-parse/lib/sync'
import { getAppStore } from '../store/store'
import { convertCSVDataToObj } from '../utils/dataUtils'
import {
	b64_to_utf8,
	utf8_to_b64,
	createCSVDataString,
} from '../utils/textUtils'

const githubRepoOwner = process.env.REACT_APP_REPO_OWNER
const githubRepoName = process.env.REACT_APP_REPO_NAME

const createPath = (obj: any, pathInput: string, value: any = undefined) => {
	let path = pathInput.split('/')
	let current = obj
	while (path.length > 1) {
		const [head, ...tail] = path
		path = tail
		if (current[head] === undefined) {
			current[head] = {}
		}
		current = current[head]
	}
	if (!current[path[0]]) {
		current[path[0]] = {}
	} else {
		current[path[0]] = { ...current[path[0]], ...value }
	}
	return obj
}

const getContent = async (url: string, token: string) => {
	const response = await fetch(`${url}`, {
		method: 'GET',
		headers: {
			Authorization: `token ${token}`,
		},
	})
	const data = await response.json()

	return data
}

const createWorkingBranch = async (state: any, branchName: string) => {
	const mainBranch = state?.mainBranch
	const createBranchResponse = await fetch(
		`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/git/refs`,
		{
			method: 'POST',
			headers: {
				Authorization: `token ${state.accessToken}`,
			},
			body: JSON.stringify({
				ref: branchName,
				sha: mainBranch.commit.sha,
			}),
		}
	)
	return await createBranchResponse.json()
}

const commitChanges = async (state: any, branchName: string, globalUpdates: any, locationUpdates: any) => {
	if (globalUpdates) {
		for (const i in globalUpdates) {
			const updateObj = globalUpdates[i]
			const fileData = createCSVDataString(updateObj.content)
			await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/localization/${updateObj.path}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({
						branch: branchName,
						message: `updated ${updateObj.path}`,
						content: utf8_to_b64(fileData),
						sha: updateObj.sha,
					}),
				}
			)
		}
	}

	if (locationUpdates) {
		for (const i in locationUpdates) {
			const locationObj = locationUpdates[i].data

			//Info
			await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/policies/${locationObj.info.path}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({
						branch: branchName,
						message: `updated ${locationObj.info.path}`,
						content: utf8_to_b64(
							JSON.stringify(locationObj.info.content, null, '\t')
						),
						sha: locationObj.info.sha,
					}),
				}
			)
			//Vaccingation
			await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/policies/${locationObj.vaccination.path}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({
						branch: branchName,
						message: `updated ${locationObj.vaccination.path}`,
						content: utf8_to_b64(
							JSON.stringify(
								locationObj.vaccination.content,
								null,
								'\t'
							)
						),
						sha: locationObj.vaccination.sha,
					}),
				}
			)
			//Strings
			await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/policies/${locationObj.strings.path}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({
						branch: branchName,
						message: `updated ${locationObj.strings.path}`,
						content: utf8_to_b64(
							createCSVDataString(locationObj.strings.content)
						),
						sha: locationObj.strings.sha,
					}),
				}
			)

			// Regions
			if (locationObj.regions) {
				const regionKeys = Object.keys(locationObj.regions)
				for (const key of regionKeys) {
					const regionObj = locationObj.regions[key]
					//Info
					await fetch(
						`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/policies/${regionObj.info.path}`,
						{
							method: 'PUT',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
							body: JSON.stringify({
								branch: branchName,
								message: `updated ${regionObj.info.path}`,
								content: utf8_to_b64(
									JSON.stringify(regionObj.info.content, null, '\t')
								),
								sha: regionObj.info.sha,
							}),
						}
					)
					//Vaccination
					await fetch(
						`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/policies/${regionObj.vaccination.path}`,
						{
							method: 'PUT',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
							body: JSON.stringify({
								branch: branchName,
								message: `updated ${regionObj.vaccination.path}`,
								content: utf8_to_b64(
									JSON.stringify(
										regionObj.vaccination.content,
										null,
										'\t'
									)
								),
								sha: regionObj.vaccination.sha,
							}),
						}
					)
				}
			}
		}
	}
}

export const repoServices = async (
	command: string,
	extraData: any = undefined
): Promise<any | undefined> => {
	const state = getAppStore()
	let branchName = `refs/heads/${state.username}-policy-${Date.now()}`

	switch (command) {
		case 'checkAccess':
			const loadAccessResponse = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/collaborators/${state.username}`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
						Accept: 'application/vnd.github.v3+json',
					},
				}
			)
			return loadAccessResponse

		case 'getBranches':
			const loadBranchesResponse = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/branches`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)

			return await loadBranchesResponse.json()

		case 'getUserWorkingBranches': 
			const userPrs = await repoServices('getUserPullRequests')
			const allBranches = extraData[0]
			const usersBranches = allBranches.filter((branch: any) => branch.name.split('-policy-')[0] === state.username)

			const userWorkingBranches = usersBranches.filter((branch: any) => {
				return !userPrs.find((pr: any) => pr?.head?.ref === branch.name)
			} ).sort((a: any, b: any) => (a.name > b.name ? -1 : 1))

			return userWorkingBranches

		case 'getUserPullRequests': 
			const prResp = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/issues?creator=${state.username}`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)
			const prs = await prResp.json();
				
			const populatedPRs: any[] = await Promise.all(
				prs.map(async (item: any) => {
					const res = await fetch(
						`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/pulls/${item.number}`,
						{
							method: 'GET',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
						}
					)
					
					return await res.json()
				})
			)

			return populatedPRs
		case 'getPullRequests':
			const loadPRResponse = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/pulls/${extraData}`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)

			const commitResp = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/pulls/${extraData}/commits`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)

			return {data: await loadPRResponse.json(), commits: await commitResp.json()}
		case 'getIssues':
			const loadIssuesResponse = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/issues`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)

			return await loadIssuesResponse.json()


		case 'getRepoFileData':
			const query = !extraData
				? `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data`
				: `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data?ref=${extraData}`

			const dataFolderResp = await fetch(query,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)
			const dataFolderObj = await dataFolderResp.json()
			const policyFolderGitUrl = dataFolderObj.find(
				(folder: { name: string }) => folder.name === 'policies'
			).git_url
			const loadPolicyFolderResponse = await fetch(
				`${policyFolderGitUrl}?recursive=true`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)
			const policyFolderData = await loadPolicyFolderResponse.json()
			const stateData: any = {}
			policyFolderData.tree.forEach(async (element: any) => {
				if (element.type === 'tree') {
					createPath(stateData, element.path)
				} else {
					const lastInstance = element.path.lastIndexOf('/')
					const filePath = element.path.substring(0, lastInstance)
					const fileName: string = element.path.substring(lastInstance + 1)
					const fileType: string = fileName.split('.')[0]
					const fileObj: any = {}

					const fileData = await getContent(
						String(element.url),
						String(state.accessToken)
					)

					switch (fileName.split('.')[1].toLowerCase()) {
						case 'json':
							fileObj[fileType] = {
								name: fileName,
								type: fileType,
								sha: element.sha,
								url: element.url,
								path: element.path,
								content: JSON.parse(b64_to_utf8(fileData.content)),
							}
							break
						case 'md':
							fileObj['desc_md'] = {
								name: fileName,
								type: fileType,
								sha: element.sha,
								url: element.url,
								path: element.path,
								content: b64_to_utf8(fileData.content),
							}

							break
						case 'csv':
							fileObj['strings'] = {
								name: fileName,
								type: fileType,
								sha: element.sha,
								url: element.url,
								path: element.path,
								content: convertCSVDataToObj(
									parse(b64_to_utf8(fileData.content), { columns: true })
								),
							}

							break
					}

					if (fileObj !== {}) {
						createPath(stateData, filePath, fileObj)
					}
				}
			})

			const localizationFolderGitUrl = dataFolderObj.find(
				(folder: { name: string }) => folder.name === 'localization'
			).git_url

			const localizationResponse = await fetch(
				`${localizationFolderGitUrl}?recursive=true`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
				}
			)

			const localizationData = await localizationResponse.json()

			const customStrings = localizationData.tree.find(
				(file: { path: string }) => file.path === 'custom-strings.csv'
			)
			const cdcStateNames = localizationData.tree.find(
				(file: { path: string }) => file.path === 'cdc-state-names.csv'
			)
			const cdcStateLinks = localizationData.tree.find(
				(file: { path: string }) => file.path === 'cdc-state-links.csv'
			)

			let customStringsData: any = {}
			let cdcStateNamesData: any = {}
			let cdcStateLinksData: any = {}

			const customStringsDataParse = await getContent(
				String(customStrings.url),
				String(state.accessToken)
			)
			customStringsData = convertCSVDataToObj(
				parse(b64_to_utf8(customStringsDataParse.content), { columns: true })
			)

			const cdcStateNamesDataParse = await getContent(
				String(cdcStateNames.url),
				String(state.accessToken)
			)
			cdcStateNamesData = convertCSVDataToObj(
				parse(b64_to_utf8(cdcStateNamesDataParse.content), { columns: true })
			)

			const cdcStateLinksDataParse = await getContent(
				String(cdcStateLinks.url),
				String(state.accessToken)
			)
			cdcStateLinksData = convertCSVDataToObj(
				parse(b64_to_utf8(cdcStateLinksDataParse.content), { columns: true })
			)

			customStrings['content'] = customStringsData
			cdcStateNames['content'] = cdcStateNamesData
			cdcStateLinks['content'] = cdcStateLinksData

			return [stateData, customStrings, cdcStateNames, cdcStateLinks]

		case 'createWorkingBranch':
			if (state?.mainBranch) {
				return await createWorkingBranch(state, branchName)
			}
			break
		case 'commitChanges':
			if (extraData) {
				await commitChanges(state, extraData.branchName, extraData.globalUpdates, extraData.locationUpdates)
			}
			break
		case 'createPR':
			if (state?.mainBranch) {
				const globalUpdates = extraData[0]
				const locationUpdates = extraData[1]
				const prFormData = extraData[3]

				if(state.loadedPRData) {
					branchName = `refs/heads/${state.loadedPRData.head.ref}`
				} else if (state.userWorkingBranch) {
					branchName = `refs/heads/${state.userWorkingBranch}`
				} else {
					await createWorkingBranch(state, branchName)
				}

				if (state.pendingChanges) {
					await commitChanges(state, branchName, globalUpdates, locationUpdates)
				}

				let prTitle = ''
				if (!state.loadedPRData) {
					prTitle = !prFormData.prTitle ? 'auto PR creation' : prFormData.prTitle

					const prResp = await fetch(
						`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/pulls`,
						{
							method: 'POST',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
							body: JSON.stringify({
								head: branchName,
								base: 'main',
								title: prTitle,
								body: prFormData.prDetails
							}),
						}
					)

					const prRespClone = await prResp.clone().json()

					await fetch(
						`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/issues/${prRespClone.number}/labels`,
						{
							method: 'POST',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
							body: JSON.stringify({
								labels: ['data-composer-submission', 'requires-data-accuracy-review']
							}),
						}
					)

					return prResp.json()
				} else {
					prTitle = !prFormData.prTitle ? state.loadedPRData.title : prFormData.prTitle
					const prDetails = !prFormData.prDetails ? state.loadedPRData.body : prFormData.prDetails
					await fetch(
						`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/pulls/${state.loadedPRData.number}`,
						{
							method: 'PATCH',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
							body: JSON.stringify({
								title: prTitle,
								body: prDetails
							}),
						}
					)

					return state.loadedPRData
				}
			}
			break
	}

	return undefined
}

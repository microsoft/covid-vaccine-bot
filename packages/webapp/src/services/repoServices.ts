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

const gitFetch = async (url: string, options: any = {}) => {
	const {headers, json = true, ..._options} = options
	const {accessToken} = getAppStore()
	const apiUrl = url.startsWith('https://api.github.com/') ? url : `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/${url}`

	const response = await fetch(apiUrl, {
		method: 'GET',
		headers: {
			Authorization: `token ${accessToken}`,
			...headers
		},
		..._options
	})
	
	if(!response.ok) {
		return {
			status: response.status,
			ok: response.ok
		}
	}
	
	if(json)
		return await response.json()
	else
		return response
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

export const repoServices = async (
	command: string,
	extraData: any = undefined
): Promise<any | undefined> => {
	const state = getAppStore()

	switch (command) {
		case 'checkAccess':
			const loadAccessResponse = await gitFetch(
				`collaborators/${state.username}`,
				{
					headers: {
						Accept: 'application/vnd.github.v3+json',
					},
					json: false
				}
			)
			return loadAccessResponse

		case 'getBranches':
			const loadBranchesResponse = await gitFetch(`branches`)

			return loadBranchesResponse
		case 'getPullRequests':
			const loadPRResponse = await gitFetch(`pulls/${extraData}`)

			const commentResp = await gitFetch(`issues/${extraData}/comments`)

			const commentsObj = await commentResp.json()
			const changes: any[] = []
			if (commentsObj && commentsObj.length > 0) {
				commentsObj.forEach((comment: { body: string }) => {
					changes.push(JSON.parse(comment.body.substr(1, comment.body.length - 2)))
				})
			}

			const commitResp = await gitFetch(`pulls/${extraData}/commits`)

			return {data: loadPRResponse, changes, commits: commitResp}
		case 'getIssues':
			const loadIssuesResponse = await gitFetch(`issues`)

			const prList = loadIssuesResponse
			const prChangeList: any[] = []
			prList.forEach(async (item: any) => {
				const commentResp = await gitFetch(`issues/${item.number}/comments`)
				const commentsObj = commentResp
				if (commentsObj && commentsObj.length > 0) {
					const changes = JSON.parse(
						commentsObj[0].body.substr(1, commentsObj[0].body.length - 2)
					)
					prChangeList.push({
						prNumber: item.number,
						prDescription: item.body,
						prChanges: changes,
					})
				}
			})

			return [loadIssuesResponse, prChangeList]


		case 'getRepoFileData':
			const query = !extraData
				? `contents/packages/plans/data`
				: `contents/packages/plans/data?ref=${extraData}`

			const dataFolderResp = await gitFetch(query)
			const dataFolderObj = dataFolderResp
			const policyFolderGitUrl = dataFolderObj.find(
				(folder: { name: string }) => folder.name === 'policies'
			).git_url
			const loadPolicyFolderResponse = await gitFetch(`${policyFolderGitUrl}?recursive=true`)
			const policyFolderData = loadPolicyFolderResponse
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

			const localizationResponse = await gitFetch(`${localizationFolderGitUrl}?recursive=true`)


			const customStrings = localizationResponse.tree.find(
				(file: { path: string }) => file.path === 'custom-strings.csv'
			)
			const cdcStateNames = localizationResponse.tree.find(
				(file: { path: string }) => file.path === 'cdc-state-names.csv'
			)
			const cdcStateLinks = localizationResponse.tree.find(
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

		case 'createPR':
			if (state?.mainBranch) {
				const mainBranch = state?.mainBranch
				let branchName = `refs/heads/${state.username}-policy-${Date.now()}`
				const globalUpdates = extraData[0]
				const locationUpdates = extraData[1]
				const prFormData = extraData[3]
				const changeSummary = extraData[4]

				let workingBranch = state.loadedPRData

				if (!state.loadedPRData) {
					const createBranchResponse = await gitFetch(
						`git/refs`,
						{
							method: 'POST',
							body: JSON.stringify({
								ref: branchName,
								sha: mainBranch.commit.sha,
							}),
						}
					)
					if(!createBranchResponse.ok)
						return createBranchResponse
					
					workingBranch = createBranchResponse
				} else {
					branchName = `refs/heads/${state.loadedPRData.head.ref}`
				}

				if (workingBranch) {
					if (globalUpdates) {
						for (const i in globalUpdates) {
							const updateObj = globalUpdates[i]
							const fileData = createCSVDataString(updateObj.content)
							await gitFetch(
								`contents/packages/plans/data/localization/${updateObj.path}`,
								{
									method: 'PUT',
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
							const infoUpdateResponse = await gitFetch(
								`contents/packages/plans/data/policies/${locationObj.info.path}`,
								{
									method: 'PUT',
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
							if(!infoUpdateResponse.ok)
								return infoUpdateResponse

							//Vaccination
							await gitFetch(
								`contents/packages/plans/data/policies/${locationObj.vaccination.path}`,
								{
									method: 'PUT',
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
							await gitFetch(
								`contents/packages/plans/data/policies/${locationObj.strings.path}`,
								{
									method: 'PUT',
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
									await gitFetch(
										`contents/packages/plans/data/policies/${regionObj.info.path}`,
										{
											method: 'PUT',
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
									await gitFetch(
										`contents/packages/plans/data/policies/${regionObj.vaccination.path}`,
										{
											method: 'PUT',
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


				let prTitle = ''
				if (!state.loadedPRData) {
					prTitle = !prFormData.prTitle ? 'auto PR creation' : prFormData.prTitle
					const prResp = await gitFetch(
						`pulls`,
						{
							method: 'POST',
							body: JSON.stringify({
								head: branchName,
								base: 'main',
								title: prTitle,
								body: prFormData.prDetails
							}),
						}
					)
					if(!prResp.ok)
						return prResp

					await gitFetch(
						`issues/${prResp.number}/labels`,
						{
							method: 'POST',
							body: JSON.stringify({
								labels: ['data-composer-submission', 'requires-data-accuracy-review']
							}),
						}
					)

					await gitFetch(
						`issues/${prResp.number}/comments`,
						{
							method: 'POST',
							headers: {
								Authorization: `token ${state.accessToken}`,
							},
							body: JSON.stringify({
								body: `\`${JSON.stringify(changeSummary)}\``
							}),
						}
					)

					return prResp
				} else {
					prTitle = !prFormData.prTitle ? state.loadedPRData.title : prFormData.prTitle
					const prDetails = !prFormData.prDetails ? state.loadedPRData.body : prFormData.prDetails
					const prResp = await gitFetch(
						`pulls/${state.loadedPRData.number}`,
						{
							method: 'PATCH',
							body: JSON.stringify({
								title: prTitle,
								body: prDetails
							}),
						}
					)

					if(!prResp.ok)
						return prResp

					await gitFetch(
						`issues/${state.loadedPRData.number}/comments`,
						{
							method: 'POST',
							body: JSON.stringify({
								body: `\`${JSON.stringify(changeSummary)}\``
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

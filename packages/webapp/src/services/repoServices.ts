/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import parse from 'csv-parse/lib/sync'
import { getAppStore } from '../store/store'
import { convertCSVDataToObj, pathFind } from '../utils/dataUtils'
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
}

export const gitFetch = async (
	url: string,
	options: any = {}
): Promise<any> => {
	const { headers, json = true, ..._options } = options
	const { accessToken } = getAppStore()
	const apiUrl = url.startsWith('https://api.github.com/')
		? url
		: `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/${url}`

	const response = await fetch(apiUrl, {
		method: 'GET',
		headers: {
			Authorization: `token ${accessToken}`,
			...headers,
		},
		..._options,
	})

	if (response.ok === false) {
		const error = Object.assign(new Error(), {
			status: response.status,
			ok: response.ok,
		})

		throw error
	}

	if (json) return await response.json()
	else return response
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
	if (state.mainBranch)
		return await gitFetch(`git/refs`, {
			method: 'POST',
			body: JSON.stringify({
				ref: branchName,
				sha: state.mainBranch.commit.sha,
			}),
		})
	else return undefined
}

const commitChanges = async (
	state: any,
	branchName: string,
	locationUpdates: any
) => {
	let branchLastCommitSha = ''
	const { committedDeletes, repoFileData, initRepoFileData } = state

	if (locationUpdates) {
		let skipFetch = false
		let locationResp: any = {}

		for(const locationPath of locationUpdates) {
			const pathArray = locationPath.split('.')
			let locationObj = pathFind(repoFileData, pathArray)
			const isDeleted = !locationObj

			if (isDeleted) {
				locationObj = pathFind(initRepoFileData, pathArray)
			}

			skipFetch =
				!locationObj.info?.path ||
				committedDeletes.includes(locationObj.info.path)

				const method = isDeleted ? 'DELETE' : 'PUT'
				const message = isDeleted ? 'deleted' : 'updated'
				const content = isDeleted
				? undefined
				: {
					info: utf8_to_b64(
						JSON.stringify(locationObj.info.content, null, '\t')
						),
						vaccination: utf8_to_b64(
							JSON.stringify(locationObj.vaccination.content, null, '\t')
							),
							strings: utf8_to_b64(
								createCSVDataString(locationObj.strings.content)
								),
							}

			if (!skipFetch) {
				//Info
				const infoQuery = `contents/packages/plans/data/policies/${locationObj.info.path}`
				locationResp = await gitFetch(infoQuery, {
					method,
					body: JSON.stringify({
						branch: branchName,
						message: `${message} ${locationObj.info.path}`,
						content: content?.info,
						sha: locationObj.info.sha,
					}),
				})

				//Vaccination
				const vacQuery = `contents/packages/plans/data/policies/${locationObj.vaccination.path}`
				locationResp = await gitFetch(vacQuery, {
					method,
					body: JSON.stringify({
						branch: branchName,
						message: `${message} ${locationObj.vaccination.path}`,
						content: content?.vaccination,
						sha: locationObj.vaccination.sha,
					}),
				})

				//Strings
				const stringQuery = `contents/packages/plans/data/policies/${locationObj.strings.path}`
				locationResp = await gitFetch(stringQuery, {
					method,
					body: JSON.stringify({
						branch: branchName,
						message: `${message} ${locationObj.strings.path}`,
						content: content?.strings,
						sha: locationObj.strings.sha,
					}),
				})
			}
		}

		branchLastCommitSha = locationResp?.commit?.sha ?? branchLastCommitSha
	}
	// if (locationUpdates) {
	// 	let locationResp: any = {}
	// 	let skipFetch = false
	// 	for (const i in locationUpdates) {
	// 		const locationObj = locationUpdates[i].data
	// 		skipFetch =
	// 			!locationObj.info?.path ||
	// 			committedDeletes.includes(locationObj.info.path)
	// 		const infoQuery = `contents/packages/plans/data/policies/${locationObj.info.path}`
	// 		const method = locationObj.delete ? 'DELETE' : 'PUT'
	// 		const message = locationObj.delete ? 'deleted' : 'updated'
	// 		const content = locationObj.delete
	// 			? undefined
	// 			: {
	// 					info: utf8_to_b64(
	// 						JSON.stringify(locationObj.info.content, null, '\t')
	// 					),
	// 					vaccination: utf8_to_b64(
	// 						JSON.stringify(locationObj.vaccination.content, null, '\t')
	// 					),
	// 					strings: utf8_to_b64(
	// 						createCSVDataString(locationObj.strings.content)
	// 					),
	// 			  }

	// 		//Info
	// 		if (!skipFetch) {
	// 			locationResp = await gitFetch(infoQuery, {
	// 				method,
	// 				body: JSON.stringify({
	// 					branch: branchName,
	// 					message: `${message} ${locationObj.info.path}`,
	// 					content: content?.info,
	// 					sha: locationObj.info.sha,
	// 				}),
	// 			})

	// 			//Vaccination
	// 			const vacQuery = `contents/packages/plans/data/policies/${locationObj.vaccination.path}`
	// 			locationResp = await gitFetch(vacQuery, {
	// 				method,
	// 				body: JSON.stringify({
	// 					branch: branchName,
	// 					message: `${message} ${locationObj.vaccination.path}`,
	// 					content: content?.vaccination,
	// 					sha: locationObj.vaccination.sha,
	// 				}),
	// 			})

	// 			//Strings
	// 			const stringQuery = `contents/packages/plans/data/policies/${locationObj.strings.path}`
	// 			locationResp = await gitFetch(stringQuery, {
	// 				method,
	// 				body: JSON.stringify({
	// 					branch: branchName,
	// 					message: `${message} ${locationObj.strings.path}`,
	// 					content: content?.strings,
	// 					sha: locationObj.strings.sha,
	// 				}),
	// 			})
	// 		}

	// 		// Regions
	// 		if (locationObj.regions && !skipFetch) {
	// 			const regionKeys = Object.keys(locationObj.regions)
	// 			for (const key of regionKeys) {
	// 				const regionObj = locationObj.regions[key]
	// 				const skipRegionFetch =
	// 					!regionObj.info?.path ||
	// 					committedDeletes.includes(regionObj.info.path)

	// 				//Info
	// 				if (!skipRegionFetch) {
	// 					const _delete = locationObj.delete || regionObj.delete
	// 					const regionMethod = _delete ? 'DELETE' : 'PUT'
	// 					const regionMessage = _delete ? 'deleted' : 'updated'
	// 					const regInfoQuery = `contents/packages/plans/data/policies/${regionObj.info.path}`

	// 					locationResp = await gitFetch(regInfoQuery, {
	// 						method: regionMethod,
	// 						body: JSON.stringify({
	// 							branch: branchName,
	// 							message: `${regionMessage} ${regionObj.info.path}`,
	// 							content: _delete
	// 								? undefined
	// 								: utf8_to_b64(
	// 										JSON.stringify(regionObj.info.content, null, '\t')
	// 								  ),
	// 							sha: regionObj.info.sha,
	// 						}),
	// 					})

	// 					//Vaccination
	// 					const regVacQuery = `contents/packages/plans/data/policies/${regionObj.vaccination.path}`
	// 					locationResp = await gitFetch(regVacQuery, {
	// 						method: regionMethod,
	// 						body: JSON.stringify({
	// 							branch: branchName,
	// 							message: `${regionMessage} ${regionObj.vaccination.path}`,
	// 							content: _delete
	// 								? undefined
	// 								: utf8_to_b64(
	// 										JSON.stringify(regionObj.vaccination.content, null, '\t')
	// 								  ),
	// 							sha: regionObj.vaccination.sha,
	// 						}),
	// 					})
	// 				}
	// 			}
	// 		}
	// 	}

	// 	branchLastCommitSha = locationResp?.commit?.sha ?? branchLastCommitSha
	// }

	return branchLastCommitSha
}

export const repoServices = async (
	command: string,
	extraData: any = undefined
): Promise<any | undefined> => {
	try {
		const state = getAppStore()
		let branchName = `refs/heads/${state.username}-policy-${Date.now()}`

		switch (command) {
			case 'checkAccess':
				return await gitFetch(`collaborators/${state.username}`, {
					headers: {
						Accept: 'application/vnd.github.v3+json',
					},
					json: false,
				})

			case 'getBranches':
				return await gitFetch(`branches?per_page=100`)

			case 'getCommits':
				console.log('extraData', extraData)
				return await gitFetch(
					`commits?since=${extraData.since}&sha=${extraData.sha}`
				)

			case 'getUserWorkingBranches':
				const userPrs = await repoServices('getUserPullRequests')
				const allBranches = extraData[0]
				const usersBranches = allBranches.filter(
					(branch: any) => branch.name.split('-policy-')[0] === state.username
				)

				const userWorkingBranches = usersBranches
					.filter((branch: any) => {
						return !userPrs.find((pr: any) => pr?.head?.ref === branch.name)
					})
					.sort((a: any, b: any) => (a.name > b.name ? -1 : 1))

				return userWorkingBranches

			case 'getUserPullRequests':
				const prs = await gitFetch(`issues?creator=${state.username}`)
				const populatedPRs: any[] = await Promise.all(
					prs.map(async (item: any) => gitFetch(`pulls/${item.number}`))
				)

				return populatedPRs
			case 'getPullRequests':
				const loadPRResponse = await gitFetch(`pulls/${extraData}`)
				const commitResp = await gitFetch(`pulls/${extraData}/commits`)

				return { data: loadPRResponse, commits: commitResp }
			case 'getIssues':
				return await gitFetch(`issues`)

			case 'getRepoFileData':
				const query = !extraData
					? `contents/packages/plans/data?ref=${process.env.REACT_APP_MAIN_BRANCH}`
					: `contents/packages/plans/data?ref=${extraData}`

				const dataFolderObj = await gitFetch(query)
				const policyFolderGitUrl = dataFolderObj.find(
					(folder: { name: string }) => folder.name === 'policies'
				).git_url
				const loadPolicyFolderResponse = await gitFetch(
					`${policyFolderGitUrl}?recursive=true`
				)
				const policyFolderData = loadPolicyFolderResponse
				const stateData: any = {}

				policyFolderData.tree.forEach((element: any) => {
					if (element.type === 'tree') {
						createPath(stateData, element.path)
					} else {
						const lastInstance = element.path.lastIndexOf('/')
						const filePath = element.path.substring(0, lastInstance)
						const fileName: string = element.path.substring(lastInstance + 1)
						const fileType: string = fileName.split('.')[0]
						const fileObj: any = {}

						switch (fileName.split('.')[1].toLowerCase()) {
							case 'json':
								fileObj[fileType] = {
									name: fileName,
									type: fileType,
									sha: element.sha,
									url: element.url,
									path: element.path,
									content: null,
								}
								break
							case 'md':
								fileObj['desc_md'] = {
									name: fileName,
									type: fileType,
									sha: element.sha,
									url: element.url,
									path: element.path,
									content: null,
								}

								break
							case 'csv':
								fileObj['strings'] = {
									name: fileName,
									type: fileType,
									sha: element.sha,
									url: element.url,
									path: element.path,
									content: null,
								}

								break
						}

						if (fileObj !== {}) {
							createPath(stateData, filePath, fileObj)
						}
					}
				})

				for (const element of Object.keys(stateData)) {
					const location = stateData[element]

					const [infoData, stringsData, vaccinationData] = await Promise.all([
						gitFetch(String(location.info.url)),
						gitFetch(String(location.strings.url)),
						gitFetch(String(location.vaccination.url)),
					])

					location.info.content = JSON.parse(b64_to_utf8(infoData.content))
					location.strings.content = convertCSVDataToObj(
						parse(b64_to_utf8(stringsData.content), { columns: true })
					)
					location.vaccination.content = JSON.parse(
						b64_to_utf8(vaccinationData.content)
					)
				}

				return stateData

			case 'getLocationData':
				const location = extraData

				const pathArray = location.info.path.split('/')
				pathArray.splice(-1, 1)
				const pathStr = pathArray.join('/')

				if (location.info) {
					const infoData = await getContent(
						String(location.info.url),
						String(state.accessToken)
					)

					location.info.content = JSON.parse(b64_to_utf8(infoData.content))
				}

				if (location.strings) {
					const stringsData = await getContent(
						String(location.strings.url),
						String(state.accessToken)
					)

					location.strings.content = convertCSVDataToObj(
						parse(b64_to_utf8(stringsData.content), { columns: true })
					)
				} else {
					location.strings = {
						name: location.info.content.id + '.csv',
						path: `${pathStr}/${location.info.content.id}.csv`,
						sha: '',
						type: location.info.content.id,
						url: '',
						content: {},
					}
				}

				if (location.vaccination) {
					const vaccinationData = await getContent(
						String(location.vaccination.url),
						String(state.accessToken)
					)
					location.vaccination.content = JSON.parse(
						b64_to_utf8(vaccinationData.content)
					)
				}

				return location
			case 'createWorkingBranch':
				if (state.mainBranch) {
					return await createWorkingBranch(state, branchName)
				}
				break
			case 'commitChanges':
				if (extraData) {
					return await commitChanges(
						state,
						extraData.branchName,
						extraData.locationUpdates
					)
				}
				break
			case 'createPR':
				if (state.mainBranch) {
					const locationUpdates = extraData[0]
					const prFormData = extraData[2]
					if (state.loadedPRData) {
						branchName = `refs/heads/${state.loadedPRData.head.ref}`
					} else if (state.userWorkingBranch) {
						branchName = `refs/heads/${state.userWorkingBranch}`
					} else {
						await createWorkingBranch(state, branchName)
					}

					if (state.pendingChanges) {
						await commitChanges(
							state,
							branchName,
							locationUpdates
						)
					}

					let prTitle = ''
					if (!state.loadedPRData) {
						prTitle = !prFormData.prTitle
							? 'auto PR creation'
							: prFormData.prTitle
						const prResp = await gitFetch(`pulls`, {
							method: 'POST',
							body: JSON.stringify({
								head: branchName,
								base: process.env.REACT_APP_MAIN_BRANCH,
								title: prTitle,
								body: prFormData.prDetails,
							}),
						})

						await gitFetch(`issues/${prResp.number}/labels`, {
							method: 'POST',
							body: JSON.stringify({
								labels: [
									'data-composer-submission',
									'requires-data-accuracy-review',
								],
							}),
						})

						return prResp
					} else {
						prTitle = !prFormData.prTitle
							? state.loadedPRData.title
							: prFormData.prTitle
						const prDetails = !prFormData.prDetails
							? state.loadedPRData.body
							: prFormData.prDetails
						await gitFetch(`pulls/${state.loadedPRData.number}`, {
							method: 'PATCH',
							body: JSON.stringify({
								title: prTitle,
								body: prDetails,
							}),
						})

						return state.loadedPRData
					}
				}
				break
		}

		return undefined
	} catch (error) {
		return error
	}
}

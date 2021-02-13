/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { processCSVData, convertCSVDataToObj } from '../utils/dataUtils'
import { b64_to_utf8, utf8_to_b64 } from '../utils/textUtils'

console.log('proc', process.env)
const github = {
	REPO_OWNER: process.env.REACT_APP_REPO_OWNER,
	REPO_NAME: process.env.REACT_APP_REPO_NAME,
}

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

export const repoServices = async (
	command: string,
	extraData: any = undefined
): Promise<any | undefined> => {
	const state = getAppStore()

	if (command === 'getBranches') {
		const response = await fetch(
			`https://api.github.com/repos/${github.REPO_OWNER}/${github.REPO_NAME}/branches`,
			{
				method: 'GET',
				headers: {
					Authorization: `token ${state.accessToken}`,
				},
			}
		)

		const data = await response.json()

		return data
	}

	if (command === 'getRepoFileData') {
		const dataFolderResp = await fetch(
			`https://api.github.com/repos/${github.REPO_OWNER}/${github.REPO_NAME}/contents/packages/plans/data`,
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
		const response = await fetch(`${policyFolderGitUrl}?recursive=true`, {
			method: 'GET',
			headers: {
				Authorization: `token ${state.accessToken}`,
			},
		})
		const data = await response.json()
		const stateData: any = {}
		data.tree.forEach(async (element: any) => {
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
								processCSVData(b64_to_utf8(fileData.content))
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
			processCSVData(b64_to_utf8(customStringsDataParse.content))
		)

		const cdcStateNamesDataParse = await getContent(
			String(cdcStateNames.url),
			String(state.accessToken)
		)
		cdcStateNamesData = convertCSVDataToObj(
			processCSVData(b64_to_utf8(cdcStateNamesDataParse.content))
		)

		const cdcStateLinksDataParse = await getContent(
			String(cdcStateLinks.url),
			String(state.accessToken)
		)
		cdcStateLinksData = convertCSVDataToObj(
			processCSVData(b64_to_utf8(cdcStateLinksDataParse.content))
		)

		customStrings['content'] = customStringsData
		cdcStateNames['content'] = cdcStateNamesData
		cdcStateLinks['content'] = cdcStateLinksData

		return [stateData, customStrings, cdcStateNames, cdcStateLinks]
	}

	if (command === 'createPR') {
		if (state?.mainBranch) {
			const mainBranch = state?.mainBranch
			const branchName = `refs/heads/${state.username}-policy-${Date.now()}`
			const response = await fetch(
				`https://api.github.com/repos/${github.REPO_OWNER}/${github.REPO_NAME}/git/refs`,
				{
					method: 'POST',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({ ref: branchName, sha: mainBranch.commit.sha }),
				}
			)

			const newBranch = await response.json()

			const fileResp = await fetch(
				`https://api.github.com/repos/${github.REPO_OWNER}/${github.REPO_NAME}/contents/packages/plans/data/policies/${extraData.path}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({
						branch: branchName,
						message: 'auto file creation',
						content: utf8_to_b64('[FileContent]'),
						sha: extraData.sha,
					}),
				}
			)

			const prResp = await fetch(
				`https://api.github.com/repos/${github.REPO_OWNER}/${github.REPO_NAME}/pulls`,
				{
					method: 'POST',
					headers: {
						Authorization: `token ${state.accessToken}`,
					},
					body: JSON.stringify({
						head: branchName,
						base: 'main',
						title: 'auto PR creation',
					}),
				}
			)

			return prResp.json()
		}
	}

	return undefined
}

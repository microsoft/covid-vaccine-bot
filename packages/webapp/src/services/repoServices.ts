/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import parse from 'csv-parse/lib/sync'
import { getAppStore } from '../store/store'
import { convertCSVDataToObj } from '../utils/dataUtils'
import { b64_to_utf8, utf8_to_b64 } from '../utils/textUtils'

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
	const githubRepoOwner = process.env.REACT_APP_REPO_OWNER
	const githubRepoName = process.env.REACT_APP_REPO_NAME

	if (command === 'getBranches') {
		const response = await fetch(
			`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/branches`,
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
			`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data`,
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
	}

	if (command === 'createPR') {
		if (state?.mainBranch) {
			const mainBranch = state?.mainBranch
			const branchName = `refs/heads/${state.username}-policy-${Date.now()}`
			const response = await fetch(
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/git/refs`,
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
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data/policies/${extraData.path}`,
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
				`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/pulls`,
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

			console.log(newBranch, fileResp)

			return prResp.json()
		}
	}

	return undefined
}

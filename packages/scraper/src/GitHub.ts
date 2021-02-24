/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */

import { config } from 'dotenv'
import fetch from 'node-fetch'
import { ScrapeLink } from './types'

config()

const githubRepoOwner = process.env.SCRAPER_REPO_OWNER
const githubRepoName = process.env.SCRAPER_REPO_NAME
const githubToken = process.env.SCRAPER_REPO_TOKEN

export async function loadGithubLinkData(): Promise<ScrapeLink[]> {
	let linkList = []

	const dataFolderResp = await fetch(
		`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/packages/plans/data`,
		{
			method: 'GET',
			headers: {
				Authorization: `token ${githubToken}`,
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
				Authorization: `token ${githubToken}`,
			},
		}
	)
	const policyFolderData = await loadPolicyFolderResponse.json()

	const gitFiles = policyFolderData.tree.filter(
		(file: any) => file.path.toLowerCase().indexOf('vaccination.json') !== -1
	)

	for (let i = 0; i < gitFiles.length; i++) {
		const file = gitFiles[i]
		const fileData = JSON.parse(b64_to_utf8(await getContent(file.url)))
		const rootLocation = file.path.split('/')[0]

		if (fileData.links?.eligibility != null) {
			if (fileData.links.eligibility.scrape !== false) {
				linkList.push(
					Object.assign(fileData.links.eligibility, {
						RootLocation: rootLocation,
					}) as ScrapeLink
				)
			}
		} else if (fileData.links?.info != null) {
			if (fileData.links.info.scrape !== false) {
				linkList.push(
					Object.assign(fileData.links.info, {
						RootLocation: rootLocation,
					}) as ScrapeLink
				)
			}
		}

		if (fileData.links?.eligibility_plan != null) {
			if (fileData.links.eligibility_plan.scrape !== false) {
				linkList.push(
					Object.assign(fileData.links.eligibility_plan, {
						RootLocation: rootLocation,
					}) as ScrapeLink
				)
			}
		}
	}

	return linkList
}

export async function createIssues(linkIssues: any): Promise<void> {
	console.log('creating github issues for integrity mismatches')

	// Specifically using a for here since array.forEach + async calls
	// can cause issues.
	for (let location of Object.keys(linkIssues)) {
		const titleLabel = `Webscrapping changes for ${location}`
		let bodyText = ''
		linkIssues[location].forEach((link: ScrapeLink) => {
			bodyText += link.url + '\n'
		})

		await fetch(
			`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/issues`,
			{
				method: 'POST',
				headers: {
					Authorization: `token ${githubToken}`,
				},
				body: JSON.stringify({
					title: titleLabel,
					body: bodyText,
					labels: ['scrapped changes'],
				}),
			}
		)
	}
}

const getContent = async (url: string) => {
	const response = await fetch(`${url}`, {
		method: 'GET',
		headers: {
			Authorization: `token ${githubToken}`,
		},
	})
	const data = await response.json()

	return data.content
}

function atobLookup(chr: any) {
	const keystr =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	const index = keystr.indexOf(chr)
	return index
}

function b64_to_utf8(str: string) {
	const blob = atob(str) || ''
	return decodeURIComponent(escape(blob))
}

function atob(data: string) {
	data = `${data}`
	data = data.replace(/[ \t\n\f\r]/g, '')
	if (data.length % 4 === 0) {
		data = data.replace(/==?$/, '')
	}
	if (data.length % 4 === 1 || /[^+/0-9A-Za-z]/.test(data)) {
		return null
	}
	let output = ''
	let buffer = 0
	let accumulatedBits = 0
	for (let i = 0; i < data.length; i++) {
		buffer <<= 6
		buffer |= atobLookup(data[i])
		accumulatedBits += 6
		if (accumulatedBits === 24) {
			output += String.fromCharCode((buffer & 0xff0000) >> 16)
			output += String.fromCharCode((buffer & 0xff00) >> 8)
			output += String.fromCharCode(buffer & 0xff)
			buffer = accumulatedBits = 0
		}
	}

	if (accumulatedBits === 12) {
		buffer >>= 4
		output += String.fromCharCode(buffer)
	} else if (accumulatedBits === 18) {
		buffer >>= 2
		output += String.fromCharCode((buffer & 0xff00) >> 8)
		output += String.fromCharCode(buffer & 0xff)
	}
	return output
}

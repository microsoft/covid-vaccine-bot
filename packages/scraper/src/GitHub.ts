/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */

import { config } from 'dotenv'
import fetch from 'node-fetch'
import { ScrapeLink } from './types'
var atob = require('atob');

config()

const githubRepoOwner = process.env.SCRAPER_REPO_OWNER
const githubRepoName = process.env.SCRAPER_REPO_NAME
const githubToken = process.env.SCRAPER_REPO_TOKEN

export async function loadGithubLinkData(): Promise<ScrapeLink[]> {
	const linkList = []

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
		const locationPath = file.path.split('/')[0]

		if (fileData.links?.eligibility != null) {
			if (fileData.links.eligibility.scrape !== false) {
				linkList.push(
					Object.assign(fileData.links.eligibility, {
						LocationPath: locationPath,
					}) as ScrapeLink
				)
			}
		} else if (fileData.links?.info != null) {
			if (fileData.links.info.scrape !== false) {
				linkList.push(
					Object.assign(fileData.links.info, {
						LocationPath: locationPath,
					}) as ScrapeLink
				)
			}
		}

		if (fileData.links?.eligibility_plan != null) {
			if (fileData.links.eligibility_plan.scrape !== false) {
				linkList.push(
					Object.assign(fileData.links.eligibility_plan, {
						LocationPath: locationPath,
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
	// can cause issues with execution.
	for (const location of Object.keys(linkIssues)) {
		const titleLabel = `Scraped changes for ${location}`
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

/*
	The following method allow for the decoding of the base64 encoded,
	UTF-8 content that GitHub uses to store the file data on their end.
*/

function b64_to_utf8(str: string) {
	const blob = atob(str) || ''
	return decodeURIComponent(escape(blob))
}

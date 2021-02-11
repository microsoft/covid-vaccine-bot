/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import fetch from 'node-fetch'
import ssri from 'ssri'
import { Link } from '@ms-covidbot/state-plan-schema'
const CACHE_DIR = path.join(__dirname, '../.cache/')

type IntegrityRecord = Record<string, { integrity: string }>
type RunResult = {
	integrity: IntegrityRecord
	changes: Link[]
	errors: Error[]
}

async function scrapeSites(): Promise<void> {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR)
	}
	const lastResult = require('../last_run.json') as RunResult
	const links = (require('@ms-covidbot/state-plans/dist/info_links.json') as Link[]).filter(
		(link) => link.scrape !== false
	)
	console.log(`aggregating ${links.length} sites`)
	const result: RunResult = {
		integrity: {},
		changes: [],
		errors: [],
	}

	let link: Link
	for (link of links) {
		try {
			console.log(chalk.grey.dim(`checking ${printLink(link)}`))
			const scrapeUrl = getScrapeUrl(link)
			const response = await fetch(scrapeUrl, { timeout: 10000 })
			const body = await response.text()
			const integrity = ssri.fromData(body)
			const integrityString = integrity.toString() as string

			// write the response out
			fs.writeFileSync(
				path.join(CACHE_DIR, link.text.replace(/\//g, '.')),
				body
			)

			// Save the current integrity
			result.integrity[link.url] = {
				integrity: integrityString,
			}

			if (integrityString !== lastResult.integrity[link.url]?.integrity) {
				console.log(
					chalk.green(`✔ integrity changed for [${link.text}](${link.url})`)
				)
				result.changes.push(link)
			}
		} catch (err) {
			result.errors.push(err)
		}
	}

	// Write out integrity file
	fs.writeFileSync(
		path.join(__dirname, '../last_run.json'),
		JSON.stringify(result, null, 4),
		{ encoding: 'utf8' }
	)
	console.log(`could not process ${result.errors.length} urls`, result.errors)
	console.log(
		`${result.changes.length}/${links.length} (${(
			(result.changes.length / links.length) *
			100
		).toFixed(2)}%) changed links since last run`
	)
}

function getScrapeUrl(link: Link): string {
	return typeof link.scrape === 'string' ? link.scrape : link.url
}

function printLink(link: Link): string {
	const url = getScrapeUrl(link)
	return `[${link.text}](${url})`
}

scrapeSites()
	.then(() => console.log('sites scraped'))
	.catch((err) => {
		console.error('error while scraping sites', err)
		process.exit(1)
	})

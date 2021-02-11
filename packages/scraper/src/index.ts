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

type IntegrityRecord = Record<string, { integrity: string }>
type RunResult = {
	integrity: IntegrityRecord
	changes: Link[]
	errors: Error[]
}

async function scrapeSites(): Promise<void> {
	const lastResult = require('../last_run.json') as RunResult
	const links = require('@ms-covidbot/state-plans/dist/info_links.json') as Link[]
	console.log(`aggregating ${links.length} sites`)
	const result: RunResult = {
		integrity: {},
		changes: [],
		errors: [],
	}

	let link: Link
	for (link of links) {
		try {
			console.log(chalk.grey.dim(`checking ${link.text}`))
			const response = await fetch(link.url, { timeout: 10000 })
			const body = await response.text()
			const integrity = ssri.fromData(body)
			const integrityString = integrity.toString() as string

			// Save the current integrity
			result.integrity[link.url] = {
				integrity: integrityString,
			}

			if (integrityString !== lastResult.integrity[link.url]?.integrity) {
				console.log(
					chalk.green(`✔ integrity for [${link.text}] changed, ${link.url}`)
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

scrapeSites()
	.then(() => console.log('sites scraped'))
	.catch((err) => {
		console.error('error while scraping sites', err)
		process.exit(1)
	})

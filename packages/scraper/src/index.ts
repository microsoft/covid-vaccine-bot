/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import Crawler from 'crawler'
import jsdom from 'jsdom'
import ssri from 'ssri'
import { Link } from '@ms-covidbot/state-plan-schema'

const CACHE_DIR = path.join(__dirname, '../.cache/')

type IntegrityRecord = Record<string, { integrity: string }>
type RunResult = {
	integrity: IntegrityRecord
	changes: Link[]
	errors: Error[]
}

function loadLastRun(): RunResult {
	return require('../last_run.json') as RunResult
}

function loadLinksToScrape(): Link[] {
	const data = require('@ms-covidbot/state-plans/dist/info_links.json') as Link[]
	return data.filter((link) => link.scrape !== false)
}

async function scrapeSites(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(CACHE_DIR)) {
			fs.mkdirSync(CACHE_DIR)
		}
		const lastResult = loadLastRun()
		const links = loadLinksToScrape()
		console.log(`aggregating ${links.length} sites`)
		const result: RunResult = {
			integrity: {},
			changes: [],
			errors: [],
		}
		const c = new Crawler({
			maxConnections: 10,
			jQuery: jsdom,
		})
		links.forEach((link) => {
			const scrapeUrl = link.url
			c.queue({
				uri: scrapeUrl,
				callback: (err, res, done) => {
					if (err) {
						result.errors.push(
							new Error(`error crawling ${scrapeUrl}: ` + err.message)
						)
						done()
					} else {
						try {
							const body = res.body
							const integrity = ssri.fromData(body)
							const integrityString = integrity.toString() as string

							// write the response out
							const filename = link.url
								.replace('http://', '')
								.replace('https://', '')
								.replace(/\//g, '__')
							fs.writeFileSync(path.join(CACHE_DIR, filename), body)

							// Save the current integrity
							result.integrity[scrapeUrl] = {
								integrity: integrityString,
							}

							if (
								integrityString !== lastResult.integrity[scrapeUrl]?.integrity
							) {
								console.log(
									chalk.green(
										`✔ integrity changed for [${
											link.text || 'link'
										}](${scrapeUrl})`
									)
								)
								result.changes.push(link)
							}
						} catch (err) {
							result.errors.push(err)
						} finally {
							done()
						}
					}
				},
			})
		})
		c.on('drain', () => {
			result.errors = result.errors.map((e) => e.message) as any
			// Write out integrity file
			fs.writeFileSync(
				path.join(__dirname, '../last_run.json'),
				JSON.stringify(result, null, 4),
				{ encoding: 'utf8' }
			)
			console.log(
				`could not process ${result.errors.length} urls`,
				result.errors
			)
			console.log(
				`${result.changes.length}/${links.length} (${(
					(result.changes.length / links.length) *
					100
				).toFixed(2)}%) changed links since last run`
			)
			resolve()
		})
	})
}

scrapeSites()
	.then(() => console.log('sites scraped'))
	.catch((err) => {
		console.error('error while scraping sites', err)
		process.exit(1)
	})

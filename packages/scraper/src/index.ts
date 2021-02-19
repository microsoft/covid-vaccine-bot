/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import chalk from 'chalk'
import { Scraper } from './Scraper'
import {
	loadLinksToScrape,
	loadLastRun,
	saveFile,
	getLinkFilename,
	saveRunResult,
	getCacheFilename,
	createOutputFolder,
} from './io'

import { config } from 'dotenv'
import {checkConnection, createIssue} from './GitHub'
config()


async function scrapeSites(): Promise<void> {

	await checkConnection()
	createOutputFolder()
	const lastRun = loadLastRun()
	const links = loadLinksToScrape()
	const scraper = new Scraper(lastRun, links)
	scraper.onLinkStarted((link) => {
		console.log(
			chalk.grey.dim(`checking [${link.text || 'link'}](${link.url})`)
		)
	})
	scraper.onIntegrityMismatch(async (link) => {
		console.log(
			chalk.green(
				`✔ integrity mismatch for  [${link.text || 'link'}](${link.url})`
			)
		)
		await createIssue("Detected Website Change", link.url);

	})
	scraper.onLinkScraped(([link, scraping]) => {
		saveFile(
			getCacheFilename(`${getLinkFilename(link)}-${epochNow()}.txt`),
			scraping.content
		)
	})

	console.log(`aggregating ${links.length} sites`)

	// Execute the Scraper
	const result = await scraper.execute()
	if (result.errors.length > 0) {
		console.log(`could not process ${result.errors.length} urls`, result.errors)
	}
	console.log(
		`${result.changes.length}/${links.length} (${(
			(result.changes.length / links.length) *
			100
		).toFixed(2)}%) changed links since last run`
	)
	// @ts-expect-error downcasting to string[] for persistence
	result.errors = result.errors.map((e) => e.message || e.toString())
	saveRunResult(result)
}

const epochNow = () => new Date().getTime() / 1000

scrapeSites()
	.then(() => console.log('sites scraped'))
	.catch((err) => {
		console.error('error while scraping sites', err)
		process.exit(1)
	})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires, @essex/adjacent-await */
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { Scraper } from './Scraper'
import { RunResult } from './types'
import { Link } from '@ms-covidbot/state-plan-schema'

const CACHE_DIR = path.join(__dirname, '../.cache/')

async function scrapeSites(): Promise<void> {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR)
	}
	const lastRun = loadLastRun()
	const links = loadLinksToScrape()
	const scraper = new Scraper(lastRun, links)
	scraper.onLinkStarted((link) => {
		console.log(
			chalk.grey.dim(`checking [${link.text || 'link'}](${link.url})`)
		)
	})
	scraper.onIntegrityMismatch((link) => {
		console.log(
			chalk.green(
				`✔ integrity mismatch for  [${link.text || 'link'}](${link.url})`
			)
		)
	})
	scraper.onLinkScraped(([link, scraping]) => {
		saveFile(
			cacheFilename(`${getLinkFilename(link)}-${epochNow()}.txt`),
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
	result.errors = result.errors.map((e) => e.message || e.toString()) as any
	writeRunResult(result)
}

function cacheFilename(name: string): string {
	return path.join(__dirname, `../.cache/${name}`)
}

function saveFile(path: string, content: string) {
	fs.writeFileSync(path, content, { encoding: 'utf8' })
}

function loadLastRun(): RunResult {
	return require('../last_run.json') as RunResult
}

function writeRunResult(run: RunResult) {
	saveFile(
		path.join(__dirname, '../last_run.json'),
		JSON.stringify(run, null, 4)
	)
}

function loadLinksToScrape(): Link[] {
	const data = require('@ms-covidbot/state-plans/dist/info_links.json') as Link[]
	return data.filter((link) => link.scrape !== false)
}

const epochNow = () => new Date().getTime() / 1000

function writeBodyToCache(link: Link, body: string): void {
	fs.writeFileSync(path.join(CACHE_DIR, getLinkFilename(link)), body)
}

const getLinkFilename = (link: Link): string =>
	link.url.replace('http://', '').replace('https://', '').replace(/\//g, '__')

scrapeSites()
	.then(() => console.log('sites scraped'))
	.catch((err) => {
		console.error('error while scraping sites', err)
		process.exit(1)
	})

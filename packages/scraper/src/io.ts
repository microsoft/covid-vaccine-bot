/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import { Link } from '@covid-vax-bot/plan-schema'
import { RunResult } from './types'

const CACHE_DIR = path.join(__dirname, '../.cache/')

export function createOutputFolder(): void {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR)
	}
}

export function loadLinksToScrape(): Link[] {
	const data = require('@covid-vax-bot/plans/dist/info_links.json') as Link[]
	return data.filter((link) => link.scrape !== false)
}

export function loadLastRun(): RunResult {
	return require('../last_run.json') as RunResult
}

export function saveRunResult(run: RunResult): void {
	saveFile(
		path.join(__dirname, '../last_run.json'),
		JSON.stringify(run, null, 4)
	)
}
export function saveFile(path: string, content: string): void {
	fs.writeFileSync(path, content, { encoding: 'utf8' })
}

export function getCacheFilename(name: string): string {
	return path.join(CACHE_DIR, name)
}

export function getLinkFilename(link: Link): string {
	return link.url
		.replace('http://', '')
		.replace('https://', '')
		.replace(/\//g, '__')
}

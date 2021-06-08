/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import { Link, VaccinationPlan } from '@covid-vax-bot/plan-schema'
import { createDistDir, DIST_DIR } from '../createDistDir'
import { DATA_DIR, getFiles } from '../getFiles'
import { readCsvFile } from '../readCsvFile'

/* eslint-disable-next-line import/order */
import stringify = require('csv-stringify')
const LOCALIZATION_TABLE_PATH = path.join(DIST_DIR, 'localization.csv')

async function aggregateInfoSites(): Promise<void> {
	const stringMap = getStringMap()
	const files = getFiles(DATA_DIR, (file) => file === 'vaccination.json')
	const links: Link[] = []
	files.forEach((file) => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const data: VaccinationPlan = require(file)

		// Eligibility plan > info site
		if (isScrapeableLink(data.links?.eligibility)) {
			links.push(data.links?.eligibility as Link)
		} else if (isScrapeableLink(data.links?.info)) {
			links.push(data.links?.info as Link)
		}

		if (isScrapeableLink(data.links?.eligibility_plan)) {
			links.push(data.links?.eligibility_plan as Link)
		}
	})

	links.forEach(
		(l) =>
			(l.text =
				l.text !== null && stringMap.has(l.text!) ? stringMap.get(l.text!) : '')
	)
	createDistDir()
	const content = await new Promise<string>((resolve, reject) => {
		stringify(links, { header: true }, (err, content) => {
			if (err) {
				reject(err)
			} else {
				resolve(content)
			}
		})
	})

	fs.writeFileSync(path.join(DIST_DIR, 'info_links.csv'), content)
}

function isScrapeableLink(link: Link | null | undefined): boolean {
	return link != null && !!link.url && link.scrape !== false
}

function getStringMap(): Map<string, string> {
	const records: Record<string, string>[] = []
	readCsvFile(LOCALIZATION_TABLE_PATH, records)

	const result = new Map<string, string>()
	records.forEach((r) => result.set(r['String ID'], r['en-us']))
	return result
}
aggregateInfoSites()
	.then(() => console.log('aggregated info sites'))
	.catch((err) => {
		console.error('error aggregating info sites', err)
		process.exit(1)
	})

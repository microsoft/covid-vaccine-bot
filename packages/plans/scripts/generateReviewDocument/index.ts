/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import { join } from 'path'
import { Region } from '@covid-vax-bot/plan-schema'
import { DIST_DIR } from '../createDistDir'
import { readCsvFile } from '../readCsvFile'
import { ReviewDocument } from './ReviewDocument'

async function generateReviewDocument(): Promise<void> {
	const OUTPUT_FILE_NAME = join(DIST_DIR, 'policies.md')
	const policies = readPolicies()
	const loc = readLocalizationTable()

	const result = new ReviewDocument(loc, policies).generate()

	fs.writeFileSync(OUTPUT_FILE_NAME, result)
}

function readLocalizationTable(): Map<string, string> {
	const LOCALIZATION_FILE = join(DIST_DIR, 'localization.csv')
	const records: Record<string, string>[] = []
	readCsvFile(LOCALIZATION_FILE, records)

	const result = new Map<string, string>()
	records.forEach((r) => result.set(r['String ID'], r['en-us']))
	return result
}

function readPolicies(): Region[] {
	return require(join(DIST_DIR, 'policies.json'))
}

generateReviewDocument()
	.then(() => console.log('generated policies.md'))
	.catch((err) => console.error('error generating policies.md', err))

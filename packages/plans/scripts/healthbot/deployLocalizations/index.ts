/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @essex/adjacent-await, @typescript-eslint/no-var-requires */
import * as path from 'path'
import { config } from 'dotenv'
import { DIST_DIR } from '../../createDistDir'
import { readCsvFile } from '../../readCsvFile'

config()

async function uploadLocalizationRecords() {
	const { Localizations } = require('../Localizations')
	const localizations = new Localizations()

	const records: Record<string, string>[] = []
	readCsvFile(path.join(DIST_DIR, 'localization.csv'), records)
	await localizations.upload(records)
}

uploadLocalizationRecords()
	.then(() => console.log('successfully uploaded Localizations'))
	.catch((err) => {
		console.log('error uploading localizations', err.message, err.toJSON())
		process.exit(1)
	})

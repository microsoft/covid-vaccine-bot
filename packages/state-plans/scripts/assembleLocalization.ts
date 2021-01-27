/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import { createDistDir, DIST_DIR } from './createDistDir'
import { readCsvFile } from './readCsvFile'
/* eslint-disable-next-line import/order */
import stringify = require('csv-stringify')
import { DATA_DIR, getFiles } from './getFiles'

const OUTPUT_FILE = path.join(DIST_DIR, 'localization.csv')

function assembleLocalizationFile() {
	const records: unknown[] = []
	const localizationFiles = getFiles(DATA_DIR, (f) => f.endsWith('.csv'))
	localizationFiles.forEach((file) => {
		console.log('reading ' + file)
		readCsvFile(file, records)
	})

	stringify(records, { header: true }, (err, content) => {
		if (err) {
			throw err
		}

		console.log('generated localization table')
		fs.writeFile(OUTPUT_FILE, content, (err) => {
			if (err) {
				throw err
			}
			console.log('wrote localization table')
		})
	})
}

createDistDir()
assembleLocalizationFile()

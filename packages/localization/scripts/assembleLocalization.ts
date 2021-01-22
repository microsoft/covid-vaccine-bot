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

const BASE_LOCALIZATION_DIR = path.join(__dirname, '../data/base')
const STATE_DATA_DIR = path.join(__dirname, '../data/state_defs')
const OUTPUT_FILE = path.join(DIST_DIR, 'localization.csv')

function assembleLocalizationFile() {
	const records: unknown[] = []
	const baseLocalizationFiles = fs.readdirSync(BASE_LOCALIZATION_DIR)
	baseLocalizationFiles.forEach((file) => {
		console.log('reading ' + file)
		readCsvFile(path.join(BASE_LOCALIZATION_DIR, file), records)
	})

	const localizationFiles = fs.readdirSync(STATE_DATA_DIR)
	localizationFiles.forEach((file) => {
		console.log('reading ' + file)
		readCsvFile(path.join(STATE_DATA_DIR, file), records)
	})

	createDistDir()

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

assembleLocalizationFile()

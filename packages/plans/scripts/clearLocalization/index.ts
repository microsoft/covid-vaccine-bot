/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import stringify = require('csv-stringify')
import { getFiles } from '../getFiles'
import { readCsvFile } from '../readCsvFile'

const target: string = process.argv[2]

async function clearLocalization() {
	const csvFiles = getFiles(path.join(__dirname, '../../data'), (f) =>
		f.endsWith('.csv')
	)
	for (const file of csvFiles) {
		const records: Record<string, string>[] = []
		readCsvFile(file, records)

		for (const record of records) {
			record[target] = ''
		}

		stringify(records, { header: true }, (err, content) => {
			console.log(`writing ${file}`)
			fs.writeFile(file, content, (err) => {
				if (err) {
					throw err
				}
				console.log(`wrote ${file}`)
			})
		})
	}
}

clearLocalization()
	.then(() => console.log('cleared localization'))
	.catch((err) => {
		console.error('error clearing localization', err)
		process.exit(1)
	})

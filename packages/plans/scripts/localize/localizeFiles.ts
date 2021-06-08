/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import stringify = require('csv-stringify')
import { getFiles } from '../getFiles'
import { readCsvFile } from '../readCsvFile'
import { translateText } from './translateText'

const BLOCK_IDS: Record<string, boolean> = {
	'c19.test/special_chars': true,
}

export async function localizeFiles(
	toInApi: string,
	toInFile: string
): Promise<void> {
	const files = getFiles(path.join(__dirname, '../../data'), (file) =>
		file.endsWith('.csv')
	)

	for (const file of files) {
		console.log('localizing ' + file)
		await localizeFile(file, toInApi, toInFile)
	}
}

async function localizeFile(
	file: string,
	toInApi: string,
	toInFile: string
): Promise<void> {
	// Read the records
	const records: Record<string, string>[] = []
	readCsvFile(file, records)

	// Map records by id
	const recordsById = new Map<string, Record<string, string>>()
	records.forEach((r) => recordsById.set(r['String ID'], r))

	const localizeIds = records
		.filter((r) => r[toInFile].trim() === '')
		.map((s) => s['String ID'])
		.filter((id) => !BLOCK_IDS[id])

	let numLocalized = 0
	for (const id of localizeIds) {
		try {
			const record = recordsById.get(id)!
			const enUs = record['en-us']
			const [loc] = await translateText([enUs], toInApi)
			record[toInFile] = loc
			numLocalized++
		} catch (err) {
			console.error(`error localizing ${id}`, err)
		}
	}

	if (numLocalized > 0) {
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

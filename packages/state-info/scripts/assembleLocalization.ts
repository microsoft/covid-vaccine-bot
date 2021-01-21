import * as fs from 'fs'
import * as path from 'path'
import stringify = require('csv-stringify')
import { readCsvFile } from './readCsvFile'

const BASE_LOCALIZATION_DIR = path.join(__dirname, '../data/base_localization')
const STATE_DATA_DIR = path.join(__dirname, '../data/state_localization')
const OUTPUT_FILE = path.join(__dirname, '../dist/localization.csv')

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

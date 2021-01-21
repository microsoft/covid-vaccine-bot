import * as fs from 'fs'
import parseSync = require('csv-parse/lib/sync')

export function readCsvFile(file: string, output: unknown[]): void {
	const content = fs.readFileSync(file, { encoding: 'utf-8' })
	const records = parseSync(content, {
		columns: true,
		skipEmptyLines: true,
		bom: true,
		trim: true,
	})
	output.push(...records)
}

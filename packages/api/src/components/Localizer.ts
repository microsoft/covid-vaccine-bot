/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import parseSync = require('csv-parse/lib/sync')

export class Localizer {
	private strings = new Map<string, Record<string, string>>()

	public constructor() {
		const records: Record<string, string>[] = []
		readCsvFile(
			require.resolve('@covid-vax-bot/plans/dist/localization.csv'),
			records
		)
		records.forEach((r) => this.strings.set(r['String ID'], r))
	}

	public localize(
		id: string | undefined,
		localization: string
	): string | undefined {
		if (id == null) {
			return undefined
		}
		const s = this.strings.get(id)
		if (s) {
			return s[localization]
		}
	}
}

function readCsvFile(file: string, output: unknown[]): void {
	const content = fs.readFileSync(file, { encoding: 'utf-8' })
	const records = parseSync(content, {
		columns: true,
		skipEmptyLines: true,
		bom: true,
		trim: true,
	})
	output.push(...records)
}

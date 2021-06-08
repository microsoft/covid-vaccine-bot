/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import { CACHE_DIR } from './cache'
import { ProviderLocation } from './types'

export function getFiles(): string[] {
	return fs.readdirSync(CACHE_DIR)
}

export function getLatestFilePath(): string {
	const files = getFiles().filter((t) => t.endsWith('.csv'))
	const file = getLatestFile(files)
	return path.join(CACHE_DIR, file)
}

export function getLatestFile(files: string[]): string {
	const timestamps = files
		.map((f) => f.replace('bch_inventory_report_', '').replace('.csv', ''))
		.map((f) => new Date(f))
		.map((d) => d.getTime())

	// Find greatest timestamp
	let latestTimestamp = -1
	let winnerIndex = -1
	for (let i = 0; i < timestamps.length; ++i) {
		const currentTimestamp = timestamps[i]
		if (winnerIndex < 0 || currentTimestamp > latestTimestamp) {
			latestTimestamp = currentTimestamp
			winnerIndex = i
		}
	}

	return files[winnerIndex]
}

export function getJsonRecords(file: string): ProviderLocation[] {
	const input = fs.readFileSync(file.replace('.csv', '.json'), {
		encoding: 'utf-8',
	})
	return input
		.split('\n')
		.filter((t) => !!t)
		.map((line) =>
			JSON.parse(line, function (key, value) {
				if (key === 'quantity_last_updated') {
					return new Date(value)
				} else {
					return value
				}
			})
		)
}

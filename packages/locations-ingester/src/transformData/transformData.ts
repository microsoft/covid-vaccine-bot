/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import parse from 'csv-parse/lib/sync'

// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat
// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

import { CACHE_DIR } from '../cache'
import { getFiles, getLatestFile } from '../io'
import { ProviderLocation, ProviderLocationCsv } from '../types'

const BOOLEAN_COLS: Record<string, boolean> = {
	insurance_accepted: true,
	walkins_accepted: true,
	in_stock: true,
}
const DATE_COLS: Record<string, boolean> = {
	quantity_last_updated: true,
}
const NUMBER_COLS: Record<string, boolean> = {
	supply_level: true,
	loc_store_no: true,
}

function getSourceFile(): string {
	const files = getFiles().filter((f) => f.endsWith('.csv'))
	return path.join(CACHE_DIR, getLatestFile(files))
}
/**
 * Collates records in the given CSV into the target JSON output format
 * @param file The CSV File path
 */
export async function transformData(): Promise<void> {
	const file = getSourceFile()
	console.log('transforming CSV data to JSON', file)
	const input = fs.readFileSync(file, { encoding: 'utf-8' })
	const records: ProviderLocationCsv[] = parse(input, {
		columns: true,
		delimiter: '|',
		cast(item, ctx) {
			if (BOOLEAN_COLS[ctx.column]) {
				return item === 'TRUE'
			} else if (DATE_COLS[ctx.column]) {
				return new Date(item)
			} else if (NUMBER_COLS[ctx.column]) {
				return Number.parseFloat(item)
			} else {
				return item
			}
		},
	})

	const recordsById = new Map<string, ProviderLocation>()
	records.forEach(({ provider_location_guid: provider_id, ...row }) => {
		let phone = row.loc_phone
		try {
			if (phone) {
				const phoneParsed = phoneUtil.parseAndKeepRawInput(row.loc_phone, 'US')
				phone = phoneUtil.format(phoneParsed, PNF.NATIONAL)
			}
		} catch (err) {
			console.log('error parsing raw phone number', row.loc_phone)
		}

		const rec: ProviderLocation = {
			provider_id,
			location: {
				name: row.loc_name,
				store_no: row.loc_store_no,
				phone,
				street1: row.loc_admin_street1,
				street2: row.loc_admin_street2,
				city: row.loc_admin_city,
				state: row.loc_admin_state,
				zip: row.loc_admin_zip,
			},
			hours: {
				sunday: row.sunday_hours,
				monday: row.monday_hours,
				tuesday: row.tuesday_hours,
				wednesday: row.wednesday_hours,
				thursday: row.thursday_hours,
				friday: row.friday_hours,
				saturday: row.saturday_hours,
			},
			provider_notes: row.provider_notes,
			web_address: row.web_address,
			pre_screen: row.pre_screen,
			insurance_accepted: row.insurance_accepted,
			walkins_accepted: row.walkins_accepted,
			any_in_stock: row.in_stock,
			meds: [
				{
					name: row.med_name,
					ndc: row.ndc,
					in_stock: row.in_stock,
					supply_level: row.supply_level,
					quantity_last_updated: row.quantity_last_updated,
				},
			],
		}

		if (!recordsById.has(rec.provider_id)) {
			recordsById.set(rec.provider_id, rec)
		} else {
			const existingRecord = recordsById.get(rec.provider_id)!

			// Add the new vaccine record
			existingRecord.meds.push(rec.meds[0])
			// add the any_in_stock field
			const anyInStock = existingRecord.any_in_stock || row.in_stock
			existingRecord.any_in_stock = anyInStock
		}
	})

	console.log('combined recs', recordsById.size)

	const recs: string[] = []
	for (const record of recordsById.values()) {
		recs.push(JSON.stringify(record))
	}

	fs.writeFileSync(file.replace('.csv', '.json'), recs.join('\n'), {
		encoding: 'utf-8',
	})
	console.log('finished writing json data')
}

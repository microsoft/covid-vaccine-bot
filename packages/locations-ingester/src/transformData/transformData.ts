import fs from 'fs'
import parse from 'csv-parse/lib/sync'
import { ProviderLocation } from '../types'

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

/**
 * Collates records in the given CSV into the target JSON output format
 * @param file The CSV File path
 */
export async function transformData(file: string): Promise<void> {
	const input = fs.readFileSync(file, { encoding: 'utf-8' })
	const records = parse(input, {
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
	records.forEach((rec: any) => {
		rec.id = rec.provider_location_guid
		delete rec.provider_location_guid

		if (!recordsById.has(rec.id)) {
			rec.meds = [rec.med_name]
			delete rec.med_name
			recordsById.set(rec.id, rec)
		} else {
			recordsById.get(rec.id)!.meds.push(rec.med_name)
		}
	})

	console.log('combined recs', recordsById.size)

	const recs: string[] = []
	for (let record of recordsById.values()) {
		recs.push(JSON.stringify(record))
	}

	fs.writeFileSync(file.replace('.csv', '.json'), recs.join('\n'), {
		encoding: 'utf-8',
	})
}

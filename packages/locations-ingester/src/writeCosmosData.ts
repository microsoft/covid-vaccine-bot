import fs from 'fs'
import path from 'path'
import parse from 'csv-parse/lib/sync'

export interface ProviderLocation {
	provider_location_guid: string
	loc_store_no: number
	loc_phone: string
	loc_name: string
	loc_admin_street1: string
	loc_admin_street2: string
	loc_admin_city: string
	loc_admin_state: string
	loc_admin_zip: string
	sunday_hours: string
	monday_hours: string
	tuesday_hours: string
	wednesday_hours: string
	thursday_hours: string
	friday_hours: string
	saturday_hours: string
	web_address: string
	pre_screen: string
	insurance_accepted: boolean
	walkins_accepted: boolean
	provider_notes: string
	ndc: string
	med_name: string // 'Pfizer-BioNTech, COVID-19 Vaccine, 30 mcg/0.3mL',
	in_stock: boolean
	supply_level: number
	quantity_last_updated: Date
}

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

export async function writeCosmosData(): Promise<void> {
	const DIST_DIR = path.join(__dirname, '../dist/')
	const files = fs.readdirSync(DIST_DIR)
	const latestFile = getLatestFile(files)
	const result = readCsvFile(path.join(DIST_DIR, latestFile))
	console.log('RES', result)
}

function readCsvFile(file: string): Array<ProviderLocation> {
	const content = fs.readFileSync(file, { encoding: 'utf-8' })
	const rows = parse(content, {
		columns: true,
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
		delimiter: '|',
	})
	return rows
}

function getLatestFile(files: string[]): string {
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

writeCosmosData()

import axios from 'axios'
import config from 'config'
import ProgressBar from 'progress'
import _ from 'lodash'
import { getLatestJsonRecords } from '../io'
import { GeoCache, readGeocodeCache, writeGeocodeCache } from './geocodeCache'
import { GeoPoint, ProviderLocation } from '../types'

const MAPS_KEY = config.get<string>('azureMaps.key')
const API_URL = 'https://atlas.microsoft.com/search/address/json'

/**
 * Collates records in the given CSV into the target JSON output format
 * @param file The CSV File path
 */
export async function geocodeData(): Promise<void> {
	const records = getLatestJsonRecords()
	const chunks = _.chunk(records, 10)
	const geoCache = readGeocodeCache()
	console.log(`read ${records.length} input records`)

	const bar = new ProgressBar(':bar', { total: chunks.length })
	try {
		for (let chunk of chunks) {
			await Promise.all(chunk.map((c) => geocodeLocation(c, geoCache)))
			bar.tick()
		}
	} catch (err) {
		console.error('error geocoding data', err)
	} finally {
		writeGeocodeCache(geoCache)
	}
}

async function geocodeLocation(
	location: ProviderLocation,
	cache: GeoCache
): Promise<void> {
	if (!MAPS_KEY) {
		throw new Error('AZURE_MAPS_KEY must be defined')
	}
	const query = `${location.loc_admin_street1} ${location.loc_admin_zip}`
	const response = await axios.get(API_URL, {
		params: {
			'api-version': '1.0',
			'subscription-key': MAPS_KEY,
			limit: 1,
			query: `"${query}"`,
		},
	})
	const pos: null | { lat: number; lon: number } = _.get(
		response,
		'data.results[0].position',
		null
	)
	if (pos != null) {
		const point: GeoPoint = [pos.lat, pos.lon]
		location.position = {
			type: 'Point',
			coordinates: point,
		}
		cache.set(location.id, point)
	}
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import axios from 'axios'
import config from 'config'
import _ from 'lodash'
import { getLatestFilePath, getLatestJsonRecords } from '../io'
import { GeoPoint, ProviderLocation } from '../types'
import { GeoCache, readGeocodeCache, writeGeocodeCache } from './geocodeCache'

const MAPS_KEY = config.get<string>('azureMaps.key')
const API_URL = 'https://atlas.microsoft.com/search/address/json'

/**
 * Collates records in the given CSV into the target JSON output format
 * @param file The CSV File path
 */
export async function geocodeData(): Promise<void> {
	console.log('geocoding data')
	const records = getLatestJsonRecords()
	const chunks = _.chunk(records, 10)
	const geoCache = readGeocodeCache()
	console.log(
		`read ${records.length} input records, cache warmed with ${geoCache.size} records`
	)

	try {
		let chunkIndex = 0
		for (const chunk of chunks) {
			if (chunkIndex % 100 === 0) {
				console.log(`geocoding chunk ${chunkIndex}/${chunks.length}`)
			}
			await Promise.all(chunk.map((c) => geocodeLocation(c, geoCache)))
			chunkIndex++
		}
		console.log('writing geocoded data file')
		fs.writeFileSync(
			getLatestFilePath().replace('.csv', '.geocoded.json'),
			records.map((r) => JSON.stringify(r)).join('\n'),
			{ encoding: 'utf-8' }
		)
		console.log('finished geocoding data')
	} catch (err) {
		console.error('error geocoding data', err)
		throw err
	} finally {
		writeGeocodeCache(geoCache)
	}
}

async function geocodeLocation(
	provider: ProviderLocation,
	cache: GeoCache
): Promise<void> {
	const point = await getPosition(provider, cache)
	if (point) {
		provider.position = {
			type: 'Point',
			coordinates: point,
		}
	}
}

async function getPosition(
	provider: ProviderLocation,
	cache: GeoCache
): Promise<GeoPoint | null> {
	if (!MAPS_KEY) {
		throw new Error('AZURE_MAPS_KEY must be defined')
	}
	if (cache.has(provider.provider_id)) {
		return cache.get(provider.provider_id) || null
	}

	const query = `${provider.location.street1} ${provider.location.zip}`
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
	const result: GeoPoint | null = pos ? ([pos.lon, pos.lat] as GeoPoint) : null
	if (result != null) {
		cache.set(provider.provider_id, result)
	}
	return result
}

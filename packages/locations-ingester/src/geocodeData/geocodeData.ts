/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import axios from 'axios'
import config from 'config'
import _ from 'lodash'
import { getJsonRecords, getLatestFilePath } from '../io'
import { GeoPoint, ProviderLocation } from '../types'
import { GeoCache, readGeocodeCache, writeGeocodeCache } from './geocodeCache'

const MAPS_KEY = config.get<string>('azureMaps.key')
const API_URL = 'https://atlas.microsoft.com/search/address/json'
const BATCH_SIZE = 5

function getSourceFile(): string {
	const filePath = getLatestFilePath()
	return filePath.replace('.csv', '.json')
}

/**
 * Collates records in the given CSV into the target JSON output format
 * @param file The CSV File path
 */
export async function geocodeData(): Promise<void> {
	const filePath = getSourceFile()
	console.log(`geocoding data in ${filePath}`)
	const records = getJsonRecords(filePath)
	const chunks = _.chunk(records, BATCH_SIZE)
	const geoCache = readGeocodeCache()
	console.log(
		`read ${records.length} input records, cache warmed with ${geoCache.size} records`
	)

	try {
		let chunkIndex = 0
		let hits = 0
		let misses = 0
		for (const chunk of chunks) {
			if (chunkIndex % 100 === 0) {
				console.log(
					`geocoding chunk ${chunkIndex}/${chunks.length} ${(
						(hits / (hits + misses)) *
						100
					).toFixed(2)}% cache hits`
				)
			}
			await Promise.all(
				chunk.map((c) => {
					return geocodeLocation(c, geoCache).then((cacheHit) => {
						if (cacheHit) {
							hits++
						} else {
							misses++
						}
					})
				})
			)
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
): Promise<boolean> {
	const [point, cacheHit] = await getPosition(provider, cache)
	if (point) {
		provider.position = {
			type: 'Point',
			coordinates: point,
		}
	}
	return cacheHit
}

async function getPosition(
	provider: ProviderLocation,
	cache: GeoCache
): Promise<[GeoPoint | null, boolean]> {
	if (!MAPS_KEY) {
		throw new Error('AZURE_MAPS_KEY must be defined')
	}
	if (cache.has(provider.provider_id)) {
		return [cache.get(provider.provider_id) || null, true]
	} else {
		try {
			const result = await getPositionFromService(provider)
			cache.set(provider.provider_id, result)
			return [result, false]
		} catch (err) {
			console.error('error geocoding', err)
			// swallow on purpose
			return [null, false]
		}
	}
}

async function getPositionFromService(
	provider: ProviderLocation
): Promise<GeoPoint | null> {
	const response = await axios.get(API_URL, {
		params: {
			'api-version': '1.0',
			'subscription-key': MAPS_KEY,
			limit: 1,
			query: `"${getLocationQueryText(provider)}"`,
		},
		timeout: 15000,
	})
	if (
		Object.keys(response.headers).some((s) => s.startsWith('x-ms-ratelimit'))
	) {
		console.log('rate limiting headers detected', response.headers)
	}
	const pos: null | { lat: number; lon: number } = _.get(
		response,
		'data.results[0].position',
		null
	)
	return pos ? ([pos.lon, pos.lat] as GeoPoint) : null
}

function getLocationQueryText({
	location: { street1, city, state, zip },
}: ProviderLocation): string {
	return `${street1} 
	${city}, ${state} ${zip}`
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import { CACHE_DIR } from '../cache'
import { GeoPoint } from '../types'

const GEO_CACHE_FILE = path.join(CACHE_DIR, 'geocache.json')

// location id -> lat/lon
export type GeoCache = Map<string, GeoPoint | null>

export function readGeocodeCache(): GeoCache {
	const cache = new Map<string, GeoPoint>()
	if (process.env.BUST_GEO_CACHE) {
		console.log('Busting Geo-Cache')
	} else if (fs.existsSync(GEO_CACHE_FILE)) {
		console.log('Loading Geo-Cache')
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const data = require(GEO_CACHE_FILE) as PersistedGeoCacheItem[]
		data.forEach((d) => cache.set(d.id, d.coordinates))
	}
	return cache
}

export function writeGeocodeCache(cache: GeoCache): void {
	const persistedData: PersistedGeoCacheItem[] = []
	for (const id of cache.keys()) {
		persistedData.push({
			id,
			coordinates: cache.get(id)!,
		})
	}
	fs.writeFileSync(GEO_CACHE_FILE, JSON.stringify(persistedData))
}

interface PersistedGeoCacheItem {
	id: string
	coordinates: GeoPoint
}

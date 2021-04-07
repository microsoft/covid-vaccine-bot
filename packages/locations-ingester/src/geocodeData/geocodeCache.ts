import fs from 'fs'
import path from 'path'
import { GeoPoint } from '../types'

const GEO_CACHE_FILE = path.join(__dirname, '../../dist/geocache.json')

// location id -> lat/lon
export type GeoCache = Map<string, GeoPoint>

export function readGeocodeCache(): GeoCache {
	const cache = new Map<string, GeoPoint>()
	if (fs.existsSync(GEO_CACHE_FILE)) {
		const data = require(GEO_CACHE_FILE) as PersistedGeoCacheItem[]
		data.forEach((d) => {
			cache.set(d.id, d.coordinates)
		})
	}
	return cache
}

export function writeGeocodeCache(cache: GeoCache): void {
	const persistedData: PersistedGeoCacheItem[] = []
	for (let id of cache.keys()) {
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

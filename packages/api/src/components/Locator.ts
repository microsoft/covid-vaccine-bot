/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Container } from '@azure/cosmos'
import axios from 'axios'
import config from 'config'

interface CacheItem {
	key: string
	location?: [number, number]
}
export class Locator {
	private subscriptionKey: string = config.get<string>('azureMaps.key')

	public constructor(private locationCache: Container) {}

	/**
	 * Gets a geo location of a zip (TODO: cache this in CosmosDB)
	 * @param postalCode The postal code to locate
	 * @param countrySet The country(ies) the postal code could be in
	 * @returns A lon/lat array of the geocoded zip
	 */
	public async getLocationFromPostalCode(
		postalCode: string,
		countrySet: string
	): Promise<[number, number]> {
		const cacheKey = `${postalCode}|${countrySet}`
		let cacheItem: CacheItem | null = await this.getCacheItem(cacheKey)
		if (cacheItem == null) {
			cacheItem = { key: cacheKey }
		}

		if (
			cacheItem.location != null &&
			Array.isArray(cacheItem.location) &&
			cacheItem.location.length == 2
		) {
			console.log(`cache hit ${cacheItem.key} => ${cacheItem.location}`)
			return cacheItem.location
		} else {
			const location = await this.getLocationFromPostalCodeInner(
				postalCode,
				countrySet
			)
			cacheItem.location = location
			await this.locationCache.items.upsert(cacheItem)
			return location
		}
	}

	private async getCacheItem(key: string): Promise<null | CacheItem> {
		const cacheResult = this.locationCache.items.query({
			query: `select * from locationCache l where l.key = @key`,
			parameters: [{ name: '@key', value: key }],
		})
		const items = await cacheResult.fetchAll()
		if (items.resources.length > 0) {
			return items.resources[0]
		}
		return null
	}

	private async getLocationFromPostalCodeInner(
		postalCode: string,
		countrySet: string
	): Promise<[number, number]> {
		const response = await axios.get(
			`https://atlas.microsoft.com/search/fuzzy/json`,
			{
				params: {
					'api-version': '1.0',
					'subscription-key': this.subscriptionKey,
					countrySet,
					query: postalCode,
					limit: 1,
				},
				headers: {
					Accept: 'application/json',
				},
			}
		)
		if (response.status <= 400) {
			if (response.data.results == null || response.data.results.length === 0) {
				throw new Error('no results found')
			}
			const position = response.data.results[0].position
			return [position.lon, position.lat]
		} else {
			throw new Error(`Location Error: ${response.status}, ${response.data}`)
		}
	}
}

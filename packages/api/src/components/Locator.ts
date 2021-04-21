/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import axios from 'axios'
import config from 'config'

export class Locator {
	private subscriptionKey: string = config.get<string>('azureMaps.key')

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

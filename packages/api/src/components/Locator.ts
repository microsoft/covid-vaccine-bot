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
	 * @param zip The zip to locate
	 * @returns A lon/lat array of the geocoded zip
	 */
	public async getLocationFromZip(zip: string): Promise<[number, number]> {
		const response = await axios.get(
			`https://atlas.microsoft.com/search/address/reverse/json?query=${lat},${long}&api-version=1.0&subscription-key=${this.subscriptionKey}`,
			{
				headers: {
					Accept: 'application/json',
				},
			}
		)
		if (response.status <= 400) {
			const result = response.data
			return result.addresses[0].address
		} else {
			throw new Error(`Location Error: ${response.status}, ${response.data}`)
		}
	}
}

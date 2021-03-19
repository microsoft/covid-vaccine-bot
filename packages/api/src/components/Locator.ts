/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import axios from 'axios'

export interface GeoPoint {
	lat: number
	long: number
}

export interface LocationInformation {
	/**
	 * The country name (e.g. United States)
	 */
	country: string

	/**
	 * Country code, e.g. "US"
	 */
	countryCode: string

	/**
	 * An ISO country code - e.g. "USA"
	 */
	countryCodeISO3: string

	/**
	 * The name of a country subdivision (state, province) - e.g. "Washington"
	 */
	countrySubdivisionName: string

	/**
	 * Country subdivision (state, province) - e.g. "WA"
	 */
	countrySubdivision: string

	/**
	 * A second level subdivision (county) - e.g. "Kitsap"
	 */
	countrySecondarySubdivision: string

	/**
	 * A low-level municipality (town, city) - e.g. "Bremerton"
	 */
	municipality: string

	/**
	 * A postal code (ZIP code) - e.g. "98311"
	 */
	postalCode: string

	freeformAddress: string
}

const SUBSCRIPTION_KEY = 'ORMjHZDPj50P11bBJ9iiCOryTSOaETw77PhKj3Wh5C4'

//

export class Locator {
	public async getLocationInformation({
		lat,
		long,
	}: GeoPoint): Promise<LocationInformation> {
		const response = await axios.get(
			`https://atlas.microsoft.com/search/address/reverse/json?query=${lat},${long}&api-version=1.0&subscription-key=${SUBSCRIPTION_KEY}`,
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

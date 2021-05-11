/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import config from 'config'
import { Locator } from './Locator'

const DEFAULT_LIMIT = config.get<number>('service.defaultResultLimit')

export class QueryArgUtil {
	public constructor(private locator: Locator) {}

	public async unpackLocation(
		query: Record<string, any>
	): Promise<[number, number]> {
		if (query.lat && query.lon) {
			return [query.lon as number, query.lat as number]
		} else if (query.postalCode) {
			return this.locator.getLocationFromPostalCode(
				query.postalCode,
				query.countrySet || config.get<string>('azureMaps.defaultCountrySet')
			)
		} else {
			throw new Error('lat/lon coordinates or zip must be defined in the query')
		}
	}

	public unpackLimit(query: Record<string, any>): number {
		if (query.limit != null) {
			return (query.limit as any) as number
		} else {
			return DEFAULT_LIMIT
		}
	}
}

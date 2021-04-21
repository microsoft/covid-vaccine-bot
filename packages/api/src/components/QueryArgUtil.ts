/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Locator } from './Locator'

export class QueryArgUtil {
	public constructor(private locator: Locator) {}

	public async unpackLocation(
		query: Record<string, any>
	): Promise<[number, number]> {
		if (query.lat && query.lon) {
			return [query.lon as number, query.lat as number]
		} else if (query.zip) {
			return this.locator.getLocationFromZip(query.zip)
		} else {
			throw new Error('lat/lon coordinates or zip must be defined in the query')
		}
	}
}

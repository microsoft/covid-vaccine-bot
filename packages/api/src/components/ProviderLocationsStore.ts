/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Container } from '@azure/cosmos'
import { ProviderLocation } from '../types'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const geodist = require('geodist')

const MILES_TO_METERS = 1609.344

const FIND_PROVIDERS_IN_RADIUS = `
	SELECT * 
	FROM providers p 
	WHERE 
		ST_DISTANCE(
			p.position, 
			{ "type": "Point", "coordinates": [@lon, @lat]}
		) < @radiusMeters AND
	p.last_updated >= @minDate
`
const FIND_PROVIDERS_IN_RADIUS_WITH_STOCK = `
	SELECT * 
	FROM providers p 
	WHERE 
		ST_DISTANCE(
			p.position, 
			{ "type": "Point", "coordinates": [@lon, @lat]}
		) < @radiusMeters AND
	  p.any_in_stock=true AND
		p.last_updated >= @minDate
`

export class ProviderLocationsStore {
	public constructor(private container: Container) {}

	public async getProviderLocations(
		lat: number,
		lon: number,
		radiusMiles: number,
		inStockOnly: boolean
	): Promise<ProviderLocation[]> {
		const query = inStockOnly
			? FIND_PROVIDERS_IN_RADIUS_WITH_STOCK
			: FIND_PROVIDERS_IN_RADIUS
		const queryPos = { lat, lon }
		const radiusMeters = radiusMiles * MILES_TO_METERS
		const minDate = new Date()
		minDate.setDate(minDate.getDate() - 3)
		const response = await this.container.items.query<ProviderLocation>(
			{
				query,
				parameters: [
					{ name: '@lat', value: lat },
					{ name: '@lon', value: lon },
					{ name: '@radiusMeters', value: radiusMeters },
					{ name: '@minDate', value: minDate.toISOString() },
				],
			},
			{
				maxItemCount: 100,
			}
		)

		const locations = await response.fetchNext()
		for (const loc of locations.resources) {
			const itemPos = {
				lon: loc.position!.coordinates[0],
				lat: loc.position?.coordinates[1],
			}
			const dist = geodist(queryPos, itemPos, { unit: 'mi', exact: true })
			loc.distance = dist
		}
		const result = locations.resources.sort((a, b) => a.distance - b.distance)
		return result
	}
}

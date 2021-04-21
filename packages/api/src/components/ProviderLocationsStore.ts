/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Container } from '@azure/cosmos'
import { ProviderLocation } from '../types'
const geodist = require('geodist')

const MILES_TO_METERS = 1609.344

const FIND_PROVIDERS_IN_RADIUS = `
	select * 
	from providers p 
	where 
		ST_DISTANCE(
			p.position, 
			{ "type": "Point", "coordinates": [@lon, @lat]}
		) < @radiusMeters
`

export class ProviderLocationsStore {
	public constructor(private container: Container) {}

	public async getProviderLocations(
		lat: number,
		lon: number,
		radiusMiles: number
	): Promise<ProviderLocation[]> {
		const queryPos = { lat, lon }
		const radiusMeters = radiusMiles * MILES_TO_METERS
		const response = await this.container.items.query<ProviderLocation>(
			{
				query: FIND_PROVIDERS_IN_RADIUS,
				parameters: [
					{ name: '@lat', value: lat },
					{ name: '@lon', value: lon },
					{ name: '@radiusMeters', value: radiusMeters },
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

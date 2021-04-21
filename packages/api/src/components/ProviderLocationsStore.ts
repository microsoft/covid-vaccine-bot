/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { CosmosClient, Container } from '@azure/cosmos'
import { ProviderLocation } from '../types'

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
		const result = locations.resources.sort((a, b) => {
			const aDist =
				Math.pow(a.position!.coordinates[0] - lon, 2) +
				Math.pow(a.position!.coordinates[1] - lat, 2)
			const bDist =
				Math.pow(b.position!.coordinates[0] - lon, 2) +
				Math.pow(b.position!.coordinates[1] - lon, 2)
			return Math.sqrt(aDist + bDist)
		})
		return result
	}
}

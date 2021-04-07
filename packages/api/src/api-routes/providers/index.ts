/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { providersCosmosContainer } from '../../components'
import { ProviderLocation } from '../../types'

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
export const GET: Operation = [
	async (req: Request, res: Response) => {
		const lat = (req.query.lat as any) as number
		const lon = (req.query.lon as any) as number
		const radius = (req.query.radius as any) as number
		const radiusMeters = radius * MILES_TO_METERS
		console.log('find providers', lat, lon, radius, radiusMeters)

		const response = await providersCosmosContainer.items.query<ProviderLocation>(
			{
				query: FIND_PROVIDERS_IN_RADIUS,
				parameters: [
					{ name: '@lat', value: lat },
					{ name: '@lon', value: lon },
					{ name: '@radiusMeters', value: radius * MILES_TO_METERS },
				],
			},
			{
				maxItemCount: 100,
			}
		)
		console.log('RESPONSE', response)
		const locations = await response.fetchNext()
		console.log('LOCATIONS', locations)
		res.json(locations.resources)
	},
]
GET.apiDoc = {
	description: 'Retrieves C19 vaccine eligibility rules based on a location.',
	tags: ['eligibility'],
	operationId: 'getEligibility',
	parameters: [
		{
			in: 'query',
			name: 'lat',
			description: 'the latitude of the search center',
			type: 'number',
			format: 'double',
			required: true,
		},
		{
			in: 'query',
			name: 'lon',
			description: 'the longitude of the search center',
			type: 'number',
			format: 'double',
			required: true,
		},
		{
			in: 'query',
			name: 'radius',
			format: 'double',
			description: 'the search radius in miles',
			type: 'number',
			required: true,
		},
	],
	responses: {
		default: {
			description: 'Unexpected error',
			schema: {
				$ref: '#/definitions/Error',
			},
		},
	},
}

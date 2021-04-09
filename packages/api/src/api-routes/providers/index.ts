/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { providerLocationsStore } from '../../components'
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
		if (radius > 100) {
			res.status(400).json({ message: 'radius must be <= 100 miles' })
		}

		const radiusMeters = radius * MILES_TO_METERS
		console.log('find providers', lat, lon, radius, radiusMeters)
		const providers = await providerLocationsStore.getProviderLocations(
			lat,
			lon,
			radius
		)
		res.json(providers)
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
		200: {
			description: 'Vaccination Provider List Response',
			schema: {
				$ref: '#/definitions/ProviderListResponse',
			},
		},
		default: {
			description: 'Unexpected error',
			schema: {
				$ref: '#/definitions/Error',
			},
		},
	},
}

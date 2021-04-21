/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { providerLocationsStore, queryArgUtil } from '../../components'

export const GET: Operation = [
	async (req: Request, res: Response) => {
		const [lon, lat] = await queryArgUtil.unpackLocation(req.query)

		const radius = (req.query.radius as any) as number
		if (radius > 100) {
			res.status(400).json({ message: 'radius must be <= 100 miles' })
		}
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
			name: 'zip',
			description: 'the zip code of the search center',
			type: 'string',
			required: false,
		},
		{
			in: 'query',
			name: 'lat',
			description: 'the latitude of the search center',
			type: 'number',
			format: 'double',
			required: false,
		},
		{
			in: 'query',
			name: 'lon',
			description: 'the longitude of the search center',
			type: 'number',
			format: 'double',
			required: false,
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

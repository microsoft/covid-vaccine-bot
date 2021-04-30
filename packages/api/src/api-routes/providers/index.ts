/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import config from 'config'
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { providerLocationsStore, queryArgUtil } from '../../components'

const MIN_LIMIT = 1
const MAX_LIMIT = config.get<number>('service.maxResultLimit')
const MAX_RADIUS = config.get<number>('service.maxSearchRadius')

export const GET: Operation = [
	async (req: Request, res: Response) => {
		try {
			const [lon, lat] = await queryArgUtil.unpackLocation(req.query)
			const inStock: boolean = ((req.query.inStock as any) as boolean) || false
			const limit: number = queryArgUtil.unpackLimit(req.query)
			const radius = (req.query.radius as any) as number

			if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
				res.status(400).json({
					message: `limit must be >= ${MIN_LIMIT} and <= ${MAX_LIMIT}`,
				})
				return
			}
			if (radius > MAX_RADIUS) {
				res
					.status(400)
					.json({ message: `radius must be <= ${MAX_RADIUS} miles` })
				return
			}
			const providers = await providerLocationsStore.getProviderLocations(
				lat,
				lon,
				radius,
				inStock,
				limit
			)
			res.json(providers)
		} catch (err) {
			console.error('error: ', err)
			res.status(500).send({ message: 'an internal error  occured' })
		}
	},
]
GET.apiDoc = {
	description: 'Retrieves C19 vaccine eligibility rules based on a location.',
	tags: ['eligibility'],
	operationId: 'getEligibility',
	parameters: [
		{
			in: 'query',
			name: 'postalCode',
			description: 'the postalCode code of the search center',
			type: 'string',
			required: false,
		},
		{
			in: 'query',
			name: 'inStock',
			description: 'if true, only find locations that have stock available',
			type: 'boolean',
			required: false,
		},
		{
			in: 'query',
			name: 'limit',
			description: 'the maximum number of items to return',
			type: 'integer',
			required: false,
		},
		{
			in: 'query',
			name: 'countrySet',
			type: 'string',
			description: 'the country the postal code is in',
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

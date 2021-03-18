/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { Locator } from '../../components/Locator'
import { resolvePlan } from '@covid-vax-bot/plan-locator'
import regions from '@covid-vax-bot/plans/dist/policies.json'

const locator = new Locator()
export const GET: Operation = [
	async (req: Request, res: Response) => {
		const lat = (req.query.lat as any) as number
		const long = (req.query.long as any) as number
		const address = await locator.getLocationInformation(lat, long)
		const response = resolvePlan(
			{
				adminDistrict: address.countrySubdivision,
				adminDistrict2: address.countrySecondarySubdivision,
				countryRegion: address.countryCode,
				locality: address.municipality,
				formattedAddress: address.freeformAddress,
				postalCode: address.postalCode,
			},
			regions as any
		)
		res.json(response)
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
			type: 'number',
			format: 'double',
			required: true,
		},
		{
			in: 'query',
			name: 'long',
			type: 'number',
			format: 'double',
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

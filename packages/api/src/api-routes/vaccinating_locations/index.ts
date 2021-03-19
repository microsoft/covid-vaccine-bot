/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { locator } from '../../components'
import { vaccineLocationRetrievers } from '../../components/location_retrievers'

export const GET: Operation = [
	async (req: Request, res: Response) => {
		try {
			const lat = (req.query.lat as any) as number
			const long = (req.query.long as any) as number
			const location = { lat, long }
			const locInfo = await locator.getLocationInformation(location)
			const retriever = vaccineLocationRetrievers[locInfo.countrySubdivision]
			if (!retriever) {
				res.status(501).json({
					message: `not implemented for ${locInfo.countrySubdivision} yet`,
				})
			}
			const vaccinationLocation = await retriever(location)
			res.json(vaccinationLocation)
		} catch (err) {
			res.status(500).json({ message: err.message })
		}
	},
]
GET.apiDoc = {
	description: 'Retrieves locations providing vaccinations',
	tags: ['locations'],
	operationId: 'getVaccinationLocations',
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
		{
			in: 'query',
			name: 'localization',
			type: 'string',
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

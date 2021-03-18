/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'

export const GET: Operation = [
	(req: Request, res: Response) => {
		console.log('Get Eligibility', req.query.lat, req.query.long)
		res.json({ test: 'hello world GET response' })
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

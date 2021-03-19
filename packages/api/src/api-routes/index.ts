/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'

export const GET: Operation = [
	async (req: Request, res: Response) => {
		res.json({
			health: 'ok',
			links: {
				docs: '/api-docs',
			},
		})
	},
]
GET.apiDoc = {
	description: 'Service Info & Health',
	tags: ['health'],
	operationId: 'getHealth',
	responses: {
		default: {
			description: 'Unexpected error',
			schema: {
				$ref: '#/definitions/Error',
			},
		},
	},
}

import { OpenAPIV3 } from 'openapi-types'

export const apiDoc: OpenAPIV3.Document = {
	openapi: '3.0.0',
	info: {
		title: 'COVID-19 Vaccine Eligibility API',
		version: '0.0.1',
	},
	paths: {
		'/eligibility': {
			get: {
				responses: {
					'200': {
						description: 'OK Response',
					},
				},
			},
			post: {
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									lat: {
										type: 'number',
									},
									long: {
										type: 'number',
									},
								},
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'OK Response',
						content: {
							'application/json': {
								schema: {
									type: 'object',
								},
							},
						},
					},
				},
			},
		},
	},
}

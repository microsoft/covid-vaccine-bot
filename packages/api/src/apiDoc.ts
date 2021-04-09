/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { OpenAPIV2 } from 'openapi-types'

export const apiDoc: OpenAPIV2.Document = {
	swagger: '2.0',
	info: {
		title: 'COVID-19 Vaccine Eligibility API',
		version: '0.0.1',
	},
	definitions: {
		/**
		 * General Error Object
		 */
		Error: {
			additionalProperties: true,
		},
		ProviderListResponse: {
			type: 'array',
			items: {
				type: 'object',
				$ref: '#/definitions/Provider',
			},
		},
		Provider: {
			type: 'object',
			properties: {
				provider_id: {
					type: 'string',
				},
				location: {
					type: 'object',
					$ref: '#/definitions/ProviderLocation',
				},
				hours: {
					type: 'object',
					$ref: '#/definitions/ProviderHours',
				},
				web_address: { type: 'string' },
				pre_screen: { type: 'string' },
				insurance_accepted: { type: 'string' },
				walkins_accepted: { type: 'string' },
				meds: {
					type: 'array',
					items: {
						type: 'object',
						$ref: '#/definitions/ProviderMedication',
					},
				},
			},
			required: ['provider_id'],
		},
		ProviderLocation: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				store_no: { type: 'integer' },
				phone: { type: 'string' },
				street1: { type: 'string' },
				street2: { type: 'string' },
				city: { type: 'string' },
				state: { type: 'string' },
				zip: { type: 'string' },
			},
		},
		ProviderHours: {
			type: 'object',
			properties: {
				sunday: { type: 'string' },
				monday: { type: 'string' },
				tuesday: { type: 'string' },
				wednesday: { type: 'string' },
				thursday: { type: 'string' },
				friday: { type: 'string' },
				saturday: { type: 'string' },
			},
		},
		ProviderMedication: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				provider_notes: { type: 'string' },
				ndc: { type: 'string' },
				in_stock: { type: 'boolean' },
				supply_level: { type: 'integer' },
				quantity_last_updated: { type: 'string' },
			},
		},
	},
	// paths are derived from args.routes.  These are filled in by fs-routes.
	paths: {},
}

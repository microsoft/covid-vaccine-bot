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
		/**
		 * A region hierarchy (e.g. US -> WA -> Kitsap)
		 */
		RegionHieararchy: {
			type: 'array',
			items: {
				type: 'object',
				$ref: '#/definitions/RegionHierarchyItem',
			},
		},
		/**
		 * An item in a region Hierarchy
		 */
		RegionHierarchyItem: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
				},
				name: {
					type: 'string',
				},
				type: {
					type: 'string',
				},
			},
			required: ['id', 'name', 'type'],
		},
		/**
		 * An informational or actionable link
		 */
		Link: {
			type: 'object',
			properties: {
				url: {
					type: 'string',
				},
				text: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				content: {
					description: 'A content-type hint for binary formats',
					enum: ['image', 'pdf'],
					type: 'string',
				},
			},
			required: ['url'],
		},
		/**
		 * An object of utility links
		 */
		Links: {
			type: 'object',
			properties: {
				info: {
					$ref: '#/definitions/Link',
				},
				workflow: {
					$ref: '#/definitions/Link',
				},
				scheduling: {
					$ref: '#/definitions/Link',
				},
				scheduling_phone: {
					$ref: '#/definitions/Link',
				},
				registration: {
					$ref: '#/definitions/Link',
				},
				providers: {
					$ref: '#/definitions/Link',
				},
				eligibility: {
					$ref: '#/definitions/Link',
				},
				eligibility_plan: {
					$ref: '#/definitions/Link',
				},
			},
		},
		/**
		 * Vaccination Phase Info
		 */
		Phase: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
				},
				qualifications: {
					type: 'array',
					items: {
						type: 'object',
						$ref: '#/definitions/Qualification',
					},
				},
			},
			required: ['id'],
		},
		/**
		 * The top-level plan response
		 */
		Plan: {
			type: 'object',
			properties: {
				regionalHierarchy: {
					$ref: '#/definitions/RegionHieararchy',
				},
				links: {
					$ref: '#/definitions/Links',
				},
				phase: {
					$ref: '#/definitions/Phase',
				},
			},
		},
	},

	// paths are derived from args.routes.  These are filled in by fs-routes.
	paths: {},
}

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
		Error: {
			additionalProperties: true,
		},
	},

	// paths are derived from args.routes.  These are filled in by fs-routes.
	paths: {},
}

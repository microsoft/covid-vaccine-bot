/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Validator } from 'jsonschema'

export const State = {
	id: '/State',
	type: 'object',
	properties: {
		id: {
			type: 'string',
		},
		name: {
			type: 'string',
		},
		code_alpha: {
			type: 'string',
		},
		code_numeric: {
			type: 'integer',
		},
		c19: {
			$ref: '/StateCovidInfo',
		},
	},
	required: ['id', 'name', 'code_alpha', 'code_numeric', 'c19'],
}

const StateCovidInfo = {
	id: '/StateCovidInfo',
	type: 'object',
	properties: {
		vaccination: {
			$ref: '/StateCovidVaccinationInfo',
		},
	},
	required: ['vaccination'],
}

const StateCovidVaccinationInfo = {
	id: '/StateCovidVaccinationInfo',
	type: 'object',
	properties: {
		links: {
			type: 'object',
			properties: {
				info: { $ref: '/Link' },
				workflow: { $ref: '/Link' },
				scheduling_phone: { $ref: '/Link' },
			},
			required: ['info'],
		},
		phases: {
			type: 'array',
			items: {
				$ref: '/CovidVaccinationPhase',
			},
		},
		regions: {
			type: 'array',
			items: { $ref: '/Region' },
		},
	},
	required: ['links', 'phases'],
}

const CovidVaccinationPhase = {
	id: '/CovidVaccinationPhase',
	type: 'object',
	properties: {
		name: { type: 'string' },
		active: { type: 'boolean' },
		qualifications: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
	required: ['name', 'qualifications'],
}

const Link = {
	id: '/Link',
	type: 'object',
	properties: {
		text: { type: 'string' },
		url: { type: 'string' },
	},
	required: ['url'],
}

const Region = {
	id: '/Region',
	type: 'object',
	properties: {
		id: {
			type: 'string',
		},
		name: {
			type: 'string',
		},
		alias: {
			description:
				'A dot-delimeted identifier into the policy tree (e.g. washington.kitsap)',
			type: 'string',
		},
		flags: {
			type: 'object',
			properties: {
				is_tribal_land: {
					type: 'boolean',
				},
				is_city: {
					type: 'boolean',
				},
			},
		},
		phases: {
			type: 'array',
			items: {
				$ref: '/CovidVaccinationPhase',
			},
		},
		regions: {
			type: 'array',
			items: { $ref: '/Region' },
		},
	},
	required: ['name'],
}

export function createValidator(): Validator {
	const v = new Validator()
	v.addSchema(State, '/State')
	v.addSchema(StateCovidInfo, '/StateCovid')
	v.addSchema(StateCovidVaccinationInfo, '/StateCovidVaccinationInfo')
	v.addSchema(CovidVaccinationPhase, '/CovidVaccinationPhase')
	v.addSchema(Link, '/Link')
	v.addSchema(Region, '/Region')
	return v
}

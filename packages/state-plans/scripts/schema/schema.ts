/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export const Region = {
	id: '/Region',
	type: 'object',
	properties: {
		id: {
			type: 'string',
		},
		name: {
			type: 'string',
		},
		type: {
			description: 'the region type',
			// state || county || tribal_land || city
			type: 'string',
		},
		code_alpha: {
			type: 'string',
		},
		code_numeric: {
			type: 'integer',
		},
	},
	required: ['id', 'name', 'type'],
}

export const VaccinationPlan = {
	id: '/VaccinationPlan',
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
		activePhase: {
			type: 'string',
			description: 'the ID of the currently active phase',
		},
		phases: {
			type: 'array',
			items: {
				$ref: '/VaccinationPhase',
			},
		},
		regions: {
			type: 'array',
			items: { $ref: '/Region' },
		},
	},
	required: [],
}

export const VaccinationPhase = {
	id: '/VaccinationPhase',
	type: 'object',
	properties: {
		id: {
			description:
				'An identifier for the vaccination phase. The identifier should be unique in the phase array',
			type: 'string',
		},
		extends: {
			description:
				'The base phase that this phase should extend: (e.g. arizona.1a)',
			type: 'string',
		},
		label: {
			description:
				'An optional label to present when displaying information about the phase. The system will be "Phase " + phase.id.toUpperCase()',
			type: 'string',
		},
		active: {
			description:
				'A flag indicating that this phase is currently active for the region. Only one phase in the phase array should be marked as active.',
			type: 'boolean',
		},
		qualifications: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
	required: ['id', 'qualifications'],
}

export const Link = {
	id: '/Link',
	type: 'object',
	properties: {
		text: { type: 'string' },
		url: { type: 'string' },
	},
	required: ['url'],
}

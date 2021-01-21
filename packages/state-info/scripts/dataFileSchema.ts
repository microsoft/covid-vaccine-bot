
import { Validator } from 'jsonschema'

export const State = {
	id: '/State',
	type: 'object',
	properties: {
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
	required: ['name', 'code_alpha', 'code_numeric', 'c19'],
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
		info_link: { $ref: '/Link' },
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
	required: ['info_link', 'phases'],
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
	required: ['text', 'url'],
}

const Region = {
	id: '/Region',
	type: 'object',
	properties: {
		name: {
			type: 'string',
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


export function createValidator() {
	const v = new Validator()
	v.addSchema(State, '/State')
	v.addSchema(StateCovidInfo, '/StateCovid')
	v.addSchema(StateCovidVaccinationInfo, '/StateCovidVaccinationInfo')
	v.addSchema(CovidVaccinationPhase, '/CovidVaccinationPhase')
	v.addSchema(Link, '/Link')
	v.addSchema(Region, '/Region')
	return v
}

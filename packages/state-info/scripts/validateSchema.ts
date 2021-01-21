import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import { ValidationError, Validator } from 'jsonschema'

const State = {
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

/**
 * Validate that state-level data files adhere to the schema
 */
function validateDataFiles() {
	const validator = createValidator()
	const root = path.join(__dirname, '../data')
	const files = fs.readdirSync(root)
	let errors: ValidationError[] = []

	// Validate each state file
	files
		.filter((f) => f.endsWith('.json'))
		.forEach((file) => {
			const filePath = path.join(root, file)
			const data = require(filePath)
			const validationResult = validator.validate(data, State)

			// handle results
			if (validationResult.errors.length > 0) {
				errors.push(...validationResult.errors)
				console.log(
					chalk.red(`❌ ${file} has ${validationResult.errors.length} errors`)
				)
			} else {
				console.log(chalk.green(`✔ ${file}`))
			}
		})

	if (errors.length > 0) {
		console.log(errors)
		console.log('💥 ' + chalk.red(`${errors.length} schema validation errors`))
		process.exit(1)
	} else {
		console.log('🚀 ' + chalk.green(`all files passed schema validation`))
	}
}

function createValidator() {
	const v = new Validator()
	v.addSchema(State, '/State')
	v.addSchema(StateCovidInfo, '/StateCovid')
	v.addSchema(StateCovidVaccinationInfo, '/StateCovidVaccinationInfo')
	v.addSchema(CovidVaccinationPhase, '/CovidVaccinationPhase')
	v.addSchema(Link, '/Link')
	v.addSchema(Region, '/Region')
	return v
}

validateDataFiles()

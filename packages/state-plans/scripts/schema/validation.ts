/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Validator } from 'jsonschema'
import * as schema from './schema'

function createValidator(): Validator {
	const v = new Validator()
	v.addSchema(schema.Region, '/Region')
	v.addSchema(schema.VaccinationPlan, '/VaccinationPlan')
	v.addSchema(schema.VaccinationPhase, '/VaccinationPhase')
	v.addSchema(schema.Link, '/Link')
	return v
}

let validator: Validator
function getValidator() {
	if (validator == null) {
		validator = createValidator()
	}
	return validator
}

export function validateRegionInfo(data: unknown) {
	let validator = getValidator()
	return validator.validate(data, schema.Region)
}

export function validateVaccinationPlan(data: unknown) {
	let validator = getValidator()
	return validator.validate(data, schema.VaccinationPlan)
}

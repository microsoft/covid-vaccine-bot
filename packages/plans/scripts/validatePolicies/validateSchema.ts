/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Region, VaccinationPlan } from '@covid-vax-bot/plan-schema'
import regionSchemaJson from '@covid-vax-bot/plan-schema/dist/schema/Region.json'
import planSchemaJson from '@covid-vax-bot/plan-schema/dist/schema/VaccinationPlan.json'
import Ajv, { ErrorObject, JSONSchemaType } from 'ajv'

const ajv = new Ajv()
const RegionSchema: JSONSchemaType<Region> = regionSchemaJson as any
const VaccinationPlanSchema: JSONSchemaType<VaccinationPlan> =
	planSchemaJson as any

export type SchemaValidationError = ErrorObject<string, Record<string, any>>

export function validateRegionInfoSchema(
	data: unknown
): SchemaValidationError[] {
	const validate = ajv.compile<Region>(RegionSchema)
	if (validate(data)) {
		return []
	}
	return validate.errors || []
}

export function validateVaccinationPlanSchema(
	data: unknown
): SchemaValidationError[] {
	const validate = ajv.compile<VaccinationPlan>(VaccinationPlanSchema)
	if (validate(data)) {
		return []
	}
	return validate.errors || []
}

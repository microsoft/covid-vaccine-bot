/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Ajv, { ErrorObject, JSONSchemaType } from 'ajv'
import { Region, VaccinationPlan } from '@ms-covidbot/state-plan-schema'
import regionSchemaJson from '@ms-covidbot/state-plan-schema/dist/schema/Region.json'
import planSchemaJson from '@ms-covidbot/state-plan-schema/dist/schema/VaccinationPlan.json'

const ajv = new Ajv()
const RegionSchema: JSONSchemaType<Region> = regionSchemaJson as any
const VaccinationPlanSchema: JSONSchemaType<VaccinationPlan> = planSchemaJson as any

export type SchemaValidationError = ErrorObject<string, Record<string, any>>

export function validateRegionInfo(data: unknown): SchemaValidationError[] {
	const validate = ajv.compile<Region>(RegionSchema)
	if (validate(data)) {
		return []
	}
	return validate.errors || []
}

export function validateVaccinationPlan(
	data: unknown
): SchemaValidationError[] {
	const validate = ajv.compile<VaccinationPlan>(VaccinationPlanSchema)
	if (validate(data)) {
		return []
	}
	return validate.errors || []
}

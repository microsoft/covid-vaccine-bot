/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import Ajv, { JSONSchemaType } from 'ajv'
import { Region, VaccinationPlan } from '@ms-covidbot/state-plan-schema'
import regionSchemaJson from '@ms-covidbot/state-plan-schema/dist/schema/Region.json'
import planSchemaJson from '@ms-covidbot/state-plan-schema/dist/schema/VaccinationPlan.json'

const ajv = new Ajv()
const RegionSchema: JSONSchemaType<Region> = regionSchemaJson as any
const VaccinationPlanSchema: JSONSchemaType<VaccinationPlan> = planSchemaJson as any

export function validateRegionInfo(data: unknown): any[] {
	const validate = ajv.compile<Region>(RegionSchema)
	if (validate(data)) {
		return []
	}
	return validate.errors as any
}

export function validateVaccinationPlan(data: unknown): any[] {
	const validate = ajv.compile<VaccinationPlan>(VaccinationPlanSchema)
	if (validate(data)) {
		return []
	}
	return validate.errors as any
}

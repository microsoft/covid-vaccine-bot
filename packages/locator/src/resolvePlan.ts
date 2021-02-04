/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getMatchingRegion } from './getMatchingRegion'
import { resolvePlanInState } from './resolvePlanInState'
import { BingLocation, PlanResult } from './types'
import { Region } from '@ms-covidbot/state-plan-schema'

export function resolvePlan(
	location: BingLocation,
	topLevelPlans: Region[]
): PlanResult {
	const stateRegion = getMatchingRegion(location, topLevelPlans)
	if (!stateRegion || (!stateRegion.plan && !stateRegion.regions)) {
		throw new Error(`Unable to locate plan for ${location.adminDistrict}.`)
	}

	return resolvePlanInState(location, stateRegion)
}

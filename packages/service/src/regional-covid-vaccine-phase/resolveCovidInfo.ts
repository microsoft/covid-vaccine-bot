/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { config } from './config'
import { Location } from './fetchLocation'

export interface CovidInfo {
	region: {
		id: string
		name: string
		path: string
		type: string
	}
	links: Record<string, Record<string, string>>
	qualifications: string[]
}

export async function resolveCovidInfo(
	location: Location,
	statesPlans: any
): Promise<CovidInfo> {
	const statePlan = getMatchingStatePlan(location, statesPlans)
	const activeStatePhase = getActivePhase(
		statePlan?.c19?.vaccination?.phases ?? []
	)
	// State level qualifications.
	// May be overridden with regional policies.
	let qualifications: string[] = activeStatePhase?.qualifications ?? []

	// Top level state region.
	// May be overridden with a more granular region.
	let region: any = {
		id: statePlan?.id ?? '',
		name: statePlan?.name ?? '',
		alias: statePlan?.name ?? '',
		type: statePlan ? 'state' : '',
	}

	const regionStack: any[] = []

	if (statePlan?.c19?.vaccination?.regions != null) {
		regionStack.push(statePlan.c19.vaccination.regions)
	}

	// Search for matching subregion
	while (regionStack.length) {
		const matchingRegion = getMatchingRegion(location, regionStack.pop())
		if (!matchingRegion) {
			continue
		}
		const currentPhase = getActivePhase(matchingRegion.phases ?? [])
		if (currentPhase?.qualifications?.length) {
			// override qualifications and region with more granular regional guidelines
			qualifications = currentPhase.qualifications
			region = matchingRegion
		}
		// search for finer regional match.
		if (matchingRegion.regions != null) {
			regionStack.push(matchingRegion.regions)
		}
	}

	return {
		region: {
			id: region.id,
			name: region.name,
			path: region.alias,
			type: region.type,
		},
		links:
			(statePlan?.c19?.vaccination?.links as Record<
				string,
				Record<string, string>
			>) ?? {},
		qualifications,
	}
}

function getActivePhase(phases: any[]): any | undefined {
	return phases.filter((p: any) => p?.active)[0]
}

function getMatchingRegion(
	location: Location,
	regions: any[]
): any | undefined {
	return regions.filter((region: any) => {
		return (
			region.id ===
			location[config.regionTypeToLocationsMapping[region?.type ?? '']]
		)
	})[0]
}

function getMatchingStatePlan(
	location: Location,
	plans: any[]
): any | undefined {
	return plans.filter((plan: any) => {
		return plan.code_alpha === location.adminDistrict
	})[0]
}

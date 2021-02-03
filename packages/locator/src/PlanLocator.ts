/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import objectPath from 'object-path'
import { Region, RolloutPhase, Link } from '@ms-covidbot/state-plan-schema'

export interface PolicyRegion {
	id: string
	name: string
	type: string
}

export interface PlanPolicy {
	regionalHierarchy: PolicyRegion[]
	links: Record<string, Link | undefined>
	phase: RolloutPhase | undefined
}

export interface BingLocation {
	[key: string]: string
	adminDistrict: string
	adminDistrict2: string
	countryRegion: string
	formattedAddress: string
	locality: string
	postalCode: string
}

export function resolvePlanPolicy(
	location: BingLocation,
	topLevelPlans: Region[]
): PlanPolicy {
	const stateRegion = getMatchingRegion(location, topLevelPlans)

	if (!stateRegion || (!stateRegion.plan && !stateRegion.regions)) {
		throw new Error(`Unable to locate plan for ${location.adminDistrict}.`)
	}

	let region = stateRegion
	let currentPhases = stateRegion.plan?.phases ?? []
	let currentActivePhaseLabel = stateRegion.plan?.activePhase ?? ''
	let currentActivePhase = getActivePhase(
		currentActivePhaseLabel,
		currentPhases
	)
	let currentLinks = stateRegion.plan?.links ?? {}
	const regionalHierarchy: PolicyRegion[] = [
		{
			id: region.id,
			name: region.name,
			type: region.type,
		},
	]

	const regionsStack: Region[][] = []

	if (stateRegion.regions != null) {
		regionsStack.push(stateRegion.regions)
	}

	/**
	 * Though the Region schema is recursive, most properties are optional.
	 * Using a stack for searching instead of recursion allows for overriding only the defined properties
	 * when exploring nested regions and fallback to parent definitions otherwise.
	 * For example, the counties in Arizona define activePhase but do not define the phases themselves
	 * but instead rely on the state level phases definition.
	 */
	while (regionsStack.length) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const regions = regionsStack.pop()!
		const matchingRegion = getMatchingRegion(location, regions)
		if (matchingRegion != null) {
			region = matchingRegion
			regionalHierarchy.push({
				id: region.id,
				name: region.name,
				type: region.type,
			})
			currentPhases = region.plan?.phases ?? currentPhases
			currentActivePhaseLabel =
				region.plan?.activePhase ?? currentActivePhaseLabel
			currentActivePhase = getActivePhase(
				currentActivePhaseLabel,
				currentPhases
			)
			currentLinks = region.plan?.links ?? currentLinks
			if (matchingRegion.regions != null) {
				regionsStack.push(matchingRegion.regions)
			}
		}
	}

	return {
		regionalHierarchy,
		links: currentLinks,
		phase: currentActivePhase,
	}
}

function getActivePhase(
	activePhaseId: string,
	phases: RolloutPhase[]
): RolloutPhase | undefined {
	return phases.filter((p: RolloutPhase) => p.id === activePhaseId)[0]
}

function getMatchingRegion(
	location: BingLocation,
	regions: Region[]
): Region | undefined {
	return regions.filter((region: Region) => {
		return (
			objectPath.get(region, REGION_TYPES[region.type]?.policyTreeId) ===
			objectPath.get(location, REGION_TYPES[region.type]?.locationsId)
		)
	})[0]
}

const REGION_TYPES: Record<
	string,
	{ locationsId: string; policyTreeId: string }
> = {
	state: {
		locationsId: 'adminDistrict',
		policyTreeId: 'metadata.code_alpha',
	},
	territory: {
		locationsId: 'adminDistrict',
		policyTreeId: 'metadata.code_alpha',
	},
	tribal_land: {
		locationsId: '',
		policyTreeId: '',
	},
	county: {
		locationsId: 'adminDistrict2',
		policyTreeId: 'metadata.id_bing',
	},
	city: {
		locationsId: 'locality',
		policyTreeId: '',
	},
}

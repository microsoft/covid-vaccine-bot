/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { BingLocation, PlanResult, PlanRegion } from './types'
import { Region, RolloutPhase } from '@covid-vax-bot/plan-schema'

export function resolvePlan(
	location: BingLocation,
	topLevelPlans: Region[]
): PlanResult {
	const countryRegion = getMatchingRegion(location, topLevelPlans)
	if (!countryRegion) {
		throw new Error(`Unable to locate country for location`)
	}
	const stateRegion = getMatchingRegion(location, countryRegion.regions || [])
	if (!stateRegion) {
		throw new Error(`Unable to locate state/province for location`)
	}

	return resolvePlanInState(location, stateRegion)
}

/**
 *
 * @param location The Location Information
 * @param stateRegion The state region to dive into
 */
function resolvePlanInState(
	location: BingLocation,
	stateRegion: Region
): PlanResult {
	let region = stateRegion
	let currentPhases = stateRegion.plan?.phases ?? []
	let currentActivePhaseLabel = stateRegion.plan?.activePhase ?? ''
	let currentUnknownPhase = stateRegion.plan?.unknownPhase ?? false
	let currentNoPhaseLabel = stateRegion.plan?.noPhaseLabel ?? false
	let currentActivePhase = getActivePhase(
		currentActivePhaseLabel,
		currentPhases
	)
	const currentLinks = { ...(stateRegion.plan?.links || {}) }
	const regionalHierarchy: PlanRegion[] = [
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
			currentNoPhaseLabel = region.plan?.noPhaseLabel ?? currentNoPhaseLabel
			currentActivePhaseLabel =
				region.plan?.activePhase ?? currentActivePhaseLabel
			currentActivePhase = getActivePhase(
				currentActivePhaseLabel,
				currentPhases
			)
			currentUnknownPhase = region?.plan?.unknownPhase ?? currentUnknownPhase
			Object.assign(currentLinks, region.plan?.links || {})
			if (matchingRegion.regions != null) {
				regionsStack.push(matchingRegion.regions)
			}
		}
	}

	return {
		regionalHierarchy,
		links: currentLinks,
		phase: currentActivePhase,
		noPhaseLabel: currentNoPhaseLabel,
		unknownPhase: currentUnknownPhase,
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
		const regionMeta = REGION_TYPES[region.type]
		const treeNodeId =
			get(region, regionMeta?.policyTreeId) ?? get(region, 'name')
		return treeNodeId === get(location, regionMeta?.locationsId)
	})[0]
}

const REGION_TYPES: Record<
	string,
	{ locationsId: string; policyTreeId: string }
> = {
	country: {
		locationsId: 'countryRegion',
		policyTreeId: 'metadata.id_bing',
	},
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

// from https://youmightnotneed.com/lodash/
const get = (
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	obj: any,
	path: string | string[],
	defValue: unknown = undefined
) => {
	// If path is not defined or it has false value
	if (!path) return undefined
	// Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
	// Regex explained: https://regexr.com/58j0k
	const pathArray: string[] = Array.isArray(path)
		? (path as string[])
		: (path.match(/([^[.\]])+/g) as string[])
	// Find value if exist return otherwise return undefined value;
	return (
		pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj) || defValue
	)
}

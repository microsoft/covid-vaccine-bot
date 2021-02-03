/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/**
 * Note: using underscore because it's installed for healthbot steps
 * https://docs.microsoft.com/en-us/azure/health-bot/scenario-authoring/advanced_functionality
 */
import { getMatchingRegion } from './getMatchingRegion'
import { BingLocation, PlanRegion, PlanResult } from './types'
import { Region, RolloutPhase } from '@ms-covidbot/state-plan-schema'

/**
 *
 * @param location The Location Information
 * @param stateRegion The state region to dive into
 */
export function resolvePlanInState(
	location: BingLocation,
	stateRegion: Region
): PlanResult {
	let region = stateRegion
	let currentPhases = stateRegion.plan?.phases ?? []
	let currentActivePhaseLabel = stateRegion.plan?.activePhase ?? ''
	let currentActivePhase = getActivePhase(
		currentActivePhaseLabel,
		currentPhases
	)
	let currentLinks = stateRegion.plan?.links ?? {}
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

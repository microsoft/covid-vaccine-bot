/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { RolloutPhase, Link } from '@covid-vax-bot/plan-schema'

export interface PlanRegion {
	id: string
	name: string
	type: string
}

export interface PlanResult {
	regionalHierarchy: PlanRegion[]
	links: Record<string, Link | undefined>
	phase: RolloutPhase | undefined
	noPhaseLabel: boolean
	unknownPhase: boolean
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

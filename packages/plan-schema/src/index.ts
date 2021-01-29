/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

export type RegionType =
	| 'state'
	| 'territory'
	| 'tribal_land'
	| 'county'
	| 'city'

export interface Region {
	/**
	 * A unique identifier for this region. Should not contain dots. Unique within context of parent node
	 */
	id: string

	/**
	 * A display name for the region
	 */
	name: string

	/**
	 * The type of region this is
	 */
	type: RegionType

	/**
	 * The plan associated with this region
	 */
	vaccination_plan?: VaccinationPlan

	/**
	 * The nested regions
	 */
	regions?: Region[]
}

export interface VaccinationPlan {
	/**
	 * Informational links about the vaccination plan
	 */
	links?: {
		info?: Link
		workflow?: Link
		scheduling_phone?: Link
	}

	activePhase?: string

	phases?: RolloutPhase[]
}

export interface Link {
	url: string
	text: string
	description?: string
}

export interface RolloutPhase {
	id: string
	extends?: string
	label?: string
	qualifications: Qualification[]
}

export type Qualification = string

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

export interface RegionMetadata {
	[key: string]: string | number | boolean
}
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
	 * A metadata object
	 */
	metadata?: RegionMetadata

	/**
	 * The plan associated with this region
	 */
	plan?: VaccinationPlan

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
	label?: string
	qualifications: Qualification[]
}

export interface Qualification {
	/**
	 * The ID of the qualification question to ask
	 */
	question: string

	/**
	 * The ID of the clarifying text to provide (e.g. what defines an essential worker)
	 */
	moreInfo?: string
}

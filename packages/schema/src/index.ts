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

export type LinkType =
	/**
	 * General information link for the region
	 */
	| 'info'
	/**
	 * A link to an eligibility workflow tool
	 */
	| 'workflow'
	/**
	 * A site where a user can self-service schedule themselves
	 * for a vaccination
	 */
	| 'scheduling'
	/**
	 * A scheduling hotline
	 */
	| 'scheduling_phone'
	/**
	 * A site where a user can submit a registration form so
	 * that the region can follow up with them to schedule an
	 * appointment
	 */
	| 'registration'
	/**
	 * A site where a user can view a list of scheduling providers
	 * and locations
	 */
	| 'providers'
	/**
	 * Documentation describing eligibility criteria about the current phase. If not present, defaults to info link
	 */
	| 'eligibility'
	/**
	 * Documentation describing the rollout phases in detail - may be more technical, or provide additional content than the info link
	 */
	| 'eligibility_plan'

type ContentType = 'pdf' | 'image'

export interface VaccinationPlan {
	/**
	 * Informational links about the vaccination plan
	 */
	links?: Partial<Record<LinkType, Link>>
	activePhase?: string
	noPhaseLabel?: boolean
	unknownPhase?: boolean
	phases?: RolloutPhase[]
}

export interface Link {
	url: string
	text?: string | undefined
	description?: string | undefined

	/**
	 * Scraping hins for the current link (only applies to info links ATM).
	 * When false, scraping is disabled for this link.
	 * When a string, the URL is overridden by this URL
	 */
	scrape?: boolean

	/**
	 * A hint to use a querySelectorAll expressions to extract portions of the document.
	 * The default is to extract the full document
	 */
	scrapeQuery?: [string]

	/**
	 * A content-type hint for binary formats
	 */
	content?: ContentType
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
	 * A short-form, SMS-friendly variant of the question. The system wil default to 'question'
	 */
	questionSms?: string

	/**
	 * A voice-agent friendly of the question. The system wil default to 'question'
	 */
	questionVoice?: string

	/**
	 * The ID of the clarifying text to provide (e.g. what defines an essential worker)
	 */
	moreInfoText?: string

	/**
	 * A short-form, SMS-friendly variant of the more-info text. The system will default to 'moreInfoText'
	 */
	moreInfoTextSms?: string

	/**
	 * A voice-agent friendly variant of the more-info text. The system will default to 'moreInfoText'
	 */
	moreInfoTextVoice?: string

	/**
	 * A URL to provide to elaborate on eligibility details
	 */
	moreInfoUrl?: string
}

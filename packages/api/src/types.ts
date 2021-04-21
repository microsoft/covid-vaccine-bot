/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export interface OpenApiError {
	status: number
}

export interface ProviderLocation {
	provider_id: string
	location: {
		name: string
		store_no: number
		phone: string
		street1: string
		street2: string
		city: string
		state: string
		zip: string
	}
	position?: {
		type: 'Point'
		coordinates: GeoPoint
	}
	hours: {
		monday: string
		tuesday: string
		wednesday: string
		thursday: string
		friday: string
		saturday: string
		sunday: string
	}
	meds: MedInfo[]
	web_address: string
	pre_screen: string
	insurance_accepted: boolean
	walkins_accepted: boolean
	distance: number
}

export type GeoPoint = [number, number]

export interface MedInfo {
	name: string
	provider_notes: string
	ndc: string
	in_stock: boolean
	supply_level: number
	quantity_last_updated: Date
}

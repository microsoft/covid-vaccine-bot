/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
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
	any_in_stock: boolean
	meds: MedInfo[]
	web_address: string
	pre_screen: string
	insurance_accepted: boolean
	walkins_accepted: boolean
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

export interface ProviderLocationCsv {
	provider_location_guid: string
	loc_store_no: number
	loc_phone: string
	loc_name: string
	loc_admin_street1: string
	loc_admin_street2: string
	loc_admin_city: string
	loc_admin_state: string
	loc_admin_zip: string
	sunday_hours: string
	monday_hours: string
	tuesday_hours: string
	wednesday_hours: string
	thursday_hours: string
	friday_hours: string
	saturday_hours: string
	web_address: string
	pre_screen: string
	insurance_accepted: boolean
	walkins_accepted: boolean
	provider_notes: string
	ndc: string
	in_stock: boolean
	supply_level: number
	quantity_last_updated: Date
	med_name: string
}

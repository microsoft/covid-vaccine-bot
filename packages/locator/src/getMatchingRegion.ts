/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/**
 * Note: using underscore because it's installed for healthbot steps
 * https://docs.microsoft.com/en-us/azure/health-bot/scenario-authoring/advanced_functionality
 */
import { BingLocation } from './types'
import { Region } from '@ms-covidbot/state-plan-schema'
// eslint-disable-next-line
const _ = require('underscore')

export function getMatchingRegion(
	location: BingLocation,
	regions: Region[]
): Region | undefined {
	return regions.filter((region: Region) => {
		return (
			_.get(region, REGION_TYPES[region.type]?.policyTreeId) ===
			_.get(location, REGION_TYPES[region.type]?.locationsId)
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

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { BingLocation } from './types'
import { Region } from '@ms-covidbot/state-plan-schema'

export function getMatchingRegion(
	location: BingLocation,
	regions: Region[]
): Region | undefined {
	return regions.filter((region: Region) => {
		const regionMeta = REGION_TYPES[region.type]
		return (
			get(region, regionMeta?.policyTreeId) ===
			get(location, regionMeta?.locationsId)
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

// from https://youmightnotneed.com/lodash/
const get = (
	obj: Record<string, any>,
	path: string | string[],
	defValue: any = undefined
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

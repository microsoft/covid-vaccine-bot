/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { Location } from './fetchLocation'

export interface CovidInfo {
	state: string
	stateCode: string
	phase: string
	infoLink: {
		text: string
		url: string
	}
	qualifications: string[]
}

export function resolveCovidInfo(location: Location, statesPlans: any) {
	return (
		statesPlans.filter((plan: any) => {
			return plan.code_alpha === location.adminDistrict
		})[0] ?? {}
	)

	// const qualificationsInfo: any =
	// 	(statePlan?.c19?.vaccination?.phases ?? []).filter(
	// 		(q: any) => q.active
	// 	)[0] ?? {}
	//
	// return {
	// 	state: statePlan.name ?? '',
	// 	stateCode: location.adminDistrict,
	// 	phase: qualificationsInfo.name ?? '',
	// 	infoLink: statePlan?.c19?.vaccination?.info_link ?? { text: '', url: '' },
	// 	qualifications: qualificationsInfo.qualifications ?? [],
	// }
}

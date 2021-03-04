/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export const convertCSVDataToObj = (csvData: any) => {
	const returnObj: any = {}

	csvData.forEach((row: any) => {
		const stringLabel: string = Object.keys(row).find(
			(x) => x.trim() === 'String ID'
		) as string
		const stringId: string = row[stringLabel]

		delete row[stringLabel]
		returnObj[stringId.toLowerCase()] = row
	})

	return returnObj
}

export const createLocationDataObj = (locationData: any): any => {
	const locationName = locationData.details.replace(/\s/g, '_').toLowerCase()
	return {
		info: {
			content: {
				id: locationName,
				metadata: {
					code_alpha: locationName,
					code_numeric: 0,
				},
				name: locationData.details,
				type: locationData.regionType,
			},
			name: 'info.json',
			path: `${locationName}/info.json`,
			sha: '',
			type: 'info',
			url: '',
		},
		strings: { content: {} },
		vaccination: {
			content: {
				activePhase: '',
				links: {
					eligibility: {
						url: locationData.eligibility,
						text: '',
					},
					eligibility_plan: {
						url: locationData.eligibilityPlan,
						text: '',
					},
					info: {
						url: locationData.info,
						text: `cdc/${locationName}/state_link`,
					},
					providers: {
						url: locationData.providers,
						text: 'c19.links/vax_providers',
					},
					workflow: {
						url: locationData.workflow,
						text: 'c19.links/vax_quiz',
					},
					scheduling: {
						url: locationData.scheduling,
						text: 'c19.links/schedule_vax',
					},
					scheduling_phone: {
						url: `tel:${locationData.schedulingPhone}`,
						text: locationData.schedulingPhone,
					},
				},
			},
			name: 'vaccination.json',
			path: `${locationName}/vaccination.json`,
			sha: '',
			type: 'vaccination',
			url: '',
		},
	}
}

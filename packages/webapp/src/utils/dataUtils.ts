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
		Object.keys(row).forEach(k => {
			if ((!k.endsWith('sms') || !k.endsWith('voice'))) {
				!(`${k}-sms` in row) && (row[`${k}-sms`]= "")
				!(`${k}-voice` in row) && (row[`${k}-voice`]= "")
			}
		})

		returnObj[stringId.toLowerCase()] = row
	})

	return returnObj
}

export const createLocationDataObj = (locationData: any): any => {
	const locationName = locationData.details
		.replace(/[^a-z0-9\s]/gi, '')
		.replace(/\s/g, '_')
		.toLowerCase()
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
					...(locationData?.eligibility !== '' && {
						eligibility: {
							url: locationData.eligibility,
						},
					}),
					...(locationData?.eligibilityPlan !== '' && {
						eligibility_plan: {
							url: locationData.eligibilityPlan,
						},
					}),
					...(locationData?.info !== '' && {
						info: {
							url: locationData.info,
							text: `cdc/${locationName}/state_link`,
						},
					}),
					...(locationData?.providers !== '' && {
						providers: {
							url: locationData.providers,
							text: 'c19.links/vax_providers',
						},
					}),
					...(locationData?.workflow !== '' && {
						workflow: {
							url: locationData.workflow,
							text: 'c19.links/vax_quiz',
						},
					}),
					...(locationData?.scheduling !== '' && {
						scheduling: {
							url: locationData.scheduling,
							text: 'c19.links/schedule_vax',
						},
					}),
					...(locationData?.schedulingPhone !== '' && {
						scheduling_phone: {
							url: `tel:${locationData.schedulingPhone}`,
							text: locationData.schedulingPhone,
						},
					}),
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
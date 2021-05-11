/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export const convertCSVDataToObj = (csvData: any): any => {
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

export const pathFind = (obj: any, path: string[]): any => {
	for (let i = 0; i < path.length; i++) {
		obj = obj[path[i]]
	}
	return obj
}

export const createLocationDataObj = (
	locationId: string,
	filePathArray: string[],
	locationData: any,
	currentLanguage: string
): any => {
	const filePath = filePathArray.join('/')
	const locationPathKey = filePathArray.join('.')

	const locationNameKey = `name.${locationPathKey}`

	const stringsContent = {
		[locationNameKey]: { [currentLanguage]: locationData.details },
	}

	let schedulingPhoneObj: any = {}

	if (locationData?.schedulingPhone !== '') {
		const schedulingPhoneKey = `scheduling.phone.${locationNameKey}`
		stringsContent[schedulingPhoneKey] = {
			[currentLanguage]: locationData.schedulingPhone,
		}

		schedulingPhoneObj = {
			url: `tel:${locationData.schedulingPhone}`,
			text: schedulingPhoneKey,
		}

		if (locationData.schedulingPhoneDesc !== '') {
			const schedulingPhoneDescKey = `scheduling.phone.description.${locationNameKey}`
			stringsContent[schedulingPhoneDescKey] = {
				[currentLanguage]: locationData.schedulingPhoneDesc,
			}
			schedulingPhoneObj['description'] = schedulingPhoneDescKey
		}
	}

	return {
		info: {
			content: {
				id: locationId,
				metadata: {
					code_alpha: locationId,
					code_numeric: 0,
				},
				name: locationNameKey,
				type: locationData.regionType,
			},
			name: 'info.json',
			path: `${filePath}/info.json`,
			sha: '',
			type: 'info',
			url: '',
		},
		strings: {
			content: stringsContent,
			name: `${locationId}.csv`,
			path: `${filePath}/${locationId}.csv`,
			sha: '',
			type: locationId,
			url: '',
		},
		vaccination: {
			content: {
				phases: [],
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
						},
					}),
					...(locationData?.providers !== '' && {
						providers: {
							url: locationData.providers,
						},
					}),
					...(locationData?.workflow !== '' && {
						workflow: {
							url: locationData.workflow,
						},
					}),
					...(locationData?.scheduling !== '' && {
						scheduling: {
							url: locationData.scheduling,
						},
					}),
					...(locationData?.schedulingPhone !== '' && {
						scheduling_phone: schedulingPhoneObj,
					}),
				},
			},
			name: 'vaccination.json',
			path: `${filePath}/vaccination.json`,
			sha: '',
			type: 'vaccination',
			url: '',
		},
	}
}
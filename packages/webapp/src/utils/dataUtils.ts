/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {isEqual, reduce, map} from 'lodash'
export const convertCSVDataToObj = (csvData: any): any => {
	const returnObj: any = {}

	csvData.forEach((row: any) => {
		const stringLabel: string = Object.keys(row).find(
			(x) => x.trim() === 'String ID'
		) as string
		const stringId: string = row[stringLabel]

		delete row[stringLabel]
		Object.keys(row).forEach((k) => {
			if (!k.endsWith('sms') || !k.endsWith('voice')) {
				!(`${k}-sms` in row) && (row[`${k}-sms`] = '')
				!(`${k}-voice` in row) && (row[`${k}-voice`] = '')
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

export const compare = function (a: any, b: any): any {
  var result: {
    different: string[]
    missing_from_first: string[]
    missing_from_second: string[]
	} = {
    different: [],
    missing_from_first: [],
    missing_from_second: []
  }

	console.log('compare', a, b);
	
  reduce(a, function (_result, value, key) {
    if (b.hasOwnProperty(key)) {
      if (isEqual(value, b[key])) {
        return _result;
      } else {
        if (typeof (a[key]) != typeof ({}) || typeof (b[key]) != typeof ({})) {
          //dead end.
          _result.different.push(key);
          return _result;
        } else {
          var deeper = compare(a[key], b[key]);
          _result.different = _result.different.concat(map(deeper.different, (sub_path) => {
            return key + "." + sub_path;
          }));

          _result.missing_from_second = _result.missing_from_second.concat(map(deeper.missing_from_second, (sub_path) => {
            return key + "." + sub_path;
          }));

          _result.missing_from_first = _result.missing_from_first.concat(map(deeper.missing_from_first, (sub_path) => {
            return key + "." + sub_path;
          }));
          return _result;
        }
      }
    } else {
      _result.missing_from_second.push(key);
      return _result;
    }
  }, result);

  reduce(b, function (_result, value, key) {
    if (a.hasOwnProperty(key)) {
      return _result;
    } else {
      _result.missing_from_first.push(key);
      return _result;
    }
  }, result);

	console.log('result', result);
	
	debugger

  return result;
}
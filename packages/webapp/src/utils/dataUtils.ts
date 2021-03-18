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

export const getObjDiffs = (obj1: any, obj2: any) => {

    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
        return obj1;
    }

    const diffs: any = {};
    let key;

    /**
     * Check if two arrays are equal
     * @param  {Array}   arr1 The first array
     * @param  {Array}   arr2 The second array
     * @return {Boolean}      If true, both arrays are equal
     */
    const arraysMatch = function (arr1: any, arr2: any) {

        // Check if the arrays are the same length
        if (arr1.length !== arr2.length) return false;

        // Check if all items exist and are in the same order
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }

        // Otherwise, return true
        return true;

    };

    /**
     * Compare two items and push non-matches to object
     * @param  {*}      item1 The first item
     * @param  {*}      item2 The second item
     * @param  {String} key   The key in our object
     */
    const compare = function (item1: any, item2: any, key: string) {
        // Get the object type
        const type1 = Object.prototype.toString.call(item1);
        const type2 = Object.prototype.toString.call(item2);

        // If type2 is undefined it has been removed
        if (type2 === '[object Undefined]') {
            diffs[key] = null;
            return;
        }

        // If items are different types
        if (type1 !== type2) {
            diffs[key] = item2;
            return;
        }

        // If an object, compare recursively
        if (type1 === '[object Object]') {
            const objDiff = getObjDiffs(item1, item2);
            if (Object.keys(objDiff).length > 0) {
                diffs[key] = objDiff;
            }
            return;
        }

        // If an array, compare
        if (type1 === '[object Array]') {
            if (!arraysMatch(item1, item2)) {
                diffs[key] = item2;
            }
            return;
        }

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (type1 === '[object Function]') {
            if (item1.toString() !== item2.toString()) {
                diffs[key] = item2;
            }
        } else {
            if (item1 !== item2 ) {
                diffs[key] = item2;
            }
        }

    };


    //
    // Compare our objects
    //
    // Loop through the first object
    for (key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            compare(obj1[key], obj2[key], key);
        }
    }

    // Loop through the second object and find missing items
    for (key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (!obj1[key] && obj1[key] !== obj2[key] ) {
                diffs[key] = obj2[key];
            }
        }
    }

    // Return the object of differences
    return diffs;
};
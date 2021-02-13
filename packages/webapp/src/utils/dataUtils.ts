/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export const processCSVData = (allText: string): any => {
	const allTextLines = allText.split(/\r\n|\n/)
	const headers = allTextLines[0].split(',')
	const lines = []

	for (let i = 1; i < allTextLines.length; i++) {
		const data = allTextLines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
		if (data.length === headers.length) {
			const tarr = []
			for (let j = 0; j < headers.length; j++) {
				tarr.push({ key: headers[j], data: data[j].replace(/"/g, '') })
			}
			lines.push(tarr)
		}
	}

	return lines
}

export const convertCSVDataToObj = (csvData: any) => {
	const returnObj: any = {}
	csvData.forEach((row: any) => {
		const rowObj: any = {}
		row.slice(1).forEach((x: any) => {
			rowObj[x.key] = x.data
		})
		returnObj[row[0]['data'].toLowerCase()] = rowObj
	})

	return returnObj
}

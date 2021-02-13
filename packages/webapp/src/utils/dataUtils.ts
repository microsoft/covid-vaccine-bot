export const processCSVData = (allText: string): any => {
	var allTextLines = allText.split(/\r\n|\n/)
	var headers = allTextLines[0].split(',')
	var lines = []

	for (var i = 1; i < allTextLines.length; i++) {
		var data = allTextLines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
		if (data.length === headers.length) {
			var tarr = []
			for (var j = 0; j < headers.length; j++) {
				tarr.push({ key: headers[j], data: data[j].replace(/"/g, '') })
			}
			lines.push(tarr)
		}
	}

	return lines
}

export const convertCSVDataToObj = (csvData: any) => {
	let returnObj: any = {}
	csvData.forEach((row: any) => {
		let rowObj: any = {}
		row.slice(1).forEach((x: any) => {
			rowObj[x.key] = x.data
		})
		returnObj[row[0]['data'].toLowerCase()] = rowObj
	})

	return returnObj
}

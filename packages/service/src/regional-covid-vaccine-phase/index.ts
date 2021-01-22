/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { fetchLocation } from './fetchLocation'

const httpTrigger: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	context.log('HTTP trigger function processed a request.')
	const zipcode = req.query.zipcode
	const locationResults = await fetchLocation(zipcode)

	context.res = {
		// status: 200, /* Defaults to 200 */
		headers: {
			'Content-Type': 'application/json',
		},
		body: {
			location: locationResults,
		},
	}
}

export default httpTrigger

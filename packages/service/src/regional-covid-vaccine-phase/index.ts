/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
// eslint-disable-next-line import/no-unresolved
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import logIntercept from 'azure-function-log-intercept'
import { fetchAllStateGuidelines } from './fetchAllStateGuidelines'
import { fetchLocation } from './fetchLocation'
import { resolveCovidInfo } from './resolveCovidInfo'

const httpTrigger: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	// send console messages to context tracing
	logIntercept(context)
	const zipcode = req.query.zipcode

	if (!zipcode || !/^\d{5}$/.test(zipcode)) {
		context.res = {
			status: 400,
			body: 'Invalid zip code.',
		}
		return
	}

	const [location, allStateGuidelines] = await Promise.all([
		fetchLocation(zipcode),
		fetchAllStateGuidelines(),
	])

	const covidInfo = await resolveCovidInfo(location, allStateGuidelines)

	context.res = {
		// status: 200, /* Defaults to 200 */
		headers: {
			'Content-Type': 'application/json',
		},
		body: {
			location: location,
			covid: covidInfo,
		},
	}
}

export default httpTrigger

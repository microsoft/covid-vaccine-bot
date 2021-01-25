/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { fetchLocation } from './fetchLocation'
import { fetchStatesPlans } from './fetchStatesPlans'
import logIntercept from 'azure-function-log-intercept'

const httpTrigger: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	logIntercept(context)
	const zipcode = req.query.zipcode
	const [locationResults, statesPlans] = await Promise.all([
		fetchLocation(zipcode),
		fetchStatesPlans(),
	])

	context.res = {
		// status: 200, /* Defaults to 200 */
		headers: {
			'Content-Type': 'application/json',
		},
		body: {
			location: locationResults,
			statePlans: statesPlans,
		},
	}
}

export default httpTrigger

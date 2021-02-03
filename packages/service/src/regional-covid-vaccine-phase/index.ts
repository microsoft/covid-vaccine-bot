/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
// eslint-disable-next-line import/no-unresolved
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import logIntercept from 'azure-function-log-intercept'
import { fetchAllStatePlans } from './fetchAllStatePlans'
import { fetchLocation } from './fetchLocation'
import { resolvePlan } from '@ms-covidbot/policy-locator'

const httpTrigger: AzureFunction = async function (
	context: Context,
	req: HttpRequest
): Promise<void> {
	// send console messages to context tracing
	logIntercept(context)
	const zipcode = req.query.zipcode
	const invalidate = Boolean(req.query.invalidate)

	if (!zipcode || !/^\d{5}$/.test(zipcode)) {
		context.res = {
			status: 400,
			body: 'Invalid zip code.',
		}
		return
	}

	const [location, allStatesPlans] = await Promise.all([
		fetchLocation(zipcode, invalidate),
		fetchAllStatePlans(invalidate),
	])

	try {
		const plan = resolvePlan(location, allStatesPlans)
		context.res = {
			// status: 200, /* Defaults to 200 */
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				location,
				plan,
			},
		}
	} catch (ex) {
		context.res = {
			status: 404,
			body: ex.message,
		}
	}
}

export default httpTrigger

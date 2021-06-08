/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ingest } from './ingest'
// import { Context } from '@azure/functions'
type Context = any

function scheduledIngest(context: Context): void {
	console.log = context.log
	console.error = context.log
	try {
		ingest()
			.then(() => context.done())
			.catch((err) => context.done(err))
	} catch (err) {
		console.error('error running ingest fn', err)
		context.done(err)
	}
}

export default scheduledIngest

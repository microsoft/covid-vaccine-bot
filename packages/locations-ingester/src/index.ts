/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ingest } from './ingest'
import { Context } from '@azure/functions'

function scheduledIngest(context: Context) {
	ingest()
		.then(() => context.done())
		.catch((err) => context.done(err))
}

export default scheduledIngest

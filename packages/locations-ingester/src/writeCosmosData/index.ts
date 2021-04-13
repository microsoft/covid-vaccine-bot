/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { writeCosmosData } from './writeCosmosData'

writeCosmosData()
	.then(() => console.log('wrote data'))
	.catch((err) => {
		console.error('caught error writing data', err)
		process.exit(1)
	})

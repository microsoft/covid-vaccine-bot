/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getLatestFilePath } from '../io'
import { transformData } from './transformData'

transformData(getLatestFilePath())
	.then(() => console.log('finished data transform'))
	.catch((err) => console.log('error transforming data', err))

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @essex/adjacent-await, @typescript-eslint/no-var-requires */
import * as path from 'path'
import { config } from 'dotenv'
import { DIST_DIR } from '../../createDistDir'

config()

async function uploadFiles() {
	const { Resources } = require('../Resources')
	const resources = new Resources()

	await resources.upload([path.join(DIST_DIR, 'policies.json')])
}

uploadFiles().then(() => console.log('successfully uploaded resources'))

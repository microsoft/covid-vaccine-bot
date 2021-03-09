/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import { DIST_DIR } from '../createDistDir'
import { getFiles } from '../getFiles'

export function assembleAllData(): void {
	console.log('assembling combined file')
	const result: unknown[] = []
	getFiles(path.join(DIST_DIR, 'regions')).forEach((regionDataFile) => {
		result.push(require(regionDataFile))
	})
	fs.writeFileSync(
		path.join(DIST_DIR, 'policies.json'),
		JSON.stringify(result, null, 4),
		{ encoding: 'utf8' }
	)
}

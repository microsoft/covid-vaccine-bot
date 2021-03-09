/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import { assembleRegion, POLICIES_DIR } from './assembleRegion'

export function assembleRegions(): void {
	const regionsPaths = fs.readdirSync(POLICIES_DIR)
	regionsPaths.forEach(assembleRegion)
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'

export const DIST_DIR = path.join(__dirname, '../dist')

export function createDistDir(): void {
	if (!fs.existsSync(DIST_DIR)) {
		fs.mkdirSync(DIST_DIR)
	}
}

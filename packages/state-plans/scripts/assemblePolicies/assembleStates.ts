/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import { assembleState, POLICIES_DIR } from './assembleState'

export function assembleStates(): void {
	const statePaths = fs.readdirSync(POLICIES_DIR)
	statePaths.forEach(assembleState)
}

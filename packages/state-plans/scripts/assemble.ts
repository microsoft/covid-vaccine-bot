/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import { DIST_DIR, createDistDir } from './createDistDir'

const STATE_PLAN_DIR = path.join(__dirname, '../data/state_plans')
const STATE_PLAN_FILES = fs.readdirSync(STATE_PLAN_DIR)
const statePlanPath = (file: string): string => path.join(STATE_PLAN_DIR, file)
const ALL_STATES_OUTPUT_FILE_PATH = path.join(DIST_DIR, 'states_data.json')

function assembleDataFile(): void {
	const result: unknown[] = []
	STATE_PLAN_FILES.forEach((file) => {
		const filePath = statePlanPath(file)
		/* eslint-disable-next-line @typescript-eslint/no-var-requires */
		const data = require(filePath)
		result.push(data)
	})

	createDistDir()

	fs.writeFileSync(
		ALL_STATES_OUTPUT_FILE_PATH,
		JSON.stringify(result, null, 4),
		{
			encoding: 'utf8',
		}
	)
}

assembleDataFile()

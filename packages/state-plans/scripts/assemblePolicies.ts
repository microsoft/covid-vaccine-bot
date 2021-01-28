/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import { DIST_DIR, createDistDir } from './createDistDir'
import { getFiles, DATA_DIR } from './getFiles'

const POLICIES_DIR = path.join(DATA_DIR, 'policies')

/**
 * Assembles a state's information into a combined JSON file.
 * TODO: handle nested regions in regions/ folder
 * @param state The state to assemble
 */
function assembleState(state: string) {
	console.log('assembling ' + state)
	const rootInfo = require(path.join(POLICIES_DIR, state, 'info.json'))
	const vaxPlan = require(path.join(POLICIES_DIR, state, 'vaccination.json'))

	fs.writeFileSync(
		path.join(DIST_DIR, 'states', `${state}.json`),
		JSON.stringify(
			{
				...rootInfo,
				vaccination_plan: vaxPlan,
			},
			null,
			4
		),
		{ encoding: 'utf8' }
	)
}
function assembleStates() {
	const statePaths = fs.readdirSync(POLICIES_DIR)
	statePaths.forEach(assembleState)
}

function assembleAllData() {
	console.log('assembling combined file')
	const result: unknown[] = []
	getFiles(path.join(DIST_DIR, 'states')).forEach((stateDataFile) => {
		result.push(require(stateDataFile))
	})
	fs.writeFileSync(
		path.join(DIST_DIR, 'states.json'),
		JSON.stringify(result, null, 4),
		{ encoding: 'utf8' }
	)
}

createDistDir()
assembleStates()
assembleAllData()

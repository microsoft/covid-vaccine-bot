/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import { DIST_DIR } from '../createDistDir'
import { DATA_DIR } from '../getFiles'
import { Region } from '@covid-vax-bot/state-plan-schema'

export const POLICIES_DIR = path.join(DATA_DIR, 'policies')

const stateOutputPath = (state: string): string =>
	path.join(DIST_DIR, 'states', `${state}.json`)
const infoJsonPath = (state: string): string =>
	path.join(POLICIES_DIR, state, 'info.json')
const planJsonPath = (state: string): string =>
	path.join(POLICIES_DIR, state, 'vaccination.json')

/**
 * Assembles a region's information into a combined JSON file.
 * TODO: handle nested regions in regions/ folder
 * @param state The state to assemble
 */
export function assembleRegion(state: string): void {
	console.log('assembling ' + state)
	const content = getPolicyNodeData(state)
	fs.writeFileSync(stateOutputPath(state), JSON.stringify(content, null, 4), {
		encoding: 'utf8',
	})
}

function getPolicyNodeData(dir: string): Region {
	const info = require(infoJsonPath(dir))
	const plan = require(planJsonPath(dir))
	let regions: Region[] = []

	const regionsDir = path.join(POLICIES_DIR, dir, 'regions')
	if (fs.existsSync(regionsDir)) {
		regions = fs
			.readdirSync(regionsDir)
			.map((region) => getPolicyNodeData(path.join(dir, 'regions', region)))
	}

	return {
		...info,
		plan,
		regions: regions.length === 0 ? undefined : regions,
	}
}

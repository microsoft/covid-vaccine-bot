/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import { createDistDir, DIST_DIR } from '../createDistDir'
import { DATA_DIR, getFiles } from '../getFiles'
import { Link, VaccinationPlan } from '@ms-covidbot/state-plan-schema'

async function aggregateInfoSites(): Promise<void> {
	const files = getFiles(DATA_DIR, (file) => file === 'vaccination.json')
	const links: Link[] = []
	files.forEach((file) => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const data: VaccinationPlan = require(file)
		if (data.links?.info != null) {
			links.push(data.links.info)
		}
	})

	createDistDir()
	fs.writeFileSync(
		path.join(DIST_DIR, 'info_links.json'),
		JSON.stringify(links, null, 4)
	)
}

aggregateInfoSites()
	.then(() => console.log('aggregated info sites'))
	.catch((err) => {
		console.error('error aggregating info sites', err)
		process.exit(1)
	})

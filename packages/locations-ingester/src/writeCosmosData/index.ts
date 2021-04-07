/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { UpsertOperationInput } from '@azure/cosmos'
import _ from 'lodash'
import ProgressBar from 'progress'
import { getCosmosContainer } from '../cosmos'
import { getLatestGeoJsonRecords } from '../io'

async function writeData() {
	const container = getCosmosContainer()
	const data = getLatestGeoJsonRecords()
	console.log(`writing provider data: ${data.length} records`)
	const chunks = _.chunk(data, 100)
	const bar = new ProgressBar(':bar', { total: chunks.length })

	for (const chunk of chunks) {
		await container.items.bulk(
			chunk.map((r) => {
				return {
					operationType: 'Upsert',
					resourceBody: r as any,
				} as UpsertOperationInput
			})
		)
		bar.tick()
	}
}

writeData()
	.then(() => console.log('wrote data'))
	.catch((err) => {
		console.error('caught error writing data', err)
		process.exit(1)
	})

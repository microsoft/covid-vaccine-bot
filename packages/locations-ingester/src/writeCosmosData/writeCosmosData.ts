/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { UpsertOperationInput } from '@azure/cosmos'
import _ from 'lodash'
import ProgressBar from 'progress'
import { getCosmosContainer } from '../cosmos'
import { getLatestGeoJsonRecords } from '../io'

const MAX_COSMOS_BATCH_SIZE = 100

export async function writeCosmosData() {
	const container = getCosmosContainer()
	const data = getLatestGeoJsonRecords()
	console.log(`writing provider data: ${data.length} records`)
	const chunks = _.chunk(data, MAX_COSMOS_BATCH_SIZE)
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

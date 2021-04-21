/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { UpsertOperationInput } from '@azure/cosmos'
import _ from 'lodash'
import { getCosmosContainer } from '../cosmos'
import { getLatestGeoJsonRecords } from '../io'

const MAX_COSMOS_BATCH_SIZE = 100

export async function writeCosmosData() {
	console.log('writing data to cosmosdb')
	const container = getCosmosContainer()
	const data = getLatestGeoJsonRecords()
	console.log(`writing provider data: ${data.length} records`)
	const chunks = _.chunk(data, MAX_COSMOS_BATCH_SIZE)

	let chunkIndex = 0
	for (const chunk of chunks) {
		if (chunkIndex % 100 === 0) {
			console.log(`writing batch ${chunkIndex} / ${chunks.length}`)
		}
		await container.items.bulk(
			chunk.map((r) => {
				return {
					operationType: 'Upsert',
					resourceBody: r as any,
				} as UpsertOperationInput
			})
		)
	}
	console.log('finished writing cosmosdb data')
}

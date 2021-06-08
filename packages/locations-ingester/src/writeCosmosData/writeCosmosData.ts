/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Container } from '@azure/cosmos'
import _ from 'lodash'
import { getCosmosContainer } from '../cosmos'
import { getJsonRecords, getLatestFilePath } from '../io'
import { ProviderLocation } from '../types'

const CHUNK_SIZE = 25

export function getFilePath(): string {
	return getLatestFilePath().replace('.csv', '.json')
}

export async function writeCosmosData(): Promise<void> {
	const filePath = getFilePath()
	console.log(`writing data to cosmosdb from ${filePath}`)
	const container = getCosmosContainer()
	const data = getJsonRecords(filePath)
	console.log(`writing provider data: ${data.length} records`)
	const chunks = _.chunk(data, CHUNK_SIZE)

	let chunkIndex = 0
	for (const chunk of chunks) {
		console.log(`writing batch ${chunkIndex} / ${chunks.length}`)
		await processChunk(chunk, container)
		chunkIndex++
	}
	console.log('finished writing cosmosdb data')
}

function processChunk(
	chunk: ProviderLocation[],
	container: Container
): Promise<void> {
	return Promise.all(chunk.map((loc) => processLocation(loc, container))).then(
		() => {
			// do nothing
		}
	)
}

async function processLocation(
	loc: ProviderLocation,
	container: Container
): Promise<void> {
	const queryResponse = container.items.query<ProviderLocation>({
		query: `SELECT * from providers p where p.provider_id = @id`,
		parameters: [{ name: '@id', value: loc.provider_id }],
	})
	const result = await queryResponse.fetchAll()
	const existing = result.resources.length > 0 ? result.resources[0] : {}
	const updated = {
		...existing,
		...loc,
		last_updated: new Date().toISOString(),
	}
	try {
		await container.items.upsert(updated)
	} catch (err) {
		console.log('error upserting', updated, err)
		// swallow?
		// throw err
	}
}

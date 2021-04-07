/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import config from 'config'
import parse from 'csv-parse'
import { geocodeLocation } from './geocodeData/geocodeLocation'
import { ProviderLocation } from './types'
import { Transform, Writable } from 'stream'
import { CosmosClient, JSONObject, UpsertOperationInput } from '@azure/cosmos'
const batch2 = require('batch2')

// 100 max items per CosmosDB batch operation
const COSMOSDB_CHUNK_SIZE = 100
const BOOLEAN_COLS: Record<string, boolean> = {
	insurance_accepted: true,
	walkins_accepted: true,
	in_stock: true,
}
const DATE_COLS: Record<string, boolean> = {
	quantity_last_updated: true,
}
const NUMBER_COLS: Record<string, boolean> = {
	supply_level: true,
	loc_store_no: true,
}

export function pipelineFile(file: string) {
	const parser = createParser()
	const input = fs.createReadStream(file, {
		encoding: 'utf-8',
	})
	return new Promise<void>((resolve, reject) => {
		const stream = input
			.pipe(parser)
			.pipe(attachIdTransformer())
			.pipe(createGeocodeTransformer())
			.pipe(createWorkItemTransformer())
			.pipe(batch2({ size: COSMOSDB_CHUNK_SIZE, objectMode: true }))
			.pipe(createWriteTransformer())

		stream.on('end', () => resolve())
		stream.on('error', (err: Error) => reject(err))
	})
}

function createParser(): parse.Parser {
	return parse({
		columns: true,
		delimiter: '|',
		cast(item, ctx) {
			if (BOOLEAN_COLS[ctx.column]) {
				return item === 'TRUE'
			} else if (DATE_COLS[ctx.column]) {
				return new Date(item)
			} else if (NUMBER_COLS[ctx.column]) {
				return Number.parseFloat(item)
			} else {
				return item
			}
		},
	})
}

function attachIdTransformer(): Transform {
	return new Transform({
		objectMode: true,
		transform(record: ProviderLocation, encoding, callback) {
			try {
				record.id = record.provider_location_guid
				callback(null, record)
			} catch (err) {
				callback(err)
			}
		},
	})
}

function createGeocodeTransformer(): Transform {
	return new Transform({
		objectMode: true,
		transform(record: ProviderLocation, encoding, callback) {
			Promise.resolve()
				.then(() => geocodeLocation(record as ProviderLocation))
				.then(() => callback(null, record))
				.catch((err) => callback(err, record))
		},
	})
}

function createWorkItemTransformer(): Transform {
	return new Transform({
		objectMode: true,
		transform(record: ProviderLocation, encoding, callback) {
			callback(null, {
				operationType: 'Upsert',
				resourceBody: (record as unknown) as JSONObject,
			} as UpsertOperationInput)
		},
	})
}

function createWriteTransformer(): Writable {
	const client = new CosmosClient({
		endpoint: config.get<string>('cosmosdb.endpoint'),
		key: config.get<string>('cosmosdb.key'),
	})
	const database = client.database(config.get('cosmosdb.database'))
	const container = database.container(config.get('cosmosdb.container'))

	return new Writable({
		objectMode: true,
		write(ops: UpsertOperationInput[], encoding, callback) {
			container.items
				.bulk(ops)
				.then((response) => {
					response.forEach((r) => {
						if (r.statusCode >= 400) {
							console.error('error uploading document', r.resourceBody)
						}
					})
				})
				.catch((err) => callback(err))
				.then(() => callback())
		},
	})
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { createCacheDir } from './cache'
import { fetchS3Data } from './fetchS3Data/fetchS3Data'
import { geocodeData } from './geocodeData/geocodeData'
import { getLatestFilePath } from './io'
import { transformData } from './transformData/transformData'
import { writeCosmosData } from './writeCosmosData/writeCosmosData'

export async function ingest() {
	try {
		createCacheDir()
		console.log('fetching S3 Data')
		await fetchS3Data()
		console.log('transforming data to JSON')
		await transformData(getLatestFilePath())
		console.log('geocoding data')
		await geocodeData()
		console.log('writing data to cosmosdb')
		await writeCosmosData()
	} catch (err) {
		console.error(`error ingesting data`, err)
	}
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { persistCache, restoreCache } from './cache'
import { fetchS3Data } from './fetchS3Data/fetchS3Data'
import { geocodeData } from './geocodeData/geocodeData'
import { getLatestFilePath } from './io'
import { transformData } from './transformData/transformData'
import { writeCosmosData } from './writeCosmosData/writeCosmosData'

export async function ingest() {
	try {
		await restoreCache()
		await fetchS3Data()
		await transformData(getLatestFilePath())
		await geocodeData()
		await writeCosmosData()
	} finally {
		await persistCache()
	}
}

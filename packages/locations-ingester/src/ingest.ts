/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { fetchS3Data } from './fetchS3Data/fetchS3Data'
import { transformData } from './transformData/transformData'
import { writeCosmosData } from './writeCosmosData/writeCosmosData'

export async function ingest() {
	try {
		await fetchS3Data()
		await transformData()
		await writeCosmosData()
	} catch (err) {
		console.error('error ingesting', err)
		throw err
	}
}

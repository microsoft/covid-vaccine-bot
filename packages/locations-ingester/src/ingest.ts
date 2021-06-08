/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @essex/adjacent-await */
import { fetchS3Data } from './fetchS3Data/fetchS3Data'
import { transformData } from './transformData/transformData'
import { writeCosmosData } from './writeCosmosData/writeCosmosData'

export async function ingest(): Promise<void> {
	try {
		await fetchS3Data()
		await transformData()
		await writeCosmosData()
	} catch (err) {
		console.error('error ingesting', err)
		throw err
	}
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { BlobServiceClient } from '@azure/storage-blob'
import { config } from './config'
import { statesPlansCache } from './statesPlansCache'
import { Region } from '@ms-covidbot/state-plan-schema'

const STATES_PLANS_KEY = 'ALL_STATES_PLANS'

export async function fetchAllStatePlans(): Promise<Region[]> {
	let allStateGuidelines = statesPlansCache.get(STATES_PLANS_KEY)

	if (allStateGuidelines != null) {
		console.log('Returning cached state guidelines.')
		return allStateGuidelines
	}

	console.log('state guidelines do not exist in cache. Fetching remote data.')

	const account = config.azureBlobStorageAccount
	const sasToken = config.azureBlobStorageSasToken
	const containerName = config.azureBlobContainer
	const statesDataBlob = config.azureStatesBlob

	const blobServiceClient = new BlobServiceClient(
		`https://${account}.blob.core.windows.net${sasToken}`
	)
	const containerClient = blobServiceClient.getContainerClient(containerName)
	const blobClient = containerClient.getBlobClient(statesDataBlob)
	const response = await blobClient.downloadToBuffer()
	allStateGuidelines = JSON.parse(response.toString()) as Region[]
	statesPlansCache.set(STATES_PLANS_KEY, allStateGuidelines)
	return allStateGuidelines
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { BlobServiceClient } from '@azure/storage-blob'
import { config } from './config'
import { statesPlansCache } from './statesPlansCache'

const STATES_PLANS_KEY = 'statesPlans'

export async function fetchStatesPlans() {
	let statesPlans = statesPlansCache.get(STATES_PLANS_KEY)

	if (statesPlans != null) {
		console.log(`Returning cached ${STATES_PLANS_KEY}`)
		return statesPlans
	}

	console.log(
		`${STATES_PLANS_KEY} does not exist in cache. Fetching remote data.`
	)

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
	statesPlans = JSON.parse(response.toString())
	statesPlansCache.set(STATES_PLANS_KEY, statesPlans)
	return statesPlans
}

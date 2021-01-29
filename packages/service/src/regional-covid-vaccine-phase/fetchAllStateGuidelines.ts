/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { BlobServiceClient } from '@azure/storage-blob'
import { config } from './config'
import { statesGuidelinesCache } from './statesGuidelinesCache'

const STATES_GUIDELINES_KEY = 'stateGuidelines'

export async function fetchAllStateGuidelines(): Promise<any> {
	let allStateGuidelines = statesGuidelinesCache.get(STATES_GUIDELINES_KEY)

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
	allStateGuidelines = JSON.parse(response.toString())
	statesGuidelinesCache.set(STATES_GUIDELINES_KEY, allStateGuidelines)
	return allStateGuidelines
}

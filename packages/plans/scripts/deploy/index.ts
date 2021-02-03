/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { existsSync, promises as fs } from 'fs'
import { resolve } from 'path'
import {
	BlobServiceClient,
	StorageSharedKeyCredential,
} from '@azure/storage-blob'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '.env') })

const STATES_FILE = 'states.json'
const LOCAL_STATES_FILE_PATH = resolve(__dirname, `../../dist/${STATES_FILE}`)

async function run() {
	const {
		AZURE_STORAGE_ACCOUNT_NAME,
		AZURE_STORAGE_ACCOUNT_KEY,
		AZURE_BLOB_CONTAINER,
	} = process.env

	if (!existsSync(LOCAL_STATES_FILE_PATH)) {
		throw new Error(`${LOCAL_STATES_FILE_PATH} does not exist.`)
	}

	if (
		!AZURE_STORAGE_ACCOUNT_NAME ||
		!AZURE_STORAGE_ACCOUNT_KEY ||
		!AZURE_BLOB_CONTAINER
	) {
		throw new Error(
			'One of the following env variables is not set: ' +
				'AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, AZURE_BLOB_CONTAINER'
		)
	}

	const fileContents = await fs.readFile(LOCAL_STATES_FILE_PATH, 'utf-8')
	const fileOptions = {
		blobHTTPHeaders: {
			blobContentType: 'application/json',
		},
	}
	const blobLocation = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
	const blobCredentials = new StorageSharedKeyCredential(
		AZURE_STORAGE_ACCOUNT_NAME,
		AZURE_STORAGE_ACCOUNT_KEY
	)
	const blobContainerCLient = new BlobServiceClient(
		blobLocation,
		blobCredentials
	).getContainerClient(AZURE_BLOB_CONTAINER)
	const blobClient = blobContainerCLient.getBlockBlobClient(STATES_FILE)
	const uploadResponse = await blobClient.upload(
		fileContents,
		Buffer.byteLength(fileContents),
		fileOptions
	)
	console.log(`Upload complete: ${STATES_FILE} - ${uploadResponse.requestId}`)
}

run().catch((ex) => {
	console.error(ex)
	process.exit(1)
})

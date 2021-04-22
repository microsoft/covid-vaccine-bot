/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import {
	ContainerClient,
	StorageSharedKeyCredential,
} from '@azure/storage-blob'
import config from 'config'

export const CACHE_DIR = path.join(__dirname, '../.cache')

export function createCacheDir() {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR)
	}
}

export async function restoreCache() {
	console.log('restoring cache')
	createCacheDir()
	await syncCacheFromBlobStorage()
}

async function syncCacheFromBlobStorage() {
	const client = getClient()
	const blobs = client.listBlobsFlat()
	let done = false
	do {
		const nextBlob = await blobs.next()
		done = nextBlob.done ?? false
		if (!done) {
			const blobItem = nextBlob.value
			console.log(`restore cache item ${blobItem.name}`)
			await client
				.getBlockBlobClient(blobItem.name)
				.downloadToFile(path.join(CACHE_DIR, blobItem.name))
		}
	} while (!done)
}

export async function persistCache() {
	console.log('persisting cache')
	const cacheFiles = fs
		.readdirSync(CACHE_DIR)
		.map((f) => path.join(CACHE_DIR, f))

	const client = getClient()
	// only upload files that we want to cache (e.g. geocache.json)
	for (const file of cacheFiles.filter(
		(f) => f.indexOf('geocache.json') >= 0
	)) {
		const objName = path.basename(file)
		console.log(`persisting cache item: ${objName}`)
		const content = fs.readFileSync(file)
		await client.uploadBlockBlob(objName, content, content.length)
	}
}

function getClient(): ContainerClient {
	const url = config.get<string>('azureBlobStorage.url')
	if (!url) {
		throw new Error('azureStorage.url not defined')
	}
	const creds = createBlobStorageCredentials()
	return new ContainerClient(url, creds)
}

function createBlobStorageCredentials() {
	const account = config.get<string>('azureBlobStorage.account')
	const key = config.get<string>('azureBlobStorage.key')
	if (!account) {
		throw new Error('azureStorage.account not defined')
	}
	if (!key) {
		throw new Error('azureStorage.key not defined')
	}
	return new StorageSharedKeyCredential(account, key)
}

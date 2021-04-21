/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import config from 'config'
import { BlockBlobClient } from '@azure/storage-blob'

export const CACHE_DIR = path.join(__dirname, '../.cache')

export function createCacheDir() {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR)
	}
}

export function restoreCache() {}

export async function persistCache() {
	const cacheFiles = fs
		.readdirSync(CACHE_DIR)
		.map((f) => path.join(CACHE_DIR, f))

	const client = getClient()
	for (let file of cacheFiles) {
		await client.uploadFile(file)
	}
}

function getClient(): BlockBlobClient {
	const url = config.get<string>('azureBlobStorage.url')
	return new BlockBlobClient(url)
}

persistCache()

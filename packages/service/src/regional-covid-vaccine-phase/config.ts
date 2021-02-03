/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { resolve } from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '../../.env') })

export const config: Record<string, any> = {
	locationsApi: 'https://dev.virtualearth.net/REST/v1/Locations',
	locationsApiKey: process.env.BING_MAPS_API_KEY || '',
	azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
	azureStorageAccountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
	azureBlobContainer: process.env.AZURE_BLOB_CONTAINER || '',
	azureStatesBlob: process.env.AZURE_STATES_BLOB || '',
}

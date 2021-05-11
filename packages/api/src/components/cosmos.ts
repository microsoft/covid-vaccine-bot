/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { CosmosClient, Container } from '@azure/cosmos'
import config from 'config'

export function getCosmosContainer(): Container {
	const database = getCosmosDatabase()
	return database.container(config.get('cosmosdb.container'))
}

export function getCosmosLocationCacheContainer(): Container {
	const database = getCosmosDatabase()
	return database.container(config.get('cosmosdb.locationCacheContainer'))
}

function getCosmosDatabase() {
	const client = new CosmosClient({
		endpoint: config.get<string>('cosmosdb.endpoint'),
		key: config.get<string>('cosmosdb.key'),
	})
	return client.database(config.get('cosmosdb.database'))
}

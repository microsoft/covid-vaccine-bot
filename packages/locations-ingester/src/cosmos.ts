import config from 'config'
import { CosmosClient, Container } from '@azure/cosmos'

export function getCosmosContainer(): Container {
	const client = new CosmosClient({
		endpoint: config.get<string>('cosmosdb.endpoint'),
		key: config.get<string>('cosmosdb.key'),
	})
	const database = client.database(config.get('cosmosdb.database'))
	const container = database.container(config.get('cosmosdb.container'))
	return container
}

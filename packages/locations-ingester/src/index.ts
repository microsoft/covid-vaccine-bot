/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getCosmosContainer } from './cosmos'

async function execute() {
	const container = getCosmosContainer()
	container.items.bulk()
	await container.items.upsert({
		id: 'test_1233',
		loc_admin_zip: '00000',
		position: { x: 123, y: 456 },
	})

	const result = container.items.query({
		query: 'SELECT l.position FROM locations l where l.id = @id',
		parameters: [
			{
				name: '@id',
				value: 'test_fart',
			},
		],
	})
	const resp = await result.fetchAll()
	console.log(resp)
}

execute().catch((err) => {
	console.error('error reading data', err)
	process.exit(1)
})

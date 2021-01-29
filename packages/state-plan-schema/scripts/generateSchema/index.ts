/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import * as schema from './schema'

const DIST_DIR = path.join(__dirname, '../../dist')
const SCHEMA_DIST_DIR = path.join(DIST_DIR, 'schema')

function writeSchema(): void {
	Object.keys(schema).forEach((key) => {
		const item = (schema as any)[key]

		fs.writeFileSync(
			path.join(SCHEMA_DIST_DIR, `${key}.json`),
			JSON.stringify(item, null, 4),
			{
				encoding: 'utf8',
			}
		)
	})
}

if (!fs.existsSync(DIST_DIR)) {
	fs.mkdirSync(DIST_DIR)
}
if (!fs.existsSync(SCHEMA_DIST_DIR)) {
	fs.mkdirSync(SCHEMA_DIST_DIR)
}
writeSchema()

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'

const ALWAYS_TRUE_PREDICATE = () => true
export const DATA_DIR = path.join(__dirname, '../data')

export function getFiles(
	rootDir: string,
	predicate: (file: string) => boolean = ALWAYS_TRUE_PREDICATE
): string[] {
	return readDirectory(rootDir, predicate)
}

function readDirectory(
	dir: string,
	predicate: (file: string) => boolean
): string[] {
	const results: string[] = []
	const files = fs.readdirSync(dir)

	files.forEach((file) => {
		const filePath = path.join(dir, file)
		if (fs.lstatSync(filePath).isDirectory()) {
			results.push(...readDirectory(filePath, predicate))
		} else if (predicate(file)) {
			results.push(filePath)
		}
	})
	return results
}

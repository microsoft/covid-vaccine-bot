/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { localizeFiles } from './localizeFiles'

const apiTarget: string = process.argv[2]
const fileTarget: string = process.argv[3]

console.log(`beginning localization into ${apiTarget}, ${fileTarget}`)
localizeFiles(apiTarget, fileTarget)
	.then(() => console.log('localization complete!'))
	.catch((err) => {
		console.error('error localizing', err)
		process.exit(1)
	})

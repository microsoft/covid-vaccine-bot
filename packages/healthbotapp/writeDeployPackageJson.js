/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const { name, version, dependencies } = require('./package.json')

const deployPackage = {
	name,
	version,
	dependencies,
	main: 'index.js',
}

fs.writeFileSync(
	path.join(__dirname, 'dist/package.json'),
	JSON.stringify(deployPackage, null, 2)
)

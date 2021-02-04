/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const config = {
	input: 'lib/resolvePlan.js',
	output: {
		dir: 'dist/bundles',
		format: 'iife',
		name: 'resolvePlan',
	},
	plugins: [nodeResolve(), commonjs()],
}

export default config

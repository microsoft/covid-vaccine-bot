/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

const path = require('path')

module.exports = (env, argv) => ({
	mode: argv && argv.mode ? argv.mode : 'development',
	target: 'node',
	entry: {
		'regional-covid-vaccine-phase': path.resolve(
			__dirname,
			'./src/regional-covid-vaccine-phase/index.ts'
		),
	},
	output: {
		filename: '[name]/index.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'commonjs2', // IMPORTANT!
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.mjs'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
})

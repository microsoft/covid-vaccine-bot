/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
const execa = require('execa')
const minimist = require('minimist')
const buildOptions = require('minimist-options')
const debug = require('debug')
const packageInfo = require('../package.json')
const path = require('path')
const validate = require('./validate')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const log = debug('ms-covid-healthbot-service:scripts:buildDeploy')

// CLI options
const options = {
	containerRegistry: {
		type: 'string',
		default: '',
	},

	imageName: {
		type: 'string',
		required: true,
		default: packageInfo.name || '',
	},

	imageTag: {
		type: 'string',
		default: packageInfo.version || '',
	},

	username: {
		type: 'string',
		alias: 'u',
		required: true,
	},

	password: {
		type: 'string',
		alias: 'p',
		required: true,
	},

	skipVersionTag: {
		type: 'boolean',
		default: false,
	},

	verbose: {
		type: 'boolean',
		alias: 'v',
		default: false,
	},
}

async function pushImage(image) {
	const pushScript = `docker push ${image}`
	log('Pushing Docker image: "%s"', pushScript)
	const scriptResult = execa.command(pushScript)
	scriptResult.stdout.pipe(process.stdout)
	await scriptResult
}

async function run() {
	const args = minimist(process.argv.slice(2), buildOptions(options))

	if (args.verbose) {
		debug.enable('*')
	}

	log('args: %O', args)

	validate(options, args)

	const {
		containerRegistry,
		username,
		password,
		imageName,
		imageTag,
		skipVersionTag,
	} = args

	// Azure CR uses containerRegistry domain as image namespace.
	// Dockerhub uses username as image ns.
	const ns = containerRegistry || username
	const latestImage = `${ns}/${imageName}`
	const versionTag = `${latestImage}:${imageTag}`

	log('Logging into Docker: "%s"', containerRegistry || 'dockerHub')
	const login = execa.command(
		`docker login ${containerRegistry} --username ${username} --password ${password}`
	)
	login.stdout.pipe(process.stdout)
	await login

	if (imageTag && !skipVersionTag) {
		await pushImage(versionTag)
	}

	await pushImage(`${latestImage}:latest`)
}

run().catch((er) => {
	console.error(er)
	process.exit(1)
})

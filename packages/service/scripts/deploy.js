/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
const path = require('path')
const debug = require('debug')
const execa = require('execa')
const minimist = require('minimist')
const buildOptions = require('minimist-options')
const packageInfo = require('../package.json')
const validate = require('./validate')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const log = debug('ms-covid-healthbot-service:scripts:buildDeploy')

// CLI options
const options = {
	containerRegistry: {
		type: 'string',
		alias: 'c',
		required: true,
	},

	imageName: {
		type: 'string',
		alias: 'i',
		required: true,
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

	prod: {
		type: 'boolean',
		default: false,
	},

	version: {
		type: 'string',
		default: packageInfo.version || '',
	},

	verbose: {
		type: 'boolean',
		alias: 'v',
		default: false,
	},
}

async function tagImage(sourceImage, targetImage) {
	const tagScript = `docker tag ${sourceImage} ${targetImage}`
	log('Tagging image: "%s"', tagScript)
	const scriptResult = execa.command(tagScript)
	scriptResult.stdout.pipe(process.stdout)
	await scriptResult
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
		prod,
		version,
	} = args

	const baseImage = `${containerRegistry}/${imageName}`
	const latestImage = `${baseImage}:latest`
	const images = []

	if (prod) {
		if (version) {
			const versionImage = `${baseImage}:${version}`
			try {
				const inspect = execa.command(`docker image inspect ${versionImage}`)
				await inspect
				console.error(`Error. ${versionImage} already exists.`)
				process.exit(1)
			} catch (ex) {
				images.push(versionImage)
			}
		}
		images.push(`${baseImage}:prod`)
	} else {
		images.push(`${baseImage}:dev`)
	}

	log('Logging into Docker: "%s"', containerRegistry)
	const login = execa.command(
		`docker login ${containerRegistry} --username ${username} --password ${password}`
	)
	login.stdout.pipe(process.stdout)
	await login

	for (const image of images) {
		await tagImage(latestImage, image)
		// eslint-disable-next-line @essex/adjacent-await
		await pushImage(image)
	}
	await pushImage(latestImage)
}

run().catch((er) => {
	console.error(er)
	process.exit(1)
})

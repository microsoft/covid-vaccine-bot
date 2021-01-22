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

const log = debug('ms-covid-healthbot-service:scripts:build')

// CLI options
const options = {
	// Azure CR uses containerRegistry domain as image namespace.
	// Dockerhub uses username as image ns.
	imageNameSpace: {
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

	// build image with :latest tag only.
	// Skipping image:version tag.
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

async function run() {
	const args = minimist(process.argv.slice(2), buildOptions(options))

	if (args.verbose) {
		debug.enable('*')
	}

	log('args: %O', args)

	validate(options, args)

	const { imageNameSpace, imageName, imageTag, skipVersionTag } = args
	const latestImage = imageNameSpace
		? `${imageNameSpace}/${imageName}`
		: imageName
	const versionTag = `${latestImage}:${imageTag}`

	// list of image:tags to build.
	const tags = [latestImage]

	// Check if image:tag exists before creating it.
	if (imageTag) {
		try {
			const inspect = execa.command(`docker image inspect ${versionTag}`)
			await inspect
			if (!skipVersionTag) {
				console.error(`Error. ${versionTag} already exists.`)
				process.exit(1)
			}
		} catch (ex) {
			log('Creating image: %s', versionTag)
			tags.push(versionTag)
		}
	}

	// build tags
	const script = `docker build -t ${tags.join(' -t ')} ${process.cwd()}`
	log(script)
	const build = execa.command(script)
	build.stdout.pipe(process.stdout)
	await build
}

run().catch((er) => {
	console.error(er)
	process.exit(1)
})

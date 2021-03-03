/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Server } from 'http'
import { config as configDotEnv } from 'dotenv'
import { Application } from './Application'
import { Configuration } from './Configuration'

async function bootstrap(): Promise<void> {
	try {
		const config = createConfiguration()
		await createAppService(config)
	} catch (err) {
		console.error('error launching app service', err)
	}
}

function createConfiguration(): Configuration {
	configDotEnv()
	const nodeConfig = require('config')
	return new Configuration(nodeConfig)
}

function createAppService(config: Configuration): Server {
	const app = new Application(config)
	return app.start()
}

bootstrap()

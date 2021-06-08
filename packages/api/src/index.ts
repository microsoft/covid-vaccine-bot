/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import config from 'config'
import { createApp } from './app'

function startup(): void {
	try {
		console.log('starting app...')
		const app = createApp()
		const port = config.get<number>('service.port')
		console.log('initializing server...')
		app.listen(port, () =>
			console.log(`💉 C19 VAX API Listening on port ${port}`)
		)
	} catch (err) {
		console.error('error starting app', err)
		throw err
	}
}

startup()

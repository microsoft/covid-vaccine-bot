import http from 'http'
import { createApp } from './app'

function startup() {
	try {
		console.log('starting app...')
		const app = createApp()
		const port = 3000
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

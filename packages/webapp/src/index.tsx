/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { initializeIcons } from '@fluentui/react/lib/Icons'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './components/App'
import './orchestrators/authOrchestrators'
import './orchestrators/repoOrchestrators'
import './orchestrators/intlOrchestrators'

function render() {
	try {
		const basePath = process.env.REACT_APP_BASE_PATH
		initializeIcons()
		ReactDOM.render(
			<React.StrictMode>
				<Router basename={basePath}>
					<App />
				</Router>
			</React.StrictMode>,
			document.getElementById('root')
		)
	} catch (err) {
		console.error('error rendering app', err)
	}
}

render()

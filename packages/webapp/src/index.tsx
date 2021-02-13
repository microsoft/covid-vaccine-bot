import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { initializeIcons } from '@fluentui/react/lib/Icons'
import { BrowserRouter as Router } from 'react-router-dom'
import './orchestrators/authOrchestrators'
import './orchestrators/repoOrchestrators'

initializeIcons()
ReactDOM.render(
	<React.StrictMode>
		<Router>
			<App />
		</Router>
	</React.StrictMode>,
	document.getElementById('root')
)

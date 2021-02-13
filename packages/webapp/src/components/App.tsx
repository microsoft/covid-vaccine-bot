import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { isUserAuthenticated } from '../selectors/authSelectors'
import Login from './Login'
import About from './About'
import Dashboard from './Dashboard'
import { Switch, Route, Redirect } from 'react-router-dom'

import './App.scss'

export default observer(function App() {
	return (
		<div>
			{isUserAuthenticated() ? (
				<>
					<Switch>
						<Route exact path="/">
							<Dashboard />
						</Route>
						<Route path="/about">
							<About />
						</Route>
						<Route path="*">
							<div>404 page not found.</div>
						</Route>
					</Switch>
				</>
			) : (
				<Switch>
					<Route exact path="/">
						<Login />
					</Route>
					<Route path="*">
						<Redirect to="/" />
					</Route>
				</Switch>
			)}
		</div>
	)
})

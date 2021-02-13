import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { loginUser } from '../actions/authActions'
import { DefaultButton } from 'office-ui-fabric-react'

import './Login.scss'

export default observer(function Login() {
	return (
		<div className="loginPageContainer">
			<div className="loginContainer">
				<h3>Covid19 Vaccine Data Policy Composer</h3>
				<DefaultButton text="Login with Github" onClick={loginUser} />
			</div>
		</div>
	)
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { DefaultButton } from 'office-ui-fabric-react'
import { loginUser } from '../actions/authActions'

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

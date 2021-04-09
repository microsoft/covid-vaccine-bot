/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { DefaultButton } from 'office-ui-fabric-react'
import { loginUser } from '../actions/authActions'
import { getText as t } from '../selectors/intlSelectors'

import './Login.scss'

export default observer(function Login() {
	return (
		<div className="loginPageContainer">
			<div className="loginContainer">
				<h3>{t('App.title')}</h3>
				<DefaultButton text={t('App.LoginButton')} onClick={loginUser} />
			</div>
		</div>
	)
})

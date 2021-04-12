/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { logoutUser } from '../mutators/authMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'

import './LocationForm.scss'

export default observer(function UserAccessExpirationForm(props: any) {
	const { onSubmit } = props
	const { pendingChanges } = getAppStore()

	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">{t('App.UserAccessExpirationForm.title')}</div>
			</div>
			<div className="modalBody">
				<p>{t('App.UserAccessExpirationForm.text')}</p>
			</div>
			<div className="modalFooter">
				<PrimaryButton onClick={onSubmit}>
					{t('App.UserAccessExpirationForm.submit')}
				</PrimaryButton>
				{!pendingChanges && (
					<DefaultButton onClick={logoutUser}>
						{t('App.UserAccessExpirationForm.logout')}
					</DefaultButton>
				)}
			</div>
		</div>
	)
})

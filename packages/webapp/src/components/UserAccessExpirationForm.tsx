/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	PrimaryButton,
	DefaultButton,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { logoutUser } from '../mutators/authMutators'
import { getAppStore } from '../store/store'
import { getText as t } from '../selectors/intlSelectors'

import './LocationForm.scss'

export default observer(function UserAccessExpirationForm(props: any) {
	const { onSubmit } = props
    const {pendingChanges} = getAppStore()
	
	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">{t('App.UserAccessExpirationForm.title')}</div>
			</div>
			<div className="modalBody">
                <p>
					{t('App.UserAccessExpirationForm.text')}
                </p>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text={t('App.UserAccessExpirationForm.submit')}
					onClick={onSubmit}
				/>
                {!pendingChanges && (
                    <DefaultButton text={t('App.UserAccessExpirationForm.logout')} onClick={logoutUser} />
                )}
			</div>
		</div>
	)
})

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

import './LocationForm.scss'

export default observer(function LocationForm(props: any) {
	const { onSubmit, onCancel, item, isRegion } = props
    const {pendingChanges} = getAppStore()
	
	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">Session Expired</div>
			</div>
			<div className="modalBody">
                <p>
                    Please log back in with Github to continue working. 
                </p>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text="Continue Working"
					onClick={onSubmit}
				/>
                {!pendingChanges && (
                    <DefaultButton text="Logout" onClick={logoutUser} />
                )}
			</div>
		</div>
	)
})

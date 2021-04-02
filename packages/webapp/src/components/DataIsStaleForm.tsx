/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton } from '@fluentui/react'
import { observer } from 'mobx-react-lite'

import './LocationForm.scss'

export default observer(function DataIsStaleForm(props: any) {
	const { onSubmit } = props
	
	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">Data is stale</div>
			</div>
			<div className="modalBody">
                <p>
                    The current current branch you are trying to acces is not available. <br />
					Either the branch has been deleted or the change has been marked as complete. 
                </p>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text="Refresh Data"
					onClick={onSubmit}
				/>
			</div>
		</div>
	)
})

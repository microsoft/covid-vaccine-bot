/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { observer } from 'mobx-react-lite'

import './LocationForm.scss'

export default observer(function DeleteLocationForm(props: any) {
	const { onSubmit, onCancel, location } = props
	
	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">Remove Location</div>
			</div>
			<div className="modalBody">
				<p>
						Are you sure you would like to remove <strong>{location.text ?? location.name}</strong>?
				</p>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text="Remove Location"
					onClick={() => onSubmit?.(location)}
				/>
				<DefaultButton text="Cancel" onClick={() => onCancel?.()} />
			</div>
		</div>
	)
})

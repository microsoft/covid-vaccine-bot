/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	PrimaryButton,
	DefaultButton,
	TextField,
	Checkbox,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'

import './PhaseForm.scss'

export interface PhaseFormProp {
	onSubmit?: (phaseData: any) => void
	onCancel?: () => void
}

export default observer(function PhaseForm(props: PhaseFormProp) {
	const { onSubmit, onCancel } = props
	const [formData, setFormData] = useState<any>({})
	const fieldChanges = useRef<any>(formData)

	const handleTextChange = useCallback(
		(ev) => {
			const value = ev.target.value
			fieldChanges.current = {
				...fieldChanges.current,
				...{
					[ev.target.name]: value,
				},
			}

			setFormData({ ...formData, ...fieldChanges.current })
		},
		[formData, fieldChanges]
	)

	const handleCheckboxChange = useCallback(
		(_ev: any, checked?: boolean) => {
			fieldChanges.current = {
				...fieldChanges.current,
				...{
					isActive: checked,
				},
			}

			setFormData({ ...formData, ...fieldChanges.current })
		},
		[formData, fieldChanges]
	)

	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">New Phase</div>
			</div>
			<div className="modalBody">
				<TextField
					label="Phase Id:"
					name="phaseId"
					value={formData.phaseId}
					onChange={handleTextChange}
				/>
				<TextField
					label="Phase Name:"
					name="name"
					value={formData.name}
					onChange={handleTextChange}
				/>
				<Checkbox label="Active" onChange={handleCheckboxChange} />
			</div>
			<div className="modalFooter">
				<PrimaryButton text="Submit" onClick={() => onSubmit?.(formData)} />
				<DefaultButton text="Cancel" onClick={() => onCancel?.()} />
			</div>
		</div>
	)
})

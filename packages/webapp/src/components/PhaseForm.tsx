/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	PrimaryButton,
    DefaultButton,
    TextField
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'

import './LocationForm.scss'

export interface PhaseFormProp {
    item?: any
    onSubmit?: (phaseData: any) => void
    onCancel?: () => void
}

const setInitialData = (item: any) => {
    if (item) {
        return {
            phaseId: item.keyId,
            name: item.name.includes(' (active)') ? item.name.replace(' (active)','') : item.name,
            isActive: item.keyId.includes(' (active)')
        }
    } else {
        return {
            phaseId: null,
            name: '',
            isActive: false
        }
    }
}

export default observer(function PhaseForm(props: PhaseFormProp) {
    const { onSubmit, onCancel, item } = props
    const [formData, setFormData] = useState<any>(setInitialData(item))
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

	const formTitle = item ? 'Edit Phase' : 'New Phase'

    return (
        <div className="modalWrapper">
            <div className="modalHeader">
                <div className="title">{formTitle}</div>
            </div>
            <div className="modalBody">
                <TextField
                    label="Phase Name:"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                />
            </div>
            <div className="modalFooter">
                <PrimaryButton text="Submit" onClick={() => onSubmit?.(formData)} />
                <DefaultButton text="Cancel" onClick={() => onCancel?.()}/>
            </div>
        </div>
    )
})

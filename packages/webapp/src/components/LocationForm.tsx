/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import {
	PrimaryButton,
    DefaultButton,
    TextField,
    Dropdown
} from '@fluentui/react'
import { useRef } from 'react'

import './LocationForm.scss'

export interface LocationFormProp {
    onSubmit?: (newLocation: any) => void
    onCancel?: () => void
}

export default observer(function LocationForm(props: LocationFormProp) {
    const { onSubmit, onCancel } = props
    const formData = useRef<any>({})

	return (
        <div className="modalWrapper">
            <div className="modalHeader">
                <div className="title">Add new location</div>
            </div>
            <div className="modalBody">
                <div className="detailsGroup">
                    <TextField
                        label="Details"
                        value={formData.current.details}
                        onChange={(_ev, value) => formData.current.details = value as string}
                    />
                    <Dropdown
                        placeholder="Region type"
                        options={[]}
                    />
                </div>
                <TextField
                    label="General information link for the region:"
                    value={formData.current.regionInfoLink}
                    onChange={(_ev, value) => formData.current.regionInfoLink = value as string}
                />
                <TextField
                    label="Link to an existing eligibility workflow tool:"
                    value={formData.current.workflowToolLink}
                    onChange={(_ev, value) => formData.current.workflowToolLink = value as string}
                />
                <TextField
                    label="Appointment registration scheduler:"
                    value={formData.current.appointmentSchedulerLink}
                    onChange={(_ev, value) => formData.current.appointmentSchedulerLink = value as string}
                />
                <TextField
                    label="List of scheduling providers and locations:"
                    value={formData.current.providersAndLocationsLink}
                    onChange={(_ev, value) => formData.current.providersAndLocationsLink = value as string}
                />
                <TextField
                    label="Eligibility criteria about the current phase:"
                    value={formData.current.currentPhaseCriteriaLink}
                    onChange={(_ev, value) => formData.current.currentPhaseCriteriaLink = value as string}
                />
                <TextField
                    label="Documentation describing the rollout phases in detail:"
                    value={formData.current.rolloutPhasesDocLink}
                    onChange={(_ev, value) => formData.current.rolloutPhasesDocLink = value as string}
                />
                <TextField
                    label="A scheduling hotline:"
                    value={formData.current.schedulingHotline}
                    onChange={(_ev, value) => formData.current.schedulingHotline = value as string}
                />
            </div>
            <div className="modalFooter">
                <PrimaryButton text="Submit" onClick={() => onSubmit?.(formData.current)} />
                <DefaultButton text="Cancel" onClick={() => onCancel?.()}/>
            </div>
        </div>
    )
})

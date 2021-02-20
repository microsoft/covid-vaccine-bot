/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import {
	PrimaryButton, DefaultButton, TextField, Dropdown
} from '@fluentui/react'

import './AddLocationForm.scss'

export default observer(function AddLocationForm() {
	return (
        <div className="modalWrapper">
            <div className="modalHeader">
                <div className="title">Add new location</div>
            </div>
            <div className="modalBody">
                <div className="detailsGroup">
                    <TextField label="Details" />
                    <Dropdown placeholder="Region type" options={[]}/>
                </div>
                <TextField label="General information link for the region:" />
                <TextField label="Link to an existing eligibility workflow tool:" />
                <TextField label="Appointment registration scheduler:" />
                <TextField label="List of scheduling providers and locations:" />
                <TextField label="Eligibility criteria about the current phase:" />
                <TextField label="Documentation describing the rollout phases in detail" />
                <TextField label="A scheduling hotline" />
            </div>
            <div className="modalFooter">
                <PrimaryButton text="Submit" />
                <DefaultButton text="Cancel" />
            </div>
        </div>
    )
})

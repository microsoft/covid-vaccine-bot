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
import { getCustomStrings } from '../selectors/locationSelectors'

import './LocationForm.scss'

export interface LocationFormProp {
    item?: any
    onSubmit?: (locationData: any) => void
    onCancel?: () => void
}

export default observer(function LocationForm(props: LocationFormProp) {
    const { onSubmit, onCancel, item } = props
    const formData = useRef<any>({})

    const regionTypeOptions = [
        {
            key: 'state',
            text: 'State'
        },{
            key: 'territory',
            text: 'Territory'
        },{
            key: 'tribal_land',
            text: 'Tribal land'
        },{
            key: 'county',
            text: 'County'
        },{
            key: 'city',
            text: 'City'
        }
    ]

    if (item) {
        const { info, vaccination } = item.value
        const { info: vacInfo, scheduling_phone, eligibility_plan } = vaccination.content.links

        console.log(item.value)
        formData.current = {
            details: info.content.name,
            selectedRegionKey: info.content.type,
            info: vacInfo?.url || '',
            schedulingPhone: scheduling_phone?.text ? getCustomStrings(item, scheduling_phone.text) : '',
            eligibilityPlan: eligibility_plan?.url || ''
        }
    }

    const formTitle = item ? `Edit location` : 'Add new location'

	return (
        <div className="modalWrapper">
            <div className="modalHeader">
                <div className="title">{formTitle}</div>
            </div>
            <div className="modalBody">
                <div className="detailsGroup">
                    <TextField
                        label="Details"
                        value={formData.current.details}
                        onChange={(_ev, value) => formData.current.details = value as string}
                    />
                    <Dropdown
                        selectedKey={formData.current.selectedRegionKey}
                        placeholder="Region type"
                        options={regionTypeOptions}
                    />
                </div>
                <TextField
                    label="General information link for the region:"
                    value={formData.current.info}
                    onChange={(_ev, value) => formData.current.info = value as string}
                />
                <TextField
                    label="Link to an existing eligibility workflow tool:"
                    value={formData.current.workflow}
                    onChange={(_ev, value) => formData.current.workflow = value as string}
                />
                <TextField
                    label="Appointment registration scheduler:"
                    value={formData.current.scheduling}
                    onChange={(_ev, value) => formData.current.scheduling = value as string}
                />
                <TextField
                    label="List of scheduling providers and locations:"
                    value={formData.current.providers}
                    onChange={(_ev, value) => formData.current.providers = value as string}
                />
                <TextField
                    label="Eligibility criteria about the current phase:"
                    value={formData.current.eligibility}
                    onChange={(_ev, value) => formData.current.eligibility = value as string}
                />
                <TextField
                    label="Documentation describing the rollout phases in detail:"
                    value={formData.current.eligibilityPlan}
                    onChange={(_ev, value) => formData.current.eligibilityPlan = value as string}
                />
                <TextField
                    label="A scheduling hotline:"
                    value={formData.current.schedulingPhone}
                    onChange={(_ev, value) => formData.current.schedulingPhone = value as string}
                />
            </div>
            <div className="modalFooter">
                <PrimaryButton text="Submit" onClick={() => onSubmit?.(formData.current)} />
                <DefaultButton text="Cancel" onClick={() => onCancel?.()}/>
            </div>
        </div>
    )
})

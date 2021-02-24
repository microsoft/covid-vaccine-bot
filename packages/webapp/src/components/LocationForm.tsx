/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	PrimaryButton,
    DefaultButton,
    TextField,
    Dropdown,
    IDropdownOption
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'
import { getStateCustomStrings, getRegionCustomStrings } from '../selectors/locationSelectors'

import './LocationForm.scss'

export interface LocationFormProp {
    item?: any
    onSubmit?: (locationData: any) => void
    onCancel?: () => void
    isRegion?: boolean
}

const setInitialData = (item?: any, isRegion?: boolean) => {

    const getStrings = (item: any, keyFilter:string, isRegion?:boolean) => {
        return isRegion ?
            getRegionCustomStrings(item, keyFilter)
            :
            getStateCustomStrings(item, keyFilter)
    }

    if (item) {
        const { info, vaccination } = item?.value || {}
        const { info: vacInfo, scheduling_phone, eligibility_plan } = vaccination?.content?.links || {}

        return {
            details: info.content.name,
            regionType: info.content.type,
            info: vacInfo?.url || '',
            workflow: '',
            scheduling: '',
            providers: '',
            eligibility: '',
            eligibilityPlan: eligibility_plan?.url || '',
            schedulingPhone: scheduling_phone?.text ? getStrings(item, scheduling_phone.text, isRegion) : ''
        }
    } else {
        return {
            details: '',
            regionType: '',
            info: '',
            workflow: '',
            scheduling: '',
            providers: '',
            eligibility: '',
            eligibilityPlan: '',
            schedulingPhone: ''
        }
    }
}

export default observer(function LocationForm(props: LocationFormProp) {
    const { onSubmit, onCancel, item, isRegion } = props
    const [formData, setFormData] = useState<any>(setInitialData(item, isRegion))
    const fieldChanges = useRef<any>(formData)
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

    const formTitle = item ? `Edit location` : 'Add new location'

    const handleRegionChange = useCallback((_ev:any, item?: IDropdownOption) => {
        fieldChanges.current = {
            ...fieldChanges.current,
            ...{
                regionType: item?.key
            }
        }

        setFormData({...formData, ...fieldChanges.current})
    },[formData, fieldChanges])

    const handleTextChange = useCallback(ev => {
        const value = ev.target.value
        fieldChanges.current = {
            ...fieldChanges.current,
            ...{
                [ev.target.name]: value
            }
        }

        setFormData({...formData, ...fieldChanges.current})
    },[formData, fieldChanges])

	return (
        <div className="modalWrapper">
            <div className="modalHeader">
                <div className="title">{formTitle}</div>
            </div>
            <div className="modalBody">
                <div className="detailsGroup">
                    <TextField
                        label="Details"
                        name="details"
                        value={formData.details}
                        onChange={handleTextChange}
                    />
                    <Dropdown
                        selectedKey={formData.regionType}
                        placeholder="Region type"
                        options={regionTypeOptions}
                        onChange={handleRegionChange}
                    />
                </div>
                <TextField
                    label="General information link for the region:"
                    name="info"
                    value={formData.info}
                    onChange={handleTextChange}
                />
                <TextField
                    label="Link to an existing eligibility workflow tool:"
                    name="workflow"
                    value={formData.workflow}
                    onChange={handleTextChange}
                />
                <TextField
                    label="Appointment registration scheduler:"
                    name="scheduling"
                    value={formData.scheduling}
                    onChange={handleTextChange}
                />
                <TextField
                    label="List of scheduling providers and locations:"
                    name="providers"
                    value={formData.providers}
                    onChange={handleTextChange}
                />
                <TextField
                    label="Eligibility criteria about the current phase:"
                    name="eligibility"
                    value={formData.eligibility}
                    onChange={handleTextChange}
                />
                <TextField
                    label="Documentation describing the rollout phases in detail:"
                    name="eligibilityPlan"
                    value={formData.eligibilityPlan}
                    onChange={handleTextChange}
                />
                <TextField
                    label="A scheduling hotline:"
                    name="schedulingPhone"
                    value={formData.schedulingPhone}
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

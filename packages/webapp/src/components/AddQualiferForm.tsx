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
import { getGlobalQualifierValidationTexts } from '../selectors/qualifierSelectors'

import './AddQualifierForm.scss'

export interface AddQualifierFormProp {
    item?: any
    tagsOptions: IDropdownOption[]
    onSubmit?: (newQualifier: any) => void
    onCancel?: () => void
}

const setInitialData = (item: any) => {
    if (item) {
        return {
            tagKey: item.key.split('/')[1].split('.')[0],
            key: item.key,
            qualifier: item.text,
            isNew: false
        }
    } else {
        return {
            tagKey: '',
            key: '',
            qualifier: '',
            isNew: true
        }
    }
}

export default observer(function AddQualifierForm(props: AddQualifierFormProp) {
    const { onSubmit, onCancel, item, tagsOptions } = props
    const [formData, setFormData] = useState<any>(setInitialData(item))
    const fieldChanges = useRef<any>(formData)
    const globalQualifiersList = useRef<string[]>(getGlobalQualifierValidationTexts())
    const [hasError, setHasError] = useState<boolean>(false)

	const handleTagChange = useCallback(
		(_ev: any, item?: IDropdownOption) => {
            fieldChanges.current = {
                ...fieldChanges.current,
                ...{
                    tagKey: item?.key,
                },
            }

            setFormData({ ...formData, ...fieldChanges.current })
		},
		[formData, fieldChanges]
	)

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

    const isDuplicate = useCallback((newQualifier: string) => {
        const newQualifierText = newQualifier.toLowerCase().replaceAll(' ','')
        if (globalQualifiersList.current.includes(newQualifierText)) {
            setHasError(true)
            return 'Qualifier already exist, please revise.'
        } else {
            setHasError(false)
            return ''
        }

    }, [globalQualifiersList, hasError])


    const disableSubmit = useCallback((): boolean => {
        if (hasError) return true
        return formData.qualifier === ''
    },[formData, hasError])

	const formTitle = item ? 'Edit Qualifier' : 'New Qualifier'

    return (
        <div className="modalWrapper">
            <div className="modalHeader">
                <div className="title">{formTitle}</div>
            </div>
            <div className="modalBody">
                <div className="tagRow">
                    <Dropdown
                        selectedKey={formData.tagKey}
                        placeholder="Tag"
                        options={tagsOptions}
                        onChange={handleTagChange}
                        disabled={!formData.isNew}
                    />
                    <div></div>
                </div>
                <TextField
                    label=""
                    name="qualifier"
                    placeholder="Qualifier text..."
                    value={formData.qualifier}
                    onChange={handleTextChange}
                    multiline={true}
                    autoAdjustHeight={false}
                    resizable={false}
                    disabled={!formData.tagKey}
                    validateOnLoad={false}
                    onGetErrorMessage={() => isDuplicate(formData.qualifier)}
                />
            </div>
            <div className="modalFooter">
                <PrimaryButton text="Submit" disabled={disableSubmit()} onClick={() => onSubmit?.(formData)} />
                <DefaultButton text="Cancel" onClick={() => onCancel?.()}/>
            </div>
        </div>
    )
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	PrimaryButton,
	DefaultButton,
	TextField,
	Dropdown,
	IDropdownOption,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'
import { getText as t } from '../selectors/intlSelectors'
import { getGlobalQualifierValidationTexts } from '../selectors/qualifierSelectors'

import './AddQualifierForm.scss'

export interface AddQualifierFormProp {
	rootLocationKey: string
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
			isNew: false,
		}
	} else {
		return {
			tagKey: '',
			key: '',
			qualifier: '',
			isNew: true,
		}
	}
}

export default observer(function AddQualifierForm(props: AddQualifierFormProp) {
	const { onSubmit, onCancel, item, tagsOptions, rootLocationKey } = props
	const [formData, setFormData] = useState<any>(setInitialData(item))
	const fieldChanges = useRef<any>(formData)
	const globalQualifiersList = useRef<string[]>(
		getGlobalQualifierValidationTexts(rootLocationKey)
	)
	const [hasError, setHasError] = useState<boolean>(false)
	const [isAddingTag, setIsAddingTag] = useState<boolean>(false)

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

	const isDuplicate = useCallback(
		(newQualifier: string) => {
			const newQualifierText = newQualifier.toLowerCase().replaceAll(' ', '')
			if (globalQualifiersList.current.includes(newQualifierText)) {
				setHasError(true)
				return t('AddQualifierForm.hasDuplicate.qualifier')
			} else {
				setHasError(false)
				return ''
			}
		},
		[globalQualifiersList, setHasError]
	)

	const isTagDuplicate = useCallback(
		(newTag: string) => {
			const newTagKey = newTag.toLowerCase().replaceAll(' ', '_')
			const tagKeys = tagsOptions.map((t) => t.key)
			if (tagKeys.includes(newTagKey)) {
				setHasError(true)
				return t('AddQualifierForm.hasDuplicate.tag')
			} else {
				setHasError(false)
				return ''
			}
		},
		[setHasError, tagsOptions]
	)

	const disableSubmit = useCallback((): boolean => {
		if (hasError) return true
		return formData.qualifier === ''
	}, [formData, hasError])

	const createNewTag = useCallback(() => {
		const newTagKey = formData.tagKey.replaceAll(' ', '_')
		tagsOptions.push({ key: newTagKey, text: formData.tagKey })
		tagsOptions.sort((a, b) => (a.text > b.text ? 1 : -1))

		fieldChanges.current = {
			...fieldChanges.current,
			...{
				tagKey: newTagKey,
			},
		}

		setIsAddingTag(false)
		setFormData({ ...formData, ...fieldChanges.current })
	}, [formData, tagsOptions, fieldChanges, setIsAddingTag])

	const formTitle = item
		? t('AddQualifierForm.title.edit')
		: t('AddQualifierForm.title.new')

	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">{formTitle}</div>
			</div>
			<div className="modalBody">
				<div className="tagRow">
					{!isAddingTag ? (
						<>
							<Dropdown
								selectedKey={formData.tagKey}
								placeholder={t('AddQualifierForm.Tag.Dropdown.placeholder')}
								options={tagsOptions}
								onChange={handleTagChange}
								disabled={!formData.isNew}
							/>
							{formData.isNew && (
								<PrimaryButton
									text={t('AddQualifierForm.Tag.newTag')}
									onClick={() => setIsAddingTag(true)}
								/>
							)}
						</>
					) : (
						<>
							<TextField
								name="tagKey"
								placeholder={t('AddQualifierForm.Tag.Input.placeholder')}
								onChange={handleTextChange}
								validateOnLoad={false}
								onGetErrorMessage={() => isTagDuplicate(formData.tagKey)}
							/>
							<PrimaryButton
								text={t('AddQualifierForm.Tag.Buttons.ok')}
								onClick={() => createNewTag()}
							/>
							<DefaultButton
								text={t('AddQualifierForm.Tag.Buttons.cancel')}
								onClick={() => setIsAddingTag(false)}
							/>
						</>
					)}
					<div></div>
				</div>
				<TextField
					label=""
					name="qualifier"
					placeholder={t('AddQualifierForm.Qualifier.placeholder')}
					value={formData.qualifier}
					onChange={handleTextChange}
					multiline={true}
					autoAdjustHeight={false}
					resizable={false}
					disabled={!formData.tagKey || isAddingTag}
					validateOnLoad={false}
					onGetErrorMessage={() => isDuplicate(formData.qualifier)}
				/>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text={t('App.submit')}
					disabled={disableSubmit()}
					onClick={() => onSubmit?.(formData)}
				/>
				<DefaultButton
					text={t('App.cancel')}
					onClick={() => onCancel?.()}
				/>
			</div>
		</div>
	)
})

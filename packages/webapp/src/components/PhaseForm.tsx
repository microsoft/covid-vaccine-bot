/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton, DefaultButton, TextField } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'
import { getText as t } from '../selectors/intlSelectors'
import { formatId } from '../utils/textUtils'

import './LocationForm.scss'

export interface PhaseFormProp {
	item?: any
	currentLocation?: any
	duplicate?: boolean
	onSubmit?: (phaseData: any) => void
	onCancel?: () => void
}

const setInitialData = (item: any) => {
	if (item) {
		return {
			phaseId: item.keyId,
			name: item.name.includes(` (${t('App.active')})`)
				? item.name.replace(` (${t('App.active')})`, '')
				: item.name,
			isActive: item.keyId.includes(` (${t('App.active')})`),
		}
	} else {
		return {
			phaseId: null,
			name: '',
			isActive: false,
		}
	}
}

export default observer(function PhaseForm(props: PhaseFormProp) {
	const {
		onSubmit,
		onCancel,
		item,
		duplicate = false,
		currentLocation,
	} = props
	const [formData, setFormData] = useState<any>(setInitialData(item))
	const [hasError, setHasError] = useState<boolean>(false)
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

	const isDuplicate = useCallback(() => {
		if (!duplicate) return ''

		const location = currentLocation
		const nextPhaseId = formatId(formData.name)
		const nameExists = location.vaccination.content.phases.find((item: { id: string }) => item.id === nextPhaseId)

		if (nameExists) {
			setHasError(true)
			return t('PhaseForm.hasDuplicateName')
		} else {
			setHasError(false)
			return ''
		}
	}, [
		setHasError,
		duplicate,
		formData?.name,
		currentLocation
	])

	const disableSubmit = useCallback((): boolean => {
		return hasError || formData.name === ''
	}, [formData, hasError])

	const formTitle = duplicate
		? t('PhaseForm.title.duplicate')
		: item
		? t('PhaseForm.title.edit')
		: t('PhaseForm.title.new')

	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">{formTitle}</div>
			</div>
			<div className="modalBody">
				<TextField
					label={t('PhaseForm.label')}
					name="name"
					value={formData.name}
					onChange={handleTextChange}
					onGetErrorMessage={isDuplicate}
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

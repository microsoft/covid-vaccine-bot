/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton, DefaultButton, TextField } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { formatId } from '../utils/textUtils'

import './LocationForm.scss'

export interface PhaseFormProp {
	item?: any
	selectedState?: any
	onSubmit?: (phaseData: any) => void
	onCancel?: () => void
	duplicate?: boolean
	isRegion?: boolean
	regionInfo?: any
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
		selectedState,
		isRegion,
		regionInfo,
	} = props
	const [formData, setFormData] = useState<any>(setInitialData(item))
	const [hasError, setHasError] = useState<boolean>(false)
	const { repoFileData } = getAppStore()
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

		const location = repoFileData[selectedState.key]
		const nextPhaseId = formatId(formData.name)
		const nameExists =
			(isRegion &&
				regionInfo?.key &&
				location.regions[regionInfo.key].vaccination?.content.phases &&
				!!location.regions[regionInfo.key].vaccination.content.phases.find(
					(item: { id: string }) => item.id === nextPhaseId
				)) ||
			!!location.vaccination.content.phases.find(
				(item: { id: string }) => item.id === nextPhaseId
			)

		if (nameExists) {
			setHasError(true)
			return t('PhaseForm.hasDuplicateName')
		} else {
			setHasError(false)
			return ''
		}
	}, [
		repoFileData,
		setHasError,
		duplicate,
		formData?.name,
		selectedState?.key,
		isRegion,
		regionInfo?.key,
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
					text={t('PhaseForm.submit')}
					disabled={disableSubmit()}
					onClick={() => onSubmit?.(formData)}
				/>
				<DefaultButton
					text={t('PhaseForm.cancel')}
					onClick={() => onCancel?.()}
				/>
			</div>
		</div>
	)
})

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
	Checkbox,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, useState } from 'react'
import { getText as t } from '../selectors/intlSelectors'
import {
	getStateCustomStrings,
	getRegionCustomStrings,
} from '../selectors/locationSelectors'
import './LocationForm.scss'

export interface LocationFormProp {
	item?: any
	onSubmit?: (locationData: any, prevItem: any) => void
	onCancel?: () => void
	isRegion?: boolean
}

const setInitialData = (item?: any, isRegion?: boolean) => {
	const getStrings = (item: any, keyFilter: string, isRegion?: boolean) => {
		return isRegion
			? getRegionCustomStrings(item, keyFilter)
			: getStateCustomStrings(item, keyFilter)
	}

	if (item) {
		const { info, vaccination } = item?.value || {}
		const {
			info: vacInfo,
			scheduling_phone,
			eligibility_plan,
			workflow,
			scheduling,
			providers,
			eligibility,
		} = vaccination?.content?.links || {}

		return {
			details: info.content.name,
			regionType: info.content.type,
			info: vacInfo?.url || '',
			workflow: workflow?.url || '',
			scheduling: scheduling?.url || '',
			providers: providers?.url || '',
			eligibility: eligibility?.url || '',
			eligibilityPlan: eligibility_plan?.url || '',
			schedulingPhone: scheduling_phone?.text
				? getStrings(item, scheduling_phone.text, isRegion)
				: '',
			schedulingPhoneDesc: scheduling_phone?.description
				? getStrings(item, scheduling_phone.description, isRegion)
				: '',
			noPhaseLabel: vaccination.content?.noPhaseLabel || false,
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
			schedulingPhone: '',
			schedulingPhoneDesc: '',
			noPhaseLabel: false,
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
			text: t('LocationForm.regionTypeOptions.state'),
		},
		{
			key: 'territory',
			text: t('LocationForm.regionTypeOptions.territory'),
		},
		{
			key: 'tribal_land',
			text: t('LocationForm.regionTypeOptions.tribal_land'),
		},
		{
			key: 'county',
			text: t('LocationForm.regionTypeOptions.county'),
		},
		{
			key: 'city',
			text: t('LocationForm.regionTypeOptions.city'),
		},
	].filter((region) => (isRegion ? region.key !== 'state' : true))

	const baseTitle = isRegion
		? t('LocationForm.baseTitle.sublocation')
		: t('LocationForm.baseTitle.location')
	const formTitle = item
		? `${t('LocationForm.formTitle.edit')} ${baseTitle}`
		: `${t('LocationForm.formTitle.new')} ${baseTitle}`

	const handleRegionChange = useCallback(
		(_ev: any, item?: IDropdownOption) => {
			fieldChanges.current = {
				...fieldChanges.current,
				...{
					regionType: item?.key,
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

	const onNoLabelChange = useCallback(
		(_ev: any, checked?: boolean) => {
			fieldChanges.current = {
				...fieldChanges.current,
				...{
					noPhaseLabel: checked,
				},
			}

			setFormData({ ...formData, ...fieldChanges.current })
		},
		[formData, fieldChanges]
	)

	const canSubmit = useCallback(() => {
		return formData.details !== '' && formData.regionType !== ''
	}, [formData])

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
						placeholder={t('LocationForm.regionTypeOptions.placeholder')}
						options={regionTypeOptions}
						onChange={handleRegionChange}
					/>
				</div>
				<TextField
					label={t('LocationForm.info')}
					name="info"
					value={formData.info}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.workflow')}
					name="workflow"
					value={formData.workflow}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.scheduling')}
					name="scheduling"
					value={formData.scheduling}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.providers')}
					name="providers"
					value={formData.providers}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.eligibility')}
					name="eligibility"
					value={formData.eligibility}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.eligibilityPlan')}
					name="eligibilityPlan"
					value={formData.eligibilityPlan}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.schedulingPhone')}
					name="schedulingPhone"
					value={formData.schedulingPhone}
					onChange={handleTextChange}
				/>
				<TextField
					label={t('LocationForm.schedulingPhoneDesc')}
					name="schedulingPhoneDesc"
					value={formData.schedulingPhoneDesc}
					onChange={handleTextChange}
				/>
				<Checkbox
					label={t('LocationForm.noPhaseLabel')}
					checked={formData.noPhaseLabel}
					onChange={onNoLabelChange}
				/>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text={t('App.submit')}
					disabled={!canSubmit()}
					onClick={() => onSubmit?.(formData, item)}
				/>
				<DefaultButton text={t('App.cancel')} onClick={() => onCancel?.()} />
			</div>
		</div>
	)
})

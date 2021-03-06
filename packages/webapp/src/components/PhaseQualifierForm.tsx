/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	IconButton,
	Dropdown,
	DirectionalHint,
	TextField,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useRef, useEffect } from 'react'
import { getText as t } from '../selectors/intlSelectors'
import {
	getPhaseTagItems,
	getPhaseQualifierItems,
	getPhaseMoreInfoTextByKey,
	getPhaseQualifierItemsByKey,
	getPhaseMoreInfoUrl
} from '../selectors/phaseSelectors'
import { getAppStore } from '../store/store'

import './PhaseQualifierForm.scss'

export interface PhaseQualifierFormProps {
	currentLocation: any
	groupKey: any
	rowItem: any
	onRowItemRemove?: (item: any, groupKey: any) => void
	onRowItemTextChange?: (item: any, prevItem: any) => void
	onRowItemQualifierChange?: (item: any, prevItem: any) => void
}

export default observer(function PhaseQualifierForm(
	props: PhaseQualifierFormProps
) {
	const {
		currentLocation,
		groupKey,
		rowItem,
		onRowItemQualifierChange,
		onRowItemRemove,
		onRowItemTextChange,
	} = props
	const { isEditable, currentLanguage } = getAppStore()
	const phaseTagItems = useRef(getPhaseTagItems(currentLocation))
	const phaseQualifierItems = useRef(getPhaseQualifierItems(currentLocation))
	const [filteredQualifierItems, setFilteredQualifierItems] = useState<any[]>(
		getPhaseQualifierItemsByKey(currentLocation, rowItem.tagKey)
	)
	const [moreInfoText, setMoreInfoText] = useState<string>('')
	const [moreInfoTextSms, setMoreInfoTextSms] = useState<string>('')
	const [moreInfoTextVoice, setMoreInfoTextVoice] = useState<string>('')
	const [moreInfoUrl, setMoreInfoUrl] = useState<string>(
		getPhaseMoreInfoUrl(rowItem)
	)
	const changedItem = useRef<any>(rowItem)
	changedItem.current.moreInfoContent = moreInfoText

	let moreInfoKey = rowItem.moreInfoKey
	let moreInfoTextSmsKey = rowItem.moreInfoTextSms
	let moreInfoTextVoiceKey = rowItem.moreInfoTextVoice

	const locationPhases = rowItem.location.vaccination.content.phases
	const currentPhase = locationPhases?.find(
		(phase: { id: any }) => phase.id === rowItem.groupId
	)

	if (currentPhase) {
		const currQualification = currentPhase?.qualifications.find(
			(qualification: { question: any }) =>
				qualification.question === rowItem.qualifierId
		)
		if (currQualification) {
			moreInfoKey = currQualification.moreInfoText
			moreInfoTextSmsKey = currQualification.moreInfoTextSms
			moreInfoTextVoiceKey = currQualification.moreInfoTextVoice
		}
	}

	useEffect(() => {
		if (currentLocation) {
			phaseQualifierItems.current = getPhaseQualifierItems(currentLocation)
			setFilteredQualifierItems(
				getPhaseQualifierItemsByKey(currentLocation, rowItem.tagKey)
			)
		}
	}, [phaseQualifierItems, currentLocation, rowItem])

	useEffect(() => {
		if (currentLanguage) {
			setMoreInfoText(getPhaseMoreInfoTextByKey(currentLocation, moreInfoKey))
			setMoreInfoTextSms(getPhaseMoreInfoTextByKey(currentLocation, moreInfoTextSmsKey))
			setMoreInfoTextVoice(getPhaseMoreInfoTextByKey(currentLocation, moreInfoTextVoiceKey))
		}
	}, [currentLanguage, currentLocation, moreInfoKey, moreInfoTextVoiceKey, moreInfoTextSmsKey])

	const onTagChange = useCallback(
		(_event, option) => {
			setFilteredQualifierItems(
				phaseQualifierItems.current.filter(
					(q: any) => q.key.split('/')[1].split('.')[0] === option.key
				)
			)
			setMoreInfoText('')
			setMoreInfoUrl('')
			changedItem.current = {
				...changedItem.current,
				...{
					key: `${rowItem.groupId}-c19.eligibility.question/${option.key}`,
					tagKey: option.key,
					qualifierId: undefined,
					text: '',
					moreInfoKey: '',
					moreInfoContent: '',
					moreInfoTextSms: '',
					moreInfoTextVoice: ''
				},
			}
		},
		[phaseQualifierItems, rowItem]
	)

	const onQualifierChange = useCallback(
		(_event, option) => {
			setMoreInfoText('')
			setMoreInfoUrl('')
			setMoreInfoTextSms('')
			setMoreInfoTextVoice('')

			changedItem.current = {
				...changedItem.current,
				...{
					qualifierId: option.key,
					text: option.text,
					moreInfoKey: '',
					moreInfoContent: '',
					moreInfoTextSms: '',
					moreInfoTextVoice: ''
				},
			}
			onRowItemQualifierChange?.(changedItem.current, rowItem)
		},
		[onRowItemQualifierChange, rowItem]
	)

	const onMoreInfoTextChange = useCallback(
		(_event, value) => {
			changedItem.current = {
				...changedItem.current,
				...{
					moreInfoContent: value,
				},
			}
			setMoreInfoText(value)
		},
		[setMoreInfoText]
	)

	const onMoreInfoTextSmsChange = useCallback(
		(_event, value) => {
			changedItem.current = {
				...changedItem.current,
				...{
					moreInfoTextSms: value,
				},
			}
			setMoreInfoTextSms(value)
		},
		[setMoreInfoTextSms]
	)

	const onMoreInfoTextVoiceChange = useCallback(
		(_event, value) => {
			changedItem.current = {
				...changedItem.current,
				...{
					moreInfoTextVoice: value,
				},
			}
			setMoreInfoTextVoice(value)
		},
		[setMoreInfoTextVoice]
	)

	const onMoreInfoUrlChange = useCallback(
		(_event, value) => {
			changedItem.current = {
				...changedItem.current,
				...{
					moreInfoUrl: value,
				},
			}
			setMoreInfoUrl(value)
		},
		[setMoreInfoUrl]
	)

	return (
		<div
			className="phaseDetailRow"
			style={{ pointerEvents: isEditable ? 'unset' : 'none' }}
		>
			<div className="mainRow">
				<Dropdown
					options={phaseTagItems.current}
					defaultSelectedKey={rowItem.tagKey}
					placeholder={t('PhaseQualifierForm.Tag.placeholder')}
					className="tagDropdown"
					styles={{ root: { minWidth: 250 } }}
					onChange={onTagChange}
				/>
				<Dropdown
					title={rowItem.text}
					options={filteredQualifierItems}
					defaultSelectedKey={rowItem.qualifierId}
					placeholder={t('PhaseQualifierForm.Qualifier.placeholder')}
					styles={{ root: { width: '100%', minWidth: 0 } }}
					onChange={onQualifierChange}
				/>
				<IconButton
					iconProps={{ iconName: 'MoreVertical' }}
					styles={{ menuIcon: { visibility: 'hidden', width: 0, margin: 0 } }}
					menuProps={{
						isBeakVisible: false,
						directionalHint: DirectionalHint.rightTopEdge,
						items: [
							{
								key: 'removeRow',
								text: t('PhaseQualifierForm.FormButtons.remove'),
								onClick: () => onRowItemRemove?.(rowItem, groupKey),
							},
						],
					}}
					title={t('PhaseQualifierForm.FormButtons.more')}
					aria-label={t('PhaseQualifierForm.FormButtons.more')}
				/>
			</div>
			<div className="detailsRow">
				<TextField
					placeholder={t('PhaseQualifierForm.MoreInfoText.placeholder')}
					multiline={true}
					autoAdjustHeight={true}
					resizable={true}
					styles={{ root: { width: 'calc(100% - 32px)', padding: '5px 0' } }}
					value={moreInfoText}
					onChange={onMoreInfoTextChange}
					onBlur={() => onRowItemTextChange?.(changedItem.current, rowItem)}
				/>
				<TextField
					placeholder={t('PhaseQualifierForm.MoreInfoTextSms.placeholder')}
					multiline={true}
					autoAdjustHeight={true}
					resizable={true}
					styles={{ root: { width: 'calc(100% - 32px)', padding: '5px 0' } }}
					value={moreInfoTextSms}
					onChange={onMoreInfoTextSmsChange}
					onBlur={() => onRowItemTextChange?.(changedItem.current, rowItem)}
				/>
				<TextField
					placeholder={t('PhaseQualifierForm.MoreInfoTextVoice.placeholder')}
					multiline={true}
					autoAdjustHeight={true}
					resizable={true}
					styles={{ root: { width: 'calc(100% - 32px)', padding: '5px 0' } }}
					value={moreInfoTextVoice}
					onChange={onMoreInfoTextVoiceChange}
					onBlur={() => onRowItemTextChange?.(changedItem.current, rowItem)}
				/>
				<TextField
					placeholder={t('PhaseQualifierForm.MoreInfoUrl.placeholder')}
					styles={{ root: { width: 'calc(100% - 32px)', padding: '5px 0' } }}
					value={moreInfoUrl}
					onChange={onMoreInfoUrlChange}
					onBlur={() => onRowItemTextChange?.(changedItem.current, rowItem)}
				/>
			</div>
		</div>
	)
})

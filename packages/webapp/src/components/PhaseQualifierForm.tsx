/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	IconButton,
	Dropdown,
	DirectionalHint,
	TextField,
	IDetailsRowProps,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useRef } from 'react'
import {
	getPhaseTagItems,
	getPhaseQualifierItems,
	getPhaseMoreInfoItems,
	getPhaseMoreInfoTextByKey,
	getPhaseQualifierItemsByKey,
} from '../selectors/phaseSelectors'

import './PhaseQualifierForm.scss'
export interface PhaseQualifierFormProps {
	selectedState: any
	rowItems: IDetailsRowProps
	isEditable: boolean
	isRegion: boolean
	onRowItemRemove?: (item: any) => void
	onRowItemTextChange: (item: any, prevItem: any) => void
	onRowItemQualifierChange: (item: any, prevItem: any) => void
}

export default observer(function PhaseQualiferForm(
	props: PhaseQualifierFormProps
) {
	const {
		selectedState,
		rowItems,
		isEditable,
		isRegion,
		onRowItemRemove,
		onRowItemTextChange,
		onRowItemQualifierChange
	} = props
	const phaseTagItems = useRef(getPhaseTagItems(selectedState))
	const phaseQualifierItems = useRef(getPhaseQualifierItems(selectedState))
	const phaseMoreInfoItems = useRef(getPhaseMoreInfoItems(selectedState))
	const [filteredQualifierItems, setFilteredQualifierItems] = useState<any[]>(
		getPhaseQualifierItemsByKey(selectedState, rowItems.item.tagKey)
	)

	let moreInfoKey = rowItems.item.moreInfoKey
	if(isRegion) {
		const regionPhases = rowItems.item.location.value.vaccination.content.phases
		const currPhase = regionPhases?.find((phase: { id: any }) => phase.id === rowItems.item.groupId)
		if (currPhase){
			const currQualification = currPhase?.qualifications.find((qualification: { question: any }) => qualification.question === rowItems.item.qualifierId)
			if (currQualification) {
				moreInfoKey = currQualification.moreInfoText
			}
		}
	}

	const [moreInfoText, setMoreInfoText] = useState<string>(
		getPhaseMoreInfoTextByKey(selectedState, moreInfoKey)
	)

	const [moreInfoUrl, setMoreInfoUrl] = useState<string>(
		rowItems.item.moreInfoUrl
	)
	const changedItem = useRef<any>(rowItems.item)
	changedItem.current.moreInfoContent = moreInfoText

	const onTagChange = useCallback(
		(_event, option) => {
			setFilteredQualifierItems(
				phaseQualifierItems.current.filter(
					(q) => q.key.split('/')[1].split('.')[0] === option.key
				)
			)
			setMoreInfoText('')
			setMoreInfoUrl('')
			changedItem.current = {
				...changedItem.current,
				...{
					key: `${rowItems.item.groupId}-c19.eligibility.question/${option.key}`,
					tagKey: option.key,
					qualifierId: undefined,
					text: '',
					moreInfoKey: '',
					moreInfoContent: '',
				},
			}
		},
		[phaseQualifierItems, rowItems]
	)

	const onQualifierChange = useCallback(
		(_event, option) => {

			setMoreInfoText('')
			setMoreInfoUrl('')

			changedItem.current = {
				...changedItem.current,
				...{
					qualifierId: option.key,
					text: option.text,
					moreInfoKey:'',
					moreInfoContent: '',
				},
			}
			onRowItemQualifierChange(changedItem.current, rowItems.item)
		},
		[phaseMoreInfoItems, onRowItemQualifierChange, rowItems]
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
		[rowItems]
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
		[rowItems]
	)

	return (
		<div
			className="phaseDetailRow"
			style={{ pointerEvents: isEditable ? 'unset' : 'none' }}
		>
			<div className="mainRow">
				<Dropdown
					options={phaseTagItems.current}
					defaultSelectedKey={rowItems.item.tagKey}
					placeholder="Tag"
					className="tagDropdown"
					styles={{ root: { minWidth: 250 } }}
					onChange={onTagChange}
				/>
				<Dropdown
					options={filteredQualifierItems}
					defaultSelectedKey={rowItems.item.qualifierId}
					placeholder="Qualifier"
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
								text: 'Remove',
								onClick: () => onRowItemRemove?.(rowItems.item),
							},
							{
								key: 'details',
								text: 'Details',
							},
						],
					}}
					title="More"
					aria-label="More"
				/>
			</div>
			<div className="detailsRow">
				<TextField
					placeholder="More info text"
					multiline={true}
					autoAdjustHeight={true}
					resizable={false}
					styles={{ root: { width: 'calc(100% - 32px)', padding: '5px 0' } }}
					value={moreInfoText}
					onChange={onMoreInfoTextChange}
					onBlur={ () => onRowItemTextChange(changedItem.current, rowItems.item) }
				/>
				<TextField
					placeholder="More info url"
					styles={{ root: { width: 'calc(100% - 32px)', padding: '5px 0' } }}
					value={moreInfoUrl}
					onChange={onMoreInfoUrlChange}
					onBlur={ () => onRowItemTextChange(changedItem.current, rowItems.item) }
				/>
			</div>
		</div>
	)
})

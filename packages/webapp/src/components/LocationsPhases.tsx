/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	IDetailsGroupRenderProps,
	IGroup,
	FontIcon,
	IGroupDividerProps,
	IDetailsListProps
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { getAppStore } from '../store/store'
import PhaseForm from './PhaseForm'

import './Locations.scss'

export interface LocationsPhasesProp {
	isRegion: boolean
	value: any
	selectedState: any
}

const phaseColumns = [
	{
		key: 'question',
		name: 'Question',
		fieldName: 'text',
		minWidth: 200,
		isResizable: false,
		isMultiline: true,
	},
]

export default observer(function LocationsPhases(props: LocationsPhasesProp) {
	const { globalFileData, currentLanguage, repoFileData, isEditable } = getAppStore()
	const { isRegion, value, selectedState } = props

	const [phaseGroup, setPhaseGroup] = useState<IGroup[]>([])
	const [phaseGroupItems, setPhaseGroupItems] = useState<any[]>([])

	useEffect(() => {
		if (repoFileData) {
			const tempPhaseGroup: IGroup[] = []
			const tempPhaseGroupItems: any[] = []
			const currentStateObj: any = repoFileData[selectedState.key]
			const phaseObj = currentStateObj.vaccination.content.phases

			phaseObj.forEach((phase: any) => {
				const isCollapsed: boolean = !isRegion && value.value.id !== phase.id

				let isActivePhase = false
				if (isRegion) {
					isActivePhase = value.phase === phase.id
				} else {
					isActivePhase =
						phase.id === currentStateObj.vaccination.content.activePhase
				}

				tempPhaseGroup.push({
					key: phase.id + tempPhaseGroup.length,
					name: phase.label,
					startIndex: tempPhaseGroupItems.length,
					count: phase.qualifications.length,
					isCollapsed: isCollapsed,
					data: {
						keyId: phase.id,
						isActive: isActivePhase,
					},
				})

				phase.qualifications.forEach((qualification: any) => {
					const keyId: string = String(qualification.question).toLowerCase()
					let label = `*Translation not found* (${keyId})`

					if (
						currentStateObj.strings &&
						currentStateObj.strings.content[keyId]
					) {
						label =
							currentStateObj.strings.content[keyId][currentLanguage] || label
					} else if (globalFileData.customStrings.content[keyId]) {
						label =
							globalFileData.customStrings.content[keyId][currentLanguage] ||
							label
					}

					tempPhaseGroupItems.push({
						key: phase.id + '-' + keyId,
						text: label,
						moreInfoKey: qualification?.moreInfoText ? qualification.moreInfoText.toLowerCase() : '',
						moreInfoUrl: qualification.moreInfoUrl,
						qualifierId: keyId,
						tagKey: keyId.split('/')[1].split('.')[0]
					})
				})
			})

			setPhaseGroup(tempPhaseGroup)
			setPhaseGroupItems(tempPhaseGroupItems)
		}
	}, [repoFileData, globalFileData, selectedState, currentLanguage, isRegion, value])

	const onRenderHeader: IDetailsGroupRenderProps['onRenderHeader'] = (
		props
	) => {
		if (props?.group) {
			const { group } = props
			return (
				<div className="phaseGroupHeader" onClick={onToggleCollapse(props)}>
					<div>
						<FontIcon
							iconName={group.isCollapsed ? 'ChevronRight' : 'ChevronDown'}
							className="groupToggleIcon"
						/>
						{group.name ? (
							<span>
								{group.name} <small>({group.data.keyId})</small>
							</span>
						) : (
							`Phase ${group.data.keyId}`
						)}
					</div>
					<div className='groupHeaderButtons'>
						<div className='addQualifierGroup'>
							<FontIcon iconName='CircleAdditionSolid' style={{color: '#0078d4'}}/>
							Add Qualifier
						</div>
						<div className='removePhaseGroup'>
							<FontIcon iconName='Blocked2Solid' style={{color: '#d13438'}}/>
							Remove
						</div>
						{group.data.isActive ? (
							<div className='activeGroup'>
								<FontIcon iconName='CircleFill' style={{color: '#00b7c3'}}/>
								Active Phase
							</div>
						) : (
							<div className='activeGroup'>
								<FontIcon iconName='CircleRing' style={{color: '#00b7c3'}}/>
								Set as Active
							</div>
						)}
					</div>
				</div>
			)
		}
		return null
	}

	const onToggleCollapse = (props: IGroupDividerProps): (() => void) => {
		return () => {
			props!.onToggleCollapse!(props!.group!)
		}
	}

	const onRenderRow: IDetailsListProps['onRenderRow'] = props => {
		if (props) {
			return <PhaseForm rowItems={props} selectedState={selectedState} isEditable={isEditable} />
		}
		return null;
	}

	return (
		<div className="phaseGridContainer">
			<DetailsList
				indentWidth={0}
				items={phaseGroupItems}
				groups={phaseGroup}
				columns={phaseColumns}
				groupProps={{
					showEmptyGroups: false,
					onRenderHeader: onRenderHeader,
				}}
				onRenderRow={onRenderRow}
				isHeaderVisible={false}
				checkboxVisibility={2}
				constrainMode={1}
				selectionMode={1}
			/>
		</div>
	)
})

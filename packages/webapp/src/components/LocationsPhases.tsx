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
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { getAppStore } from '../store/store'

import './Dashboard.scss'

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
	const { globalFileData, currentLanguage, repoFileData } = getAppStore()
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
					key: phase.id,
					name: phase.label,
					startIndex: tempPhaseGroupItems.length,
					count: phase.qualifications.length,
					isCollapsed: isCollapsed,
					data: {
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
								{group.name} <small>({group.key})</small>
							</span>
						) : (
							`Phase ${group.key}`
						)}
					</div>
					{group.data.isActive && (
						<div className="activeGroup">
							<FontIcon
								iconName="StatusCircleInner"
								style={{ color: '#00b7c3' }}
							/>
							Active Phase
						</div>
					)}
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
				isHeaderVisible={false}
				checkboxVisibility={2}
				constrainMode={1}
				selectionMode={1}
			/>
		</div>
	)
})

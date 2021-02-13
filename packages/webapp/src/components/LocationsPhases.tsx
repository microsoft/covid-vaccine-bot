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
import * as React from 'react'
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
		name: '',
		fieldName: 'text',
		minWidth: 200,
		isResizable: false,
		isMultiline: true,
	},
]

export default observer(function LocationsPhases(props: LocationsPhasesProp) {
	const { globalFileData, currentLanguage, repoFileData } = getAppStore()
	const { isRegion, value, selectedState } = props

	const [phaseGroup, setPhaseGroup] = React.useState<IGroup[]>([])
	const [phaseGroupItems, setPhaseGroupItems] = React.useState<any[]>([])

	React.useEffect(() => {
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
						value.key.includes('active') && value.key.includes(phase.id)
				}

				tempPhaseGroup.push({
					key: phase.id,
					name: 'Phase ' + phase.id,
					startIndex: 0,
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
	}, [
		repoFileData,
		globalFileData,
		selectedState,
		currentLanguage,
		isRegion,
		value,
	])

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
						{group.name}
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
		<div>
			<DetailsList
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
			/>
		</div>
	)
})

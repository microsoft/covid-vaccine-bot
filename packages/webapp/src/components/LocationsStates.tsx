/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	DetailsListLayoutMode,
	Dropdown,
	Panel,
	PrimaryButton,
	ProgressIndicator,
	TextField,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { getAppStore } from '../store/store'

import './Dashboard.scss'

export interface LocationsStatesProp {
	onSelectedItem: (item: any) => void
}

export default observer(function LocationsStates(props: LocationsStatesProp) {
	const { onSelectedItem } = props

	const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(
		false
	)
	const [filteredStateList, setFilteredStateList] = React.useState<any[]>([])
	const stateRepoFullList = React.useRef<any[]>([])

	const state = getAppStore()

	const locationColumns = [
		{
			key: 'stateCol',
			name: 'State',
			fieldName: 'text',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'regionCol',
			name: 'Number of regions',
			fieldName: 'regions',
			minWidth: 200,
			isResizable: true,
		},
	]

	React.useEffect(() => {
		if (state.repoFileData) {
			const tempList: any[] = []
			Object.entries(state.repoFileData).forEach(([key, value]) => {
				const stateId = value?.info?.content.id
				const stateNames = state?.globalFileData?.cdcStateNames.content

				const stateLabel =
					stateNames[`cdc/${stateId}/state_name`] &&
					stateNames[`cdc/${stateId}/state_name`][state.currentLanguage] &&
					stateNames[`cdc/${stateId}/state_name`][
						state.currentLanguage
					].trim() !== ''
						? stateNames[`cdc/${stateId}/state_name`][state.currentLanguage]
						: `*Translation Not Found* (${stateId})`

				tempList.push({
					key: key,
					text: stateLabel,
					regions: value?.regions ? Object.keys(value.regions).length : 0,
					value: value,
				})
			})
			setFilteredStateList(tempList)
			stateRepoFullList.current = tempList
		}
	}, [
		state.repoFileData,
		state.globalFileData,
		state.currentLanguage,
		stateRepoFullList,
	])

	const onStateFilter = React.useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			text?: string | undefined
		) => {
			if (text) {
				setFilteredStateList(
					stateRepoFullList.current.filter(
						(state) => state.text.toLowerCase().indexOf(text) > -1
					)
				)
			} else {
				setFilteredStateList(stateRepoFullList.current)
			}
		},
		[stateRepoFullList]
	)

	const openSelection = React.useCallback(
		(item: any) => {
			onSelectedItem(item)
		},
		[onSelectedItem]
	)

	return (
		<div className="bodyContainer">
			<div className="bodyHeader">
				<div className="bodyHeaderTitle">
					<div className="breadCrumbs">/Locations</div>
					<div className="mainTitle">Locations</div>
				</div>
				{state.toggleAddLocation && (
					<PrimaryButton text="+ Add location" onClick={openPanel} />
				)}
			</div>
			<div className="bodyContent">
				{state.repoFileData ? (
					<section>
						<TextField label="Filter by name:" onChange={onStateFilter} />
						<DetailsList
							items={filteredStateList}
							columns={locationColumns}
							setKey="set"
							layoutMode={DetailsListLayoutMode.justified}
							selectionPreservedOnEmptyClick={true}
							ariaLabelForSelectionColumn="Toggle selection"
							ariaLabelForSelectAllCheckbox="Toggle selection for all items"
							checkButtonAriaLabel="Row checkbox"
							checkboxVisibility={2}
							onItemInvoked={openSelection}
						/>
					</section>
				) : (
					<section>
						<ProgressIndicator description="Loading content..." />
					</section>
				)}
			</div>
			<Panel
				isLightDismiss={true}
				headerText="Add new location"
				isBlocking={true}
				isOpen={isOpen}
				onDismiss={dismissPanel}
				closeButtonAriaLabel="Close"
				className="newLocationPanel"
			>
				<div className="newLocationPanelBody">
					<Dropdown
						label="Locations"
						selectedKey={undefined}
						placeholder="Select a location"
						options={stateRepoFullList.current}
					/>
					<br />
					<TextField label="New sub-location " required />
					<br />
					<PrimaryButton text="Save" />
				</div>
			</Panel>
		</div>
	)
})

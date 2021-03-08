/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	IGroup,
	FontIcon,
} from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useState, useEffect, useCallback } from 'react'
import {
	modifyStateStrings,
	modifyMoreInfoLinks,
	setActivePhase,
	updateQualifier,
	addQualifier,
	removeQualifier,
	removePhase,
} from '../mutators/repoMutators'
import { getAppStore } from '../store/store'
import PhaseQualifierForm from './PhaseQualifierForm'

import './Locations.scss'

export interface LocationsPhasesProp {
	isRegion: boolean
	value: any
	selectedState: any
}

export default observer(function LocationsPhases(props: LocationsPhasesProp) {
	const {
		globalFileData,
		currentLanguage,
		repoFileData,
		isEditable,
	} = getAppStore()
	const { isRegion, value, selectedState } = props

	const [phaseGroup, setPhaseGroup] = useState<IGroup[]>([])
	const [phaseGroupItems, setPhaseGroupItems] = useState<any[]>([])

	useEffect(() => {
		if (repoFileData) {
			const tempPhaseGroup: IGroup[] = []
			const tempPhaseGroupItems: any[] = []
			const currentStateObj: any = repoFileData[selectedState.key]
			let phaseObj = currentStateObj.vaccination.content.phases
			const regionObj = isRegion
				? repoFileData[selectedState.key].regions[value.key]
				: null

			if (isRegion && regionObj.vaccination.content.phases) {
				phaseObj = regionObj.vaccination.content.phases
			}

			phaseObj.forEach((phase: any) => {
				const isCollapsed: boolean = !isRegion && value.value.id !== phase.id

				let isActivePhase = false
				if (isRegion && regionObj.vaccination.content.activePhase) {
					isActivePhase = phase.id === regionObj.vaccination.content.activePhase
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
						key: phase.id + '-' + keyId + '-' + tempPhaseGroupItems.length,
						text: label,
						moreInfoKey: qualification?.moreInfoText
							? qualification.moreInfoText.toLowerCase()
							: '',
						moreInfoContent: '',
						moreInfoUrl: qualification.moreInfoUrl,
						qualifierId: keyId,
						tagKey: keyId.split('/')[1].split('.')[0],
						groupId: phase.id,
						location: value,
					})
				})
			})

			setPhaseGroup(tempPhaseGroup)
			setPhaseGroupItems(tempPhaseGroupItems)
		}
	}, [repoFileData, globalFileData, selectedState, currentLanguage, isRegion, value])

	const onAddQualifierClick = useCallback(
		(phaseId: any) => {
			const newPhaseGroupItems: any[] = []
			const newPhaseGroup: any[] = []
			const insertIdx =
				phaseGroupItems
					.map((i) => i.key.startsWith(phaseId))
					.lastIndexOf(true) + 1

			const newItem = {
				key: `${phaseId}-c19.eligibility.question/new_qualifier`,
				text: '',
				moreInfoKey: '',
				moreInfoUrl: '',
				qualifierId: 'c19.eligibility.question/new_qualifier',
				tagKey: 'new_tagKey',
				groupId: phaseId,
				location: value,
			}

			for (let i = 0; i < phaseGroupItems.length; i++) {
				if (i === insertIdx) {
					newPhaseGroupItems.push(newItem)
					newPhaseGroupItems.push(phaseGroupItems[i])
				} else {
					newPhaseGroupItems.push(phaseGroupItems[i])
				}
			}

			if (insertIdx === phaseGroupItems.length) {
				newPhaseGroupItems.push(newItem)
			}

			phaseGroup.forEach((group) => {
				newPhaseGroup.push({
					...group,
					...{
						startIndex: newPhaseGroupItems.findIndex(
							(i) => i.groupId === group.data.keyId
						),
						count: newPhaseGroupItems.filter(
							(i) => i.groupId === group.data.keyId
						).length,
					},
				})
			})

			setPhaseGroup(newPhaseGroup)
			setPhaseGroupItems(newPhaseGroupItems)
		},
		[phaseGroupItems, phaseGroup, value]
	)

	const onRemoveRowItem = (item: any) => {
		removeQualifier({
			locationKey: selectedState.key,
			item: item,
			regionInfo: isRegion ? value : null,
		})
	}

	const onRemovePhaseGroupClick = (phaseId: any) => {
		removePhase({
			locationKey: selectedState.key,
			phaseId: phaseId,
			regionInfo: isRegion ? value : null,
		})
	}

	const onSetActivePhase = (phaseId: string) => {
		setActivePhase({
			locationKey: selectedState.key,
			phaseId: phaseId,
			regionInfo: isRegion ? value : null,
		})
	}

	const onToggleCollapse = useCallback((group) => {
		const groupIdx = phaseGroup.findIndex(g => g.key === group.key)
		phaseGroup[groupIdx].isCollapsed = !group.isCollapsed
		setPhaseGroup([...phaseGroup])
	},[setPhaseGroup, phaseGroup])

	const onChangeRowItemText = (currentItem: any, initItem: any) => {
		if (
			initItem.moreInfoUrl?.toLowerCase() !==
			currentItem.moreInfoUrl?.toLowerCase()
		) {
			modifyMoreInfoLinks({
				locationKey: selectedState.key,
				item: currentItem,
				regionInfo: isRegion ? value : null,
			})
		} else if (initItem.moreInfoContent !== currentItem.moreInfoContent) {
			let calcInfoKey = currentItem.qualifierId.replace('question', 'moreinfo')
			calcInfoKey += `.${selectedState.value.info.content.metadata.code_alpha.toLowerCase()}`
			if (isRegion) {
				calcInfoKey += `.${value.name.toLowerCase()}`
			}
			calcInfoKey += `.${currentItem.groupId}`

			modifyStateStrings({
				infoKey: calcInfoKey,
				locationKey: selectedState.key,
				item: currentItem,
				regionInfo: isRegion ? value : null,
			})
		}
	}

	const onChangeRowItemQualifier = (currentItem: any, initItem: any) => {
		if (initItem.qualifierId !== 'c19.eligibility.question/new_qualifier') {
			updateQualifier({
				oldId: initItem.qualifierId,
				locationKey: selectedState.key,
				item: currentItem,
				regionInfo: isRegion ? value : null,
			})
		} else {
			addQualifier({
				locationKey: selectedState.key,
				item: currentItem,
				regionInfo: isRegion ? value : null,
			})
		}
	}

	return (
		<div className="phaseGridContainer">
			{phaseGroup.length > 0 ? (
				phaseGroup.map((group: any, idx: number) => {
					return(
						<div key={`phasegroup-${idx}`}>
							<div className="phaseGroupHeader">
								<div className="groupHeaderLabel" onClick={() => {onToggleCollapse(group)}}>
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
								<div className="groupHeaderButtons">
									{isEditable ? (
										<>
											<div
												className="addQualifierGroup"
												onClick={() => onAddQualifierClick(group.data.keyId)}
											>
												<FontIcon
													iconName="CircleAdditionSolid"
													style={{ color: '#0078d4' }}
												/>
												Add Qualifier
											</div>
											<div
												className="removePhaseGroup"
												onClick={() => onRemovePhaseGroupClick(group.data.keyId)}
											>
												<FontIcon
													iconName="Blocked2Solid"
													style={{ color: '#d13438' }}
												/>
												Remove
											</div>
											{group.data.isActive ? (
												<div className="activeGroup">
													<FontIcon
														iconName="CircleFill"
														style={{ color: '#00b7c3' }}
													/>
													Active Phase
												</div>
											) : (
												<div
													className="activeGroup"
													onClick={() => onSetActivePhase(group.data.keyId)}
												>
													<FontIcon
														iconName="CircleRing"
														style={{ color: '#00b7c3' }}
													/>
													Set as Active
												</div>
											)}
										</>
									) : (
										<>
											{group.data.isActive && (
												<div className="activeGroup">
													<FontIcon
														iconName="CircleFill"
														style={{ color: '#00b7c3' }}
													/>
													Active Phase
												</div>
											)}
										</>
									)}
								</div>
							</div>
							<div style={{display: group.isCollapsed ? 'none': 'block'}}>
								{phaseGroupItems.length > 0 ? (
									phaseGroupItems.filter(i => i.groupId === group.data.keyId).map((groupItem: any, idx: number) => {
										return (
											<PhaseQualifierForm
												key={idx}
												rowItems={{item: groupItem}}
												selectedState={selectedState}
												isEditable={isEditable}
												isRegion={isRegion}
												onRowItemRemove={onRemoveRowItem}
												onRowItemTextChange={onChangeRowItemText}
												onRowItemQualifierChange={onChangeRowItemQualifier}
											/>
										)
									})
								):(
									null
								)}
							</div>
						</div>
					)
					})
				):(
					null
				)}
		</div>
	)
})

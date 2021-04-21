/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { 
	FontIcon,
	Modal,
 } from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
	modifyStateStrings,
	modifyMoreInfoLinks,
	setActivePhase,
	updateQualifier,
	addQualifier,
	removeQualifier,
	removePhase,
	duplicatePhase,
} from '../mutators/repoMutators'
import {getText as t} from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { formatId } from '../utils/textUtils'
//import PhaseForm from './PhaseForm'
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
	const [phaseList, setPhaseList] = useState<any[]>([])
	const groupToggleState = useRef<any[]>([])
	const selectedModalFormItem = useRef<any>(null)

	const [
		isDuplaceModalOpen,
		{ setTrue: openDuplicateModal, setFalse: dismissDuplicateModal },
	] = useBoolean(false)

	const onDuplicateSubmit = ({name}: {name: string}) => {
		const nextPhaseId = formatId(name);
		const phases = repoFileData[selectedState.key].vaccination.content.phases;
		const nameExists = !!phases.find((item: {id: string}) => item.id === nextPhaseId);

		if(nameExists) {
			return
		}

		duplicatePhase({
			locationKey: selectedState.key,
			phaseId: selectedModalFormItem.current.key,
			name,
			isRegion,
			regionInfo: value
		})
	}

	const onDuplicatePhaseClick = useCallback(
		(item?: any) => {
			selectedModalFormItem.current = item ?? null
			openDuplicateModal()
		},
		[openDuplicateModal]
	)

	useEffect(() => {
		if (repoFileData) {
			dismissDuplicateModal()

			const tempPhaseList: any[] = []
			const currentStateObj: any = repoFileData[selectedState.key]
			let phaseObj = currentStateObj.vaccination.content.phases
			const regionObj = isRegion
				? repoFileData[selectedState.key].regions[value.key]
				: null

			if (isRegion && regionObj.vaccination.content.phases) {
				phaseObj = regionObj.vaccination.content.phases
			}

			phaseObj.forEach((phase: any) => {
				let isCollapsed = true

				if (isRegion) {
					isCollapsed = groupToggleState.current.length > 0 ? !groupToggleState.current.includes(phase.id) : true
				} else {
					if (groupToggleState.current.length > 0) {
						isCollapsed = !groupToggleState.current.includes(phase.id)
					} else {
						isCollapsed = value.value.id !== phase.id
					}
				}

				let isActivePhase = false
				if (isRegion && regionObj.vaccination.content.activePhase) {
					isActivePhase = phase.id === regionObj.vaccination.content.activePhase
				} else {
					isActivePhase =
						phase.id === currentStateObj.vaccination.content.activePhase
				}

				const tempPhaseObj: any = {
					key: phase.id,
					name: phase.label || phase.id,
					count: phase.qualifications.length,
					isCollapsed: isCollapsed,
					data: {
						name: phase.label || phase.id,
						keyId: phase.id,
						isActive: isActivePhase,
					},
				}

				const phaseItems: any[] = []

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

					phaseItems.push({
						key: phase.id + '-' + keyId,
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
				tempPhaseObj['items'] = phaseItems
				tempPhaseList.push(tempPhaseObj)
			})

			setPhaseList(tempPhaseList)
		}
	}, [repoFileData, globalFileData, selectedState, currentLanguage, isRegion, value, dismissDuplicateModal])

	const onAddQualifierClick = (phaseId: any) => {
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

		const tempPhaseList = phaseList.map((group) => {
			if (group.key === phaseId) {
				// const checkNewQualIndex = group.items.findIndex(
				// 	(i: any) => i.key === newItem.key
				// )
				// if (checkNewQualIndex === -1) {
					group.items.push(newItem)
				//}
			}

			return group
		})
		setPhaseList(tempPhaseList)
	}

	const onRemoveRowItem = (item: any, groupKey:any) => {
		if (item.qualifierId !== 'c19.eligibility.question/new_qualifier') {
			removeQualifier({
				locationKey: selectedState.key,
				item: item,
				regionInfo: isRegion ? value : null,
			})
		} else {
			const tempPhaseList = phaseList.map((group) => {
				if (group.key === groupKey) {
					const newItemIndex = group.items.findIndex( (i:any) => i.qualifierId ===  'c19.eligibility.question/new_qualifier')
					if(newItemIndex !== -1){
						group.items.splice(newItemIndex,1)
					}
				}

				return group
			})

			setPhaseList(tempPhaseList)
		}
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

	const onToggleCollapse = (toggleGroup: any) => {
		const tempPhaseList = phaseList.map((group) => {
			if (group.key === toggleGroup.key) {
				group.isCollapsed = !group.isCollapsed
			}

			return group
		})
		groupToggleState.current = tempPhaseList.filter( group => !group.isCollapsed ).map(group => group.key)
		setPhaseList(tempPhaseList)
	}

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
			{phaseList.length > 0
				? phaseList.map((group: any, idx: number) => {
						return (
							<div key={`phasegroup-${idx}`}>
								<div className="phaseGroupHeader">
									<div
										className="groupHeaderLabel"
										onClick={() => {
											onToggleCollapse(group)
										}}
									>
										<FontIcon
											iconName={
												group.isCollapsed ? 'ChevronRight' : 'ChevronDown'
											}
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
													onClick={() => onDuplicatePhaseClick(group)}
												>
													<FontIcon
														iconName="DuplicateRow"
														style={{ color: '#0078d4' }}
													/>
													{t('LocationsPhases.columns.duplicate')}
												</div>
												<div
													className="removePhaseGroup"
													onClick={() =>
														onRemovePhaseGroupClick(group.data.keyId)
													}
												>
													<FontIcon
														iconName="Blocked2Solid"
														style={{ color: '#d13438' }}
													/>
													{t('LocationsPhases.columns.remove')}
												</div>
												{group.data.isActive ? (
													<div className="activeGroup">
														<FontIcon
															iconName="CircleFill"
															style={{ color: '#00b7c3' }}
														/>
														{t('LocationsPhases.columns.active')}
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
														{t('LocationsPhases.columns.setActive')}
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
														{t('LocationsPhases.columns.active')}
													</div>
												)}
											</>
										)}
									</div>
								</div>
								<div style={{ display: group.isCollapsed ? 'none' : 'block' }}>
									{group.items.length > 0 && (
										group.items.map((groupItem: any, idx: number) => {
											return (
												<PhaseQualifierForm
													key={groupItem.key+'_'+idx}
													groupKey={group.key}
													rowItems={{ item: groupItem }}
													selectedState={selectedState}
													isEditable={isEditable}
													isRegion={isRegion}
													onRowItemRemove={onRemoveRowItem}
													onRowItemTextChange={onChangeRowItemText}
													onRowItemQualifierChange={onChangeRowItemQualifier}
												/>
											)
										})
									)}
									<div
										className="phaseBottomGroup"
										style={{marginTop: group.items.length > 0 ? 0 : '20px'}}
									>
										<div
											className="addQualifierGroup"
											onClick={() => onAddQualifierClick(group.data.keyId)}
										>
											<FontIcon
												iconName="CircleAdditionSolid"
												style={{ color: '#0078d4' }}
											/>
											{t('LocationsPhases.AddQualifierButton')}
										</div>
									</div>
								</div>
								<Modal
									isOpen={isDuplaceModalOpen}
									isModeless={false}
									isDarkOverlay={true}
									isBlocking={false}
								>
									{/* <PhaseForm
										selectedState={selectedState}
										duplicate={true}
										isRegion={isRegion}
										regionInfo={value}
										onCancel={dismissDuplicateModal}
										onSubmit={onDuplicateSubmit}
									/> */}
								</Modal>
							</div>
						)
				  })
				: null}
		</div>
	)
})

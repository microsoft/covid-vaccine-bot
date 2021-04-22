/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getAppStore } from '../store/store'
import {
	FontIcon,
	Modal
} from '@fluentui/react'
import PhaseQualifierForm from './PhaseQualifierFormV2'
import { getParentLocationVaccinationData } from '../selectors/phaseSelectorsV2'
import { useBoolean } from '@uifabric/react-hooks'
import PhaseForm from './PhaseForm'
import { duplicatePhase, removePhase } from '../mutators/repoMutators'
import './Locations.scss'

export interface LocationPhaseQualifiersProp {
	currentLocation: any
}

export default observer(function LocationPhaseQualifiers(props: LocationPhaseQualifiersProp) {
	const { currentLocation } = props
	const {	currentLanguage, isEditable, repoFileData } = getAppStore()
	const [phaseList, setPhaseList] = useState<any[]>([])
	const groupToggleState = useRef<any[]>([])
	const [
		isDuplaceModalOpen,
		{ setTrue: openDuplicateModal, setFalse: dismissDuplicateModal },
	] = useBoolean(false)
	const selectedPhaseGroup = useRef<any>(null)

	useEffect(() => {
		dismissDuplicateModal()
		if (currentLocation) {
			const tempPhaseList: any[] = []
			let phases = currentLocation.vaccination.content.phases
			let activePhase = currentLocation?.vaccination?.content?.activePhase

			if (!phases) {
				const parentVaccinationData = getParentLocationVaccinationData(currentLocation)
				phases = parentVaccinationData.content.phases
				activePhase = parentVaccinationData.content.activePhase
			}

			phases.forEach((phase: any) => {
				let isCollapsed = true

				if (groupToggleState.current.length > 0) {
						isCollapsed = !groupToggleState.current.includes(phase.id)
				} else {
						isCollapsed = true
				}

				const isActivePhase = activePhase === phase.id

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
						currentLocation.strings &&
						currentLocation.strings.content[keyId]
					) {
						label = currentLocation.strings.content[keyId][currentLanguage] || label
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
						location: currentLocation,
					})
				})
				tempPhaseObj['items'] = phaseItems
				tempPhaseList.push(tempPhaseObj)
			})

			setPhaseList(tempPhaseList)
		}
	}, [currentLocation, currentLanguage, dismissDuplicateModal, repoFileData])

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

	const onAddQualifierClick = (phaseId: any) => {
		const newItem = {
			key: `${phaseId}-c19.eligibility.question/new_qualifier`,
			text: '',
			moreInfoKey: '',
			moreInfoUrl: '',
			qualifierId: 'c19.eligibility.question/new_qualifier',
			tagKey: 'new_tagKey',
			groupId: phaseId,
			location: currentLocation,
		}

		const tempPhaseList = phaseList.map((group) => {
			if (group.key === phaseId) {
					group.items.push(newItem)
			}

			return group
		})
		setPhaseList(tempPhaseList)
	}

	const onRemoveRowItem = (item: any, groupKey:any) => {
		if (item.qualifierId !== 'c19.eligibility.question/new_qualifier') {
			console.log('remove new qualifier')
			// removeQualifier({
			// 	locationKey: selectedState.key,
			// 	item: item,
			// 	regionInfo: isRegion ? value : null,
			// })
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
		console.log('remove phase group', phaseId)
		removePhase({
			currentLocation,
			phaseId
		})
	}

	const onSetActivePhase = (phaseId: string) => {
		console.log('set active phase', phaseId)
		// setActivePhase({
		// 	locationKey: selectedState.key,
		// 	phaseId: phaseId,
		// 	regionInfo: isRegion ? value : null,
		// })
	}

	const onDuplicatePhaseClick = useCallback(
		(item?: any) => {
			selectedPhaseGroup.current = item ?? null
			openDuplicateModal()
		},
		[openDuplicateModal]
	)

	const onDuplicateSubmit = useCallback(({name}: {name: string}) => {
		duplicatePhase({
			currentLocation,
			phaseId: selectedPhaseGroup.current.key,
			name,
		})
		dismissDuplicateModal()
	},[currentLocation, dismissDuplicateModal])

	const onChangeRowItemText = (currentItem: any, initItem: any) => {
		console.log('row item changed')
		// if (
		// 	initItem.moreInfoUrl?.toLowerCase() !==
		// 	currentItem.moreInfoUrl?.toLowerCase()
		// ) {
		// 	modifyMoreInfoLinks({
		// 		locationKey: selectedState.key,
		// 		item: currentItem,
		// 		regionInfo: isRegion ? value : null,
		// 	})
		// } else if (initItem.moreInfoContent !== currentItem.moreInfoContent) {
		// 	let calcInfoKey = currentItem.qualifierId.replace('question', 'moreinfo')
		// 	calcInfoKey += `.${selectedState.value.info.content.metadata.code_alpha.toLowerCase()}`
		// 	if (isRegion) {
		// 		calcInfoKey += `.${value.name.toLowerCase()}`
		// 	}
		// 	calcInfoKey += `.${currentItem.groupId}`

		// 	modifyStateStrings({
		// 		infoKey: calcInfoKey,
		// 		locationKey: selectedState.key,
		// 		item: currentItem,
		// 		regionInfo: isRegion ? value : null,
		// 	})
		// }
	}

	const onChangeRowItemQualifier = (currentItem: any, initItem: any) => {
		console.log('change row item qualifier')
		// if (initItem.qualifierId !== 'c19.eligibility.question/new_qualifier') {
		// 	updateQualifier({
		// 		oldId: initItem.qualifierId,
		// 		locationKey: selectedState.key,
		// 		item: currentItem,
		// 		regionInfo: isRegion ? value : null,
		// 	})
		// } else {
		// 	addQualifier({
		// 		locationKey: selectedState.key,
		// 		item: currentItem,
		// 		regionInfo: isRegion ? value : null,
		// 	})
		// }
	}

    return (
        <section className="LocationPhaseQualifiersComponent">
            <div className="locationPhaseQualifiersSectionHeader">
                Phase Qualifiers
            </div>
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
													key={`${groupItem.key}_${idx}`}
													currentLocation={currentLocation}
													groupKey={group.key}
													rowItem={groupItem}
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
							</div>
						)
				  })
				: null}
		</div>
		<Modal
			isOpen={isDuplaceModalOpen}
			isModeless={false}
			isDarkOverlay={true}
			isBlocking={false}
		>
			<PhaseForm
				currentLocation={currentLocation}
				duplicate={true}
				onCancel={dismissDuplicateModal}
				onSubmit={onDuplicateSubmit}
			/>
		</Modal>
        </section>
    )
})
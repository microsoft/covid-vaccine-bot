/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { useState, useEffect, useCallback, useRef } from 'react'
import { formatId, toProperCase } from '../utils/textUtils'
import {
	DetailsList,
    DetailsListLayoutMode,
    FontIcon,
    IColumn,
	Modal
} from '@fluentui/react'
import { getParentLocationVaccinationData } from '../selectors/phaseSelectorsV2'
import { useBoolean } from '@uifabric/react-hooks'

import './Locations.scss'
import PhaseForm from './PhaseForm'
import { addPhase } from '../mutators/repoMutators'

export interface LocationsPhaseListProp {
	currentLocation: any
    onItemClicked?: (item: any) => void
}

export default observer(function LocationsPhaseList(props: LocationsPhaseListProp) {
	const { currentLocation, onItemClicked } = props
    const state = getAppStore()
    const [phaseItemList, setPhaseItemList] = useState<any[]>([])
	const [
		isPhaseModalOpen,
		{ setTrue: openPhaseModal, setFalse: dismissPhaseModal },
	] = useBoolean(false)
	const selectedPhaseItem = useRef<any>(null)

    const phaseColumns = [
		{
			key: 'nameCol',
			name: t('LocationsRegions.PhaseOverview.columns.name'),
			fieldName: 'name',
			minWidth: 200,
			isResizable: false,
		},
		{
			key: 'qualCol',
			name: t('LocationsRegions.PhaseOverview.columns.qualifications'),
			fieldName: 'qualifications',
			minWidth: 200,
			isResizable: false,
		},
		{
			key: 'editCol',
			name: '',
			fieldName: 'editPhase',
			minWidth: 50,
			isResizable: false,
		},
	].filter((loc) => (state.isEditable ? true : loc.key !== 'editCol'))

    useEffect(() => {
		if (currentLocation) {
			const newList = setInitialPhaseItems({
				key: currentLocation.info.content.id,
				value: currentLocation,
			})
			setPhaseItemList(newList)
		}
	}, [currentLocation, setPhaseItemList])

	const onPhaseFormOpen = useCallback(
		(item?: any) => {
			console.log(item)
			selectedPhaseItem.current = item
			openPhaseModal()
		},
		[openPhaseModal]
	)

    const onRenderItemColumn = useCallback(
		(item?: any, _index?: number, column?: IColumn) => {
			if (!column) return null

			const fieldContent = item[column.fieldName as keyof any] as string

			if (column.key === 'editCol') {
				return state.isEditable ? (
					<span>
						<FontIcon
							iconName="Edit"
							className="editIcon"
							onClick={() => onPhaseFormOpen(item)}
						/>
					</span>
				) : null
			} else {
				return <span>{fieldContent}</span>
			}
		},
		[
			state.isEditable,
			onPhaseFormOpen
		]
	)

	const onPhaseFormSubmit = useCallback((phaseData: any) => {
		dismissPhaseModal()

		console.log(phaseData)
		if (phaseData.phaseId) {
			// updatePhase({
			// 	locationKey: selectedState.key,
			// 	item: phaseData,
			// })
			console.log('update phase')
		} else {
			const { phases, activePhase } = getLocationPhaseData(currentLocation)
			phases.push({
				id: formatId(phaseData.name),
				label: phaseData.name,
				qualifications: []
			})

			if (!currentLocation.vaccination.content?.phases) {
				currentLocation.vaccination.content.phases = phases
			}

			const newList = generateUIPhaseList(phases, activePhase)
			setPhaseItemList(newList)
			addPhase(currentLocation)
		}
	},[currentLocation, dismissPhaseModal])

	return (
		<>
        <section className="LocationPhaseListComponent">
            <div className="locationPhaseOverviewSectionHeader">
                <div>
                    {t('LocationsRegions.PhaseOverview.title')}
                </div>
                {state.isEditable && (
                    <div
                        className="addPhaseHeaderButton"
                        onClick={() => onPhaseFormOpen()}
                    >
                        <FontIcon
                            iconName="CircleAdditionSolid"
                            style={{ color: '#0078d4' }}
                        />
                        {t('LocationsRegions.PhaseOverview.AddPhaseButton')}
                    </div>
                )}
            </div>
            {phaseItemList.length > 0 ? (
                <DetailsList
                    items={phaseItemList}
                    columns={phaseColumns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.justified}
                    checkboxVisibility={2}
                    onItemInvoked={(item) => onItemClicked?.(item)}
                    onRenderItemColumn={onRenderItemColumn}
                    className="locationDetailsList"
                />
            ) : (
                <div className="emptyPhaseOverview">{t('LocationsRegions.PhaseOverview.empty')}</div>
            )}
        </section>
		<Modal
			isOpen={isPhaseModalOpen}
			isModeless={false}
			isDarkOverlay={true}
			isBlocking={false}
		>
			<PhaseForm
				item={selectedPhaseItem.current}
				onCancel={dismissPhaseModal}
				onSubmit={onPhaseFormSubmit}
			/>
		</Modal>
		</>
	)
})

const getLocationPhaseData = (currentLocation: any): {phases: any[], activePhase: string} => {
	const currLocation = currentLocation.value || currentLocation

	let phases: any[] = currLocation.vaccination.content.phases
	let activePhase: string = currLocation.vaccination.content.activePhase

	if (!phases) {
		const parentLocationVaccinationData = getParentLocationVaccinationData(currLocation)
		if (parentLocationVaccinationData) {
			phases = [...parentLocationVaccinationData.content.phases]
			activePhase = {...parentLocationVaccinationData.content.activePhase}
		} else {
			return {phases: [], activePhase: '' }
		}
	}

	return {phases, activePhase}
}

const setInitialPhaseItems = (currentLocation: any): any[] => {
	const result = getLocationPhaseData(currentLocation)
	return generateUIPhaseList(result.phases, result.activePhase)
}

const generateUIPhaseList = (phases: any[], activePhase: string) => {
	return phases.map(
		(phase: any, idx: number) => {
			return {
				key: String(phase.id) + idx,
				keyId:
					String(phase.id) +
					(phase.id === activePhase ? ` (${t('App.active')})` : ''),
				name:
					toProperCase(phase.label ?? phase.id) +
					(phase.id === activePhase ? ` (${t('App.active')})` : ''),
				qualifications: phase.qualifications.length,
				value: phase,
				isNew: false,
			}
		}
	)
}
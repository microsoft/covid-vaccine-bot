/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { useState, useEffect, useCallback, useRef } from 'react'
import { toProperCase } from '../utils/textUtils'
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
		]
	)

	const onPhaseFormOpen = useCallback(
		(item?: any) => {
			console.log(item)
			selectedPhaseItem.current = item
			openPhaseModal()
		},
		[openPhaseModal]
	)

	const onPhaseFormSubmit = useCallback((phaseData: any) => {
		dismissPhaseModal()

		console.log(phaseData)
		// if (phaseData.phaseId) {
		// 	updatePhase({
		// 		locationKey: selectedState.key,
		// 		item: phaseData,
		// 	})
		// } else {
		// 	addPhase({
		// 		locationKey: selectedState.key,
		// 		item: phaseData,
		// 	})
		// }
	},[])

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

const setInitialPhaseItems = (currentLocation: any): any[] => {
	let phases: any[] = currentLocation.value.vaccination.content.phases
	let activePhase: string = currentLocation.value.vaccination.content.activePhase

	if (!phases) {
		const parentLocationVaccinationData = getParentLocationVaccinationData(currentLocation.value)
		if (parentLocationVaccinationData) {
			phases = parentLocationVaccinationData.content.phases
			activePhase = parentLocationVaccinationData.content.activePhase
		} else {
			return []
		}
	}

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
/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { useState, useEffect, useCallback } from 'react'
import { toProperCase } from '../utils/textUtils'
import {
	DetailsList,
    DetailsListLayoutMode,
    FontIcon,
    IColumn
} from '@fluentui/react'

import './Locations.scss'

export interface LocationsPhaseListProp {
	currentLocation: any
}

export default observer(function LocationsPhaseList(props: LocationsPhaseListProp) {
	const { currentLocation } = props
    const state = getAppStore()
    const [phaseItemList, setPhaseItemList] = useState<any[]>([])

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
						{column?.fieldName === 'editLocation' && (
							<FontIcon
								iconName="Cancel"
								className="deleteIcon"
								//onClick={() => onLocationDeleteFormOpen(item)}
							/>
						)}
						<FontIcon
							iconName="Edit"
							className="editIcon"
							// onClick={() =>
							// 	column?.fieldName === 'editLocation'
							// 		? onLocationFormOpen(item)
							// 		: onPhaseFormOpen(item)
							// }
						/>
					</span>
				) : null
			} else {
				return <span>{fieldContent}</span>
			}
		},
		[
			// onLocationFormOpen,
			// onLocationDeleteFormOpen,
			// onPhaseFormOpen,
			state.isEditable,
		]
	)

	return (
        <section className="LocationPhaseListComponent">
            <div className="locationPhaseOverviewSectionHeader">
                <div>
                    {t('LocationsRegions.PhaseOverview.title')}
                </div>
                {state.isEditable && (
                    <div
                        className="addPhaseHeaderButton"
                        //onClick={() => onPhaseFormOpen(null)}
                    >
                        <FontIcon
                            iconName="CircleAdditionSolid"
                            style={{ color: '#0078d4' }}
                        />
                        {t('LocationsRegions.PhaseOverview.AddPhaseButton')}
                    </div>
                )}
            </div>
            {currentLocation.vaccination?.content?.phases?.length > 0 ? (
                <DetailsList
                    items={phaseItemList}
                    columns={phaseColumns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.justified}
                    checkboxVisibility={2}
                    //onItemInvoked={(item) => selectedPhase(false, item)}
                    onRenderItemColumn={onRenderItemColumn}
                    className="locationDetailsList"
                />
            ) : (
                <div className="emptyPhaseOverview">{t('LocationsRegions.PhaseOverview.empty')}</div>
            )}
        </section>
	)
})

const setInitialPhaseItems = (currentLocation: any): any[] => {
	if (!currentLocation.value.vaccination.content.phases) {
		return []
	}
	return currentLocation.value.vaccination.content.phases.map(
		(phase: any, idx: number) => {
			const activePhase: string =
            currentLocation.value.vaccination.content.activePhase
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
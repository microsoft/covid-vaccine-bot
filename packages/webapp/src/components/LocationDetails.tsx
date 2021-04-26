/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	FontIcon,
	IColumn,
	DetailsList,
	DetailsListLayoutMode,
	Modal,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import { updateLocationData } from '../mutators/repoMutators'

import { getText as t } from '../selectors/intlSelectors'
import { getCustomString } from '../selectors/locationSelectors'
import { getAppStore } from '../store/store'

import './Locations.scss'
import { toProperCase } from '../utils/textUtils'
import LocationForm from './LocationForm'

export interface LocationsDetailsProp {
	currentLocation: any
}

export default observer(function LocationsDetails(props: LocationsDetailsProp) {
	const { currentLocation } = props
	const currentPath = currentLocation.info.path
	const { isEditable } = getAppStore()

	const [
		isLocationModalOpen,
		{ setTrue: openLocationModal, setFalse: dismissLocationModal },
	] = useBoolean(false)

	const onLocationFormSubmit = useCallback(
		(locationFormData, prevItem, initPath) => {
			dismissLocationModal()

			if (prevItem) {
				updateLocationData(locationFormData, initPath)
			}
		},
		[dismissLocationModal]
	)

	const items = []

	const locationName =
		getCustomString(currentLocation, currentLocation.info.content.name) ||
		toProperCase(currentLocation.info.content.name)
	items.push({ label: 'Details', value: locationName, isUrl: false })

	switch (currentLocation.info.content.type.toLowerCase()) {
		case 'state':
			items.push({
				label: t('LocationForm.regionTypeOptions.placeholder'),
				value: t('LocationForm.regionTypeOptions.state'),
				isUrl: false,
			})
			break
		case 'territory':
			items.push({
				label: t('LocationForm.regionTypeOptions.placeholder'),
				value: t('LocationForm.regionTypeOptions.territory'),
				isUrl: false,
			})
			break
		case 'tribal_land':
			items.push({
				label: t('LocationForm.regionTypeOptions.placeholder'),
				value: t('LocationForm.regionTypeOptions.tribal_land'),
				isUrl: false,
			})
			break
		case 'county':
			items.push({
				label: t('LocationForm.regionTypeOptions.placeholder'),
				value: t('LocationForm.regionTypeOptions.county'),
				isUrl: false,
			})
			break
		case 'city':
			items.push({
				label: t('LocationForm.regionTypeOptions.placeholder'),
				value: t('LocationForm.regionTypeOptions.city'),
				isUrl: false,
			})
			break
	}

	if (currentLocation.vaccination?.content.links.info?.url) {
		items.push({
			label: t('LocationForm.info'),
			value: currentLocation.vaccination.content.links.info.url,
			isUrl: true,
		})
	}

	if (currentLocation.vaccination?.content.links.workflow?.url) {
		items.push({
			label: t('LocationForm.workflow'),
			value: currentLocation.vaccination.content.links.workflow.url,
			isUrl: true,
		})
	}

	if (currentLocation.vaccination?.content.links.scheduling?.url) {
		items.push({
			label: t('LocationForm.scheduling'),
			value: currentLocation.vaccination.content.links.scheduling.url,
			isUrl: true,
		})
	}

	if (currentLocation.vaccination?.content.links.providers?.url) {
		items.push({
			label: t('LocationForm.providers'),
			value: currentLocation.vaccination.content.links.providers.url,
			isUrl: true,
		})
	}

	if (currentLocation.vaccination?.content.links.eligibility?.url) {
		items.push({
			label: t('LocationForm.eligibility'),
			value: currentLocation.vaccination.content.links.eligibility.url,
			isUrl: true,
		})
	}

	if (currentLocation.vaccination?.content.links.eligibility_plan?.url) {
		items.push({
			label: t('LocationForm.eligibilityPlan'),
			value: currentLocation.vaccination.content.links.eligibility_plan.url,
			isUrl: true,
		})
	}

	if (currentLocation.vaccination?.content.links.scheduling_phone?.text) {
		items.push({
			label: t('LocationForm.schedulingPhone'),
			value: getCustomString(
				currentLocation,
				currentLocation.vaccination.content.links.scheduling_phone.text
			),
			isUrl: false,
		})
	}

	if (
		currentLocation.vaccination?.content.links.scheduling_phone?.description
	) {
		items.push({
			label: t('LocationForm.schedulingPhoneDesc'),
			value: getCustomString(
				currentLocation,
				currentLocation.vaccination.content.links.scheduling_phone.description
			),
			isUrl: false,
		})
	}

	items.push({
		label: t('LocationForm.noPhaseLabel'),
		value:
			currentLocation.vaccination.content.noPhaseLabel === true ? 'Yes' : 'No',
		isUrl: false,
	})

	const formValueRender = (item: any) => {
		if (item.isUrl) {
			return (
				<a href={item.value} target="_blank" rel="noreferrer">
					{item.value}
				</a>
			)
		}
		return <span>{item.value}</span>
	}
	const columns: IColumn[] = [
		{
			key: 'label',
			name: 'label',
			fieldName: 'label',
			minWidth: 200,
			maxWidth: 400,
			isMultiline: true,
		},
		{
			key: 'value',
			name: 'value',
			fieldName: 'value',
			onRender: formValueRender,
			minWidth: 200,
			maxWidth: 400,
		},
	]

	return (
		<>
			<section className="LocationsDetailsComponent">
				<div className="locationDetailsSectionHeader">
					<div>Location Details</div>
					{isEditable && (
						<div
							className="editLocationDetailsButton"
							onClick={() => openLocationModal()}
						>
							<FontIcon
								iconName="CircleAdditionSolid"
								style={{ color: '#0078d4' }}
							/>
							Edit Details
						</div>
					)}
				</div>
				<DetailsList
					items={items}
					columns={columns}
					setKey="set"
					layoutMode={DetailsListLayoutMode.justified}
					selectionPreservedOnEmptyClick={true}
					checkboxVisibility={2}
					onRenderDetailsHeader={() => {
						return null
					}}
				/>
			</section>
			<Modal
				isOpen={isLocationModalOpen}
				isModeless={false}
				isDarkOverlay={true}
				isBlocking={false}
			>
				<LocationForm
					currentLocation={currentLocation}
					currentPath={currentPath}
					onCancel={dismissLocationModal}
					onSubmit={onLocationFormSubmit}
				/>
			</Modal>
		</>
	)
})

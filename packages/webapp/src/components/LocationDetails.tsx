/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { getAppStore } from '../store/store'
import { useBoolean } from '@uifabric/react-hooks'
import { useCallback } from 'react'
import {
	FontIcon,
	IColumn,
	DetailsList,
	DetailsListLayoutMode,
	Modal
} from '@fluentui/react'

import { getText as t } from '../selectors/intlSelectors'
import { getCustomString } from '../selectors/locationSelectors'
import LocationForm from './LocationForm'

import './Locations.scss'

export interface LocationsDetailsProp {
	currentLocation: any
}


export default observer(function LocationsDetails(props: LocationsDetailsProp) {

	const { currentLocation } = props
	const { isEditable } = getAppStore()

	const [
		isLocationModalOpen,
		{ setTrue: openLocationModal, setFalse: dismissLocationModal },
	] = useBoolean(false)

	const onLocationFormSubmit = useCallback(
		(locationData, prevItem) => {
			dismissLocationModal()
			// if (!prevItem) {
			// 	updateLocationList(locationData, false)
			// } else {
			// 	updateLocationData(locationData, false, prevItem)
			// }
		},
		[dismissLocationModal]
	)




		const items = []

		items.push({ label:'Details','value': getCustomString(currentLocation, currentLocation.info.content.name), isUrl:false })
		items.push({ label: t('LocationForm.regionTypeOptions.placeholder'),'value': currentLocation.info.content.type, isUrl:false})

		if(currentLocation.vaccination?.content.links.info?.url){
			items.push({ label:t('LocationForm.info'),'value': currentLocation.vaccination.content.links.info.url, isUrl:true })
		}

		if(currentLocation.vaccination?.content.links.workflow?.url){
			items.push({ label: t('LocationForm.workflow'),'value': currentLocation.vaccination.content.links.workflow.url, isUrl:true})
		}

		if(currentLocation.vaccination?.content.links.scheduling?.url){
			items.push({ label:t('LocationForm.scheduling'),'value': currentLocation.vaccination.content.links.scheduling.url, isUrl:true})
		}

		if(currentLocation.vaccination?.content.links.providers?.url){
			items.push({ label: t('LocationForm.providers'),'value': currentLocation.vaccination.content.links.providers.url, isUrl:true})
		}

		if(currentLocation.vaccination?.content.links.eligibility?.url){
			items.push({ label:t('LocationForm.eligibility'),'value': currentLocation.vaccination.content.links.eligibility.url, isUrl:true})
		}

		if(currentLocation.vaccination?.content.links.eligibility_plan?.url){
			items.push({ label: t('LocationForm.eligibilityPlan'),'value': currentLocation.vaccination.content.links.eligibility_plan.url, isUrl:true})
		}

		if(currentLocation.vaccination?.content.links.scheduling_phone?.text){
			items.push({ label:t('LocationForm.schedulingPhone'),'value': getCustomString(currentLocation, currentLocation.vaccination.content.links.scheduling_phone.text), isUrl:false})
		}

		if(currentLocation.vaccination?.content.links.scheduling_phone?.description){
			items.push({ label: t('LocationForm.schedulingPhoneDesc'),'value': getCustomString(currentLocation, currentLocation.vaccination.content.links.scheduling_phone.description), isUrl:false})
		}


	const formValueRender = (item: any) => {
	if(item.isUrl){
		return ( <a href={item.value} target="_blank" rel="noreferrer">{item.value}</a> )
	}
	return (<span>{item.value}</span>)
	}
	const columns: IColumn[] = [
		      {
		        key: 'label',
		        name: 'label',
		        fieldName: 'label',
		        minWidth: 200,
		        maxWidth: 400,
		        isMultiline: true
		      },
		      {
		        key: 'value',
		        name: 'value',
		        fieldName: 'value',
		        onRender: formValueRender,
		        minWidth: 200,
		        maxWidth: 400,
		        
		      }
      ]

	return (
        <>
			<section className="LocationsDetailsComponent">
                <div className="locationDetailsSectionHeader">
                <div>
						Location Details
					</div>
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
					onRenderDetailsHeader={()=>{return null}}
					
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
					onCancel={dismissLocationModal}
					onSubmit={onLocationFormSubmit}
				/>
			</Modal>
			
         </>
	)
})

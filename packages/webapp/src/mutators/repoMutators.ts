/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'
import { createLocationDataObj } from '../utils/dataUtils'

export const setBranchList = mutatorAction(
	'setBranchList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.branches = data
			const mainBranch = data.find((branch) => branch.name === 'main')
			store.mainBranch = mainBranch
		}
	}
)

export const setIssuesList = mutatorAction(
	'setIssuesList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.issues = data
		}
	}
)

export const handleCreatePR = mutatorAction(
	'handleCreatePR',
	(data: any[] | undefined) => {
		if (data) {
			alert('Checkout Github!')
		}
	}
)

export const setRepoFileData = mutatorAction(
	'setRepoFileData',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			console.log(data)
			store.repoFileData = data[0]
			store.initRepoFileData = data[0]
			store.globalFileData = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
		}
	}
)

export const setCurrentLanguage = mutatorAction(
	'setCurrentLanguage',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.currentLanguage = data.key
		}
	}
)
export const updateLocationList = mutatorAction('updateLocationList', (locationData: any, isRegion: boolean, selectedState?: any) => {
	if (locationData) {
		const store = getAppStore()
		const newLocObj = createLocationDataObj(locationData)

		if (!isRegion) {
			store.globalFileData.cdcStateNames.content[`cdc/${newLocObj.info.content.id}/state_name`] = {
				"en-us": locationData.details,
				"es-us": locationData.details,
				"vi-vn": locationData.details,
			}

			store.repoFileData[newLocObj.info.content.id] = newLocObj
			store.repoFileData = {...store.repoFileData}
		} else {
			newLocObj.info.path = `${selectedState.key}/regions/${newLocObj.info.path}`
			newLocObj.vaccination.path = `${selectedState.key}/regions/${newLocObj.vaccination.path}`

			if (store.repoFileData[selectedState.key].regions) {
				store.repoFileData[selectedState.key].regions[newLocObj.info.content.id] = newLocObj
			} else {
				store.repoFileData[selectedState.key].regions = {
					[newLocObj.info.content.id]: newLocObj
				}
			}

			store.repoFileData = {...store.repoFileData}
		}
	}
})

export const updatePhaseList = mutatorAction('updatePhaseList', (phaseItems: any[], isRegion: boolean, selectedState: any) => {
	if (phaseItems) {
		const store = getAppStore()
		console.log('covid: ', phaseItems)
		store.repoFileData[selectedState.key].vaccination.content.phases = phaseItems.map(item => {
			return {
				id: item.keyId,
				label: item.name,
				qualifications: item.value.qualifications
			}
		})

		store.repoFileData = {...store.repoFileData}
	}
})

export const modifyStateStrings = mutatorAction(
	'modifyStateStrings',
	(data:any | undefined) => {

		if(data){
			const store = getAppStore()
			if(store?.repoFileData){
			const location = store.repoFileData[data.locationKey]
			if(!location.strings?.content[data.infoKey]){
				const newStringsObj:any = {}
				newStringsObj[store.currentLanguage] = data.item.moreInfoContent
				location.strings.content[data.infoKey] = newStringsObj
				if(!data.regionInfo){

					const affectedPhase = location.vaccination.content.phases.find( (phase:any) => phase.id === data.item.groupId)
					const affectedQualifier = affectedPhase.qualifications.find( (qualification:any) => qualification.question === data.item.qualifierId )
					if(affectedQualifier){
						affectedQualifier.moreInfoText = data.infoKey
					}
					else{
						affectedPhase.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoText':data.infoKey})
					}
				} else {
					const regionVaccinationObj = location.regions[data.regionInfo.key].vaccination

					if(regionVaccinationObj.content?.phases){

						const affectedPhase = regionVaccinationObj.content.phases.find( (phase:any) => phase.id === data.item.groupId)

						if(affectedPhase){

							const affectedQualifier = affectedPhase.qualifications.find( (qualification:any) => qualification.question === data.item.qualifierId )
							if(affectedQualifier){
								affectedQualifier.moreInfoText = data.infoKey
							}
							else{
								affectedPhase.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoText':data.infoKey})
							}



						}
						else{
							const phaseObj:any = { 'id': data.item.groupId, 'qualifications':[] }
							phaseObj.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoText':data.infoKey})
							regionVaccinationObj.content['phases'].push( phaseObj)
						}


					}else
					{
						const phaseObj:any = { 'id': data.item.groupId, 'qualifications':[] }
						phaseObj.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoText':data.infoKey})
						regionVaccinationObj.content['phases'] = [phaseObj]
					}

				}

			} else {
				location.strings.content[data.infoKey][store.currentLanguage] = data.item.moreInfoContent
			}
		}
		}

	}
)

export const modifyMoreInfoLinks = mutatorAction(
	'modifyMoreInfoLinks',
	(data:any | undefined) => {

		if(data){
			const store = getAppStore()
			if(store?.repoFileData){
				const location = store.repoFileData[data.locationKey]
				if(data.regionInfo){

					const regionVaccinationObj = location.regions[data.regionInfo.key].vaccination

					if(regionVaccinationObj.content?.phases){

						const affectedPhase = regionVaccinationObj.content.phases.find( (phase:any) => phase.id === data.item.groupId)

						if(affectedPhase){

							const affectedQualifier = affectedPhase.qualifications.find( (qualification:any) => qualification.question === data.item.qualifierId )
							if(affectedQualifier){
								affectedQualifier.moreInfoUrl = data.item.moreInfoUrl
							}
							else{
								affectedPhase.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoUrl':data.item.moreInfoUrl})
							}



						}
						else{
							const phaseObj:any = { 'id': data.item.groupId, 'qualifications':[] }
							phaseObj.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoUrl':data.item.moreInfoUrl})
							regionVaccinationObj.content['phases'].push( phaseObj)
						}

					}else{
						const phaseObj:any = { 'id': data.item.groupId, 'qualifications':[] }
						phaseObj.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoUrl':data.item.moreInfoUrl})
						regionVaccinationObj.content['phases'] = [phaseObj]
					}

				}
				else{

					const affectedPhase = location.vaccination.content.phases.find( (phase:any) => phase.id === data.item.groupId)
					const affectedQualifier = affectedPhase.qualifications.find( (qualification:any) => qualification.question === data.item.qualifierId )
					if(affectedQualifier){
						affectedQualifier.moreInfoUrl = data.item.moreInfoUrl
					}
					else{
						affectedPhase.qualifications.push({ 'question': data.item.qualifierId , 'moreInfoUrl':data.item.moreInfoUrl})
					}

				}

				}
			}
		}
)

export const setActivePhase = mutatorAction(
	'setActivePhase',
	(data:any | undefined) => {

		if(data){
			const store = getAppStore()
			if(store?.repoFileData){
				const location = store.repoFileData[data.locationKey]

				if(data.regionInfo){
					console.log("in here")
					const regionVaccinationObj = location.regions[data.regionInfo.key].vaccination
					regionVaccinationObj.content['activePhase'] = data.phaseId
					store.repoFileData = {...store.repoFileData}



				}
				else {
					location.vaccination.content['activePhase'] = data.phaseId
					store.repoFileData = {...store.repoFileData}

				}
			}
		}

	})

export const updateGlobalQualifiers = mutatorAction('updateGlobalQualifiers', (newItem: any | undefined) => {
	if (newItem) {
		const store = getAppStore()
		const { customStrings } = store.globalFileData

		const qualifierKeyBank = newItem.qualifier.toLowerCase().replace(/[^A-Za-z0-9]/g,'_').split(' ') as string[]
		let qualifierKey = ''

		const customStringKeys = Object.keys(customStrings.content)

		let qKey = ''
		for (let i = 0; i < qualifierKeyBank.length; i++) {
			if (i == 0) {
				qKey = qualifierKeyBank[0]
			} else {
				qKey = `${qKey}_${qualifierKeyBank[i]}`
			}

			qualifierKey = `c19.eligibility.question/${newItem.tagKey}.${qKey}`

			if (!customStringKeys.includes(qualifierKey)) {
				break;
			}
		}

		store.globalFileData.customStrings.content[qualifierKey] = {
			[store.currentLanguage]: newItem.qualifier
		}

		store.globalFileData = {...store.globalFileData}
	}
})
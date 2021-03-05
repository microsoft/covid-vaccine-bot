/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'
import { createLocationDataObj } from '../utils/dataUtils'

export const initStoreData = mutatorAction(
	'initStoreData',
	(isDataRefreshing: boolean) => {
		const store = getAppStore()
		store.isDataRefreshing = isDataRefreshing
	}
)

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
	(data: any[] | undefined, callback?: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.issues = data
			if (callback) {
				callback()
			}
		}
	}
)

export const handleCreatePR = mutatorAction('handleCreatePR', () => {
	const store = getAppStore()
	store.pendingChanges = false
})

export const setRepoFileData = mutatorAction(
	'setRepoFileData',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.repoFileData = data[0]
			store.initRepoFileData = data[0]
			store.globalFileData = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
			store.initGlobalFileData = {
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
export const updateLocationList = mutatorAction(
	'updateLocationList',
	(locationData: any, isRegion: boolean, selectedState?: any) => {
		if (locationData) {
			const store = getAppStore()
			const newLocObj = createLocationDataObj(locationData)
			store.pendingChanges = true

			if (!isRegion) {
				store.globalFileData.cdcStateNames.content[
					`cdc/${newLocObj.info.content.id}/state_name`
				] = {
					'en-us': locationData.details,
					'es-us': locationData.details,
					'vi-vn': locationData.details,
				}

				newLocObj.strings.path = `${newLocObj.info.content.id}/${newLocObj.info.content.id}.csv`

				const schedulingPhoneKey: string = `c19.link/scheduling.phone.${newLocObj.info.content.id}`.toLowerCase()
				const stringsContentObj: any = {
					[schedulingPhoneKey]: {
						[store.currentLanguage]: locationData.schedulingPhone,
					},
				}
				newLocObj.vaccination.content.links.scheduling_phone.text = schedulingPhoneKey

				if (locationData.schedulingPhoneDesc !== '') {
					const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${newLocObj.info.content.id}`.toLowerCase()

					stringsContentObj[schedulingPhoneDescKey] = {
						[store.currentLanguage]: locationData.schedulingPhoneDesc,
					}

					newLocObj.vaccination.content.links.scheduling_phone.description = schedulingPhoneDescKey
				}

				newLocObj.strings.content = stringsContentObj

				store.repoFileData[newLocObj.info.content.id] = newLocObj
				store.repoFileData = { ...store.repoFileData }
			} else {
				const location = store.repoFileData[selectedState.key]
				newLocObj.info.path = `${selectedState.key}/regions/${newLocObj.info.path}`
				newLocObj.vaccination.path = `${selectedState.key}/regions/${newLocObj.vaccination.path}`

				const schedulingPhoneKey: string = `c19.link/scheduling.phone.${newLocObj.info.content.id}`.toLowerCase()

				location.strings.content[schedulingPhoneKey] = {
					[store.currentLanguage]: locationData.schedulingPhone,
				}
				newLocObj.vaccination.content.links.scheduling_phone.text = schedulingPhoneKey

				if (locationData.schedulingPhoneDesc !== '') {
					const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${newLocObj.info.content.id}`.toLowerCase()

					location.strings.content[schedulingPhoneDescKey] = {
						[store.currentLanguage]: locationData.schedulingPhoneDesc,
					}

					newLocObj.vaccination.content.links.scheduling_phone.description = schedulingPhoneDescKey
				}

				if (location.regions) {
					location.regions[newLocObj.info.content.id] = newLocObj
				} else {
					location.regions = {
						[newLocObj.info.content.id]: newLocObj,
					}
				}

				store.repoFileData = { ...store.repoFileData }
			}
		}
	}
)

export const updateLocationData = mutatorAction(
	'updateLocationData',
	(
		locationData: any,
		isRegion: boolean,
		prevItem: any,
		selectedState?: any
	) => {
		if (locationData) {
			const store = getAppStore()
			store.pendingChanges = true
			if (!isRegion) {
				const location = store.repoFileData[prevItem.key]

				store.globalFileData.cdcStateNames.content[
					`cdc/${prevItem.key}/state_name`
				] = {
					'en-us': locationData.details,
					'es-us': locationData.details,
					'vi-vn': locationData.details,
				}

				location.info.content.name = locationData.details
				const schedulingPhoneKey = `c19.link/scheduling.phone.${prevItem.value.info.content.metadata.code_alpha}`.toLowerCase()
				location.strings.content[schedulingPhoneKey] = {
					[store.currentLanguage]: locationData.schedulingPhone,
				}

				location.vaccination.content.links = {
					eligibility: {
						url: locationData.eligibility,
					},
					eligibility_plan: {
						url: locationData.eligibilityPlan,
					},
					info: {
						url: locationData.info,
						text: `cdc/${prevItem.key}/state_link`,
					},
					providers: {
						url: locationData.providers,
						text: 'c19.links/vax_providers',
					},
					workflow: {
						url: locationData.workflow,
						text: 'c19.links/vax_quiz',
					},
					scheduling: {
						url: locationData.scheduling,
						text: 'c19.links/schedule_vax',
					},
					scheduling_phone: {
						url: `tel:${locationData.schedulingPhone}`,
						text: schedulingPhoneKey,
					},
				}
				if (locationData.schedulingPhoneDesc !== '') {
					let schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${prevItem.value.info.content.metadata.code_alpha}`.toLowerCase()

					if (
						prevItem.value.vaccination.content.links.scheduling_phone
							.description
					) {
						schedulingPhoneDescKey =
							prevItem.value.vaccination.content.scheduling_phone.description
					}
					location.strings.content[schedulingPhoneDescKey] = {
						[store.currentLanguage]: locationData.schedulingPhoneDesc,
					}

					location.vaccination.content.links.scheduling_phone.description = schedulingPhoneDescKey
				}
			} else {
				const location = store.repoFileData[selectedState.key]
				const regionObj = location.regions[prevItem.key]
				regionObj.info.content.name = locationData.details

				const schedulingPhoneKey = `c19.link/scheduling.phone.${regionObj.info.content.id}`.toLowerCase()
				location.strings.content[schedulingPhoneKey] = {
					[store.currentLanguage]: locationData.schedulingPhone,
				}

				regionObj.vaccination.content.links = {
					eligibility: {
						url: locationData.eligibility,
					},
					eligibility_plan: {
						url: locationData.eligibilityPlan,
					},
					info: {
						url: locationData.info,
						text: `cdc/${selectedState.key}/state_link`,
					},
					providers: {
						url: locationData.providers,
						text: 'c19.links/vax_providers',
					},
					workflow: {
						url: locationData.workflow,
						text: 'c19.links/vax_quiz',
					},
					scheduling: {
						url: locationData.scheduling,
						text: 'c19.links/schedule_vax',
					},
					scheduling_phone: {
						url: `tel:${locationData.schedulingPhone}`,
						text: schedulingPhoneKey,
					},
				}

				if (locationData.schedulingPhoneDesc !== '') {
					let schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${regionObj.info.content.id}`.toLowerCase()

					if (
						prevItem.value.vaccination.content.links.scheduling_phone
							.description
					) {
						schedulingPhoneDescKey =
							prevItem.value.vaccination.content.scheduling_phone.description
					}
					location.strings.content[schedulingPhoneDescKey] = {
						[store.currentLanguage]: locationData.schedulingPhoneDesc,
					}

					regionObj.vaccination.content.links.scheduling_phone.description = schedulingPhoneDescKey
				}
			}
			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const modifyStateStrings = mutatorAction(
	'modifyStateStrings',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]
					const newStringsObj: any = {}
					newStringsObj[store.currentLanguage] = data.item.moreInfoContent
					location.strings.content[data.infoKey] = newStringsObj
					if (!data.regionInfo) {
						const affectedPhase = location.vaccination.content.phases.find(
							(phase: any) => phase.id === data.item.groupId
						)
						const affectedQualifier = affectedPhase.qualifications.find(
							(qualification: any) =>
								qualification.question.toLowerCase() ===
								data.item.qualifierId.toLowerCase()
						)
						if (affectedQualifier) {
							affectedQualifier.moreInfoText = data.infoKey
						} else {
							affectedPhase.qualifications.push({
								question: data.item.qualifierId,
								moreInfoText: data.infoKey,
							})
						}
					} else {
						const regionVaccinationObj =
							location.regions[data.regionInfo.key].vaccination

						if (!regionVaccinationObj.content?.phases) {
							copyPhaseData(regionVaccinationObj, location.vaccination)
						}
						const affectedPhase = regionVaccinationObj.content.phases.find(
							(phase: any) => phase.id === data.item.groupId
						)
						const affectedQualifier = affectedPhase.qualifications.find(
							(qualification: any) =>
								qualification.question.toLowerCase() ===
								data.item.qualifierId.toLowerCase()
						)

						affectedQualifier.moreInfoText = data.infoKey
					}
				
			}
		}
	}
)

const copyPhaseData = (newObj: any, oldObj: any) => {
	newObj.content['phases'] = []
	oldObj.content.phases.forEach((phase: any) => {
		const currPhaseObj: any = {}
		currPhaseObj['id'] = phase.id
		currPhaseObj['qualifications'] = []
		phase.qualifications.forEach((qual: any) => {
			currPhaseObj.qualifications.push({
				question: qual.question.toLowerCase(),
				moreInfoText: qual.moreInfoText?.toLowerCase(),
				moreInfoUrl: qual.moreInfoUrl,
			})
		})

		newObj.content.phases.push(currPhaseObj)
	})
}

export const modifyMoreInfoLinks = mutatorAction(
	'modifyMoreInfoLinks',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]
				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}

					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					if (affectedPhase) {
						const affectedQualifier = affectedPhase.qualifications.find(
							(qualification: any) =>
								qualification.question.toLowerCase() ===
								data.item.qualifierId.toLowerCase()
						)

						if (affectedQualifier) {
							affectedQualifier.moreInfoUrl = data.item.moreInfoUrl
						}
					}
				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)
					const affectedQualifier = affectedPhase.qualifications.find(
						(qualification: any) =>
							qualification.question.toLowerCase() ===
							data.item.qualifierId.toLowerCase()
					)
					if (affectedQualifier) {
						affectedQualifier.moreInfoUrl = data.item.moreInfoUrl
					} else {
						affectedPhase.qualifications.push({
							question: data.item.qualifierId,
							moreInfoUrl: data.item.moreInfoUrl,
						})
					}
				}
			}
		}
	}
)

export const updateQualifier = mutatorAction(
	'updateQualifier',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}

					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const affectedQualifier = affectedPhase.qualifications.find(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.oldId.toLowerCase()
					)
					if (affectedQualifier) {
						affectedQualifier.question = data.item.qualifierId.toLowerCase()
					}
				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const affectedQualifier = affectedPhase.qualifications.find(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.oldId.toLowerCase()
					)
					if (affectedQualifier) {
						affectedQualifier.question = data.item.qualifierId.toLowerCase()
					}
				}
			}
		}
	}
)
export const addQualifier = mutatorAction(
	'addQualifier',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}
					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					affectedPhase.qualifications.push({
						question: data.item.qualifierId,
					})
				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					affectedPhase.qualifications.push({
						question: data.item.qualifierId,
					})
				}
			}
		}
	}
)
export const removeQualifier = mutatorAction(
	'removeQualifier',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}
					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const removeIndex = affectedPhase.qualifications.findIndex(
						(qualification: any) =>
							qualification.question.toLowerCase() ===
							data.item.qualifierId.toLowerCase()
					)
					affectedPhase.qualifications.splice(removeIndex, 1)
					store.repoFileData = { ...store.repoFileData }
				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const removeIndex = affectedPhase.qualifications.findIndex(
						(qualification: any) =>
							qualification.question.toLowerCase() ===
							data.item.qualifierId.toLowerCase()
					)
					affectedPhase.qualifications.splice(removeIndex, 1)
					store.repoFileData = { ...store.repoFileData }
				}
			}
		}
	}
)
export const removePhase = mutatorAction(
	'removePhase',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}
					const removeIndex = regionVaccinationObj.content.phases.findIndex(
						(phase: any) => phase.id === data.phaseId
					)

					regionVaccinationObj.content.phases.splice(removeIndex, 1)
					store.repoFileData = { ...store.repoFileData }
				} else {
					const removeIndex = location.vaccination.content.phases.findIndex(
						(phase: any) => phase.id === data.phaseId
					)

					location.vaccination.content.phases.splice(removeIndex, 1)
					store.repoFileData = { ...store.repoFileData }
				}
			}
		}
	}
)

export const addPhase = mutatorAction('addPhase', (data: any | undefined) => {
	if (data) {
		const store = getAppStore()
		if (store?.repoFileData) {
			store.pendingChanges = true
			const location = store.repoFileData[data.locationKey]

			const phaseId = data.item.name.replace(/[\s.]/g, '').toLowerCase()

			const emptyQualifications: any = []

			if (!location.vaccination.content.phases) {
				location.vaccination.content.phases = []
			}

			location.vaccination.content.phases.push({
				id: phaseId,
				label: data.item.name,
				qualifications: emptyQualifications,
			})
			store.repoFileData = { ...store.repoFileData }
		}
	}
})

export const updatePhase = mutatorAction(
	'updatePhase',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]
				const phaseId = data.item.phaseId
					.toLowerCase()
					.replace(' (active)', '')
					.trim()

				const affectedPhase = location.vaccination.content.phases.find(
					(phase: any) => phase.id === phaseId
				)

				affectedPhase.label = data.item.name
				store.repoFileData = { ...store.repoFileData }
			}
		}
	}
)
export const setActivePhase = mutatorAction(
	'setActivePhase',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					regionVaccinationObj.content['activePhase'] = data.phaseId
					store.repoFileData = { ...store.repoFileData }
				} else {
					location.vaccination.content['activePhase'] = data.phaseId
					store.repoFileData = { ...store.repoFileData }
				}
			}
		}
	}
)

export const updateGlobalQualifiers = mutatorAction(
	'updateGlobalQualifiers',
	(item: any | undefined) => {
		if (item) {
			const store = getAppStore()
			const { customStrings } = store.globalFileData
			store.pendingChanges = true
			let qualifierKey = ''

			if (item.isNew) {
				const qualifierKeyBank = item.qualifier
					.toLowerCase()
					.replace(/[^A-Za-z0-9]/g, '_')
					.split('_')
					.filter((i: string) => i) as string[]

				const customStringKeys = Object.keys(customStrings.content)

				let qKey = ''
				for (let i = 0; i < qualifierKeyBank.length; i++) {
					if (i === 0) {
						qKey = qualifierKeyBank[0]
					} else {
						qKey = `${qKey}_${qualifierKeyBank[i]}`
					}
					qualifierKey = `c19.eligibility.question/${item.tagKey.toLowerCase()}.${qKey}`

					if (!customStringKeys.includes(qualifierKey)) {
						break
					}
				}

				qualifierKey = qualifierKey.endsWith('_')
					? qualifierKey.substr(0, qualifierKey.length - 1)
					: qualifierKey
			} else {
				qualifierKey = item.key
			}

			store.globalFileData.customStrings.content[qualifierKey] = {
				...store.globalFileData.customStrings.content[qualifierKey],
				[store.currentLanguage]: item.qualifier,
			}

			store.globalFileData = { ...store.globalFileData }
		}
	}
)

export const translateLocationName = mutatorAction(
	'translateLocationName',
	(item: any) => {
		if (item) {
			const store = getAppStore()
			if (store?.globalFileData) {
				store.pendingChanges = true
				if (store.globalFileData.cdcStateNames.content[item.key]) {
					store.globalFileData.cdcStateNames.content[item.key] = {
						...store.globalFileData.cdcStateNames.content[item.key],
						[item.toKey]: item.to,
					}
				} else {
					store.globalFileData.cdcStateNames.content = {
						...store.globalFileData.cdcStateNames.content,
						...{
							[item.key]: {
								[item.toKey]: item.to,
							},
						},
					}
				}

				store.globalFileData = { ...store.globalFileData }
			}
		}
	}
)

export const translateQualifier = mutatorAction(
	'translateQualifier',
	(item: any) => {
		if (item) {
			const store = getAppStore()
			if (store?.globalFileData) {
				store.pendingChanges = true
				if (store.globalFileData.customStrings.content[item.key]) {
					store.globalFileData.customStrings.content[item.key] = {
						...store.globalFileData.customStrings.content[item.key],
						[item.toKey]: item.to,
					}
				} else {
					store.globalFileData.customStrings.content = {
						...store.globalFileData.customStrings.content,
						...{
							[item.key]: {
								[item.toKey]: item.to,
							},
						},
					}
				}

				store.globalFileData = { ...store.globalFileData }
			}
		}
	}
)

export const translateMisc = mutatorAction('translateMisc', (item: any) => {
	if (item) {
		const store = getAppStore()
		if (item.category === 'state' && item.parent !== 'global') {
			if (store?.repoFileData) {
				store.pendingChanges = true
				if (
					store.repoFileData[item.parent].strings.content[item.key][item.toKey]
				) {
					store.repoFileData[item.parent].strings.content[item.key][
						item.toKey
					] = item.to
				} else {
					store.repoFileData[item.parent].strings.content[item.key] = {
						...store.repoFileData[item.parent].strings.content[item.key],
						...{ [item.toKey]: item.to },
					}
				}

				store.repoFileData = { ...store.repoFileData }
			}
		} else {
			if (store?.globalFileData) {
				store.pendingChanges = true
				const customStringKeys = Object.keys(
					store.globalFileData.customStrings.content
				)
				const isCustomString = customStringKeys.includes(item.key)

				if (isCustomString) {
					if (store.globalFileData.customStrings.content[item.key]) {
						store.globalFileData.customStrings.content[item.key] = {
							...store.globalFileData.customStrings.content[item.key],
							[item.toKey]: item.to,
						}
					} else {
						store.globalFileData.customStrings.content = {
							...store.globalFileData.customStrings.content,
							...{
								[item.key]: {
									[item.toKey]: item.to,
								},
							},
						}
					}
				} else {
					if (store.globalFileData.cdcStateLinks.content[item.key]) {
						store.globalFileData.cdcStateLinks.content[item.key] = {
							...store.globalFileData.cdcStateLinks.content[item.key],
							[item.toKey]: item.to,
						}
					} else {
						store.globalFileData.cdcStateLinks.content = {
							...store.globalFileData.cdcStateLinks.content,
							...{
								[item.key]: {
									[item.toKey]: item.to,
								},
							},
						}
					}
				}

				store.globalFileData = { ...store.globalFileData }
			}
		}
	}
})

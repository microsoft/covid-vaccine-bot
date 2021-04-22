/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { toJS } from 'mobx'
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'
import { createLocationDataObj, compare, pathFind } from '../utils/dataUtils'
import { formatId } from '../utils/textUtils'

export const setIsDataRefreshing = mutatorAction(
	'setIsDataRefreshing',
	(isDataRefreshing: boolean) => {
		const store = getAppStore()
		store.isDataRefreshing = isDataRefreshing
	}
)

export const setIsDataStale = mutatorAction(
	'isDataStale',
	(isDataStale: boolean) => {
		const store = getAppStore()
		store.isDataStale = isDataStale
	}
)

export const setPendingChanges = mutatorAction(
	'setPendingChanges',
	(pendingChanges: boolean) => {
		const store = getAppStore()
		store.pendingChanges = pendingChanges
	}
)

export const setSavingCommitsFlag = mutatorAction(
	'setSavingCommitsFlag',
	(data: boolean) => {
		const store = getAppStore()
		store.isSavingCommits = data
	}
)

export const setGlobalAndRepoChanges = mutatorAction(
	'setGlobalAndRepoChanges',
	() => {
		const store = getAppStore()
		store.initGlobalFileData = store.globalFileData
		store.initRepoFileData = store.repoFileData
	}
)

export const setBranchList = mutatorAction(
	'setBranchList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.branches = data
			const mainBranch = data.find((branch) => branch.name === process.env.REACT_APP_MAIN_BRANCH)
			store.mainBranch = mainBranch
		}
	}
)

export const setUserWorkingBranches = mutatorAction(
	'setUserWorkingBranches',
	(userWorkingBranches: any[] | undefined) => {
		if (userWorkingBranches) {
			const store = getAppStore()
			store.userWorkingBranches = userWorkingBranches
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

/**
 * Filters and sets commited deletes 
 */
export const setCommittedDeletes = mutatorAction(
	'setCommittedDeletes',
	(commits: any[] | undefined) => {
		const store = getAppStore()
		if (commits) {
			const deletedFiles = commits
				.filter((c: any) => c.commit.message.startsWith('deleted'))
				.map((c: any) => c.commit.message.replace('deleted ', ''))

			store.committedDeletes = deletedFiles
		}
	}
)
export const setLoadedPRData = mutatorAction(
	'setLoadedPRData',
	(prData: any | undefined) => {
		const store = getAppStore()
		if (prData) {
			store.loadedPRData = prData.data
			store.prChanges = {
				last_commit: prData?.commits ? [...prData.commits].pop() : undefined,
			}
		}
	}
)

export const setUserWorkingBranch = mutatorAction(
	'setUserWorkingBranch',
	(data: any | undefined) => {
		const store = getAppStore()
		store.userWorkingBranch = data
	}
)

export const clearLoadedPRData = mutatorAction('clearLoadedPRData', () => {
	const store = getAppStore()
	store.pendingChanges = false
	store.prChanges = undefined
	store.loadedPRData = undefined
})

export const setRepoFileData = mutatorAction(
	'setRepoFileData',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.repoFileData = data

		}
	}
)

export const setRepoFileChanges = mutatorAction(
	'setRepoFileData',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()

			const changes = compare(toJS(store.repoFileData), data[0])

			store.repoFileChanges = changes
			store.globalFileChanges = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
		}
	}
)

export const setInitRepoFileData = mutatorAction(
	'setInitRepoFileData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.repoFileData = data
			store.initRepoFileData = data
		}
	}
)

export const setLocationData = mutatorAction(
	'setLocationData',
	(data: any) => {
		if (data) {
			const store = getAppStore()

			const pathArray = data.info.path.split("/")
			pathArray.splice(-1,1)

			const currLocation = pathFind(store.repoFileData, pathArray)

			currLocation.info.content = data.info.content
			currLocation.strings.content = data.strings.content
			currLocation.vaccination.content = data.vaccination.content
		}
	}
)

export const setInitLocationsData = mutatorAction(
	'setInitLocationsData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.locationsData = {...data}
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

export const setBreadcrumbs = mutatorAction('setBreadcrumbs', (currentLocation: any | undefined) => {
	const store = getAppStore()
	if (currentLocation) {
		const breadCrumbs = {
			...store.breadCrumbs,
			[currentLocation.info.content.id]: {
				value: currentLocation
			}
		}
		store.breadCrumbs = breadCrumbs
	} else {
		store.breadCrumbs = {}
	}
})

export const addPhaseOverviewCrumb = mutatorAction('addPhaseOverviewCrumb', (currentLocation: any | undefined) => {
	const store = getAppStore()

	if (currentLocation) {
		const phaseOverviewCrumbs = {
			...store.breadCrumbs,
			[currentLocation.info.content.id]: {
				value: currentLocation
			},
			phase_overview: {
				value: {
					info: {
						content: {
							name: ''
						},
						path: currentLocation.info.path.replace('info.json', 'regions/phase_overview/info.json')
					}
				}
			}
		}

		store.breadCrumbs = phaseOverviewCrumbs
	} else {
		store.breadCrumbs = {}
	}
})

export const updatePhaseOverviewTitle = mutatorAction('updatePhaseOverTitle', (data: string) => {
	const store = getAppStore()
	store.breadCrumbs.phase_overview.value.info.content.name = data
})

export const deleteCrumbs = mutatorAction('deleteCrumbs', (data: any) => {
	const store = getAppStore()
	if (data) {
		const pathArray = data.value.info.path.split("/")
		pathArray.splice(-1,1)
		pathArray.push("regions")
		const parentPath = pathArray.join("/")
		const newCrumbs = {...store.breadCrumbs}
		for (const item in newCrumbs) {
			if (newCrumbs[item].value.info.path.startsWith(parentPath)) {
				delete newCrumbs[item]
			}
		}

		store.breadCrumbs = newCrumbs
	}
})


export const addLocation = mutatorAction(
	'addLocation',
	(
		locationData: any,
		locationPath: any
	) => {
		if (locationData) {
			const store = getAppStore()
			store.pendingChanges = true

			const locationId = locationData.details
				.replace(/[^a-z0-9\s]/gi, '')
				.replace(/\s/g, '_')
				.toLowerCase()

			let locationFilePath = [locationId]

			if(locationPath){
				const pathArray = locationPath.split("/")
				pathArray.splice(-1,1)
				pathArray.push("regions")
				pathArray.push(locationId)
				locationFilePath = pathArray

			}

			const newLocation = createLocationDataObj(locationId, locationFilePath, locationData, store.currentLanguage)

			if(!locationPath){
				store.repoFileData[locationId] = newLocation
			} else {
				const pathArray = locationPath.split("/")
				pathArray.splice(-1,1)

				const parentLocation = pathFind(store.repoFileData, pathArray)
				if(parentLocation.regions){
					parentLocation.regions[locationId] = newLocation
				} else {
					parentLocation["regions"] = { [locationId]:newLocation}
				}

			}

			store.repoFileData = { ...store.repoFileData }
		}
})

export const deleteLocation = mutatorAction(
	'deleteLocation',
	(locationData: any, isRegion?: boolean, selectedState?: any) => {
		const store = getAppStore()

		const pathArray = locationData.value.info.path.split("/")
		pathArray.splice(-1,1)
		if(pathArray.length === 1){

			delete store.repoFileData[locationData.key]

		} else {
			pathArray.splice(-1,1)
			const parentRegion = pathFind(store.repoFileData, pathArray)
			delete parentRegion[locationData.key]
		}

		store.repoFileData = { ...store.repoFileData }
	}
)

export const updateLocationData = mutatorAction(
	'updateLocationData',
	(
		locationData: any,
		locationPath: any
	) => {
		if (locationData) {
			const store = getAppStore()
			store.pendingChanges = true

			const pathArray = locationPath.split("/")
			pathArray.splice(-1,1)
			const rootPath = pathArray[0]

			const currLocation = pathFind(store.repoFileData, pathArray)
			const rootLocation = store.repoFileData[rootPath]

			const currLocationNameKey = currLocation.info.content.name


			if(currLocation.strings.content[currLocationNameKey]){
				currLocation.strings.content[currLocationNameKey][store.currentLanguage] = locationData.details
			} else if(rootLocation.strings.content[currLocationNameKey]){
				rootLocation.strings.content[currLocationNameKey][store.currentLanguage] = locationData.details
			}

			currLocation.info.content.type = locationData.regionType
			if(locationData.info !== ''){
				if(currLocation.vaccination.content.links.info){
					currLocation.vaccination.content.links.info.url = locationData.info
				}
				else {
					currLocation.vaccination.content.links['info'] = { 'url':locationData.info}
				}
			} else {
				delete currLocation.vaccination.content.links.info
			}

			if(locationData.worflow !== ''){
				if(currLocation.vaccination.content.links.worflow){
					currLocation.vaccination.content.links.worflow.url = locationData.worflow
				}
				else {
					currLocation.vaccination.content.links['worflow'] = { 'url':locationData.worflow }
				}
			} else {
				delete currLocation.vaccination.content.links.worflow
			}


			if(locationData.scheduling !== ''){
				if(currLocation.vaccination.content.links.scheduling){
					currLocation.vaccination.content.links.scheduling.url = locationData.scheduling
				}
				else {

					currLocation.vaccination.content.links['scheduling'] = { 'url':locationData.scheduling }
				}
			} else {
				delete currLocation.vaccination.content.links.scheduling
			}

			if(locationData.providers !== ''){
				if(currLocation.vaccination.content.links.providers){
					currLocation.vaccination.content.links.providers.url = locationData.providers
				}
				else {
					currLocation.vaccination.content.links['providers'] = { 'url':locationData.providers }
				}
			} else {
				delete currLocation.vaccination.content.links.providers
			}

			if(locationData.eligibility !== ''){
				if(currLocation.vaccination.content.links.eligibility){
					currLocation.vaccination.content.links.eligibility.url = locationData.eligibility
				}
				else {
					currLocation.vaccination.content.links['eligibility'] = { 'url':locationData.eligibility }
				}
			} else {
				delete currLocation.vaccination.content.links.eligibility
			}

			if(locationData.eligibilityPlan !== ''){
				if(currLocation.vaccination.content.links.eligibility_plan){
					currLocation.vaccination.content.links.eligibility_plan.url = locationData.eligibilityPlan
				}
				else {
					currLocation.vaccination.content.links['eligibility_plan'] = { 'url':locationData.eligibilityPlan }
				}
			} else {
				delete currLocation.vaccination.content.links.eligibility_plan
			}


			if(locationData.schedulingPhone !== ''){

				if(currLocation.vaccination.content.links.scheduling_phone){

					const schedulingPhoneKey = currLocation.vaccination.content.links.scheduling_phone.text

					if(currLocation.strings.content[schedulingPhoneKey]){
						currLocation.strings.content[schedulingPhoneKey][store.currentLanguage] = locationData.schedulingPhone
					} else if(rootLocation.strings.content[schedulingPhoneKey]){
						rootLocation.strings.content[schedulingPhoneKey][store.currentLanguage] = locationData.schedulingPhone
					}

					currLocation.vaccination.content.links.scheduling_phone.url = `tel:${locationData.schedulingPhone}`

					if(locationData.schedulingPhoneDesc !== ""){

						if(currLocation.vaccination.content.links.scheduling_phone.description){

							const schedulingPhoneDescKey = currLocation.vaccination.content.links.scheduling_phone.description
							if(currLocation.strings.content[schedulingPhoneDescKey]){
								currLocation.strings.content[schedulingPhoneDescKey][store.currentLanguage] = locationData.schedulingPhoneDesc
							} else if(rootLocation.strings.content[schedulingPhoneDescKey]){
								rootLocation.strings.content[schedulingPhoneDescKey][store.currentLanguage] = locationData.schedulingPhoneDesc
							}

						} else {
							const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${pathArray.join('.')}`
							currLocation.strings.content[schedulingPhoneDescKey] = { [store.currentLanguage]:locationData.schedulingPhoneDesc}
							currLocation.vaccination.content.links.scheduling_phone['description'] = schedulingPhoneDescKey

						}

					} else {
						delete currLocation.vaccination.content.links.scheduling_phone.description
					}

				} else {
					const schedulingPhoneKey = `c19.link/scheduling.phone.${pathArray.join('.')}`
					const schedulingPhoneObj:any = { 'text':schedulingPhoneKey, 'url':`tel:${locationData.schedulingPhone}` }

					currLocation.strings.content[schedulingPhoneKey] = { [store.currentLanguage]:locationData.schedulingPhone }

					if(locationData.schedulingPhoneDesc !== ""){
						const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${pathArray.join('.')}`
						currLocation.strings.content[schedulingPhoneDescKey] = { [store.currentLanguage]:locationData.schedulingPhoneDesc}
						schedulingPhoneObj['description'] = schedulingPhoneDescKey
					}

					currLocation.vaccination.content.links.scheduling_phone = schedulingPhoneObj
				}


			}else
			{
				delete currLocation.vaccination.content.links.scheduling_phone
			}


			currLocation.vaccination.content['noPhaseLabel'] = locationData.noPhaseLabel
			
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

				if (!data.item.moreInfoContent) {
					delete location.strings.content[data.infoKey]
				} else {
					const newStringsObj: any = {}
					newStringsObj[store.currentLanguage] = data.item.moreInfoContent
					location.strings.content[data.infoKey] = newStringsObj
				}

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
						if (data.item.moreInfoContent) {
							affectedQualifier.moreInfoText = data.infoKey
						} else {
							delete affectedQualifier.moreInfoText
						}
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
				moreInfoText: qual.moreInfoText
					?.replace(/[^a-z0-9._/\s]/gi, '')
					.replace(/\s/g, '_')
					.toLowerCase(),
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

				store.repoFileData = { ...store.repoFileData }
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

				store.repoFileData = { ...store.repoFileData }
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
				} else {
					const removeIndex = location.vaccination.content.phases.findIndex(
						(phase: any) => phase.id === data.phaseId
					)

					location.vaccination.content.phases.splice(removeIndex, 1)
				}
				store.repoFileData = { ...store.repoFileData }
			}
		}
	}
)

export const updatePhases = mutatorAction('updatePhases', (currentLocation: any) => {
	const store = getAppStore()
	store.pendingChanges = true

	const pathArray = currentLocation.info.path.split('/')
	pathArray.splice(-1, 1)

	let currLocation = pathFind(store.repoFileData, pathArray)
	currLocation.vaccination = currentLocation.vaccination
})

export const duplicatePhase = mutatorAction(
	'duplicatePhase',
	(
		data:
			| {
					name: string
					locationKey: string
					phaseId: string
					isRegion?: boolean
					regionInfo?: { key: string }
			  }
			| undefined
	) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]
				const phaseSource =
					data.isRegion &&
					data.regionInfo?.key &&
					location.regions[data.regionInfo.key].vaccination?.content.phases
						? location.regions[
								data.regionInfo.key
						  ].vaccination.content.phases.find(
								(item: { id: string }) => item.id === data.phaseId
						  )
						: location.vaccination.content.phases.find(
								(item: { id: string }) => item.id === data.phaseId
						  )
				const nextPhaseId = formatId(data.name)

				const newItem = {
					id: nextPhaseId,
					label: data.name,
					qualifications: phaseSource.qualifications?.map((item: any) => {
						const newContentKey = item.moreInfoText?.replace(
							new RegExp(data.phaseId + '$'),
							nextPhaseId
						)

						if (newContentKey) {
							location.strings.content[newContentKey] =
								location.strings.content[item.moreInfoText]
						}

						return {
							question: item.question,
							moreInfoUrl: item.moreInfoUrl,
							moreInfoText: newContentKey,
						}
					}),
				}

				if (data.isRegion && data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination

					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}

					regionVaccinationObj.content.phases.push(newItem)
				} else {
					// State level region phase
					location.vaccination.content.phases.push(newItem)
				}

				store.repoFileData = { ...store.repoFileData }
			}
		}
	}
)

export const updatePhase = mutatorAction('updatePhase', (currentLocation: any, phases?: any[]) => {
	const store = getAppStore()
	store.pendingChanges = true

	const pathArray = currentLocation.info.path.split('/')
	pathArray.splice(-1, 1)

	let currLocation = pathFind(store.repoFileData, pathArray)
	currLocation.vaccination = currentLocation.vaccination
})

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
						[`${item.toKey}-sms`]: item.sms,
						[`${item.toKey}-voice`]: item.voice,
					}
				} else {
					store.globalFileData.cdcStateNames.content = {
						...store.globalFileData.cdcStateNames.content,
						...{
							[item.key]: {
								[item.toKey]: item.to,
								[`${item.toKey}-sms`]: item.sms,
								[`${item.toKey}-voice`]: item.voice,
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
						[`${item.toKey}-sms`]: item.sms,
						[`${item.toKey}-voice`]: item.voice,
					}
				} else {
					store.globalFileData.customStrings.content = {
						...store.globalFileData.customStrings.content,
						...{
							[item.key]: {
								[item.toKey]: item.to,
								[`${item.toKey}-sms`]: item.sms,
								[`${item.toKey}-voice`]: item.voice,
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
					store.repoFileData[item.parent].strings.content[item.key][
						`${item.toKey}-sms`
					] = item.sms
					store.repoFileData[item.parent].strings.content[item.key][
						`${item.toKey}-voice`
					] = item.voice
				} else {
					store.repoFileData[item.parent].strings.content[item.key] = {
						...store.repoFileData[item.parent].strings.content[item.key],
						...{
							[item.toKey]: item.to,
							[`${item.toKey}-sms`]: item.sms,
							[`${item.toKey}-voice`]: item.voice,
						},
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
							[`${item.toKey}-sms`]: item.sms,
							[`${item.toKey}-voice`]: item.voice,
						}
					} else {
						store.globalFileData.customStrings.content = {
							...store.globalFileData.customStrings.content,
							...{
								[item.key]: {
									[item.toKey]: item.to,
									[`${item.toKey}-sms`]: item.sms,
									[`${item.toKey}-voice`]: item.voice,
								},
							},
						}
					}
				} else {
					if (store.globalFileData.cdcStateLinks.content[item.key]) {
						store.globalFileData.cdcStateLinks.content[item.key] = {
							...store.globalFileData.cdcStateLinks.content[item.key],
							[item.toKey]: item.to,
							[`${item.toKey}-sms`]: item.sms,
							[`${item.toKey}-voice`]: item.voice,
						}
					} else {
						store.globalFileData.cdcStateLinks.content = {
							...store.globalFileData.cdcStateLinks.content,
							...{
								[item.key]: {
									[item.toKey]: item.to,
									[`${item.toKey}-sms`]: item.sms,
									[`${item.toKey}-voice`]: item.voice,
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

const recursiveFindAndReplace = (key: string, saveObj: any, location: any) => {
	if (
		location.strings &&
		location.strings.content &&
		location.strings.content[key]
	) {
		location.strings.content[key] = saveObj
		return
	}
	if (location.regions && location.regions.length > 0) {
		location.regions.forEach((region: any) => {
			recursiveFindAndReplace(key, saveObj, region)
		})
	}
}

export const updateStrings = mutatorAction(
	'udpateStrings',
	(stringsList: any) => {
		if (stringsList) {
			const store = getAppStore()
			store.pendingChanges = true
			Object.keys(stringsList).forEach((stringId: string) => {
				if (store.globalFileData.customStrings.content[stringId]) {
					store.globalFileData.customStrings.content[stringId] =
						stringsList[stringId]
				} else if (store.globalFileData.cdcStateLinks.content[stringId]) {
					store.globalFileData.cdcStateLinks.content[stringId] =
						stringsList[stringId]
				} else if (store.globalFileData.cdcStateNames.content[stringId]) {
					store.globalFileData.cdcStateNames.content[stringId] =
						stringsList[stringId]
				} else {
					for (const item of Object.keys(store.repoFileData)) {
						const location = store.repoFileData[item]
						if (JSON.stringify(location).includes(stringId)) {
							recursiveFindAndReplace(stringId, stringsList[stringId], location)
							break
						}
					}
				}
			})

			store.globalFileData = { ...store.globalFileData }
		}
	}
)

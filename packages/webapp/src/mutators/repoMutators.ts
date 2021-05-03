/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { cloneDeep as clone } from 'lodash'
import { mutatorAction } from 'satcheljs'
import { getCurrentLocationObj, getLocationPhaseData } from '../selectors/locationSelectors'
import { getAppStore } from '../store/store'
import { createLocationDataObj, pathFind } from '../utils/dataUtils'
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
		store.pendingChangeList = {
			added: [],
			modified: [],
			deleted: []
		}
	}
)

export const setSavingCommitsFlag = mutatorAction(
	'setSavingCommitsFlag',
	(data: boolean) => {
		const store = getAppStore()
		store.isSavingCommits = data
	}
)

export const setBranchList = mutatorAction(
	'setBranchList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.branches = data
			const mainBranch = data.find(
				(branch) => branch.name === process.env.REACT_APP_MAIN_BRANCH
			)
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

export const setInitRepoFileData = mutatorAction(
	'setInitRepoFileData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.repoFileData = data
			store.initRepoFileData = data
			store.pendingChangeList = {
				added: [],
				modified: [],
				deleted: []
			}
		}
	}
)

export const setLoadAllStringsData = mutatorAction(
	'setLoadAllStringsData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			for(const item of data){

				const pathArray = item.path.split("/")
				pathArray.splice(-1,1)

				const currLocation = pathFind(store.repoFileData, pathArray)

				if(!currLocation.strings.content){
					currLocation.strings = item
				}


			}
			store.isDataRefreshing = false
		}
	}
)

export const setLocationData = mutatorAction('setLocationData', (data: any) => {
	if (data) {
		const store = getAppStore()

		const pathArray = clone(data.info.path).split('/')
		pathArray.splice(-1, 1)

		const currLocation = pathFind(store.repoFileData, pathArray)

		currLocation.info.content = data.info.content
		currLocation.strings.content = data.strings.content
		currLocation.vaccination.content = data.vaccination.content

		let initCurrLocation = pathFind(store.initRepoFileData, pathArray)

		initCurrLocation.info.content = clone(data.info.content)
		initCurrLocation.vaccination.content = clone(data.vaccination.content)

		if (!initCurrLocation.strings) {
			initCurrLocation = {
				...initCurrLocation,
				strings: {
					content: clone(data.strings.content)
				}
			}
		} else {
			initCurrLocation.strings.content = clone(data.strings.content)
		}
	}
})

export const setCurrentLanguage = mutatorAction(
	'setCurrentLanguage',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.currentLanguage = data.key
		}
	}
)

export const setBreadcrumbs = mutatorAction(
	'setBreadcrumbs',
	(currentLocation: any | undefined) => {
		const store = getAppStore()
		if (currentLocation) {
			const breadCrumbs = {
				...store.breadCrumbs,
				[currentLocation.info.content.id]: {
					value: currentLocation,
				},
			}
			store.breadCrumbs = breadCrumbs
		} else {
			store.breadCrumbs = {}
		}
	}
)

export const addPhaseOverviewCrumb = mutatorAction(
	'addPhaseOverviewCrumb',
	(currentLocation: any | undefined) => {
		const store = getAppStore()

		if (currentLocation) {
			const phaseOverviewCrumbs = {
				...store.breadCrumbs,
				[currentLocation.info.content.id]: {
					value: currentLocation,
				},
				phase_overview: {
					value: {
						info: {
							content: {
								name: '',
								id: currentLocation.info.content.id
							},
							path: currentLocation.info.path.replace(
								'info.json',
								'regions/phase_overview/info.json'
							),
						},
					},
				},
			}

			store.breadCrumbs = phaseOverviewCrumbs
		} else {
			store.breadCrumbs = {}
		}
	}
)

export const updatePhaseOverviewTitle = mutatorAction(
	'updatePhaseOverTitle',
	(data: string) => {
		const store = getAppStore()
		store.breadCrumbs.phase_overview.value.info.content = {
			id: data,
			name: data
		}
	}
)

export const deleteCrumbs = mutatorAction('deleteCrumbs', (data: any) => {
	const store = getAppStore()
	if (data) {
		const pathArray = data.value.info.path.split('/')
		pathArray.splice(-1, 1)
		pathArray.push('regions')
		const parentPath = pathArray.join('/')
		const newCrumbs = { ...store.breadCrumbs }
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
	(locationData: any, locationPath: any) => {
		if (locationData) {
			const store = getAppStore()
			store.pendingChanges = true

			const locationId = locationData.details
				.replace(/[^a-z0-9\s]/gi, '')
				.replace(/\s/g, '_')
				.toLowerCase()

			let locationFilePath = [locationId]

			if (locationPath) {
				const pathArray = locationPath.split('/')
				pathArray.splice(-1, 1)
				pathArray.push('regions')
				pathArray.push(locationId)
				locationFilePath = pathArray
			}

			const newLocation = createLocationDataObj(
				locationId,
				locationFilePath,
				locationData,
				store.currentLanguage
			)

			if (!locationPath) {
				store.repoFileData[locationId] = newLocation
			} else {
				const pathArray = locationPath.split('/')
				pathArray.splice(-1, 1)

				const parentLocation = pathFind(store.repoFileData, pathArray)
				if (parentLocation.regions) {
					parentLocation.regions[locationId] = newLocation
				} else {
					parentLocation['regions'] = { [locationId]: newLocation }
				}
			}

			store.pendingChangeList.added.push({
				section: 'location',
				name: locationFilePath.slice(-1)[0],
				pathKey: locationFilePath.join('.'),
				data: newLocation
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const deleteLocation = mutatorAction(
	'deleteLocation',
	(locationData: any) => {
		const store = getAppStore()
		store.pendingChanges = true

		const pathArray = locationData.value.info.path.split('/')
		pathArray.splice(-1, 1)
		if (pathArray.length === 1) {
			store.pendingChangeList.deleted.push({
				section: 'location',
				name: locationData.key,
				pathKey: pathArray.join('.'),
				data: store.repoFileData[locationData.key]
			})
			delete store.repoFileData[locationData.key]
		} else {
			pathArray.splice(-1, 1)
			const parentRegion = pathFind(store.repoFileData, pathArray)
			store.pendingChangeList.deleted.push({
				section: 'location',
				name: locationData.key,
				pathKey: pathArray.join('.'),
				data: parentRegion[locationData.key]
			})
			delete parentRegion[locationData.key]
		}

		store.repoFileData = { ...store.repoFileData }
	}
)

export const updateLocationData = mutatorAction(
	'updateLocationData',
	(locationData: any, locationPath: any) => {
		if (locationData) {
			const store = getAppStore()
			store.pendingChanges = true

			const pathArray = locationPath.split('/')
			pathArray.splice(-1, 1)
			const rootPath = pathArray[0]

			const currLocation = pathFind(store.repoFileData, pathArray)
			const rootLocation = store.repoFileData[rootPath]

			const currLocationNameKey = currLocation.info.content.name

			if (currLocation.strings.content[currLocationNameKey]) {
				currLocation.strings.content[currLocationNameKey][
					store.currentLanguage
				] = locationData.details
			} else if (rootLocation.strings.content[currLocationNameKey]) {
				rootLocation.strings.content[currLocationNameKey][
					store.currentLanguage
				] = locationData.details
			} else {
				const locationKey = `name.${pathArray.join('.')}`
				currLocation.strings.content = {
					[locationKey]: {
						[store.currentLanguage]: locationData.details
					}
				}
				currLocation.info.content.name = locationKey
			}

			currLocation.info.content.type = locationData.regionType
			if (locationData.info !== '') {
				if (currLocation.vaccination.content.links.info) {
					currLocation.vaccination.content.links.info.url = locationData.info
				} else {
					currLocation.vaccination.content.links['info'] = {
						url: locationData.info,
					}
				}
			} else {
				delete currLocation.vaccination.content.links.info
			}

			if (locationData.worflow !== '') {
				if (currLocation.vaccination.content.links.worflow) {
					currLocation.vaccination.content.links.worflow.url =
						locationData.worflow
				} else {
					currLocation.vaccination.content.links['worflow'] = {
						url: locationData.worflow,
					}
				}
			} else {
				delete currLocation.vaccination.content.links.worflow
			}

			if (locationData.scheduling !== '') {
				if (currLocation.vaccination.content.links.scheduling) {
					currLocation.vaccination.content.links.scheduling.url =
						locationData.scheduling
				} else {
					currLocation.vaccination.content.links['scheduling'] = {
						url: locationData.scheduling,
					}
				}
			} else {
				delete currLocation.vaccination.content.links.scheduling
			}

			if (locationData.providers !== '') {
				if (currLocation.vaccination.content.links.providers) {
					currLocation.vaccination.content.links.providers.url =
						locationData.providers
				} else {
					currLocation.vaccination.content.links['providers'] = {
						url: locationData.providers,
					}
				}
			} else {
				delete currLocation.vaccination.content.links.providers
			}

			if (locationData.eligibility !== '') {
				if (currLocation.vaccination.content.links.eligibility) {
					currLocation.vaccination.content.links.eligibility.url =
						locationData.eligibility
				} else {
					currLocation.vaccination.content.links['eligibility'] = {
						url: locationData.eligibility,
					}
				}
			} else {
				delete currLocation.vaccination.content.links.eligibility
			}

			if (locationData.eligibilityPlan !== '') {
				if (currLocation.vaccination.content.links.eligibility_plan) {
					currLocation.vaccination.content.links.eligibility_plan.url =
						locationData.eligibilityPlan
				} else {
					currLocation.vaccination.content.links['eligibility_plan'] = {
						url: locationData.eligibilityPlan,
					}
				}
			} else {
				delete currLocation.vaccination.content.links.eligibility_plan
			}

			if (locationData.schedulingPhone !== '') {
				if (currLocation.vaccination.content.links.scheduling_phone) {
					const schedulingPhoneKey =
						currLocation.vaccination.content.links.scheduling_phone.text

					if (currLocation.strings.content[schedulingPhoneKey]) {
						currLocation.strings.content[schedulingPhoneKey][
							store.currentLanguage
						] = locationData.schedulingPhone
					} else if (rootLocation.strings.content[schedulingPhoneKey]) {
						rootLocation.strings.content[schedulingPhoneKey][
							store.currentLanguage
						] = locationData.schedulingPhone
					}

					currLocation.vaccination.content.links.scheduling_phone.url = `tel:${locationData.schedulingPhone}`

					if (locationData.schedulingPhoneDesc !== '') {
						if (
							currLocation.vaccination.content.links.scheduling_phone
								.description
						) {
							const schedulingPhoneDescKey =
								currLocation.vaccination.content.links.scheduling_phone
									.description
							if (currLocation.strings.content[schedulingPhoneDescKey]) {
								currLocation.strings.content[schedulingPhoneDescKey][
									store.currentLanguage
								] = locationData.schedulingPhoneDesc
							} else if (rootLocation.strings.content[schedulingPhoneDescKey]) {
								rootLocation.strings.content[schedulingPhoneDescKey][
									store.currentLanguage
								] = locationData.schedulingPhoneDesc
							}
						} else {
							const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${pathArray.join(
								'.'
							)}`
							currLocation.strings.content[schedulingPhoneDescKey] = {
								[store.currentLanguage]: locationData.schedulingPhoneDesc,
							}
							currLocation.vaccination.content.links.scheduling_phone[
								'description'
							] = schedulingPhoneDescKey
						}
					} else {
						delete currLocation.vaccination.content.links.scheduling_phone
							.description
					}
				} else {
					const schedulingPhoneKey = `c19.link/scheduling.phone.${pathArray.join(
						'.'
					)}`
					const schedulingPhoneObj: any = {
						text: schedulingPhoneKey,
						url: `tel:${locationData.schedulingPhone}`,
					}

					currLocation.strings.content[schedulingPhoneKey] = {
						[store.currentLanguage]: locationData.schedulingPhone,
					}

					if (locationData.schedulingPhoneDesc !== '') {
						const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${pathArray.join(
							'.'
						)}`
						currLocation.strings.content[schedulingPhoneDescKey] = {
							[store.currentLanguage]: locationData.schedulingPhoneDesc,
						}
						schedulingPhoneObj['description'] = schedulingPhoneDescKey
					}

					currLocation.vaccination.content.links.scheduling_phone = schedulingPhoneObj
				}
			} else {
				delete currLocation.vaccination.content.links.scheduling_phone
			}

			currLocation.vaccination.content['noPhaseLabel'] =
				locationData.noPhaseLabel

			const pathKey = pathArray.join('.')
			const modifyKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === pathKey)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'location',
					name: pathArray.slice(-1)[0],
					pathKey: pathKey,
					data: currLocation
				})
			}

			const modifyRootKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === rootPath)

			if (modifyRootKeyIdx > -1) {
				store.pendingChangeList.modified[modifyRootKeyIdx].data = rootLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'location',
					name: rootPath,
					pathKey: rootPath,
					data: rootLocation
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const modifyMoreInfoText = mutatorAction(
	'modifyMoreInfoText',
	({ currentLocation, phaseGroupId, qualifierId, moreInfoText, moreInfoTextSms, moreInfoTextVoice }: any) => {
		if (currentLocation && phaseGroupId && qualifierId) {
			const store = getAppStore()
			store.pendingChanges = true

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)
			const isRootLocation = pathArray.length === 1

			const { locationData: currLocation, pathKey, name } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currLocation.vaccination.content.phases[phaseGroupIndex].qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === qualifierId
			)

			let calcInfoKey = `${qualifierId.replace('question', 'moreinfo')}`

			if (!isRootLocation) {
				const locationCode =
					currLocation.info.content?.metadata?.code_alpha ||
					currLocation.info.content.id
				calcInfoKey += `.${locationCode.toLowerCase()}.${phaseGroupId}`
			}

			if (!moreInfoText) {
				delete currLocation.strings.content[calcInfoKey]
			} else {
				const newStringsObj: any = {}
				newStringsObj[store.currentLanguage] = moreInfoText
				currLocation.strings.content[calcInfoKey] = newStringsObj

				phaseQualifiers[qualifierIdx].moreInfoText = calcInfoKey
			}

			const moreInfoSmsKey = calcInfoKey.replace('moreinfo', 'moreinfo.sms')
			if (!moreInfoTextSms) {
				delete currLocation.strings.content[moreInfoSmsKey]
			} else {
				const newStringsObj: any = {}
				newStringsObj[store.currentLanguage] = moreInfoTextSms
				currLocation.strings.content[moreInfoSmsKey] = newStringsObj

				phaseQualifiers[qualifierIdx].moreInfoTextSms = moreInfoSmsKey
			}

			const moreInfoVoiceKey = calcInfoKey.replace('moreinfo', 'moreinfo.voice')
			if (!moreInfoTextVoice) {
				delete currLocation.strings.content[moreInfoVoiceKey]
			} else {
				const newStringsObj: any = {}
				newStringsObj[store.currentLanguage] = moreInfoTextVoice
				currLocation.strings.content[moreInfoVoiceKey] = newStringsObj

				phaseQualifiers[qualifierIdx].moreInfoTextVoice = moreInfoVoiceKey
			}


			const modifyKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === pathKey)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: name,
					pathKey: pathKey,
					data: currLocation
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const modifyMoreInfoLinks = mutatorAction(
	'modifyMoreInfoLinks',
	({ currentLocation, phaseGroupId, qualifierId, moreInfoUrl }: any) => {
		if (currentLocation && phaseGroupId && qualifierId && moreInfoUrl) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey, name } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currLocation.vaccination.content.phases[phaseGroupIndex].qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === qualifierId
			)

			phaseQualifiers[qualifierIdx].moreInfoUrl = moreInfoUrl

			const modifyKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === pathKey)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: name,
					pathKey: pathKey,
					data: currLocation
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const updateQualifier = mutatorAction(
	'updateQualifier',
	({ currentLocation, phaseGroupId, qualifierId, oldQualifierId }: any) => {
		if (currentLocation && phaseGroupId && qualifierId && oldQualifierId) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey, name } = getCurrentLocationObj(currentLocation)
			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currLocation.vaccination.content.phases[phaseGroupIndex].qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === oldQualifierId
			)

			phaseQualifiers[qualifierIdx].question = qualifierId

			const modifyKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === pathKey)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: name,
					pathKey: pathKey,
					data: currLocation
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const addQualifier = mutatorAction(
	'addQualifier',
	({ currentLocation, phaseGroupId, qualifierId }: any) => {
		if (currentLocation && phaseGroupId && qualifierId) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey, name } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers = currLocation.vaccination.content.phases[phaseGroupIndex].qualifications
			phaseQualifiers.push({question: qualifierId})

			store.pendingChangeList.added.push({
				section: 'qualifier',
				name: name,
				pathKey: pathKey,
				data: currLocation
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const removeQualifier = mutatorAction(
	'removeQualifier',
	({ currentLocation, phaseGroupId, qualifierId }: any) => {
		if (currentLocation && phaseGroupId && qualifierId) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey, name } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currLocation.vaccination.content.phases[phaseGroupIndex].qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === qualifierId
			)

			store.pendingChangeList.deleted.push({
				section: 'qualifier',
				name: name,
				pathKey: pathKey,
				data: currLocation
			})

			phaseQualifiers.splice(qualifierIdx, 1)

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const removePhase = mutatorAction(
	'removePhase',
	({ currentLocation, phaseId }: any) => {
		if (currentLocation && phaseId) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const removeIndex = currLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseId
			)

			const name = currLocation.vaccination.content.phases[removeIndex].label || currLocation.vaccination.content.phases[removeIndex].id
			store.pendingChangeList.deleted.push({
				section: 'phase',
				name: name,
				pathKey: pathKey,
				data: currLocation
			})

			currLocation.vaccination.content.phases.splice(removeIndex, 1)

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const updatePhase = mutatorAction(
	'updatePhase',
	(currentLocation: any) => {
		const store = getAppStore()
		store.pendingChanges = true

		const { locationData: currLocation, pathKey, name } = getCurrentLocationObj(currentLocation)

		const { phases, activePhase } = getLocationPhaseData(currentLocation)

		if (
			!currLocation.vaccination.content?.phases ||
			currLocation.vaccination.content?.phases.length === 0
		) {
			currLocation.vaccination.content.phases = phases
		}

		if (!currLocation.vaccination.content?.activePhase) {
			currLocation.vaccination.content.activePhase = activePhase
		}

		const modifyKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === pathKey)

		if (modifyKeyIdx > -1) {
			store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
		} else {
			store.pendingChangeList.modified.push({
				section: 'phase',
				name: name,
				pathKey: pathKey,
				data: currLocation
			})
		}

		store.repoFileData = { ...store.repoFileData }
	}
)

export const addPhase = mutatorAction(
	'addPhase',
	({ currentLocation, id, label }: any) => {
		if (currentLocation && id && label) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			currLocation.vaccination.content.phases.push({
				id,
				label,
				qualifications: [],
			})

			store.pendingChangeList.added.push({
				section: 'phase',
				name: label,
				pathKey: pathKey,
				data: currLocation
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const duplicatePhase = mutatorAction(
	'duplicatePhase',
	({ currentLocation, phaseId, name }: any) => {
		if (currentLocation && phaseId && name) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey } = getCurrentLocationObj(currentLocation)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			const phase = clone(
				currLocation.vaccination.content.phases.find(
					(phase: any) => phase.id === phaseId
				)
			)

			const duplicatePhase = {
				...phase,
				id: formatId(name),
				label: name,
			}

			currLocation.vaccination.content.phases.push(duplicatePhase)

			store.pendingChangeList.added.push({
				section: 'phase',
				name: name,
				pathKey: pathKey,
				data: currLocation
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const setActivePhase = mutatorAction(
	'setActivePhase',
	({ currentLocation, phaseId }): any => {
		if (currentLocation && phaseId) {
			const store = getAppStore()
			store.pendingChanges = true

			const { locationData: currLocation, pathKey } = getCurrentLocationObj(currentLocation)
			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currLocation.vaccination.content?.phases ||
				currLocation.vaccination.content?.phases.length === 0
			) {
				currLocation.vaccination.content.phases = phases
			}

			if (!currLocation.vaccination.content?.activePhase) {
				currLocation.vaccination.content.activePhase = activePhase
			}

			currLocation.vaccination.content.activePhase = phaseId

			const modifyKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === pathKey)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'phase',
					name: phaseId,
					pathKey: pathKey,
					data: currLocation
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const updateRootLocationQualifiers = mutatorAction(
	'updateRootLocationQualifiers',
	({ rootLocationKey, newQualifier }: any | undefined) => {
		if (rootLocationKey && newQualifier) {
			const store = getAppStore()
			store.pendingChanges = true
			const stringsObj = store.repoFileData[rootLocationKey].strings.content

			let qualifierKey = ''
			//let qualifierSmsKey = ''
			//let qualifierVoiceKey = ''

			if (newQualifier.isNew) {
				const qualifierKeyBank = newQualifier.qualifier
					.toLowerCase()
					.replace(/[^A-Za-z0-9]/g, '_')
					.split('_')
					.filter((i: string) => i) as string[]

				const customStringKeys = Object.keys(stringsObj)

				let qKey = ''
				for (let i = 0; i < qualifierKeyBank.length; i++) {
					if (i === 0) {
						qKey = qualifierKeyBank[0]
					} else {
						qKey = `${qKey}_${qualifierKeyBank[i]}`
					}
					qualifierKey = `c19.eligibility.question/${newQualifier.tagKey.toLowerCase()}.${qKey}`

					if (!customStringKeys.includes(qualifierKey)) {
						break
					}
				}

				qualifierKey = qualifierKey.endsWith('_')
					? qualifierKey.substr(0, qualifierKey.length - 1)
					: qualifierKey
			} else {
				qualifierKey = newQualifier.key
				//qualifierSmsKey = newQualifier.key.replace('.question/','.question.sms/')
				//qualifierVoiceKey = newQualifier.key.replace('.question/','.question.voice/')
			}

			stringsObj[qualifierKey] = {
				...stringsObj[qualifierKey],
				[store.currentLanguage]: newQualifier.qualifier,
			}

			// if (!newQualifier.qualifierSms) {
			// 	delete stringsObj[qualifierSmsKey]
			// } else {
			// 	stringsObj[qualifierSmsKey] = {
			// 		...stringsObj[qualifierSmsKey],
			// 		[store.currentLanguage]: newQualifier.qualifierSms,
			// 	}
			// }

			// if (!newQualifier.qualifierVoice) {
			// 	delete stringsObj[qualifierVoiceKey]
			// } else {
			// 	stringsObj[qualifierVoiceKey] = {
			// 		...stringsObj[qualifierVoiceKey],
			// 		[store.currentLanguage]: newQualifier.qualifierVoice,
			// 	}
			// }

			const modifyRootKeyIdx = store.pendingChangeList.modified.findIndex((m: any) => m.pathKey === rootLocationKey)

			if (modifyRootKeyIdx > -1) {
				store.pendingChangeList.modified[modifyRootKeyIdx].data = store.repoFileData[rootLocationKey]
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: rootLocationKey,
					pathKey: rootLocationKey,
					data: store.repoFileData[rootLocationKey]
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

const recursiveFindAndReplace = (key: string, saveObj: any, location: any, changeList:any) => {
	if (
		location.strings &&
		location.strings.content &&
		location.strings.content[key]
	) {
		const { locationData, pathKey, name } = getCurrentLocationObj(location) 
		location.strings.content[key] = saveObj

		const translateChangeKey = changeList.findIndex((m: any) => m.pathKey === pathKey && m.section === 'translations')
		if(translateChangeKey === -1){
			changeList.push({
					section: 'translations',
					name: name,
					pathKey: pathKey,
					data: locationData
				})
		}
		return
	}
	if (location.regions) {
			for(const region of Object.keys(location.regions)){
			const regionObj = location.regions[region]
			if (JSON.stringify(regionObj).includes(key)) {
				recursiveFindAndReplace(key, saveObj, regionObj, changeList)
				break
			}
		}
	}
}

export const updateStrings = mutatorAction(
	'udpateStrings',
	(stringsList: any) => {
		if (stringsList) {
			const store = getAppStore()
			store.pendingChanges = true
			Object.keys(stringsList).forEach((stringId: string) => {
					for (const item of Object.keys(store.repoFileData)) {
						const location = store.repoFileData[item]
						if (JSON.stringify(location).includes(stringId)) {
							recursiveFindAndReplace(stringId, stringsList[stringId], location, store.pendingChangeList.modified)
							break
						}
					}
				})
			store.repoFileData = { ...store.repoFileData }
		}
	}
)

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { cloneDeep as clone } from 'lodash'
import { mutatorAction } from 'satcheljs'
import {
	getCurrentLocationObj,
	getLocationPhaseData,
} from '../selectors/locationSelectors'
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
			deleted: [],
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
				.filter((c: any) => c.commit.message.startsWith('Removed'))
				.map((c: any) => c.commit.message.replace('Removed ', ''))

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
				deleted: [],
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const updateRepoFileData = mutatorAction(
	'updateRepoFileData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			Object.keys(data).forEach((key) => {
				const pathArray = key.split('/')
				pathArray.splice(-1, 1)

				const currLocation = pathFind(store.repoFileData, pathArray)

				if (key.endsWith('info.json')) {
					currLocation.info.sha = data[key].content.sha
					currLocation.info.url = data[key].content.git_url
				}

				if (key.endsWith('vaccination.json')) {
					currLocation.vaccination.sha = data[key].content.sha
					currLocation.vaccination.url = data[key].content.git_url
				}

				if (key.endsWith('.csv')) {
					currLocation.strings.sha = data[key].content.sha
					currLocation.strings.url = data[key].content.git_url
				}
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const setLoadAllStringsData = mutatorAction(
	'setLoadAllStringsData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			for (const item of data) {
				const pathArray = item.path.split('/')
				pathArray.splice(-1, 1)

				const currLocation = pathFind(store.repoFileData, pathArray)

				if (!currLocation.strings.content) {
					currLocation.strings = item
				}
			}
			store.isDataRefreshing = false
		}
	}
)

export const setLocationData = mutatorAction(
	'setLocationData',
	(data: any, location: any) => {
		if (data) {
			const store = getAppStore()

			const currLocation = store.repoFileData[location.info.content.id]
			const initCurrLocation = store.initRepoFileData[location.info.content.id]

			currLocation.regions = { ...currLocation.regions, ...data }
			initCurrLocation.regions = { ...currLocation.regions, ...data }

			currLocation.dataLoaded = true
			initCurrLocation.dataLoaded = true
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
								id: currentLocation.info.content.id,
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
			name: data,
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
				data: newLocation,
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

const getRegionsRecursive = (location: any): any => {
	if (!location.regions) {
		return [{ ...location }]
	}

	let returnArr: any = [{ ...location }]
	for (const item of Object.keys(location.regions)) {
		if (item) {
			const region = location.regions[item]
			returnArr = returnArr.concat(getRegionsRecursive(region))
		}
	}
	return returnArr
}

export const deleteLocation = mutatorAction(
	'deleteLocation',
	(locationData: any) => {
		const store = getAppStore()
		store.pendingChanges = true

		const pathArray = locationData.value.info.path.split('/')
		pathArray.splice(-1, 1)

		const currentLocation = pathFind(store.repoFileData, pathArray)
		const regions: any = getRegionsRecursive(currentLocation)

		if (pathArray.length === 1) {
			delete store.repoFileData[locationData.key]
		} else {
			pathArray.splice(-1, 1)
			const parentRegion = pathFind(store.repoFileData, pathArray)
			delete parentRegion[locationData.key]
		}

		for (const region of regions) {
			const regionPathArray = region.info.path.split('/')
			regionPathArray.splice(-1, 1)
			store.pendingChangeList.deleted.push({
				section: 'location',
				name: regionPathArray.slice(-1)[0],
				pathKey: regionPathArray.join('.'),
				data: region,
			})
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
						[store.currentLanguage]: locationData.details,
					},
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
			const modifyKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === pathKey && m.section === 'location'
			)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'location',
					name: pathArray.slice(-1)[0],
					pathKey: pathKey,
					data: currLocation,
				})
			}

			const modifyRootKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === rootPath
			)

			if (modifyRootKeyIdx > -1) {
				store.pendingChangeList.modified[modifyRootKeyIdx].data = rootLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'location',
					name: rootPath,
					pathKey: rootPath,
					data: rootLocation,
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

const copyPhaseData = (currentLocation: any, phases: any) => {
	phases.forEach((phase: any) => {
		phase.qualifications.forEach((question: any) => {
			delete question.moreInfoText
			delete question.moreInfoTextSms
			delete question.moreInfoTextVoice
			delete question.moreInfoUrl
		})
	})

	currentLocation.vaccination.content.phases = phases
}

export const modifyMoreInfoText = mutatorAction(
	'modifyMoreInfoText',
	({
		currentLocation,
		phaseGroupId,
		qualifierId,
		moreInfoText,
		moreInfoTextSms,
		moreInfoTextVoice,
	}: any) => {
		if (currentLocation && phaseGroupId && qualifierId) {
			const store = getAppStore()
			store.pendingChanges = true

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)
			const isRootLocation = pathArray.length === 1

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			}

			if (!currentLocation.vaccination.content?.activePhase) {
				currentLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currentLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currentLocation.vaccination.content.phases[phaseGroupIndex]
					.qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === qualifierId
			)

			let calcInfoKey = `${qualifierId.replace('question', 'moreinfo')}`

			if (!isRootLocation) {
				const locationCode =
					currentLocation.info.content?.metadata?.code_alpha ||
					currentLocation.info.content.id
				calcInfoKey += `.${locationCode.toLowerCase()}.${phaseGroupId}`
			}

			if (!moreInfoText) {
				delete currentLocation.strings.content[calcInfoKey]
			} else {
				const newStringsObj: any = {}
				newStringsObj[store.currentLanguage] = moreInfoText
				currentLocation.strings.content[calcInfoKey] = newStringsObj

				phaseQualifiers[qualifierIdx].moreInfoText = calcInfoKey
			}

			const moreInfoSmsKey = calcInfoKey.replace('moreinfo', 'moreinfo.sms')
			if (!moreInfoTextSms) {
				delete currentLocation.strings.content[moreInfoSmsKey]
			} else {
				const newStringsObj: any = {}
				newStringsObj[store.currentLanguage] = moreInfoTextSms
				currentLocation.strings.content[moreInfoSmsKey] = newStringsObj

				phaseQualifiers[qualifierIdx].moreInfoTextSms = moreInfoSmsKey
			}

			const moreInfoVoiceKey = calcInfoKey.replace('moreinfo', 'moreinfo.voice')
			if (!moreInfoTextVoice) {
				delete currentLocation.strings.content[moreInfoVoiceKey]
			} else {
				const newStringsObj: any = {}
				newStringsObj[store.currentLanguage] = moreInfoTextVoice
				currentLocation.strings.content[moreInfoVoiceKey] = newStringsObj

				phaseQualifiers[qualifierIdx].moreInfoTextVoice = moreInfoVoiceKey
			}

			const pathKey = pathArray.join('.')
			const modifyKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === pathKey && m.section === 'qualifier'
			)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currentLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: currentLocation.info.content.id,
					pathKey: pathKey,
					data: currentLocation,
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

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			}

			if (!currentLocation.vaccination.content?.activePhase) {
				currentLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currentLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currentLocation.vaccination.content.phases[phaseGroupIndex]
					.qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === qualifierId
			)

			phaseQualifiers[qualifierIdx].moreInfoUrl = moreInfoUrl
			const pathKey = pathArray.join('.')
			const modifyKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === pathKey && m.section === 'qualifier'
			)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currentLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: currentLocation.info.content.id,
					pathKey: pathKey,
					data: currentLocation,
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

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const qualifierSmsKey = qualifierId.replace(
				'.question/',
				'.question.sms/'
			)
			const qualifierVoiceKey = qualifierId.replace(
				'.question/',
				'.question.voice/'
			)

			const rootStringsObj = store.repoFileData[pathArray[0]].strings.content
			const phaseQualiferObj: any = { question: qualifierId }

			if (rootStringsObj[qualifierSmsKey]) {
				phaseQualiferObj.questionSms = qualifierSmsKey
			}

			if (rootStringsObj[qualifierVoiceKey]) {
				phaseQualiferObj.questionVoice = qualifierVoiceKey
			}

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			}

			if (!currentLocation.vaccination.content?.activePhase) {
				currentLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currentLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)

			const phaseQualifiers =
				currentLocation.vaccination.content.phases[phaseGroupIndex]
					.qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === oldQualifierId
			)

			const oldQualifierObj = phaseQualifiers[qualifierIdx]

			if (oldQualifierObj.moreInfoText) {
				delete currentLocation.strings.content[oldQualifierObj.moreInfoText]
			}

			if (oldQualifierObj.moreInfoTextSms) {
				delete currentLocation.strings.content[oldQualifierObj.moreInfoTextSms]
			}

			if (oldQualifierObj.moreInfoTextVoice) {
				delete currentLocation.strings.content[
					oldQualifierObj.moreInfoTextVoice
				]
			}

			phaseQualifiers[qualifierIdx] = phaseQualiferObj

			const pathKey = pathArray.join('.')
			const modifyKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === pathKey && m.section === 'qualifier'
			)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currentLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: currentLocation.info.content.id,
					pathKey: pathKey,
					data: currentLocation,
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

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const qualifierSmsKey = qualifierId.replace(
				'.question/',
				'.question.sms/'
			)
			const qualifierVoiceKey = qualifierId.replace(
				'.question/',
				'.question.voice/'
			)

			const rootStringsObj = store.repoFileData[pathArray[0]].strings.content
			const phaseQualiferObj: any = { question: qualifierId }

			if (rootStringsObj[qualifierSmsKey]) {
				phaseQualiferObj.questionSms = qualifierSmsKey
			}

			if (rootStringsObj[qualifierVoiceKey]) {
				phaseQualiferObj.questionVoice = qualifierVoiceKey
			}

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			}

			if (!currentLocation.vaccination.content?.activePhase) {
				currentLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currentLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)
			const pathKey = pathArray.join('.')

			const phaseQualifiers =
				currentLocation.vaccination.content.phases[phaseGroupIndex]
					.qualifications
			phaseQualifiers.push(phaseQualiferObj)

			store.pendingChangeList.added.push({
				section: 'qualifier',
				name: currentLocation.info.content.id,
				pathKey: pathKey,
				data: currentLocation,
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

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			}

			if (!currentLocation.vaccination.content?.activePhase) {
				currentLocation.vaccination.content.activePhase = activePhase
			}

			const phaseGroupIndex = currentLocation.vaccination.content.phases.findIndex(
				(phase: any) => phase.id === phaseGroupId
			)
			const pathKey = pathArray.join('.')

			const phaseQualifiers =
				currentLocation.vaccination.content.phases[phaseGroupIndex]
					.qualifications
			const qualifierIdx = phaseQualifiers.findIndex(
				(pq: any) => pq.question === qualifierId
			)

			store.pendingChangeList.modified.push({
				section: 'qualifier',
				name: currentLocation.info.content.id,
				pathKey: pathKey,
				data: currentLocation,
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

			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const { phases } = getLocationPhaseData(currentLocation)

			const removeIndex = phases.findIndex((phase: any) => phase.id === phaseId)
			const name = phases[removeIndex].label || phases[removeIndex].id
			phases.splice(removeIndex, 1)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			} else {
				currentLocation.vaccination.content.phases = phases
			}

			if (currentLocation.vaccination.content.activePhase === phaseId) {
				delete currentLocation.vaccination.content.activePhase
			}

			store.pendingChangeList.modified.push({
				section: 'phase',
				name: name,
				pathKey: pathArray.join('.'),
				data: currentLocation,
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const updatePhase = mutatorAction(
	'updatePhase',
	(currentLocation: any, phaseId: string, phaseName: string) => {
		const store = getAppStore()
		store.pendingChanges = true

		const pathArray = currentLocation.info.path.split('/')
		pathArray.splice(-1, 1)

		const { phases, activePhase } = getLocationPhaseData(currentLocation)

		if (
			!currentLocation.vaccination.content?.phases ||
			currentLocation.vaccination.content?.phases.length === 0
		) {
			copyPhaseData(currentLocation, phases)
		} else {
			currentLocation.vaccination.content.phases = phases
		}

		if (!currentLocation.vaccination.content?.activePhase) {
			currentLocation.vaccination.content.activePhase = activePhase
		}

		const affectedPhase = currentLocation.vaccination.content.phases.find(
			(phase: any) => phase.id === phaseId
		)

		affectedPhase.label = phaseName

		const pathKey = pathArray.join('.')
		const modifyKeyIdx = store.pendingChangeList.modified.findIndex(
			(m: any) => m.pathKey === pathKey && m.section === 'phase'
		)

		if (modifyKeyIdx > -1) {
			store.pendingChangeList.modified[modifyKeyIdx].data = currentLocation
		} else {
			store.pendingChangeList.modified.push({
				section: 'phase',
				name: currentLocation.info.content.id,
				pathKey: pathKey,
				data: currentLocation,
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
			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const { phases, activePhase } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			} else {
				currentLocation.vaccination.content.phases = phases
			}

			if (!currentLocation.vaccination.content?.activePhase) {
				currentLocation.vaccination.content.activePhase = activePhase
			}

			currentLocation.vaccination.content.phases.push({
				id,
				label,
				qualifications: [],
			})

			const pathKey = pathArray.join('.')
			store.pendingChangeList.added.push({
				section: 'phase',
				name: label,
				pathKey: pathKey,
				data: currentLocation,
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
			const pathArray = currentLocation.info.path.split('/')
			pathArray.splice(-1, 1)

			const { phases } = getLocationPhaseData(currentLocation)

			if (
				!currentLocation.vaccination.content?.phases ||
				currentLocation.vaccination.content?.phases.length === 0
			) {
				copyPhaseData(currentLocation, phases)
			} else {
				currentLocation.vaccination.content.phases = phases
			}

			const phase = clone(
				currentLocation.vaccination.content.phases.find(
					(phase: any) => phase.id === phaseId
				)
			)

			const duplicatePhase = {
				...phase,
				id: formatId(name),
				label: name,
			}

			currentLocation.vaccination.content.phases.push(duplicatePhase)

			const pathKey = pathArray.join('.')
			store.pendingChangeList.added.push({
				section: 'phase',
				name: name,
				pathKey: pathKey,
				data: currentLocation,
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

			const { locationData: currLocation, pathKey } = getCurrentLocationObj(
				currentLocation
			)

			currLocation.vaccination.content.activePhase = phaseId

			const modifyKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === pathKey && m.section === 'phase'
			)

			if (modifyKeyIdx > -1) {
				store.pendingChangeList.modified[modifyKeyIdx].data = currLocation
			} else {
				store.pendingChangeList.modified.push({
					section: 'phase',
					name: phaseId,
					pathKey: pathKey,
					data: currLocation,
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

const deleteKeyRecursive = (key: string, dataSource: any, changeList: any) => {
	if (dataSource.regions) {
		for (const region in dataSource.regions) {
			const location = dataSource.regions[region]
			if (JSON.stringify(location)?.toLowerCase().includes(key)) {
				deleteKeyRecursive(key, location, changeList)
			}
		}
	}

	if (
		JSON.stringify(dataSource.vaccination.content)?.toLowerCase().includes(key)
	) {
		const pathArray = dataSource.info.path.split('/')
		pathArray.splice(-1, 1)

		dataSource.vaccination.content.phases.forEach((phase: any) => {
			if (JSON.stringify(phase)?.toLowerCase().includes(key)) {
				phase.qualifications.forEach((qualifier: any) => {
					Object.keys(qualifier).forEach((qualifierKey: string) => {
						if (qualifier[qualifierKey].toLowerCase() === key) {
							delete qualifier[qualifierKey]
						}
					})
				})
			}
		})

		changeList.push({
			section: 'phase',
			name: dataSource.info.content.id,
			pathKey: pathArray.join('.'),
			data: dataSource,
		})
	}
}

const addKeyRecursive = (
	key: string,
	dataSource: any,
	changeList: any,
	isSms = false,
	isVoice = false
) => {
	if (dataSource.regions) {
		for (const region in dataSource.regions) {
			const location = dataSource.regions[region]
			if (JSON.stringify(location)?.toLowerCase().includes(key)) {
				addKeyRecursive(key, location, changeList, isSms, isVoice)
			}
		}
	}

	if (
		JSON.stringify(dataSource.vaccination.content)?.toLowerCase().includes(key)
	) {
		const pathArray = dataSource.info.path.split('/')
		pathArray.splice(-1, 1)

		dataSource.vaccination.content.phases.forEach((phase: any) => {
			if (JSON.stringify(phase)?.toLowerCase().includes(key)) {
				phase.qualifications.forEach((qualifier: any) => {
					if (qualifier.question.toLowerCase() === key) {
						if (isSms && !qualifier.questionSms) {
							qualifier.questionSms = key.replace(
								'.question/',
								'.question.sms/'
							)
							changeList.push({
								section: 'phase',
								name: dataSource.info.content.id,
								pathKey: pathArray.join('.'),
								data: dataSource,
							})
						}

						if (isVoice && !qualifier.questionVoice) {
							qualifier.questionVoice = key.replace(
								'.question/',
								'.question.voice/'
							)
							changeList.push({
								section: 'phase',
								name: dataSource.info.content.id,
								pathKey: pathArray.join('.'),
								data: dataSource,
							})
						}
					}
				})
			}
		})
	}
}

export const updateRootLocationQualifiers = mutatorAction(
	'updateRootLocationQualifiers',
	({ rootLocationKey, newQualifier }: any | undefined) => {
		if (rootLocationKey && newQualifier) {
			const store = getAppStore()
			store.pendingChanges = true
			const stringsObj = store.repoFileData[rootLocationKey].strings.content

			let qualifierKey = ''
			let qualifierSmsKey = ''
			let qualifierVoiceKey = ''

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

				qualifierSmsKey = qualifierKey.replace('.question/', '.question.sms/')
				qualifierVoiceKey = qualifierKey.replace(
					'.question/',
					'.question.voice/'
				)
			} else {
				qualifierKey = newQualifier.key
				qualifierSmsKey = newQualifier.key.replace(
					'.question/',
					'.question.sms/'
				)
				qualifierVoiceKey = newQualifier.key.replace(
					'.question/',
					'.question.voice/'
				)
			}

			stringsObj[qualifierKey] = {
				...stringsObj[qualifierKey],
				[store.currentLanguage]: newQualifier.qualifier,
			}

			if (!newQualifier.qualifierSms && !newQualifier.isNew) {
				deleteKeyRecursive(
					qualifierSmsKey,
					store.repoFileData[rootLocationKey],
					store.pendingChangeList.modified
				)
				delete stringsObj[qualifierSmsKey]
			} else if (newQualifier.qualifierSms) {
				addKeyRecursive(
					qualifierKey,
					store.repoFileData[rootLocationKey],
					store.pendingChangeList.modified,
					true,
					false
				)
				stringsObj[qualifierSmsKey] = {
					...stringsObj[qualifierSmsKey],
					[store.currentLanguage]: newQualifier.qualifierSms,
				}
			}

			if (!newQualifier.qualifierVoice && !newQualifier.isNew) {
				deleteKeyRecursive(
					qualifierVoiceKey,
					store.repoFileData[rootLocationKey],
					store.pendingChangeList.modified
				)
				delete stringsObj[qualifierVoiceKey]
			} else if (newQualifier.qualifierVoice) {
				addKeyRecursive(
					qualifierKey,
					store.repoFileData[rootLocationKey],
					store.pendingChangeList.modified,
					false,
					true
				)
				stringsObj[qualifierVoiceKey] = {
					...stringsObj[qualifierVoiceKey],
					[store.currentLanguage]: newQualifier.qualifierVoice,
				}
			}

			const modifyRootKeyIdx = store.pendingChangeList.modified.findIndex(
				(m: any) => m.pathKey === rootLocationKey
			)

			if (modifyRootKeyIdx > -1) {
				store.pendingChangeList.modified[modifyRootKeyIdx].data =
					store.repoFileData[rootLocationKey]
			} else {
				store.pendingChangeList.modified.push({
					section: 'qualifier',
					name: rootLocationKey,
					pathKey: rootLocationKey,
					data: store.repoFileData[rootLocationKey],
				})
			}

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

const recursiveFindAndReplace = (
	key: string,
	saveObj: any,
	location: any,
	changeList: any
) => {
	if (
		location.strings &&
		location.strings.content &&
		location.strings.content[key]
	) {
		const { locationData, pathKey, name } = getCurrentLocationObj(location)
		location.strings.content[key] = saveObj

		const translateChangeKey = changeList.findIndex(
			(m: any) => m.pathKey === pathKey && m.section === 'translations'
		)
		if (translateChangeKey === -1) {
			changeList.push({
				section: 'translations',
				name: name,
				pathKey: pathKey,
				data: locationData,
			})
		}
		return
	}
	if (location.regions) {
		for (const region of Object.keys(location.regions)) {
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
						recursiveFindAndReplace(
							stringId,
							stringsList[stringId],
							location,
							store.pendingChangeList.modified
						)
						break
					}
				}
			})
			store.repoFileData = { ...store.repoFileData }
		}
	}
)

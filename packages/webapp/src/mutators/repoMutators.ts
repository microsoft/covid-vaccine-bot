/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { toJS } from 'mobx'
import { mutatorAction } from 'satcheljs'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { createLocationDataObj, compare } from '../utils/dataUtils'
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
			store.repoFileData = data[0]
			store.globalFileData = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
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
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			debugger
			//store.locationsData = data[0]
			// const locObj = Object.keys(data).reduce((a, k) => {
			// 	return {
			// 		...a,
			// 		[k]: {
			// 			info: data[k].info
			// 		}
			// 	}
			// }, {})

			//console.log(data, store.locationsData)
		}
	}
)

export const setInitLocationsData = mutatorAction(
	'setInitLocationsData',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			debugger
			store.locationsData = data
			// const locObj = Object.keys(data).reduce((a, k) => {
			// 	return {
			// 		...a,
			// 		[k]: {
			// 			info: data[k].info
			// 		}
			// 	}
			// }, {})

			console.log(data, store.locationsData)
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
					...store.globalFileData.cdcStateNames.content[
						`cdc/${newLocObj.info.content.id}/state_name`
					],
					[store.currentLanguage]: locationData.details,
				}

				newLocObj.strings.path = `${newLocObj.info.content.id}/${newLocObj.info.content.id}.csv`

				if ('noPhaseLabel' in newLocObj.vaccination.content) {
					newLocObj.vaccination.content.noPhaseLabel = locationData.noPhaseLabel
				} else {
					newLocObj.vaccination.content = {
						...newLocObj.vaccination.content,
						noPhaseLabel: locationData.noPhaseLabel,
					}
				}

				const stringsContentObj: any = {}
				if (locationData.schedulingPhone !== '') {
					const schedulingPhoneKey: string = `c19.link/scheduling.phone.${newLocObj.info.content.id}`.toLowerCase()

					stringsContentObj[schedulingPhoneKey] = {
						...stringsContentObj[schedulingPhoneKey],
						[store.currentLanguage]: locationData.schedulingPhone,
					}
					newLocObj.vaccination.content.links.scheduling_phone.text = schedulingPhoneKey
				}

				if (locationData.schedulingPhoneDesc !== '') {
					const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${newLocObj.info.content.id}`.toLowerCase()

					stringsContentObj[schedulingPhoneDescKey] = {
						...stringsContentObj[schedulingPhoneDescKey],
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

				if ('noPhaseLabel' in newLocObj.vaccination.content) {
					newLocObj.vaccination.content.noPhaseLabel = locationData.noPhaseLabel
				} else {
					newLocObj.vaccination.content = {
						...newLocObj.vaccination.content,
						noPhaseLabel: locationData.noPhaseLabel,
					}
				}

				if (locationData.info !== '') {
					newLocObj.vaccination.content.links.info.text = `cdc/${location.info.content.id}/state_link` //`c19.link/info.${newLocObj.info.content.id}`.toLowerCase()
				}

				if (locationData.schedulingPhone !== '') {
					const schedulingPhoneKey: string = `c19.link/scheduling.phone.${location.info.content.metadata.code_alpha}.${newLocObj.info.content.id}`.toLowerCase()

					location.strings.content[schedulingPhoneKey] = {
						...location.strings.content[schedulingPhoneKey],
						[store.currentLanguage]: locationData.schedulingPhone,
					}
					newLocObj.vaccination.content.links.scheduling_phone.text = schedulingPhoneKey
				}

				if (locationData.schedulingPhoneDesc !== '') {
					const schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${location.info.content.metadata.code_alpha}.${newLocObj.info.content.id}`.toLowerCase()

					location.strings.content[schedulingPhoneDescKey] = {
						...location.strings.content[schedulingPhoneDescKey],
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

export const deleteLocation = mutatorAction(
	'deleteLocation',
	(locationData: any, isRegion?: boolean, selectedState?: any) => {
		const store = getAppStore()
		store.pendingChanges = true

		if (isRegion && selectedState) {
			delete store.repoFileData[selectedState.key]?.regions?.[locationData.key]
			// What else needs to be removed here?
			// Does something need to be saved?
		} else {
			delete store.repoFileData[locationData.key]
			delete store.globalFileData.cdcStateLinks.content[
				`cdc/${locationData.key}/state_link`
			]
			delete store.globalFileData.cdcStateNames.content[
				`cdc/${locationData.key}/state_name`
			]
		}

		store.repoFileData = { ...store.repoFileData }
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
					...store.globalFileData.cdcStateNames.content[
						`cdc/${prevItem.key}/state_name`
					],
					[store.currentLanguage]: locationData.details,
				}

				location.info.content.name = locationData.details
				const schedulingPhoneKey = `c19.link/scheduling.phone.${prevItem.value.info.content.metadata.code_alpha}`.toLowerCase()

				if ('noPhaseLabel' in location.vaccination.content) {
					location.vaccination.content.noPhaseLabel = locationData.noPhaseLabel
				} else {
					location.vaccination.content = {
						...location.vaccination.content,
						noPhaseLabel: locationData.noPhaseLabel,
					}
				}

				if (locationData?.eligibility !== '') {
					if (location.vaccination.content.links.eligibility) {
						if (
							location.vaccination.content.links.eligibility.url.toLowerCase() !==
							locationData.eligibility.toLowerCase()
						) {
							location.vaccination.content.links.eligibility = {
								url: locationData.eligibility,
							}
						}
					} else {
						location.vaccination.content.links.eligibility = {
							url: locationData.eligibility,
						}
					}
				} else {
					delete location.vaccination.content.links.eligibility
				}

				if (locationData?.eligibilityPlan !== '') {
					if (location.vaccination.content.links.eligibility_plan) {
						if (
							location.vaccination.content.links.eligibility_plan.url.toLowerCase() !==
							locationData.eligibilityPlan.toLowerCase()
						) {
							location.vaccination.content.links.eligibility_plan = {
								url: locationData.eligibilityPlan,
							}
						}
					} else {
						location.vaccination.content.links.eligibility_plan = {
							url: locationData.eligibilityPlan,
						}
					}
				} else {
					delete location.vaccination.content.links.eligibility_plan
				}

				if (locationData?.info !== '') {
					if (location.vaccination.content.links.info) {
						if (
							location.vaccination.content.links.info.url.toLowerCase() !==
							locationData.info.toLowerCase()
						) {
							location.vaccination.content.links.info = {
								url: locationData.info,
								text: `cdc/${prevItem.key}/state_link`,
							}
						}
					} else {
						location.vaccination.content.links.info = {
							url: locationData.info,
							text: `cdc/${prevItem.key}/state_link`,
						}
					}
				} else {
					delete location.vaccination.content.links.info
				}

				if (locationData?.providers !== '') {
					if (location.vaccination.content.links.providers) {
						if (
							location.vaccination.content.links.providers.url.toLowerCase() !==
							locationData.providers.toLowerCase()
						) {
							location.vaccination.content.links.providers = {
								url: locationData.providers,
								text: 'c19.links/vax_providers',
							}
						}
					} else {
						location.vaccination.content.links.providers = {
							url: locationData.providers,
							text: 'c19.links/vax_providers',
						}
					}
				} else {
					delete location.vaccination.content.links.providers
				}

				if (locationData?.workflow !== '') {
					if (location.vaccination.content.links.workflow) {
						if (
							location.vaccination.content.links.workflow.url.toLowerCase() !==
							locationData.workflow.toLowerCase()
						) {
							location.vaccination.content.links.workflow = {
								url: locationData.workflow,
								text: 'c19.links/vax_quiz',
							}
						}
					} else {
						location.vaccination.content.links.workflow = {
							url: locationData.workflow,
							text: 'c19.links/vax_quiz',
						}
					}
				} else {
					delete location.vaccination.content.links.workflow
				}

				if (locationData?.scheduling !== '') {
					if (location.vaccination.content.links.scheduling) {
						if (
							location.vaccination.content.links.scheduling.url.toLowerCase() !==
							locationData.scheduling.toLowerCase()
						) {
							location.vaccination.content.links.scheduling = {
								url: locationData.scheduling,
								text: 'c19.links/schedule_vax',
							}
						}
					} else {
						location.vaccination.content.links.scheduling = {
							url: locationData.scheduling,
							text: 'c19.links/schedule_vax',
						}
					}
				} else {
					delete location.vaccination.content.links.scheduling
				}

				if (locationData?.schedulingPhone !== '') {
					location.strings.content[schedulingPhoneKey] = {
						...location.strings.content[schedulingPhoneKey],
						[store.currentLanguage]: locationData.schedulingPhone,
					}
					if (location.vaccination.content.links.scheduling_phone) {
						if (
							location.vaccination.content.links.scheduling_phone.url.toLowerCase() !==
							`tel:${locationData.schedulingPhone}`.toLowerCase()
						) {
							location.vaccination.content.links.scheduling_phone = {
								url: `tel:${locationData.schedulingPhone}`,
								text: schedulingPhoneKey,
							}
						}
					} else {
						location.vaccination.content.links.scheduling_phone = {
							url: `tel:${locationData.schedulingPhone}`,
							text: schedulingPhoneKey,
						}
					}
				}

				if (
					location.vaccination.content.links.scheduling_phone &&
					locationData.schedulingPhoneDesc !== ''
				) {
					let schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${prevItem.value.info.content.metadata.code_alpha}`.toLowerCase()

					if (
						prevItem.value.vaccination.content.links.scheduling_phone
							.description
					) {
						schedulingPhoneDescKey =
							prevItem.value.vaccination.content.links.scheduling_phone
								.description
					}
					location.strings.content[schedulingPhoneDescKey] = {
						...location.strings.content[schedulingPhoneDescKey],
						[store.currentLanguage]: locationData.schedulingPhoneDesc,
					}

					location.vaccination.content.links.scheduling_phone.description = schedulingPhoneDescKey
				}
			} else {
				const location = store.repoFileData[selectedState.key]
				const regionObj = location.regions[prevItem.key]
				regionObj.info.content.name = locationData.details

				if ('noPhaseLabel' in regionObj.vaccination.content) {
					regionObj.vaccination.content.noPhaseLabel = locationData.noPhaseLabel
				} else {
					regionObj.vaccination.content = {
						...regionObj.vaccination.content,
						noPhaseLabel: locationData.noPhaseLabel,
					}
				}

				const schedulingPhoneKey = `c19.link/scheduling.phone.${location.info.content.metadata.code_alpha}.${regionObj.info.content.id}`.toLowerCase()
				if (locationData?.schedulingPhone !== '') {
					location.strings.content[schedulingPhoneKey] = {
						[store.currentLanguage]: locationData.schedulingPhone,
					}
				}

				if (locationData?.eligibility !== '') {
					if (regionObj.vaccination.content.links.eligibility) {
						if (
							regionObj.vaccination.content.links.eligibility.url.toLowerCase() !==
							locationData.eligibility.toLowerCase()
						) {
							regionObj.vaccination.content.links.eligibility = {
								url: locationData.eligibility,
							}
						}
					} else {
						regionObj.vaccination.content.links.eligibility = {
							url: locationData.eligibility,
						}
					}
				} else {
					delete regionObj.vaccination.content.links.eligibility
				}

				if (locationData?.eligibilityPlan !== '') {
					if (regionObj.vaccination.content.links.eligibility_plan) {
						if (
							regionObj.vaccination.content.links.eligibility_plan.url.toLowerCase() !==
							locationData.eligibilityPlan.toLowerCase()
						) {
							regionObj.vaccination.content.links.eligibility_plan = {
								url: locationData.eligibilityPlan,
							}
						}
					} else {
						regionObj.vaccination.content.links.eligibility_plan = {
							url: locationData.eligibilityPlan,
						}
					}
				} else {
					delete regionObj.vaccination.content.links.eligibility_plan
				}

				if (locationData?.info !== '') {
					if (regionObj.vaccination.content.links.info) {
						if (
							regionObj.vaccination.content.links.info.url.toLowerCase() !==
							locationData.info.toLowerCase()
						) {
							regionObj.vaccination.content.links.info = {
								url: locationData.info,
								text: `cdc/${location.info.content.id}/state_link`,
							}
						}
					} else {
						regionObj.vaccination.content.links.info = {
							url: locationData.info,
							text: `cdc/${location.info.content.id}/state_link`,
						}
					}
				} else {
					delete regionObj.vaccination.content.links.info
				}

				if (locationData?.providers !== '') {
					if (regionObj.vaccination.content.links.providers) {
						if (
							regionObj.vaccination.content.links.providers.url.toLowerCase() !==
							locationData.providers.toLowerCase()
						) {
							regionObj.vaccination.content.links.providers = {
								url: locationData.providers,
								text: 'c19.links/vax_providers',
							}
						}
					} else {
						regionObj.vaccination.content.links.providers = {
							url: locationData.providers,
							text: 'c19.links/vax_providers',
						}
					}
				} else {
					delete regionObj.vaccination.content.links.providers
				}

				if (locationData?.workflow !== '') {
					if (regionObj.vaccination.content.links.workflow) {
						if (
							regionObj.vaccination.content.links.workflow.url.toLowerCase() !==
							locationData.workflow.toLowerCase()
						) {
							regionObj.vaccination.content.links.workflow = {
								url: locationData.workflow,
								text: 'c19.links/vax_quiz',
							}
						}
					} else {
						regionObj.vaccination.content.links.workflow = {
							url: locationData.workflow,
							text: 'c19.links/vax_quiz',
						}
					}
				} else {
					delete regionObj.vaccination.content.links.workflow
				}

				if (locationData?.scheduling !== '') {
					if (regionObj.vaccination.content.links.scheduling) {
						if (
							regionObj.vaccination.content.links.scheduling.url.toLowerCase() !==
							locationData.scheduling.toLowerCase()
						) {
							regionObj.vaccination.content.links.scheduling = {
								url: locationData.scheduling,
								text: 'c19.links/schedule_vax',
							}
						}
					} else {
						regionObj.vaccination.content.links.scheduling = {
							url: locationData.scheduling,
							text: 'c19.links/schedule_vax',
						}
					}
				} else {
					delete regionObj.vaccination.content.links.scheduling
				}

				if (locationData?.schedulingPhone !== '') {
					location.strings.content[schedulingPhoneKey] = {
						...location.strings.content[schedulingPhoneKey],
						[store.currentLanguage]: locationData.schedulingPhone,
					}
					if (regionObj.vaccination.content.links.scheduling_phone) {
						if (
							regionObj.vaccination.content.links.scheduling_phone.url.toLowerCase() !==
							`tel:${locationData.schedulingPhone}`.toLowerCase()
						) {
							regionObj.vaccination.content.links.scheduling_phone = {
								url: `tel:${locationData.schedulingPhone}`,
								text: schedulingPhoneKey,
							}
						}
					} else {
						regionObj.vaccination.content.links.scheduling_phone = {
							url: `tel:${locationData.schedulingPhone}`,
							text: schedulingPhoneKey,
						}
					}
				}

				if (
					regionObj.vaccination.content.links.scheduling_phone &&
					locationData.schedulingPhoneDesc !== ''
				) {
					let schedulingPhoneDescKey = `c19.link/scheduling.phone.description.${location.info.content.metadata.code_alpha}.${regionObj.info.content.id}`.toLowerCase()

					if (
						prevItem.value.vaccination.content.links.scheduling_phone
							.description
					) {
						schedulingPhoneDescKey =
							prevItem.value.vaccination.content.links.scheduling_phone
								.description
					}
					location.strings.content[schedulingPhoneDescKey] = {
						...location.strings.content[schedulingPhoneDescKey],
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

export const addPhase = mutatorAction('addPhase', (data: any | undefined) => {
	if (data) {
		const store = getAppStore()
		if (store?.repoFileData) {
			store.pendingChanges = true
			const location = store.repoFileData[data.locationKey]

			const phaseId = formatId(data.item.name)

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
					.replace(` (${t('LocationsRegions.active')})`, '')
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

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { isEqual } from 'lodash'
import { getAppStore } from '../store/store'

export const getChanges = () => {
    const state = getAppStore()
    const changesList: any[] = []
    const locationUpdates: any[] = []
    const globalUpdates: any[] = []
    const {globalFileData, repoFileData} = state

    if (!isEqual(state.initGlobalFileData.customStrings, globalFileData.customStrings)) {
        changesList.push({
            label: `Global strings information updated`,
            value: globalFileData.customStrings,
        })
        globalUpdates.push(globalFileData.customStrings)
    }

    if (!isEqual(state.initGlobalFileData.cdcStateNames, globalFileData.cdcStateNames)) {
        changesList.push({
            label: `State names information updated`,
            value: globalFileData.cdcStateNames,
        })
        globalUpdates.push(globalFileData.cdcStateNames)
    }

    if (!isEqual(state.initGlobalFileData.cdcStateLinks, globalFileData.cdcStateLinks)) {
        changesList.push({
            label: `State links information updated`,
            value: globalFileData.cdcStateLinks,
        })
        globalUpdates.push(globalFileData.cdcStateLinks)
    }

    Object.keys(repoFileData).forEach((location: any) => {
        if (state.initRepoFileData) {
            if (!state.initRepoFileData[location]) {
                changesList.push({
                    label: `New location added - ${location}`,
                    value: repoFileData[location],
                })
                locationUpdates.push({
                    key: location,
                    data: repoFileData[location],
                })
            } else {
                let addChanges = false
                if (!isEqual(state.initRepoFileData[location].info, repoFileData[location].info)) {
                    changesList.push({
                        label: `Updated information for ${location}`,
                        value: repoFileData[location],
                    })
                    addChanges = true
                }
                if (
                    repoFileData[location].regions &&
                    !isEqual(state.initRepoFileData[location].regions, repoFileData[location].regions)
                ) {
                    changesList.push({
                        label: `Updated regions for ${location}`,
                        value: repoFileData[location],
                    })
                    addChanges = true
                }
                if (!isEqual(state.initRepoFileData[location].vaccination, repoFileData[location].vaccination)) {
                    changesList.push({
                        label: `Updated phase information for ${location}`,
                        value: repoFileData[location],
                    })
                    addChanges = true
                }
                if (!isEqual(state.initRepoFileData[location].strings,repoFileData[location].strings )) {
                    changesList.push({
                        label: `Updated strings information for ${location}`,
                        value: repoFileData[location],
                    })
                    addChanges = true
                }
                if (addChanges) {
                    locationUpdates.push({
                        key: location,
                        data: repoFileData[location],
                    })
                }
            }
        }
    })

    return {globalUpdates, locationUpdates, changesList}
}

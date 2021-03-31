/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'

export const getChanges = () => {
    const state = getAppStore()
    const changesList: any[] = []
    const locationUpdates: any[] = []
    const globalUpdates: any[] = []

    if (
        JSON.stringify(state.initGlobalFileData.customStrings).toLowerCase() !==
        JSON.stringify(state.globalFileData.customStrings).toLowerCase()
    ) {
        changesList.push({
            label: `Global strings information updated`,
            value: state.globalFileData.customStrings,
        })
        globalUpdates.push(state.globalFileData.customStrings)
    }

    if (
        JSON.stringify(state.initGlobalFileData.cdcStateNames).toLowerCase() !==
        JSON.stringify(state.globalFileData.cdcStateNames).toLowerCase()
    ) {
        changesList.push({
            label: `State names information updated`,
            value: state.globalFileData.cdcStateNames,
        })
        globalUpdates.push(state.globalFileData.cdcStateNames)
    }

    if (
        JSON.stringify(state.initGlobalFileData.cdcStateLinks).toLowerCase() !==
        JSON.stringify(state.globalFileData.cdcStateLinks).toLowerCase()
    ) {
        changesList.push({
            label: `State links information updated`,
            value: state.globalFileData.cdcStateLinks,
        })
        globalUpdates.push(state.globalFileData.cdcStateLinks)
    }

    Object.keys(state.repoFileData).forEach((location: any) => {
        if (state.initRepoFileData) {
            if (!state.initRepoFileData[location]) {
                changesList.push({
                    label: `New location added - ${location}`,
                    value: state.repoFileData[location],
                })
                locationUpdates.push({
                    key: location,
                    data: state.repoFileData[location],
                })
            } else {
                let addChanges = false
                if (
                    JSON.stringify(
                        state.initRepoFileData[location].info
                    ).toLowerCase() !==
                    JSON.stringify(state.repoFileData[location].info).toLowerCase()
                ) {
                    changesList.push({
                        label: `Updated information for ${location}`,
                        value: state.repoFileData[location],
                    })
                    addChanges = true
                }
                if (
                    state.repoFileData[location].regions &&
                    JSON.stringify(
                        state.initRepoFileData[location].regions
                    )?.toLowerCase() !==
                        JSON.stringify(
                            state.repoFileData[location].regions
                        ).toLowerCase()
                ) {
                    changesList.push({
                        label: `Updated regions for ${location}`,
                        value: state.repoFileData[location],
                    })
                    addChanges = true
                }
                if (
                    JSON.stringify(
                        state.initRepoFileData[location].vaccination
                    ).toLowerCase() !==
                    JSON.stringify(
                        state.repoFileData[location].vaccination
                    ).toLowerCase()
                ) {
                    changesList.push({
                        label: `Updated phase information for ${location}`,
                        value: state.repoFileData[location],
                    })
                    addChanges = true
                }
                if (
                    JSON.stringify(
                        state.initRepoFileData[location].strings
                    ).toLowerCase() !==
                    JSON.stringify(state.repoFileData[location].strings).toLowerCase()
                ) {
                    changesList.push({
                        label: `Updated strings information for ${location}`,
                        value: state.repoFileData[location],
                    })
                    addChanges = true
                }
                if (addChanges) {
                    locationUpdates.push({
                        key: location,
                        data: state.repoFileData[location],
                    })
                }
            }
        }
    })

    return {globalUpdates, locationUpdates, changesList}
}

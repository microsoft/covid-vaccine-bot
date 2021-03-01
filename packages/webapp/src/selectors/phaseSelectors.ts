/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'

export const getPhaseQualifierItems = (selectedState?: any) => {
    return getCustomStrings(selectedState, 'eligibility.question')
}

export const getPhaseQualifierItemsByKey = (selectedState?: any, selectedKey?: any) => {
    return getPhaseQualifierItems(selectedState).filter(qualifier => qualifier.key.includes(selectedKey))
}

export const getPhaseTagItems = (selectedState?: any) => {
    const phaseQualifiers = getPhaseQualifierItems(selectedState);

    const tagKeys: any[] = []
    const tagList: any[] = []
    phaseQualifiers.forEach(qualifier => {
        const baseKey = qualifier.key.split('/')
        const tagKey = baseKey[1].split('.')[0];

        if (!tagKeys.includes(tagKey)) {
            tagKeys.push(tagKey)
            tagList.push({
                key: tagKey,
                text: toProperCase(tagKey)
            })
        }
    })

    return tagList.sort((a,b) => (a.text > b.text) ? 1 : -1)
}

export const getPhaseMoreInfoItems = (selectedState?: any) => {
    return getCustomStrings(selectedState, 'eligibility.moreinfo')
}

export const getPhaseMoreInfoTextByKey = (selectedState?: any, selectedKey?: any) => {
    if (selectedKey) {
        const res = getExactCustomStrings(selectedState, selectedKey)
        if (res.length > 0) {
            return res[0].text
        }
    }

    return ''
}
export const getPhaseMoreInfoUrl = (isRegion:boolean, rowItems:any) => {
        if(isRegion){
        const regionPhases = rowItems.item.location.value.vaccination.content.phases
        const currPhase = regionPhases?.find((phase: { id: any }) => phase.id === rowItems.item.groupId)
        if (currPhase){
            const currQualification = currPhase?.qualifications.find((qualification: { question: any }) => qualification.question === rowItems.item.qualifierId)
            if (currQualification) {
                return currQualification.moreInfoUrl 
            }
        }
        }
        return rowItems.item.moreInfoUrl
    }
const getCustomStrings = (selectedState?: any, keyFilter?: string) => {
    const { globalFileData, currentLanguage } = getAppStore();
    const qualifierList: any[] = selectedState
        ? [...Object.entries(selectedState.value?.strings?.content ?? {}), ...Object.entries(globalFileData.customStrings.content)]
        : [...Object.entries(globalFileData.customStrings.content)]

    const filteredList = keyFilter ? qualifierList.filter(([key, _value]:[string, any]) => key.includes(keyFilter)) : qualifierList
    return filteredList
        .map(([key, value]:[string, any]) => {
            return {
                key: key,
                text: value[currentLanguage]
            }
        })
        .sort((a,b) => (a.text > b.text) ? 1 : -1)
}

const getExactCustomStrings = (selectedState?: any, keyFilter?: string) => {
    const { globalFileData, currentLanguage } = getAppStore();
    const qualifierList: any[] = selectedState
        ? [...Object.entries(selectedState.value?.strings?.content ?? {}), ...Object.entries(globalFileData.customStrings.content)]
        : [...Object.entries(globalFileData.customStrings.content)]

    const filteredList = keyFilter ? qualifierList.filter(([key, _value]:[string, any]) => key.toLowerCase() === keyFilter) : qualifierList
    return filteredList
        .map(([key, value]:[string, any]) => {
            return {
                key: key,
                text: value[currentLanguage]
            }
        })
        .sort((a,b) => (a.text > b.text) ? 1 : -1)
}
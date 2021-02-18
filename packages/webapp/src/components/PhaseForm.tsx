/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { IconButton, Dropdown, DirectionalHint, TextField, IDetailsRowProps } from '@fluentui/react'
import { getAppStore } from '../store/store'
import { useCallback, useEffect, useState } from 'react'
import { toProperCase } from '../utils/textUtils'

import './PhaseForm.scss'
export interface PhaseFormProps {
    selectedState: any
    rowItems: IDetailsRowProps
}

export default observer(function PhaseForm(props: PhaseFormProps) {
    const { globalFileData, currentLanguage } = getAppStore();
    const { selectedState , rowItems } = props;
    const [ phaseTagItems, setPhaseTagItems] = useState<any[]>([])
    const [ phaseQualifierItems, setPhaseQualifierItems] = useState<any[]>([])
    const [ moreInfoText, setMoreInfoText ] = useState<string>()

    useEffect(() => {
        // state tags first, then global. check if region must be check before state and global.
        const tempTagKeyList: any[] = [];
        const tempTags: any[] = [];
        if (selectedState?.value) {
            const phases = selectedState.value.vaccination.content.phases as Array<any>;
            phases.forEach(phase => {
                phase.qualifications.forEach((qualification: any) => {
                    let baseQuestionKeys = qualification.question.split('/')
                    let tagKey = baseQuestionKeys[1].split('.')[0];
                    let questionKey = `${baseQuestionKeys[0]}/${tagKey}`

                    if (!tempTagKeyList.includes(tagKey)) {
                        tempTagKeyList.push(tagKey);
                        tempTags.push({
                            key: tagKey,
                            text: toProperCase(tagKey),
                            questionKey: questionKey
                        })
                    }
                })
            })
        }

        if (globalFileData?.customStrings) {
            const questionKeys = Object.keys(globalFileData.customStrings.content).filter((k) =>
				k.includes('eligibility.question')
			)

            questionKeys.forEach(qualification => {
                let baseQuestionKeys = qualification.split('/')
                let tagKey = baseQuestionKeys[1].split('.')[0];
                let questionKey = `${baseQuestionKeys[0]}/${tagKey}`

                if (!tempTagKeyList.includes(tagKey)) {
                    tempTagKeyList.push(tagKey);
                    tempTags.push({
                        key: tagKey,
                        text: `${toProperCase(tagKey)} (global)`,
                        questionKey: questionKey
                    })
                }
            })
        }
        setPhaseTagItems(tempTags.sort((a, b) => (a.key > b.key) ? 1 : -1));

    },[globalFileData, selectedState, rowItems])

    const onTagChange = useCallback((_event, option) => {
        // TODO: need to filter between health and healthcare
        const { questionKey, key:tagKey } = option;
        const tempQualifierList: any[] = []
        if (questionKey) {
            // add state level qualifiers
            Object.entries(selectedState.value.strings.content).forEach(([key, value]:[string, any]) => {
                let baseQuestionKeys = key.split('/')
                let qKey = baseQuestionKeys[1].split('.')[0];
                console.log(qKey, tagKey)
                if(qKey == tagKey) {
                    tempQualifierList.push({
                        key: key,
                        text: value[currentLanguage]
                    })
                }
            })

            // add global qualifiers
            Object.entries(globalFileData.customStrings.content).filter(([key, value]: [string, any]) => {
                let baseQuestionKeys = key.split('/')
                let qKey = baseQuestionKeys[1].split('.')[0];
                console.log(qKey, tagKey)
                if(qKey == tagKey) {
                    tempQualifierList.push({
                        key: key,
                        text: value[currentLanguage]
                    })
                }
            })
            setPhaseQualifierItems(tempQualifierList)
            setMoreInfoText('')
        }
    },[globalFileData, selectedState, currentLanguage])

    const onQualifierChange = useCallback((_event, option) => {
        //TODO: refactor/check if moreinfo should still be in array
        const moreInfoKey = option.key.replace('question', 'moreinfo')
        const tempMoreInfoList: any[] = []
        if (moreInfoKey) {
            Object.entries(selectedState.value.strings.content).forEach(([key, value]:[string, any]) => {
                if(key.startsWith(moreInfoKey)) {
                    tempMoreInfoList.push({
                        key: key,
                        text: value[currentLanguage]
                    })
                }
            })

            Object.entries(globalFileData.customStrings.content).filter(([key, value]: [string, any]) => {
                if(key.startsWith(moreInfoKey)) {
                    tempMoreInfoList.push({
                        key: key,
                        text: value[currentLanguage]
                    })
                }
            })
            if (tempMoreInfoList.length > 0){
                setMoreInfoText(tempMoreInfoList[0].text)
            }
        }
    },[globalFileData, selectedState, currentLanguage])

	return (
        <div className='phaseDetailRow'>
            <div className='mainRow'>
                <Dropdown
                    options={phaseTagItems}
                    placeholder='Tag'
                    className='tagDropdown'
                    styles={{root: {minWidth: 250}}}
                    onChange={onTagChange}
                />
                <Dropdown
                    options={phaseQualifierItems}
                    placeholder='Qualifier'
                    styles={{root: {width: '100%', minWidth: 0}}}
                    onChange={onQualifierChange}
                />
                <IconButton
                    iconProps={{iconName: 'MoreVertical'}}
                    styles={{menuIcon: {visibility: 'hidden', width: 0, margin: 0}}}
                    menuProps={{
                        isBeakVisible: false,
                        directionalHint: DirectionalHint.rightTopEdge,
                        items: [
                            {
                                key: 'removeRow',
                                text: 'Remove'
                            },
                            {
                                key: 'details',
                                text: 'Details'
                            }
                        ]
                    }}
                    title='More'
                    aria-label='More'
                />
            </div>
            <div className='detailsRow'>
                <TextField
                    placeholder='More info text'
                    multiline={true}
                    autoAdjustHeight={true}
                    resizable={false}
                    styles={{root: {width: 'calc(100% - 32px)', padding: '5px 0'}}}
                    defaultValue={moreInfoText}
                />
                <TextField
                    placeholder='More info url'
                    styles={{root: {width: 'calc(100% - 32px)', padding: '5px 0'}}}
                />
            </div>
        </div>
	)
})
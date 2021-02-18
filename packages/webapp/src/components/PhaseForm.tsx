/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { IconButton, Dropdown, DirectionalHint, TextField, IDetailsRowProps } from '@fluentui/react'
import { useCallback, useState, useRef } from 'react'
import { getPhaseTagItems, getPhaseQualifierItems, getPhaseMoreInfoItems, getPhaseMoreInfoTextByKey, getPhaseQualifierItemsByKey } from '../selectors/phaseSelectors'

import './PhaseForm.scss'
export interface PhaseFormProps {
    selectedState: any
    rowItems: IDetailsRowProps
    isEditable: boolean
}

export default observer(function PhaseForm(props: PhaseFormProps) {
    const { selectedState, rowItems, isEditable } = props;
    const phaseTagItems = useRef(getPhaseTagItems(selectedState))
    const phaseQualifierItems = useRef(getPhaseQualifierItems(selectedState))
    const phaseMoreInfoItems = useRef(getPhaseMoreInfoItems(selectedState))
    const [ filteredQualifierItems, setFilteredQualifierItems ] = useState<any[]>(getPhaseQualifierItemsByKey(selectedState, rowItems.item.tagKey))
    const [ moreInfoText, setMoreInfoText ] = useState<string>(getPhaseMoreInfoTextByKey(selectedState, rowItems.item.moreInfoKey))
    const [ moreInfoUrl, setMoreInfoUrl ] = useState<string>(rowItems.item.moreInfoUrl)

    //console.log(getPhaseQualifierItemsByKey(selectedState, rowItems.item.tagKey))
    const onTagChange = useCallback((_event, option) => {
        setFilteredQualifierItems(
            phaseQualifierItems.current.filter(q => q.key.split('/')[1].split('.')[0] == option.key)
        )
        setMoreInfoText('')
    },[phaseQualifierItems])

    const onQualifierChange = useCallback((_event, option) => {
        const moreInfoKey = option.key.replace('question', 'moreinfo').split('/')[1]
        const moreInfoObj = phaseMoreInfoItems.current.find(mi => mi.key.split('/')[1] === moreInfoKey)
        moreInfoObj ? setMoreInfoText(moreInfoObj.text) : setMoreInfoText('')
    },[phaseMoreInfoItems])

    const onMoreInfoTextChange = useCallback((_event, value) => {
        setMoreInfoText(value)
    },[])

    const onMoreInfoUrlChange = useCallback((_event, value) => {
        setMoreInfoUrl(value)
    },[])

	return (
        <div className='phaseDetailRow' style={{pointerEvents: isEditable ? 'unset' : 'none'}}>
            <div className='mainRow'>
                <Dropdown
                    options={phaseTagItems.current}
                    defaultSelectedKey={rowItems.item.tagKey}
                    placeholder='Tag'
                    className='tagDropdown'
                    styles={{root: {minWidth: 250}}}
                    onChange={onTagChange}
                />
                <Dropdown
                    options={filteredQualifierItems}
                    defaultSelectedKey={rowItems.item.qualifierId}
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
                    value={moreInfoText}
                    onChange={onMoreInfoTextChange}
                />
                <TextField
                    placeholder='More info url'
                    styles={{root: {width: 'calc(100% - 32px)', padding: '5px 0'}}}
                    value={moreInfoUrl}
                    onChange={onMoreInfoUrlChange}
                />
            </div>
        </div>
	)
})
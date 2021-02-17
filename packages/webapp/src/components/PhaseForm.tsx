/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { IconButton, Dropdown, DirectionalHint, TextField, IDetailsRowProps } from '@fluentui/react'
import { getAppStore } from '../store/store'

import './PhaseForm.scss'

export interface PhaseFormProps {
    selectedState: string
    rowItems: IDetailsRowProps
}

export default observer(function PhaseForm(props: PhaseFormProps) {
    const { globalFileData, repoFileData } = getAppStore();

	return (
        <div className='phaseDetailRow'>
            <div className='mainRow'>
                <Dropdown options={[]} placeholder='Tag'
                    className='tagDropdown'
                    styles={{root: {width: 400}}}
                />
                <Dropdown options={[]} placeholder='Qualifier'
                    styles={{root: {width: '100%'}}}
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
                />
                <TextField
                    placeholder='More info url'
                    styles={{root: {width: 'calc(100% - 32px)', padding: '5px 0'}}}
                />
            </div>
        </div>
	)
})
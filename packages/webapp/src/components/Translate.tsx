/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Dropdown, TextField } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { useState, useCallback, useEffect, useRef } from 'react'
import { translateLocationName } from '../mutators/repoMutators'
import { getAppStore } from '../store/store'
import { getLanguageOptions } from '../utils/textUtils'

import './Translate.scss'

const filterDropdownStyles = {
	dropdown: { border: 'none' },
	title: {
		fontSize: '14px',
		color: '#0078d4 !important',
		border: 'none',
		backgroundColor: 'transparent',
	},
	caretDown: {
		color: '#0078d4 !important',
		fontSize: '14px',
	},
	dropdownOptionText: { fontSize: '14px' },
}

export default observer(function Translate() {
	const [locationsList, setLocationsList] = useState<any[]>([])
	const { globalFileData, currentLanguage } = getAppStore()
	const languageOptions = getLanguageOptions(currentLanguage)
	const [translateLanguage, setTranslateLanguage] = useState<any>(
		languageOptions[0]
	)
	const fieldChanges = useRef<any>({})
	const mainLanguage = useRef<string>(currentLanguage)

	useEffect(() => {
		mainLanguage.current = currentLanguage
		setTranslateLanguage(getLanguageOptions(currentLanguage)[0])
	}, [currentLanguage, mainLanguage, setTranslateLanguage, getLanguageOptions])

	useEffect(() => {
		const stateNames = Object.entries(globalFileData.cdcStateNames.content)
			.map(([key, value]: [string, any]) => {
				return {
					locKey: key,
					fromKey: mainLanguage.current,
					from: value[mainLanguage.current],
					toKey: translateLanguage.key,
					to: !translateLanguage.key
						? ''
						: !value[translateLanguage.key]
						? ''
						: value[translateLanguage.key],
				}
			})
			.sort((a, b) => (a.from > b.from ? 1 : -1))

		setLocationsList(stateNames)
	}, [globalFileData, translateLanguage, mainLanguage, setLocationsList])

	const onTranslateLanguageChange = useCallback(
		(_ev, option) => {
			setTranslateLanguage(option)
		},
		[setTranslateLanguage]
	)

	const handleTextChange = useCallback(
		(ev, rowItem) => {
			const value = ev.target.value
			const idx = locationsList.findIndex((i) => i.from === rowItem.from)
			locationsList[idx] = {
				...rowItem,
				to: value,
			}
			setLocationsList([...locationsList])
			fieldChanges.current = locationsList[idx]
		},
		[fieldChanges, locationsList, setLocationsList]
	)

	const updateLocationTranslation = useCallback((current) => {
		translateLocationName(current)
	}, [])

	return (
		<div className="translatePageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ Translate</div>
						<div className="mainTitle">Translate</div>
					</div>
				</div>
				<div className="bodyContent">
					<div className="filterGroup">
						<Dropdown
							selectedKey={translateLanguage.key}
							placeholder="Available languages"
							options={languageOptions}
							styles={filterDropdownStyles}
							onChange={onTranslateLanguageChange}
						/>
						<Dropdown
							selectedKey={null}
							placeholder="Needs Translation"
							options={[]}
							styles={filterDropdownStyles}
						/>
					</div>
					<section>
						<div className="listTitle">Locations</div>
						{locationsList.map((val: any, idx: number) => {
							return (
								<div
									key={`locationRow-${idx}`}
									className={`locationListRow${idx % 2 > 0 ? '' : ' altRow'}`}
								>
									<div className="fromCol">{val.from}</div>
									<TextField
										name={val.to}
										value={val.to}
										className="toCol"
										onChange={(ev) => handleTextChange(ev, val)}
										onBlur={() => updateLocationTranslation(val)}
									/>
								</div>
							)
						})}
					</section>
				</div>
			</div>
		</div>
	)
})

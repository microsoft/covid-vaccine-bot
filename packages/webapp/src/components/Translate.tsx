/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Dropdown, TextField } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { getLanguageOptions, toProperCase, getLanguageDisplayText } from '../utils/textUtils'
import { useState, useCallback, useEffect, useRef } from 'react'
import { translateLocationName } from '../mutators/repoMutators'
import { getAppStore } from '../store/store'

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
	const { globalFileData, repoFileData,currentLanguage } = getAppStore()
	const languageOptions = getLanguageOptions()
	const [translateLanguage, setTranslateLanguage]= useState<any>(languageOptions[0])
	const fieldChanges = useRef<any>({})
	const mainLanguage = useRef<string>(currentLanguage)
	const locationFullList = useRef<any[]>([])
	const translationFilter = [
		{
			key: 'missing',
			text: 'Needs Translation'
		},
		{
			key: 'all',
			text: 'Show All'
		}
	]
	const translationFilterState = useRef<any>(translationFilter[0].key)

	const buildLocationList = useCallback(() => {
		if (repoFileData) {
			const tempList: any[] = []
			Object.entries(repoFileData).forEach(([_key, value]: [string, any]) => {
				const stateId = value?.info?.content.id
				const stateNames = globalFileData?.cdcStateNames.content

				const stateLabel =
					stateNames[`cdc/${stateId}/state_name`] &&
					stateNames[`cdc/${stateId}/state_name`][currentLanguage] &&
					stateNames[`cdc/${stateId}/state_name`][currentLanguage].trim() !== ''
						? stateNames[`cdc/${stateId}/state_name`][currentLanguage]
						: `*Translation Not Found* (${stateId})`

				const translateToValue = !translateLanguage.key
					? ''
					: !stateNames?.[`cdc/${stateId}/state_name`]?.[translateLanguage.key]
						? ''
						: stateNames?.[`cdc/${stateId}/state_name`]?.[translateLanguage.key]

				tempList.push({
					locKey: `cdc/${stateId}/state_name`,
					fromKey: mainLanguage.current,
					from: stateLabel,
					toKey: translateLanguage.key,
					to: translateToValue,
					_to: translateToValue
				})
			})
			const locationNames = tempList.sort((a,b) => (a.from > b.from) ? 1 : -1)

			if (translationFilterState.current === 'missing') {
				setLocationsList(
					locationNames.filter(location => !location._to)
				)
			} else {
				setLocationsList(locationNames)
			}

			locationFullList.current = locationNames
		}
	},[globalFileData, repoFileData, translateLanguage, mainLanguage, locationFullList, translationFilterState, setLocationsList])

	useEffect(() => {
		mainLanguage.current = currentLanguage
		setTranslateLanguage(getLanguageOptions()[0])
	},[currentLanguage, mainLanguage, setTranslateLanguage, getLanguageOptions])

	useEffect(() => {
		buildLocationList()
	},[translationFilterState, translateLanguage, mainLanguage])

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

	const updateLocationTranslation = useCallback((item) => {
		if (item.to && (item.to.toLowerCase() !== item._to.toLowerCase())) {
			item.to = toProperCase(item.to)
			translateLocationName(item)
		}
	},[])

	const onTranslateFilterChange = useCallback((_ev, option) => {
		if (option.key === 'missing') {
			setLocationsList(
				locationFullList.current.filter(location => !location._to)
			)
		} else {
			setLocationsList(locationFullList.current)
		}

		translationFilterState.current = option.key
	},[setLocationsList, locationFullList, translationFilterState])

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
							selectedKey={translationFilterState.current}
							placeholder="Needs Translation"
							options={translationFilter}
							styles={filterDropdownStyles}
							onChange={onTranslateFilterChange}
						/>
					</div>
					<section>
						<div className="listTitle">Locations</div>
						{locationsList.length > 0 ? (
							locationsList.map((val:any, idx:number) => {
								return (
									<div key={`locationRow-${idx}`} className={`locationListRow${idx % 2 > 0 ? '': ' altRow'}`}>
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
							})
						):(
							<div className="locationListRow">No missing translation found for: {getLanguageDisplayText(translateLanguage.key, translateLanguage.key)}.</div>
						)}
					</section>
				</div>
			</div>
		</div>
	)
})

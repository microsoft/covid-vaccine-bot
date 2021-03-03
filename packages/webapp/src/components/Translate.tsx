/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Dropdown, TextField, FontIcon } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { getLanguageOptions, toProperCase, getLanguageDisplayText } from '../utils/textUtils'
import { useState, useCallback, useEffect, useRef } from 'react'
import { translateLocationName, translateQualifier } from '../mutators/repoMutators'
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
	const [locationList, setLocationList] = useState<any[]>([])
	const [qualifierList, setQualifierList] = useState<any[]>([])
	const { globalFileData, repoFileData,currentLanguage } = getAppStore()
	const languageOptions = getLanguageOptions()
	const [translateLanguage, setTranslateLanguage]= useState<any>(languageOptions[0])
	const locationChanges = useRef<any>({})
	const qualifierChanges = useRef<any>({})
	const mainLanguage = useRef<string>(currentLanguage)
	const locationFullList = useRef<any[]>([])
	const qualifierFullList = useRef<any[]>([])
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
	const [isSectionCollapse, setSectionCollapse] = useState<any>({locations: false, qualifiers: false, info: false})

	const buildLocationList = useCallback(() => {
		if (repoFileData) {
			const tempList: any[] = []
			Object.entries(repoFileData).forEach(([_key, value]: [string, any]) => {
				const stateId = value?.info?.content.id
				const stateNames = globalFileData?.cdcStateNames.content

				const stateLabel =
					stateNames[`cdc/${stateId}/state_name`] &&
					stateNames[`cdc/${stateId}/state_name`][mainLanguage.current] &&
					stateNames[`cdc/${stateId}/state_name`][mainLanguage.current].trim() !== ''
						? stateNames[`cdc/${stateId}/state_name`][mainLanguage.current]
						: `*Translation Not Found* (${stateId})`

				const translateToValue = !translateLanguage.key
					? ''
					: !stateNames?.[`cdc/${stateId}/state_name`]?.[translateLanguage.key]
						? ''
						: stateNames?.[`cdc/${stateId}/state_name`]?.[translateLanguage.key]

				tempList.push({
					key: `cdc/${stateId}/state_name`,
					fromKey: mainLanguage.current,
					from: stateLabel,
					toKey: translateLanguage.key,
					to: translateToValue,
					_to: translateToValue
				})
			})
			const locationNames = tempList.sort((a,b) => (a.from > b.from) ? 1 : -1)

			if (translationFilterState.current === 'missing') {
				setLocationList(
					locationNames.filter(location => !location._to)
				)
			} else {
				setLocationList(locationNames)
			}

			locationFullList.current = locationNames
		}
	},[globalFileData, repoFileData, translateLanguage, mainLanguage, locationFullList, translationFilterState, setLocationList])

	const buildQualifierList = useCallback(() => {
		if (globalFileData) {
			const tempList: any[] = []
			Object.entries(globalFileData.customStrings.content).forEach(([key, value]: [string, any]) => {
				if (key.startsWith('c19.eligibility.question')) {
					tempList.push({
						key: key,
						fromKey: mainLanguage.current,
						from: value[mainLanguage.current],
						toKey: translateLanguage.key,
						to: value[translateLanguage.key],
						_to: value[translateLanguage.key]
					})
				}
			})
			const qualifiers = tempList.sort((a,b) => (a.from > b.from) ? 1 : -1)

			if (translationFilterState.current === 'missing') {
				setQualifierList(
					qualifiers.filter(qualifier => !qualifier._to)
				)
			} else {
				setQualifierList(qualifiers)
			}

			qualifierFullList.current = qualifiers
		}
	},[globalFileData, translateLanguage, mainLanguage, qualifierFullList, translationFilterState, setQualifierList])

	useEffect(() => {
		mainLanguage.current = currentLanguage
		setTranslateLanguage(getLanguageOptions()[0])
	},[currentLanguage, mainLanguage, setTranslateLanguage])

	useEffect(() => {
		buildLocationList()
		buildQualifierList()
	},[translationFilterState, translateLanguage, mainLanguage, buildLocationList, buildQualifierList])

	const onTranslateLanguageChange = useCallback(
		(_ev, option) => {
			setTranslateLanguage(option)
		},
		[setTranslateLanguage]
	)

	const onCollapseSection = useCallback((name: string) => {
		setSectionCollapse({...isSectionCollapse, ...{[name]: !isSectionCollapse[name]}})
	},[setSectionCollapse, isSectionCollapse])

	const handleLocationTextChange = useCallback(
		(ev, rowItem) => {
			const value = ev.target.value
			const idx = locationList.findIndex((i) => i.from === rowItem.from)
			locationList[idx] = {
				...rowItem,
				to: value,
			}
			setLocationList([...locationList])
			locationChanges.current = locationList[idx]
		},
		[locationChanges, locationList, setLocationList]
	)

	const handleQualifierTextChange = useCallback(
		(ev, rowItem) => {
			const value = ev.target.value
			const idx = qualifierList.findIndex((i) => i.from === rowItem.from)
			qualifierList[idx] = {
				...rowItem,
				to: value,
			}
			setQualifierList([...qualifierList])
			qualifierChanges.current = qualifierList[idx]
		},
		[qualifierChanges, qualifierList, setQualifierList]
	)

	const updateLocationTranslation = useCallback((item) => {
		if (item.to && (item.to.toLowerCase() !== item._to.toLowerCase())) {
			item.to = toProperCase(item.to)
			translateLocationName(item)
		}
	},[])

	const updateQualifierTranslation = useCallback((item) => {
		if (item.to && (item.to.toLowerCase() !== item._to.toLowerCase())) {
			item.to = String(item.to).trim()
			console.log(item)
			translateQualifier(item)
		}
	},[])

	const onTranslateFilterChange = useCallback((_ev, option) => {
		if (option.key === 'missing') {
			setLocationList(
				locationFullList.current.filter(i => !i._to)
			)
			setQualifierList(
				qualifierFullList.current.filter(i => !i._to)
			)
		} else {
			setLocationList(locationFullList.current)
			setQualifierList(qualifierFullList.current)
		}

		translationFilterState.current = option.key
	},[setLocationList, setQualifierList, locationFullList, qualifierFullList, translationFilterState])

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
						<div className="listTitle" onClick={() => onCollapseSection('locations')}>
							<FontIcon
								iconName={isSectionCollapse.locations ? 'ChevronRight' : 'ChevronDown'}
								className="groupToggleIcon"
							/>
							<div>Locations</div>
						</div>
						{!isSectionCollapse.locations && (
							locationList.length > 0 ? (
								locationList.map((val:any, idx:number) => {
									return (
										<div key={`locationRow-${idx}`} className={`translateListRow${idx % 2 > 0 ? '': ' altRow'}`}>
											<div className="fromCol">{val.from}</div>
											<TextField
												name={val.to}
												value={val.to}
												className="toCol"
												onChange={(ev) => handleLocationTextChange(ev, val)}
												onBlur={() => updateLocationTranslation(val)}
											/>
										</div>
									)
								})
							):(
								<div className="emptyTranslateListRow">No missing location translations found for: {getLanguageDisplayText(translateLanguage.key, translateLanguage.key)}.</div>
							)
						)}
					</section>
					<section>
						<div className="listTitle" onClick={() => onCollapseSection('qualifiers')}>
							<FontIcon
								iconName={isSectionCollapse.qualifiers ? 'ChevronRight' : 'ChevronDown'}
								className="groupToggleIcon"
							/>
							<div>Qualifiers</div>
						</div>
						{!isSectionCollapse.qualifiers && (
							qualifierList.length > 0 ? (
								qualifierList.map((val:any, idx:number) => {
									return (
										<div key={`qualifierRow-${idx}`} className={`translateListRow${idx % 2 > 0 ? '': ' altRow'} qualifier`}>
											<div className="fromCol">{val.from}</div>
											<TextField
												name={val.to}
												value={val.to}
												className="toCol"
												autoAdjustHeight={true}
												resizable={false}
												multiline={true}
												onChange={(ev) => handleQualifierTextChange(ev, val)}
												onBlur={() => updateQualifierTranslation(val)}
											/>
										</div>
									)
								})
							):(
								<div className="emptyTranslateListRow">No missing qualifier translations found for: {getLanguageDisplayText(translateLanguage.key, translateLanguage.key)}.</div>
							)
						)}
					</section>
				</div>
			</div>
		</div>
	)
})

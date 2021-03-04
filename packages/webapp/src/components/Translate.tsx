/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Dropdown, TextField, FontIcon } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { getLanguageOptions, toProperCase, getLanguageDisplayText } from '../utils/textUtils'
import { useState, useCallback, useEffect, useRef } from 'react'
import { translateLocationName, translateQualifier, translateMisc } from '../mutators/repoMutators'
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
	const { globalFileData, repoFileData, currentLanguage } = getAppStore()
	const languageOptions = getLanguageOptions()
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

	const locationChanges = useRef<any>({})
	const qualifierChanges = useRef<any>({})
	const miscChanges = useRef<any>({})

	const locationFullList = useRef<any[]>([])
	const qualifierFullList = useRef<any[]>([])
	const miscFullList = useRef<any[]>([])

	const mainLanguage = useRef<string>(currentLanguage)
	const toLanguage = useRef<any>(languageOptions[0].key)

	const [locationList, setLocationList] = useState<any[]>([])
	const [qualifierList, setQualifierList] = useState<any[]>([])
	const [miscList, setMiscList] = useState<any[]>([])

	const [translationFilterState, setTranslationFilterState] = useState<any>(translationFilter[0].key)
	const [isSectionCollapse, setSectionCollapse] = useState<any>({locations: false, qualifiers: false, misc: false})

	const buildTranslationsLists = useCallback(() => {
		const tempMiscList: any[] = []

		if (repoFileData) {
			const tempList: any[] = []
			Object.entries(repoFileData).forEach(([_key, value]: [string, any]) => {
				const stateId = value?.info?.content.id
				const stateNames = globalFileData?.cdcStateNames.content
				const stateLinks = globalFileData?.cdcStateLinks.content

				const stateLabel =
					stateNames[`cdc/${stateId}/state_name`] &&
					stateNames[`cdc/${stateId}/state_name`][mainLanguage.current] &&
					stateNames[`cdc/${stateId}/state_name`][mainLanguage.current].trim() !== ''
						? stateNames[`cdc/${stateId}/state_name`][mainLanguage.current]
						: `*Translation Not Found* (${stateId})`

				const stateLinkLabel =
				stateLinks[`cdc/${stateId}/state_link`] &&
				stateLinks[`cdc/${stateId}/state_link`][mainLanguage.current] &&
				stateLinks[`cdc/${stateId}/state_link`][mainLanguage.current].trim() !== ''
					? stateLinks[`cdc/${stateId}/state_link`][mainLanguage.current]
					: `*Translation Not Found* (${stateId})`

				const translateToValue = !toLanguage.current
					? ''
					: !stateNames?.[`cdc/${stateId}/state_name`]?.[toLanguage.current]
						? ''
						: stateNames?.[`cdc/${stateId}/state_name`]?.[toLanguage.current]

				const translateLinkToValue = !toLanguage.current
					? ''
					: !stateLinks?.[`cdc/${stateId}/state_link`]?.[toLanguage.current]
						? ''
						: stateLinks?.[`cdc/${stateId}/state_link`]?.[toLanguage.current]

				tempList.push({
					key: `cdc/${stateId}/state_name`,
					fromKey: mainLanguage.current,
					from: stateLabel,
					toKey: toLanguage.current,
					to: translateToValue,
					_to: translateToValue
				})

				tempMiscList.push({
					key: `cdc/${stateId}/state_link`,
					fromKey: mainLanguage.current,
					from: stateLinkLabel,
					toKey: toLanguage.current,
					to: translateLinkToValue,
					_to: translateLinkToValue
				})
			})
			locationFullList.current = tempList.sort((a,b) => (a.from > b.from) ? 1 : -1)
		}

		if (globalFileData) {
			const tempQualifierList: any[] = []
			Object.entries(globalFileData.customStrings.content).forEach(([key, value]: [string, any]) => {
				if (key.startsWith('c19.eligibility.question')) {
					tempQualifierList.push({
						key: key,
						fromKey: mainLanguage.current,
						from: value[mainLanguage.current],
						toKey: toLanguage.current,
						to: value[toLanguage.current],
						_to: value[toLanguage.current]
					})
				} else {
					tempMiscList.push({
						key: key,
						fromKey: mainLanguage.current,
						from: value[mainLanguage.current],
						toKey: toLanguage.current,
						to: value[toLanguage.current],
						_to: value[toLanguage.current]
					})
				}
			})
			qualifierFullList.current = tempQualifierList.sort((a,b) => (a.from > b.from) ? 1 : -1)
		}

		miscFullList.current = tempMiscList.sort((a,b) => (a.key > b.key) ? 1 : -1)
	},[globalFileData, repoFileData])

	useEffect(() => {
		mainLanguage.current = currentLanguage
		buildTranslationsLists()
	},[currentLanguage, mainLanguage, buildTranslationsLists])

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

	const handleMiscTextChange = useCallback(
		(ev, rowItem) => {
			const value = ev.target.value
			const idx = miscList.findIndex((i) => i.from === rowItem.from)
			miscList[idx] = {
				...rowItem,
				to: value,
			}
			setMiscList([...miscList])
			miscChanges.current = miscList[idx]
		},
		[miscChanges, miscList, setMiscList]
	)

	const updateLocationTranslation = useCallback((item) => {
		if (item.to && (item.to.toLowerCase() !== item._to.toLowerCase())) {
			item.to = toProperCase(item.to).trim()
			translateLocationName(item)
		}
	},[])

	const updateQualifierTranslation = useCallback((item) => {
		if (item.to && (item.to.toLowerCase() !== item._to.toLowerCase())) {
			item.to = String(item.to).trim()
			translateQualifier(item)
		}
	},[])

	const updateMiscTranslation = useCallback((item) => {
		if (item.to && (item.to.toLowerCase() !== item._to.toLowerCase())) {
			item.to = String(item.to).trim()
			translateMisc(item)
		}
	},[])

	const onLanguageChange = useCallback(
		(_ev, option) => {
			toLanguage.current = option.key
			buildTranslationsLists()
			if (translationFilterState === 'missing') {
				setLocationList(
					locationFullList.current.filter(i => !i._to)
				)
				setQualifierList(
					qualifierFullList.current.filter(i => !i._to)
				)
				setMiscList(
					miscFullList.current.filter(i => !i._to)
				)
			} else {
				setLocationList(locationFullList.current)
				setQualifierList(qualifierFullList.current)
				setMiscList(miscFullList.current)
			}
		},
		[translationFilterState, buildTranslationsLists, setLocationList, setQualifierList, setMiscList]
	)

	const onTranslationFilterChange = useCallback((_ev, option) => {
		if (option.key === 'missing') {
			setLocationList(
				locationFullList.current.filter(i => !i._to)
			)
			setQualifierList(
				qualifierFullList.current.filter(i => !i._to)
			)
			setMiscList(
				miscFullList.current.filter(i => !i._to)
			)
		} else {
			setLocationList(locationFullList.current)
			setQualifierList(qualifierFullList.current)
			setMiscList(miscFullList.current)
		}

		setTranslationFilterState(option.key)
	},[setLocationList, setQualifierList, locationFullList, qualifierFullList, setTranslationFilterState])

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
							selectedKey={toLanguage.current}
							placeholder="Available languages"
							options={languageOptions}
							styles={filterDropdownStyles}
							onChange={onLanguageChange}
						/>
						<Dropdown
							selectedKey={translationFilterState}
							placeholder="Needs Translation"
							options={translationFilter}
							styles={filterDropdownStyles}
							onChange={onTranslationFilterChange}
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
								<div className="emptyTranslateListRow">No missing location translations found for: {getLanguageDisplayText(toLanguage.current, toLanguage.current)}.</div>
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
								<div className="emptyTranslateListRow">No missing qualifier translations found for: {getLanguageDisplayText(toLanguage.current, toLanguage.current)}.</div>
							)
						)}
					</section>
					<section>
						<div className="listTitle" onClick={() => onCollapseSection('misc')}>
							<FontIcon
								iconName={isSectionCollapse.misc ? 'ChevronRight' : 'ChevronDown'}
								className="groupToggleIcon"
							/>
							<div>Miscellaneous</div>
						</div>
						{!isSectionCollapse.misc && (
							miscList.length > 0 ? (
								miscList.map((val:any, idx:number) => {
									return (
										<div key={`miscRow-${idx}`} className={`translateListRow${idx % 2 > 0 ? '': ' altRow'} misc`}>
											<div className="fromCol">{val.from}</div>
											<TextField
												name={val.to}
												value={val.to}
												className="toCol"
												autoAdjustHeight={true}
												resizable={false}
												multiline={true}
												onChange={(ev) => handleMiscTextChange(ev, val)}
												onBlur={() => updateMiscTranslation(val)}
											/>
										</div>
									)
								})
							):(
								<div className="emptyTranslateListRow">No missing miscellaneous translations found for: {getLanguageDisplayText(toLanguage.current, toLanguage.current)}.</div>
							)
						)}
					</section>
				</div>
			</div>
		</div>
	)
})

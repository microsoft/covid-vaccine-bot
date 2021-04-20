/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	Dropdown,
	TextField,
	FontIcon,
	MessageBar,
	MessageBarType,
	ProgressIndicator,
} from '@fluentui/react'
import parse from 'csv-parse/lib/sync'
import { observer } from 'mobx-react-lite'
import { useState, useCallback, useEffect, useRef, createRef } from 'react'
import {
	translateLocationName,
	translateQualifier,
	translateMisc,
	updateStrings,
} from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { convertCSVDataToObj } from '../utils/dataUtils'
import {
	getLanguageOptions,
	toProperCase,
	getLanguageDisplayText,
	createCSVDataString,
} from '../utils/textUtils'
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
	const {
		globalFileData,
		repoFileData,
		currentLanguage,
		isDataRefreshing,
		pendingChanges,
	} = getAppStore()
	const languageOptions = getLanguageOptions()
	const translationFilter = [
		{
			key: 'missing',
			text: t('Translate.translationFilter.needsTranslation'),
		},
		{
			key: 'all',
			text: t('Translate.translationFilter.showAll'),
		},
	]

	const miscFilter = [
		{
			key: 'all',
			text: t('Translate.miscFilter.all'),
		},
		{
			key: 'state',
			text: t('Translate.miscFilter.stateSpecific'),
		},
		{
			key: 'state_link',
			text: t('Translate.miscFilter.stateLinks'),
		},
		{
			key: 'other',
			text: t('Translate.miscFilter.uncategorized'),
		},
	]
	const [showLoading, setShowLoading] = useState<boolean>(false)

	const locationFullList = useRef<any[]>([])
	const qualifierFullList = useRef<any[]>([])
	const miscFullList = useRef<any[]>([])
	const stateSpecificOptions = useRef<any[]>([])

	const mainLanguage = useRef<string>(currentLanguage)
	const toLanguage = useRef<string>(languageOptions[0].key)

	const fileUploadRef = createRef<HTMLInputElement>()
	const [errorMessage, setErrorMessage] = useState<
		{ message: string } | undefined
	>()

	const [locationList, setLocationList] = useState<any[]>([])
	const [qualifierList, setQualifierList] = useState<any[]>([])
	const [miscList, setMiscList] = useState<any[]>([])

	const [translationFilterState, setTranslationFilterState] = useState<string>(
		translationFilter[0].key
	)
	const [miscFilterState, setMiscFilterState] = useState<string>(
		miscFilter[0].key
	)
	const [
		miscStateSpecFilterState,
		setMiscStateSpecFilterState,
	] = useState<string>('')
	const [isSectionCollapse, setSectionCollapse] = useState<any>({
		locations: true,
		qualifiers: true,
		misc: true,
	})

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
					stateNames[`cdc/${stateId}/state_name`][
						mainLanguage.current
					].trim() !== ''
						? stateNames[`cdc/${stateId}/state_name`][mainLanguage.current]
						: `${t('Translate.translationNotFound')} (${stateId})`

				const stateLinkLabel =
					stateLinks[`cdc/${stateId}/state_link`] &&
					stateLinks[`cdc/${stateId}/state_link`][mainLanguage.current] &&
					stateLinks[`cdc/${stateId}/state_link`][
						mainLanguage.current
					].trim() !== ''
						? stateLinks[`cdc/${stateId}/state_link`][mainLanguage.current]
						: `${t('Translate.translationNotFound')} (${stateId})`

				const translateToValue = !toLanguage.current
					? ''
					: !stateNames?.[`cdc/${stateId}/state_name`]?.[toLanguage.current]
					? ''
					: stateNames?.[`cdc/${stateId}/state_name`]?.[toLanguage.current]

				const translateToValue_SMS = !toLanguage.current
					? ''
					: !stateNames?.[`cdc/${stateId}/state_name`]?.[
							`${toLanguage.current}-sms`
					  ]
					? ''
					: stateNames?.[`cdc/${stateId}/state_name`]?.[
							`${toLanguage.current}-sms`
					  ]

				const translateToValue_Voice = !toLanguage.current
					? ''
					: !stateNames?.[`cdc/${stateId}/state_name`]?.[
							`${toLanguage.current}-voice`
					  ]
					? ''
					: stateNames?.[`cdc/${stateId}/state_name`]?.[
							`${toLanguage.current}-voice`
					  ]

				const translateLinkToValue = !toLanguage.current
					? ''
					: !stateLinks?.[`cdc/${stateId}/state_link`]?.[toLanguage.current]
					? ''
					: stateLinks?.[`cdc/${stateId}/state_link`]?.[toLanguage.current]

				const translateLinkToValue_SMS = !toLanguage.current
					? ''
					: !stateLinks?.[`cdc/${stateId}/state_link`]?.[
							`${toLanguage.current}-sms`
					  ]
					? ''
					: stateLinks?.[`cdc/${stateId}/state_link`]?.[
							`${toLanguage.current}-sms`
					  ]

				const translateLinkToValue_Voice = !toLanguage.current
					? ''
					: !stateLinks?.[`cdc/${stateId}/state_link`]?.[
							`${toLanguage.current}-voice`
					  ]
					? ''
					: stateLinks?.[`cdc/${stateId}/state_link`]?.[
							`${toLanguage.current}-voice`
					  ]

				tempList.push({
					key: `cdc/${stateId}/state_name`,
					fromKey: mainLanguage.current,
					from: stateLabel,
					toKey: toLanguage.current,
					to: translateToValue,
					sms: translateToValue_SMS,
					voice: translateToValue_Voice,
					_to: translateToValue,
					_sms: translateToValue_SMS,
					_voice: translateToValue_Voice,
					parent: 'global',
					category: 'locations',
				})

				tempMiscList.push({
					key: `cdc/${stateId}/state_link`,
					fromKey: mainLanguage.current,
					from: stateLinkLabel,
					toKey: toLanguage.current,
					to: translateLinkToValue,
					sms: translateLinkToValue_SMS,
					voice: translateLinkToValue_Voice,
					_to: translateLinkToValue,
					_sms: translateLinkToValue_SMS,
					_voice: translateLinkToValue_Voice,
					parent: 'global',
					category: 'state_link',
				})
			})
			locationFullList.current = tempList.sort((a, b) =>
				a.from > b.from ? 1 : -1
			)
		}

		if (globalFileData) {
			const tempQualifierList: any[] = []
			Object.entries(globalFileData.customStrings.content).forEach(
				([key, value]: [string, any]) => {
					if (key.startsWith('c19.eligibility.question')) {
						tempQualifierList.push({
							key: key,
							fromKey: mainLanguage.current,
							from: value[mainLanguage.current],
							toKey: toLanguage.current,
							to: value[toLanguage.current],
							sms: value[`${toLanguage.current}-sms`],
							voice: value[`${toLanguage.current}-voice`],
							_to: value[toLanguage.current],
							_sms: value[`${toLanguage.current}-sms`],
							_voice: value[`${toLanguage.current}-voice`],
							parent: 'global',
							category: 'qualifiers',
						})
					} else {
						tempMiscList.push({
							key: key,
							fromKey: mainLanguage.current,
							from: value[mainLanguage.current],
							toKey: toLanguage.current,
							to: value[toLanguage.current],
							sms: value[`${toLanguage.current}-sms`],
							voice: value[`${toLanguage.current}-voice`],
							_to: value[toLanguage.current],
							_sms: value[`${toLanguage.current}-sms`],
							_voice: value[`${toLanguage.current}-voice`],
							parent: 'global',
							category: 'other',
						})
					}
				}
			)
			qualifierFullList.current = tempQualifierList.sort((a, b) =>
				a.from > b.from ? 1 : -1
			)
		}

		const stateStrings: any[] = []
		if (repoFileData) {
			Object.entries(repoFileData)
				.filter(([_key, value]: [string, any]) => value.strings)
				.forEach(([aKey, value]: [string, any]) => {
					Object.entries(value.strings.content).forEach(
						([bKey, value]: [string, any]) => {
							stateStrings.push({
								key: bKey,
								fromKey: mainLanguage.current,
								from: value[mainLanguage.current],
								toKey: toLanguage.current,
								to: value[toLanguage.current],
								sms: value[`${toLanguage.current}-sms`],
								voice: value[`${toLanguage.current}-voice`],
								_to: value[toLanguage.current],
								_sms: value[`${toLanguage.current}-sms`],
								_voice: value[`${toLanguage.current}-voice`],
								parent: aKey,
								category: 'state',
							})
						}
					)
				})
		}
		miscFullList.current = tempMiscList
			.concat(stateStrings)
			.sort((a, b) => (a.key > b.key ? 1 : -1))

		const tempMiscStateSpecificList: any[] = []
		const tempKeys: any[] = []
		miscFullList.current.forEach((i) => {
			if (!tempKeys.includes(i.parent) && i.category === 'state') {
				tempMiscStateSpecificList.push({
					key: i.parent,
					text: toProperCase(i.parent),
				})

				tempKeys.push(i.parent)
			}
		})
		stateSpecificOptions.current = tempMiscStateSpecificList.sort((a, b) =>
			a.key > b.key ? 1 : -1
		)
	}, [globalFileData, repoFileData])

	const onCollapseSection = useCallback(
		(name: string) => {
			setSectionCollapse({
				...isSectionCollapse,
				...{ [name]: !isSectionCollapse[name] },
			})
		},
		[setSectionCollapse, isSectionCollapse]
	)

	const handleLocationTextChange = useCallback(
		(ev, rowItem) => {
			const change: any = {}
			switch (ev.target.name) {
				case rowItem.toKey:
					change.to = ev.target.value
					break
				case `${rowItem.toKey}-sms`:
					change.sms = ev.target.value
					break
				case `${rowItem.toKey}-voice`:
					change.voice = ev.target.value
					break
			}

			const idx = locationList.findIndex((i) => i.from === rowItem.from)
			locationList[idx] = {
				...rowItem,
				...change,
			}
			setLocationList([...locationList])
		},
		[locationList, setLocationList]
	)

	const handleQualifierTextChange = useCallback(
		(ev, rowItem) => {
			const change: any = {}

			switch (ev.target.name) {
				case rowItem.toKey:
					change.to = ev.target.value
					break
				case `${rowItem.toKey}-sms`:
					change.sms = ev.target.value
					break
				case `${rowItem.toKey}-voice`:
					change.voice = ev.target.value
					break
			}

			const idx = qualifierList.findIndex((i) => i.from === rowItem.from)
			qualifierList[idx] = {
				...rowItem,
				...change,
			}
			setQualifierList([...qualifierList])
		},
		[qualifierList, setQualifierList]
	)

	const handleMiscTextChange = useCallback(
		(ev, rowItem) => {
			const change: any = {}

			switch (ev.target.name) {
				case rowItem.toKey:
					change.to = ev.target.value
					break
				case `${rowItem.toKey}-sms`:
					change.sms = ev.target.value
					break
				case `${rowItem.toKey}-voice`:
					change.voice = ev.target.value
					break
			}

			const idx = miscList.findIndex((i) => i.from === rowItem.from)
			miscList[idx] = {
				...rowItem,
				...change,
			}
			setMiscList([...miscList])
		},
		[miscList, setMiscList]
	)

	const updateLocationTranslation = useCallback((item) => {
		let hasUpdate = false
		if (item.to && item.to.toLowerCase() !== item._to.toLowerCase()) {
			item.to = toProperCase(item.to).trim()
			hasUpdate = true
		}

		if (item.sms && item.sms.toLowerCase() !== item._sms.toLowerCase()) {
			item.sms = toProperCase(item.sms).trim()
			hasUpdate = true
		}

		if (item.voice && item.voice.toLowerCase() !== item._voice.toLowerCase()) {
			item.voice = toProperCase(item.voice).trim()
			hasUpdate = true
		}

		if (hasUpdate) {
			translateLocationName(item)
		}
	}, [])

	const updateQualifierTranslation = useCallback((item) => {
		let hasUpdate = false
		if (item.to && item.to.toLowerCase() !== item._to.toLowerCase()) {
			item.to = String(item.to).trim()
			hasUpdate = true
		}

		if (item.sms && item.sms.toLowerCase() !== item._sms.toLowerCase()) {
			item.sms = String(item.sms).trim()
			hasUpdate = true
		}

		if (item.voice && item.voice.toLowerCase() !== item._voice.toLowerCase()) {
			item.voice = String(item.voice).trim()
			hasUpdate = true
		}

		if (hasUpdate) {
			translateQualifier(item)
		}
	}, [])

	const updateMiscTranslation = useCallback((item) => {
		let hasUpdate = false
		if (item.to && item.to.toLowerCase() !== item._to.toLowerCase()) {
			item.to = String(item.to).trim()
			hasUpdate = true
		}

		if (item.sms && item.sms.toLowerCase() !== item._sms.toLowerCase()) {
			item.sms = String(item.sms).trim()
			hasUpdate = true
		}

		if (item.voice && item.voice.toLowerCase() !== item._voice.toLowerCase()) {
			item.voice = String(item.voice).trim()
			hasUpdate = true
		}

		if (hasUpdate) {
			translateMisc(item)
		}
	}, [])

	const onLanguageChange = useCallback(
		(_ev, option) => {
			toLanguage.current = option.key
			buildTranslationsLists()
			if (translationFilterState === 'missing') {
				setLocationList(locationFullList.current.filter((i) => !i._to))
				setQualifierList(qualifierFullList.current.filter((i) => !i._to))

				if (miscFilterState === 'all') {
					setMiscList(miscFullList.current.filter((i) => !i._to))
				} else {
					if (miscFilterState === 'state') {
						setMiscList(
							miscFullList.current.filter(
								(i) =>
									!i._to &&
									i.category === miscFilterState &&
									i.parent === miscStateSpecFilterState
							)
						)
					} else {
						setMiscList(
							miscFullList.current.filter(
								(i) => !i._to && i.category === miscFilterState
							)
						)
					}
				}
			} else {
				setLocationList(locationFullList.current)
				setQualifierList(qualifierFullList.current)

				if (miscFilterState === 'all') {
					setMiscList(miscFullList.current)
				} else {
					if (miscFilterState === 'state') {
						setMiscList(
							miscFullList.current.filter(
								(i) =>
									i.category === miscFilterState &&
									i.parent === miscStateSpecFilterState
							)
						)
					} else {
						setMiscList(
							miscFullList.current.filter((i) => i.category === miscFilterState)
						)
					}
				}
			}
		},
		[
			translationFilterState,
			miscFilterState,
			miscStateSpecFilterState,
			buildTranslationsLists,
			setLocationList,
			setQualifierList,
			setMiscList,
		]
	)

	const onTranslationFilterChange = useCallback(
		(_ev, option) => {
			if (option.key === 'missing') {
				setLocationList(locationFullList.current.filter((i) => !i._to))
				setQualifierList(qualifierFullList.current.filter((i) => !i._to))

				if (miscFilterState === 'all') {
					setMiscList(miscFullList.current.filter((i) => !i._to))
				} else {
					if (miscFilterState === 'state') {
						setMiscList(
							miscFullList.current.filter(
								(i) =>
									!i._to &&
									i.category === miscFilterState &&
									i.parent === miscStateSpecFilterState
							)
						)
					} else {
						setMiscList(
							miscFullList.current.filter(
								(i) => !i._to && i.category === miscFilterState
							)
						)
					}
				}
			} else {
				setLocationList(locationFullList.current)
				setQualifierList(qualifierFullList.current)

				if (miscFilterState === 'all') {
					setMiscList(miscFullList.current)
				} else {
					if (miscFilterState === 'state') {
						setMiscList(
							miscFullList.current.filter(
								(i) =>
									i.category === miscFilterState &&
									i.parent === miscStateSpecFilterState
							)
						)
					} else {
						setMiscList(
							miscFullList.current.filter((i) => i.category === miscFilterState)
						)
					}
				}
			}

			setTranslationFilterState(option.key)
		},
		[
			setMiscList,
			setLocationList,
			setQualifierList,
			locationFullList,
			qualifierFullList,
			miscFullList,
			miscFilterState,
			miscStateSpecFilterState,
			setTranslationFilterState,
		]
	)

	const onMiscFilterChange = useCallback(
		(_ev, option) => {
			const selectedMiscStateOptionKey =
				miscStateSpecFilterState || stateSpecificOptions.current[0].key
			const filteredList = miscFullList.current.filter((i) => {
				if (option.key === 'all') {
					return translationFilterState === 'missing' ? !i._to : i
				} else {
					if (translationFilterState === 'missing') {
						if (option.key === 'state') {
							return (
								!i._to &&
								i.category === option.key &&
								i.parent === selectedMiscStateOptionKey
							)
						} else {
							return !i._to && i.category === option.key
						}
					} else {
						if (option.key === 'state') {
							return i.category === option.key && selectedMiscStateOptionKey
						} else {
							return i.category === option.key
						}
					}
				}
			})

			setMiscList(filteredList)
			setMiscFilterState(option.key)
			setMiscStateSpecFilterState(selectedMiscStateOptionKey)
		},
		[
			miscFullList,
			translationFilterState,
			miscStateSpecFilterState,
			setMiscStateSpecFilterState,
			setMiscList,
			setMiscFilterState,
		]
	)

	const onMiscStateSpecificFilterChange = useCallback(
		(_ev, option) => {
			setMiscList(miscFullList.current.filter((i) => i.parent === option.key))
			setMiscStateSpecFilterState(option.key)
		},
		[setMiscList, miscFullList]
	)

	const onReaderLoadData = (readerEvent: any) => {
		try {
			const content = readerEvent.target.result
			const contentObj = convertCSVDataToObj(parse(content, { columns: true }))
			if (Object.keys(contentObj).length > 0) {
				updateStrings(contentObj)
				setShowLoading(false)
			} else {
				throw new Error(t('Translate.error.invalidFileContent'))
			}
		} catch (err) {
			setErrorMessage(err)
			setShowLoading(false)
		}
	}

	const onFileUpload = (e: any) => {
		setErrorMessage(undefined)
		if (e.target.files.length > 0) {
			setShowLoading(true)
			const file = e.target.files[0]
			if (file.type === 'text/csv') {
				const reader = new FileReader()
				reader.onload = onReaderLoadData
				reader.readAsText(file, 'UTF-8')
			} else {
				setErrorMessage(new Error(t('Translate.error.invalidFileType')))
				setShowLoading(false)
			}
		}
	}

	const triggerFileOnClick = () => {
		fileUploadRef.current?.click()
	}

	const searchForStrings = (elem: any, resultObj: any) => {
		if (elem.strings && elem.strings.content) {
			Object.assign(resultObj, elem.strings.content)
		}
		if (elem.regions && elem.regions.length > 0) {
			elem.regions.forEach((region: any) => {
				searchForStrings(region, resultObj)
			})
		}
	}

	const onFileDownload = () => {
		const stringsObj = {}
		Object.assign(
			stringsObj,
			globalFileData.customStrings.content,
			globalFileData.cdcStateNames.content,
			globalFileData.cdcStateLinks.content
		)
		Object.keys(repoFileData).forEach((location: string) => {
			searchForStrings(repoFileData[location], stringsObj)
		})
		const stringData = createCSVDataString(stringsObj)
		const csvData = new Blob([stringData], { type: 'text/csv' })
		const csvUrl = URL.createObjectURL(csvData)
		window.open(csvUrl)
	}

	useEffect(() => {
		mainLanguage.current = currentLanguage
		buildTranslationsLists()
		if (!pendingChanges) {
			onTranslationFilterChange(null, { key: translationFilterState })
		}
	}, [currentLanguage, mainLanguage, buildTranslationsLists, pendingChanges, onTranslationFilterChange, translationFilterState])

	return (
		<div className="translatePageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ {t('Translate.title')}</div>
						<div className="mainTitle">{t('Translate.title')}</div>
					</div>
				</div>
				<div className="bodyContent">
					{errorMessage && (
						<MessageBar
							messageBarType={MessageBarType.error}
							dismissButtonAriaLabel={t(
								'Translate.ErrorMessageBar.closeAriaLabel'
							)}
						>
							<p>
								{t('Translate.error.unexpected')} {errorMessage?.toString()}
							</p>
						</MessageBar>
					)}
					{!(showLoading || isDataRefreshing) ? (
						<section>
							<div className="filterGroup">
								<div>
									<label htmlFor="availDropdown">
										{t('Translate.Filter.LanguageDropdown.label')}
									</label>
									<Dropdown
										id="availDropdown"
										selectedKey={toLanguage.current}
										placeholder={t(
											'Translate.Filter.LanguageDropdown.placeholder'
										)}
										options={languageOptions}
										styles={filterDropdownStyles}
										onChange={onLanguageChange}
									/>
									<label htmlFor="translateDropdown">
										{t('Translate.Filter.TranslateDropdown.label')}
									</label>
									<Dropdown
										id="translateDropdown"
										selectedKey={translationFilterState}
										placeholder={t(
											'Translate.Filter.LanguageDropdown.placeholder'
										)}
										options={translationFilter}
										styles={filterDropdownStyles}
										onChange={onTranslationFilterChange}
									/>
								</div>
								<div className="fileOptions">
									<input
										ref={fileUploadRef}
										type="file"
										onChange={onFileUpload}
									/>

									<button onClick={onFileDownload}>
										<FontIcon iconName="Download" />
										{t('Translate.TemplateButtons.download')}
									</button>

									<button onClick={triggerFileOnClick}>
										<FontIcon iconName="CircleAdditionSolid" className="blue" />
										{t('Translate.TemplateButtons.upload')}
									</button>
								</div>
							</div>
							<div
								className="listTitle"
								onClick={() => onCollapseSection('locations')}
							>
								<FontIcon
									iconName={
										isSectionCollapse.locations ? 'ChevronRight' : 'ChevronDown'
									}
									className="groupToggleIcon"
								/>
								<div>
									{t('Translate.GroupList.LocationList.title')} (
									{locationList.length})
								</div>
							</div>
							{!isSectionCollapse.locations &&
								(locationList.length > 0 ? (
									<>
										<div className="translateListRow">
											<div className="fromCol"></div>
											<div className="toCol">
												{t('Translate.GroupList.columns.general')}
											</div>
											<div className="toCol">
												{t('Translate.GroupList.columns.sms')}
											</div>
											<div className="toCol">
												{t('Translate.GroupList.columns.voice')}
											</div>
										</div>
										{locationList.map((val: any, idx: number) => {
											return (
												<div
													key={`locationRow-${idx}`}
													className={`translateListRow${
														idx % 2 > 0 ? '' : ' altRow'
													}`}
												>
													<div className="fromCol">{val.from}</div>
													<TextField
														name={val.toKey}
														value={val.to}
														className="toCol"
														onChange={(ev) => handleLocationTextChange(ev, val)}
														onBlur={() => updateLocationTranslation(val)}
													/>
													<TextField
														name={`${val.toKey}-sms`}
														value={val.sms}
														className="toCol"
														onChange={(ev) => handleLocationTextChange(ev, val)}
														onBlur={() => updateLocationTranslation(val)}
													/>
													<TextField
														name={`${val.toKey}-voice`}
														value={val.voice}
														className="toCol"
														onChange={(ev) => handleLocationTextChange(ev, val)}
														onBlur={() => updateLocationTranslation(val)}
													/>
												</div>
											)
										})}
									</>
								) : (
									<div className="emptyTranslateListRow">
										{t('Translate.GroupList.LocationList.empty')}{' '}
										{getLanguageDisplayText(
											toLanguage.current,
											toLanguage.current
										)}
										.
									</div>
								))}

							<div
								className="listTitle"
								onClick={() => onCollapseSection('qualifiers')}
							>
								<FontIcon
									iconName={
										isSectionCollapse.qualifiers
											? 'ChevronRight'
											: 'ChevronDown'
									}
									className="groupToggleIcon"
								/>
								<div>
									{t('Translate.GroupList.QualifierList.title')} (
									{qualifierList.length})
								</div>
							</div>
							{!isSectionCollapse.qualifiers &&
								(qualifierList.length > 0 ? (
									<>
										<div className="translateListRow qualifier">
											<div className="fromCol"></div>
											<div className="toCol">
												{t('Translate.GroupList.columns.general')}
											</div>
											<div className="toCol">
												{t('Translate.GroupList.columns.sms')}
											</div>
											<div className="toCol">
												{t('Translate.GroupList.columns.voice')}
											</div>
										</div>
										{qualifierList.map((val: any, idx: number) => {
											return (
												<div
													key={`qualifierRow-${idx}`}
													className={`translateListRow${
														idx % 2 > 0 ? '' : ' altRow'
													} qualifier`}
												>
													<div className="fromCol">{val.from}</div>
													<TextField
														name={val.toKey}
														value={val.to}
														className="toCol"
														autoAdjustHeight={true}
														resizable={false}
														multiline={true}
														rows={Math.ceil(val.from.length / 100)}
														onChange={(ev) =>
															handleQualifierTextChange(ev, val)
														}
														onBlur={() => updateQualifierTranslation(val)}
													/>
													<TextField
														name={`${val.toKey}-sms`}
														value={val.sms}
														className="toCol"
														autoAdjustHeight={true}
														resizable={false}
														multiline={true}
														rows={Math.ceil(val.from.length / 100)}
														onChange={(ev) =>
															handleQualifierTextChange(ev, val)
														}
														onBlur={() => updateQualifierTranslation(val)}
													/>
													<TextField
														name={`${val.toKey}-voice`}
														value={val.voice}
														className="toCol"
														autoAdjustHeight={true}
														resizable={false}
														multiline={true}
														rows={Math.ceil(val.from.length / 100)}
														onChange={(ev) =>
															handleQualifierTextChange(ev, val)
														}
														onBlur={() => updateQualifierTranslation(val)}
													/>
												</div>
											)
										})}
									</>
								) : (
									<div className="emptyTranslateListRow">
										{t('Translate.GroupList.QualifierList.empty')}{' '}
										{getLanguageDisplayText(
											toLanguage.current,
											toLanguage.current
										)}
										.
									</div>
								))}

							<div
								className="listTitle"
								onClick={() => onCollapseSection('misc')}
							>
								<FontIcon
									iconName={
										isSectionCollapse.misc ? 'ChevronRight' : 'ChevronDown'
									}
									className="groupToggleIcon"
								/>
								<div>
									{t('Translate.GroupList.MiscellaneousList.title')} (
									{miscList.length})
								</div>
							</div>
							{!isSectionCollapse.misc &&
								(miscList.length > 0 ? (
									<>
										<div className="miscFilterGroup">
											<Dropdown
												selectedKey={miscFilterState}
												placeholder={t('Translate.miscFilter.placeholder')}
												options={miscFilter}
												styles={filterDropdownStyles}
												onChange={onMiscFilterChange}
											/>
											{miscFilterState === 'state' ? (
												<Dropdown
													selectedKey={miscStateSpecFilterState}
													options={stateSpecificOptions.current}
													styles={filterDropdownStyles}
													onChange={onMiscStateSpecificFilterChange}
												/>
											) : (
												<div></div>
											)}
										</div>
										<div className="translateListRow misc">
											<div className="fromCol"></div>
											<div className="toCol">
												{t('Translate.GroupList.columns.general')}
											</div>
											<div className="toCol">
												{t('Translate.GroupList.columns.sms')}
											</div>
											<div className="toCol">
												{t('Translate.GroupList.columns.voice')}
											</div>
										</div>
										{miscList.map((val: any, idx: number) => {
											return (
												<div
													key={`miscRow-${idx}`}
													className={`translateListRow${
														idx % 2 > 0 ? '' : ' altRow'
													} misc`}
												>
													<div className="fromCol">{val.from}</div>
													<TextField
														name={val.toKey}
														value={val.to}
														className="toCol"
														autoAdjustHeight={true}
														resizable={false}
														multiline={true}
														rows={Math.ceil(val.from.length / 100)}
														onChange={(ev) => handleMiscTextChange(ev, val)}
														onBlur={() => updateMiscTranslation(val)}
													/>
													<TextField
														name={`${val.toKey}-sms`}
														value={val.sms}
														className="toCol"
														autoAdjustHeight={true}
														resizable={false}
														multiline={true}
														rows={Math.ceil(val.from.length / 100)}
														onChange={(ev) => handleMiscTextChange(ev, val)}
														onBlur={() => updateMiscTranslation(val)}
													/>
													<TextField
														name={`${val.toKey}-voice`}
														value={val.voice}
														className="toCol"
														autoAdjustHeight={true}
														resizable={false}
														multiline={true}
														rows={Math.ceil(val.from.length / 100)}
														onChange={(ev) => handleMiscTextChange(ev, val)}
														onBlur={() => updateMiscTranslation(val)}
													/>
												</div>
											)
										})}
									</>
								) : (
									<div className="emptyTranslateListRow">
										{t('Translate.GroupList.MiscellaneousList.empty')}{' '}
										{getLanguageDisplayText(
											toLanguage.current,
											toLanguage.current
										)}
										.
									</div>
								))}
						</section>
					) : (
						<section className="loadingContainer">
							<ProgressIndicator
								description={
									isDataRefreshing
										? t('Translate.GroupList.loading')
										: t('Translate.GroupList.updating')
								}
							/>
						</section>
					)}
				</div>
			</div>
		</div>
	)
})

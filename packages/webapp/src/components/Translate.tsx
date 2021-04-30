/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	FontIcon,
	MessageBar,
	MessageBarType,
	ProgressIndicator,
} from '@fluentui/react'
import parse from 'csv-parse/lib/sync'
import { observer } from 'mobx-react-lite'
import { useState,  useEffect, createRef, useCallback } from 'react'
import {
	updateStrings,
} from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { convertCSVDataToObj } from '../utils/dataUtils'
import {
	createCSVDataString,
} from '../utils/textUtils'
import { loadAllStringsData } from '../actions/repoActions'

import './Translate.scss'

export default observer(function Translate() {
	const {
		repoFileData,
		isDataRefreshing,
	} = getAppStore()

	const [showLoading, setShowLoading] = useState<boolean>(false)
	const fileUploadRef = createRef<HTMLInputElement>()
	const [errorMessage, setErrorMessage] = useState<{ message: string } | undefined>()

	useEffect( () => {
		loadAllStringsData()
	},[])

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
			handleFileUpload(e.target.files[0])
		}
	}

	const handleFileUpload = (file:any) => {
			setShowLoading(true)
			if (file.type === 'text/csv') {
				const reader = new FileReader()
				reader.onload = onReaderLoadData
				reader.readAsText(file, 'UTF-8')
			} else {
				setErrorMessage(new Error(t('Translate.error.invalidFileType')))
				setShowLoading(false)
			}

	}

	const triggerFileOnClick = () => {
		fileUploadRef.current?.click()
	}

	const onDragFile = (e:any) =>{

		e.preventDefault();
    	e.stopPropagation();
	}

	const onDropFile = (e:any) =>{

		e.preventDefault();
    	e.stopPropagation();

		if (e.dataTransfer.items[0].kind === 'file') {
			handleFileUpload(e.dataTransfer.items[0].getAsFile())
		}

	}

	const recursiveFindStrings = useCallback(async (elem:any) => {
		const returnStrings = {}
		if(elem.regions){
			for(const item of Object.entries(elem.regions)){
				const regionStrings = await recursiveFindStrings(item[1])
				Object.assign(returnStrings, regionStrings)
			}
		}

		return { ...elem.strings?.content, ...returnStrings}

	},[])

	const onFileDownload = useCallback(async () => {
		let stringsObj = {}

		for(const item of Object.entries(repoFileData)){
			const location:any = item[1]
			const results = await recursiveFindStrings(location)
			stringsObj = {...stringsObj, ...results}
		}
		const stringData = createCSVDataString(stringsObj)
		const csvData = new Blob([stringData], { type: 'text/csv' })
		const csvUrl = URL.createObjectURL(csvData)
		window.open(csvUrl)

	}, [repoFileData, recursiveFindStrings])

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
							<div className="fileDropZone" onDragEnter={onDragFile} onDragOver={onDragFile} onDrop={onDropFile}>

								<div className="fileOptions">
									<input
										ref={fileUploadRef}
										type="file"
										onChange={onFileUpload}
									/>
									<p>{t('Translate.dragDropText')}</p>
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

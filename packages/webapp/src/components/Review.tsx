/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import {
	PrimaryButton,
	DetailsList,
	DetailsListLayoutMode,
	ProgressIndicator,
	TextField,
	MessageBar,
	MessageBarType,
} from 'office-ui-fabric-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPR } from '../actions/repoActions'
import { getAppStore } from '../store/store'
import { getChanges } from '../selectors/changesSelectors'

import './Review.scss'

export interface ReviewProp {
	showDashboard: () => void
}

const setInitialFormData = (initData: any | undefined) => {
	if (!initData) return {
		prTitle: '',
		prDetails: ''
	}
	return {
		prTitle: initData.title ?? '',
		prDetails: initData.body ?? ''
	}
}

export default observer(function Review(props: ReviewProp) {
	const { showDashboard } = props
	const changesColumns = [
		{
			key: 'labelCol',
			name: 'Pending Changes',
			fieldName: 'label',
			minWidth: 200,
			isResizable: true,
		},
	]

	const [changesList, setChangesList] = useState<any[]>([])
	const [locationUpdates, setLocationUpdates] = useState<any[]>([])
	const [globalUpdates, setGlobalUpdates] = useState<any[]>([])
	const [showLoading, setShowLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<
		{ message: string } | undefined
	>()
	const state = getAppStore()
	const [formData, setFormData] = useState<any>(setInitialFormData(state.loadedPRData))
	const fieldChanges = useRef<any>(formData)
	const changeSummary = useRef<any[]>([])

	useEffect(() => {
		try {
			const { globalUpdates, locationUpdates, changesList, changeSummary: tempChangeSummary } = getChanges()

			changeSummary.current = tempChangeSummary
			setLocationUpdates(locationUpdates)
			setChangesList(changesList)
			setGlobalUpdates(globalUpdates)
		} catch (err) {
			setErrorMessage(err)
		}
	}, [state.initRepoFileData, state.repoFileData, state.initGlobalFileData, state.globalFileData, changeSummary])

	const handleTextChange = useCallback(
		(ev) => {
			const value = ev.target.value
			fieldChanges.current = {
				...fieldChanges.current,
				...{
					[ev.target.name]: value,
				},
			}

			setFormData({ ...formData, ...fieldChanges.current })
		},
		[formData, fieldChanges]
	)

	return (
		<div className="reviewPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ Review</div>
						<div className="mainTitle">Review</div>
					</div>
				</div>
				<div className="bodyContent">
					{errorMessage && (
						<MessageBar
							messageBarType={MessageBarType.error}
							dismissButtonAriaLabel="Close"
						>
							<p>Unexpected {errorMessage?.toString()}</p>
						</MessageBar>
					)}
					{!showLoading ? (
						<section>
							<div className="submitContainer">
								<TextField
									label="Title (Optional):"
									name="prTitle"
									value={formData.prTitle}
									onChange={handleTextChange}
								/>
								<TextField
									label="Details (Optional):"
									name="prDetails"
									multiline={true}
									rows={5}
									autoAdjustHeight={true}
									resizable={false}
									value={formData.prDetails}
									onChange={handleTextChange}
								/>
								<DetailsList
									items={changesList}
									columns={changesColumns}
									setKey="set"
									layoutMode={DetailsListLayoutMode.justified}
									checkboxVisibility={2}
								/>
								<PrimaryButton
									text="Submit changes"
									onClick={() => {
										setShowLoading(true)
										createPR([
											globalUpdates,
											locationUpdates,
											showDashboard,
											formData,
											changeSummary.current,
										])
									}}
								/>
							</div>
						</section>
					) : (
						<section className="loadingContainer">
							<ProgressIndicator description="Saving changes..." />
						</section>
					)}
				</div>
			</div>
		</div>
	)
})
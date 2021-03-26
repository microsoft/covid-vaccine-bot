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
import { getObjDiffs } from '../utils/dataUtils'

import './Review.scss'

export interface ReviewProp {
	showDashboard: () => void
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

	const [formData, setFormData] = useState<any>({})
	const fieldChanges = useRef<any>(formData)
	const changeSummary = useRef<any[]>([])

	const state = getAppStore()
	useEffect(() => {
		const tempChangesList: any[] = []
		const tempLocationUpdates: any[] = []
		const tempGlobalUpdates: any[] = []

		try {
			if (
				JSON.stringify(state.initGlobalFileData.customStrings).toLowerCase() !==
				JSON.stringify(state.globalFileData.customStrings).toLowerCase()
			) {
				tempChangesList.push({
					label: `Global strings information updated`,
					value: state.globalFileData.customStrings,
				})
				tempGlobalUpdates.push(state.globalFileData.customStrings)

				changeSummary.current.push({
					key: 'global',
					type: 'customStrings',
					value: getObjDiffs(
						JSON.parse(JSON.stringify(state.initGlobalFileData.customStrings)),
						JSON.parse(JSON.stringify(state.globalFileData.customStrings))
					),
				})
			}

			if (
				JSON.stringify(state.initGlobalFileData.cdcStateNames).toLowerCase() !==
				JSON.stringify(state.globalFileData.cdcStateNames).toLowerCase()
			) {
				tempChangesList.push({
					label: `State names information updated`,
					value: state.globalFileData.cdcStateNames,
				})
				tempGlobalUpdates.push(state.globalFileData.cdcStateNames)

				changeSummary.current.push({
					key: 'global',
					type: 'cdcStateNames',
					value: getObjDiffs(
						JSON.parse(JSON.stringify(state.initGlobalFileData.cdcStateNames)),
						JSON.parse(JSON.stringify(state.globalFileData.cdcStateNames))
					),
				})
			}

			if (
				JSON.stringify(state.initGlobalFileData.cdcStateLinks).toLowerCase() !==
				JSON.stringify(state.globalFileData.cdcStateLinks).toLowerCase()
			) {
				tempChangesList.push({
					label: `State links information updated`,
					value: state.globalFileData.cdcStateLinks,
				})
				tempGlobalUpdates.push(state.globalFileData.cdcStateLinks)

				changeSummary.current.push({
					key: 'global',
					type: 'cdcStateLinks',
					value: getObjDiffs(
						JSON.parse(JSON.stringify(state.initGlobalFileData.cdcStateLinks)),
						JSON.parse(JSON.stringify(state.globalFileData.cdcStateLinks))
					),
				})
			}

			Object.keys(state.repoFileData).forEach((location: any) => {
				if (state.initRepoFileData) {
					if (!state.initRepoFileData[location]) {
						tempChangesList.push({
							label: `New location added - ${location}`,
							value: state.repoFileData[location],
						})
						tempLocationUpdates.push({
							key: location,
							data: state.repoFileData[location],
						})
					} else {
						let addChanges = false
						if (
							JSON.stringify(
								state.initRepoFileData[location].info
							).toLowerCase() !==
							JSON.stringify(state.repoFileData[location].info).toLowerCase()
						) {
							tempChangesList.push({
								label: `Updated information for ${location}`,
								value: state.repoFileData[location],
							})

							changeSummary.current.push({
								key: location,
								type: 'info',
								value: getObjDiffs(
									JSON.parse(
										JSON.stringify(state.initRepoFileData[location].info)
									),
									JSON.parse(JSON.stringify(state.repoFileData[location].info))
								),
							})
							addChanges = true
						}
						if (
							state.repoFileData[location].regions &&
							JSON.stringify(
								state.initRepoFileData[location].regions
							)?.toLowerCase() !==
								JSON.stringify(
									state.repoFileData[location].regions
								).toLowerCase()
						) {
							tempChangesList.push({
								label: `Updated regions for ${location}`,
								value: state.repoFileData[location],
							})

							changeSummary.current.push({
								key: location,
								type: 'regions',
								value: getObjDiffs(
									JSON.parse(
										JSON.stringify(
											state.initRepoFileData[location].regions ?? {}
										)
									),
									JSON.parse(
										JSON.stringify(state.repoFileData[location].regions)
									)
								),
							})
							addChanges = true
						}
						if (
							JSON.stringify(
								state.initRepoFileData[location].vaccination
							).toLowerCase() !==
							JSON.stringify(
								state.repoFileData[location].vaccination
							).toLowerCase()
						) {
							tempChangesList.push({
								label: `Updated phase information for ${location}`,
								value: state.repoFileData[location],
							})

							changeSummary.current.push({
								key: location,
								type: 'vaccination',
								value: getObjDiffs(
									JSON.parse(
										JSON.stringify(state.initRepoFileData[location].vaccination)
									),
									JSON.parse(
										JSON.stringify(state.repoFileData[location].vaccination)
									)
								),
							})
							addChanges = true
						}
						if (
							JSON.stringify(
								state.initRepoFileData[location].strings
							).toLowerCase() !==
							JSON.stringify(state.repoFileData[location].strings).toLowerCase()
						) {
							tempChangesList.push({
								label: `Updated strings information for ${location}`,
								value: state.repoFileData[location],
							})

							changeSummary.current.push({
								key: location,
								type: 'strings',
								value: getObjDiffs(
									JSON.parse(
										JSON.stringify(state.initRepoFileData[location].strings)
									),
									JSON.parse(
										JSON.stringify(state.repoFileData[location].strings)
									)
								),
							})
							addChanges = true
						}
						if (addChanges) {
							tempLocationUpdates.push({
								key: location,
								data: state.repoFileData[location],
							})
						}
					}
				}
			})

			setLocationUpdates(tempLocationUpdates)
			setChangesList(tempChangesList)
			setGlobalUpdates(tempGlobalUpdates)
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

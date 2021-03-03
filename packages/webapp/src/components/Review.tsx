/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import {
	PrimaryButton,
	DetailsList,
	DetailsListLayoutMode,
	IColumn,
	ProgressIndicator,
} from 'office-ui-fabric-react'
import { useState, useEffect } from 'react'
import { createPR } from '../actions/repoActions'

import { getAppStore } from '../store/store'
import { deepDiffMapper } from '../utils/dataUtils'

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

	const state = getAppStore()
	useEffect(() => {
		const tempChangesList: any[] = []
		const tempLocationUpdates: any[] = []
		const tempGlobalUpdates: any[] = []

		if (
			JSON.stringify(state.initGlobalFileData.customStrings).toLowerCase() !=
			JSON.stringify(state.globalFileData.customStrings).toLowerCase()
		) {
			tempChangesList.push({
				label: `Global strings information updated`,
				value: state.globalFileData.customStrings,
			})
			tempGlobalUpdates.push(state.globalFileData.customStrings)
		}

		if (
			JSON.stringify(state.initGlobalFileData.cdcStateNames).toLowerCase() !=
			JSON.stringify(state.globalFileData.cdcStateNames).toLowerCase()
		) {
			tempChangesList.push({
				label: `State names information updated`,
				value: state.globalFileData.cdcStateNames,
			})
			tempGlobalUpdates.push(state.globalFileData.cdcStateNames)
		}

		if (
			JSON.stringify(state.initGlobalFileData.cdcStateLinks).toLowerCase() !=
			JSON.stringify(state.globalFileData.cdcStateLinks).toLowerCase()
		) {
			tempChangesList.push({
				label: `State links information updated`,
				value: state.globalFileData.cdcStateLinks,
			})
			tempGlobalUpdates.push(state.globalFileData.cdcStateLinks)
		}

		Object.keys(state.repoFileData).forEach((location: any) => {
			if (state.initRepoFileData) {
				if (!state.initRepoFileData[location]) {
					tempChangesList.push({
						label: `New location added - ${location}`,
						value: state.repoFileData[location],
					})
					tempLocationUpdates.push(state.repoFileData[location])
				} else {
					let addChanges = false
					if (
						JSON.stringify(
							state.initRepoFileData[location].info
						).toLowerCase() !=
						JSON.stringify(state.repoFileData[location].info).toLowerCase()
					) {
						tempChangesList.push({
							label: `Updated information for ${location}`,
							value: state.repoFileData[location],
						})
						addChanges = true
					}
					if (
						state.repoFileData[location].regions &&
						JSON.stringify(
							state.initRepoFileData[location].regions
						)?.toLowerCase() !=
							JSON.stringify(state.repoFileData[location].regions).toLowerCase()
					) {
						tempChangesList.push({
							label: `Updated regions for ${location}`,
							value: state.repoFileData[location],
						})
						addChanges = true
					}
					if (
						JSON.stringify(
							state.initRepoFileData[location].vaccination
						).toLowerCase() !=
						JSON.stringify(
							state.repoFileData[location].vaccination
						).toLowerCase()
					) {
						tempChangesList.push({
							label: `Updated phase information for ${location}`,
							value: state.repoFileData[location],
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
	}, [state.initRepoFileData, state.repoFileData, state.initGlobalFileData, state.globalFileData])

	return (
		<div className="reviewPageContainer">
			<div className="bodyContainer">
				<div className="bodyContent">
					{!showLoading ? (
						<section>
							<DetailsList
								items={changesList}
								columns={changesColumns}
								setKey="set"
								layoutMode={DetailsListLayoutMode.justified}
								checkboxVisibility={2}
							/>
							<div className="submitContainer">
								<PrimaryButton
									text="Submit changes"
									onClick={() => {
										setShowLoading(true)
										createPR([globalUpdates, locationUpdates, showDashboard])
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

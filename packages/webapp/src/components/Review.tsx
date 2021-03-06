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
	TextField
} from 'office-ui-fabric-react'
import { useState, useCallback, useRef } from 'react'
import { createPR } from '../actions/repoActions'
import { getChanges } from '../selectors/changesSelectors'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'

import './Review.scss'

const githubRepoOwner = process.env.REACT_APP_REPO_OWNER
const githubRepoName = process.env.REACT_APP_REPO_NAME
export interface ReviewProp {
	showDashboard: () => void
}

const setInitialFormData = (initData: any | undefined) => {
	if (!initData)
		return {
			prTitle: '',
			prDetails: '',
		}
	return {
		prTitle: initData.title ?? '',
		prDetails: initData.body ?? '',
	}
}

export default observer(function Review(props: ReviewProp) {
	const { showDashboard } = props
	const changesColumns = [
		{
			key: 'labelCol',
			name: t('Review.columns.pending'),
			fieldName: 'label',
			minWidth: 200,
			isResizable: true,
		}
	]

	const [showLoading, setShowLoading] = useState<boolean>(false)
	const state = getAppStore()
	const [formData, setFormData] = useState<any>(
		setInitialFormData(state.loadedPRData)
	)
	const fieldChanges = useRef<any>(formData)

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

	const handleSubmit = useCallback(
		(resp) => {
			if (resp?.error) {
				setShowLoading(false)
			} else {
				showDashboard()
			}
		},
		[showDashboard]
	)

	const renderChangeLists = () => {
		const items = getChanges()
		if (items.length > 0) {
			return (
				<DetailsList
					items={items}
					columns={changesColumns}
					setKey="set"
					layoutMode={DetailsListLayoutMode.justified}
					checkboxVisibility={2}
				/>
			)
		}

		if (state.userWorkingBranch) {
			const sinceDate = new Date(parseInt(state.userWorkingBranch.split('-policy-')[1])).toLocaleString('sv').replace(' ','T')
			return (
				 <div>{t('Review.OnWorkingBranch',true, githubRepoOwner as string, githubRepoName, state.userWorkingBranch, sinceDate)}</div>
			)
		}
		else {
			return (
				<div>{t('Review.NoChangeList')}</div>
			)
		}
	}

	return (
		<div className="reviewPageContainer">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ {t('Review.title')}</div>
						<div className="mainTitle">{t('Review.title')}</div>
					</div>
				</div>
				<div className="bodyContent">
					{!showLoading ? (
						<section>
							<div className="submitContainer">
								<TextField
									label={t('Review.SubmitForm.titleLabel')}
									name="prTitle"
									value={formData.prTitle}
									onChange={handleTextChange}
								/>
								<TextField
									label={t('Review.SubmitForm.detailsLabel')}
									name="prDetails"
									multiline={true}
									rows={5}
									autoAdjustHeight={true}
									resizable={false}
									value={formData.prDetails}
									onChange={handleTextChange}
								/>
								{renderChangeLists()}
								<PrimaryButton
									text={t('Review.SubmitForm.submitText')}
									onClick={() => {
										setShowLoading(true)
										createPR([
											handleSubmit,
											formData,
										])
									}}
								/>
							</div>
						</section>
					) : (
						<section className="loadingContainer">
							<ProgressIndicator description={t('Review.saving')} />
						</section>
					)}
				</div>
			</div>
		</div>
	)
})

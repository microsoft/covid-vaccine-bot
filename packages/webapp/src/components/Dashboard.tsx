/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	DetailsList,
	DetailsListLayoutMode,
	ProgressIndicator,
	IColumn,
	FontIcon,
	Dialog,
	DialogType,
	DialogFooter,
	PrimaryButton,
	DefaultButton,
	Callout,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useState, useEffect, useCallback } from 'react'
import { initializeGitData, loadPR, loadBranch } from '../actions/repoActions'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'

import './Dashboard.scss'

export default observer(function Dashboard() {
	const state = getAppStore()
	const [prList, setPRList] = useState<any[]>([])
	const [issueList, setIssueList] = useState<any[]>([])
	const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true)
	const [noteKeys, setNoteKeys] = useState<any>([])

	useEffect(() => {
		if (state.issues) {
			const tempPRList: any = []
			const tempIssueList: any = []
			state.issues.forEach((item: any) => {
				const requestUpdate: Date = new Date(item.updated_at)
				const isScrappedIssue = item.labels.some(
					(x: any) => x.name.toLowerCase() === 'scrapped changes'
				)

				if (item.pull_request) {
					tempPRList.push({
						title: item.title,
						author: item.user.login,
						update: requestUpdate.toLocaleString(),
						action: item,
					})
				} else if (isScrappedIssue) {
					tempIssueList.push({
						title: item.title,
						author: item.user.login,
						update: requestUpdate.toLocaleString(),
						action: item,
					})
				}
			})

			setPRList(tempPRList)
			setIssueList(tempIssueList)
		}
	}, [state.issues])

	const onIssueActionRender = (
		item?: any,
		index?: number,
		column?: IColumn
	) => {
		return (
			<a
				className="tableActionLink"
				href={item?.action?.html_url}
				target="_blank"
				rel="noreferrer"
			>
				<FontIcon iconName="CircleAdditionSolid" />
				{t('Dashboard.LocationUpdates.view')}
			</a>
		)
	}

	const onPRActionRender = (item?: any, index?: number, column?: IColumn) => {
		const disabled = state.loadedPRData?.number === item?.action.number
		return (
			<div className="actionsColumn">
				<a
					className="tableActionLink"
					href={item?.action?.html_url}
					target="_blank"
					rel="noreferrer"
				>
					<FontIcon iconName="CircleAdditionSolid" />
					{t('Dashboard.PendingPRs.approve')}
				</a>
				<div
					className={`loadPRButton ${disabled ? 'disabled' : ''}`}
					onClick={() => loadPR(item.action.number)}
				>
					<FontIcon iconName="DrillDownSolid" />
					{t('Dashboard.PendingPRs.load')}
				</div>
			</div>
		)
	}

	const onBranchActionRender = (
		item?: any,
		index?: number,
		column?: IColumn
	) => {
		const disabled = state.userWorkingBranch === item?.name

		return (
			<div className="actionsColumn">
				<div
					className={`loadPRButton ${disabled ? 'disabled' : ''}`}
					onClick={() => loadBranch(item)}
				>
					<FontIcon iconName="DrillDownSolid" />
					{t('Dashboard.WorkingBranches.load')}
				</div>
			</div>
		)
	}

	const toggleCallout = useCallback(
		(id: number) => {
			const tempItems = [...noteKeys]
			const index = tempItems.indexOf(id)
			if (index > -1) {
				tempItems.splice(index, 1)
			} else {
				tempItems.push(id)
			}

			setNoteKeys(tempItems)
		},
		[noteKeys]
	)

	const onPRNotesRender = (item?: any, index?: number, column?: IColumn) => {
		if (!item.action.body) {
			return null
		}

		return (
			<>
				<FontIcon
					className={`infoButton pr-${item.action.number}`}
					iconName="InfoSolid"
					onClick={() => toggleCallout(item.action.number)}
				/>
				{noteKeys.includes(item.action.number) && (
					<Callout
						onDismiss={() => toggleCallout(item.action.number)}
						target={`.infoButton.pr-${item.action.number}`}
						gapSpace={4}
						setInitialFocus={true}
						role="alertDialog"
						className="infoCallout"
						directionalHint={5}
					>
						<div className="infoCalloutBody">
							<div className="infoHeader">
								{t('Dashboard.PendingPRs.notes')}
							</div>
							<div className="infoBody">{item.action.body}</div>
						</div>
					</Callout>
				)}
			</>
		)
	}

	const onBranchCreatedDateRender = (item: any) => {
		return (
			<div>
				{new Date(parseInt(item.name.split('-policy-')[1])).toLocaleString()}
			</div>
		)
	}

	const prColumns = [
		{
			key: 'titleCol',
			name: t('Dashboard.LocationUpdates.columns.title'),
			fieldName: 'title',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'notesCol',
			name: t('Dashboard.LocationUpdates.columns.notes'),
			fieldName: 'notes',
			minWidth: 100,
			isResizable: true,
			onRender: onPRNotesRender,
		},
		{
			key: 'authorCol',
			name: t('Dashboard.LocationUpdates.columns.author'),
			fieldName: 'author',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'updateCol',
			name: t('Dashboard.LocationUpdates.columns.update'),
			fieldName: 'update',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'actionCol',
			name: '',
			ariaLabel: t('Dashboard.LocationUpdates.action.ariaLabel'),
			fieldName: 'action',
			minWidth: 200,
			isResizable: true,
			onRender: onPRActionRender,
		},
	]

	const issueColumns = [
		{
			key: 'titleCol',
			name: t('Dashboard.LocationUpdates.columns.title'),
			fieldName: 'title',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'authorCol',
			name: t('Dashboard.LocationUpdates.columns.author'),
			fieldName: 'author',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'updateCol',
			name: t('Dashboard.LocationUpdates.columns.update'),
			fieldName: 'update',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'actionCol',
			name: '',
			ariaLabel: t('Dashboard.LocationUpdates.columns.action.ariaLabel'),
			fieldName: 'action',
			minWidth: 200,
			isResizable: true,
			onRender: onIssueActionRender,
		},
	]

	const userWorkingBranchColumns = [
		{
			key: 'branchName',
			name: t('Dashboard.WorkingBranches.columns.branchName'),
			fieldName: 'name',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'createdCol',
			name: t('Dashboard.WorkingBranches.columns.createdOn'),
			fieldName: 'createdOn',
			minWidth: 200,
			isResizable: true,
			onRender: onBranchCreatedDateRender,
		},
		{
			key: 'actionCol',
			name: '',
			ariaLabel: t('Dashboard.WorkingBranches.columns.actionsColumn.ariaLabel'),
			fieldName: 'action',
			minWidth: 200,
			isResizable: true,
			onRender: onBranchActionRender,
		},
	]

	const refreshData = useCallback(() => {
		initializeGitData()
		toggleHideDialog()
	}, [toggleHideDialog])

	const onRefreshDataClick = useCallback(() => {
		if (state.pendingChanges) {
			toggleHideDialog()
		} else {
			initializeGitData()
		}
	}, [state.pendingChanges, toggleHideDialog])

	return (
		<div className="dashboardPageWrapper">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ {t('Dashboard.title')}</div>
						<div className="mainTitle">{t('Dashboard.title')}</div>
					</div>
				</div>
				<div className="bodyContent">
					{!state.isDataRefreshing ? (
						<section>
							<div className="refreshRow">
								<div></div>
								<div
									className="refreshDataHeaderButton"
									onClick={onRefreshDataClick}
								>
									<FontIcon iconName="Refresh" className="refreshIcon" />
									{t('Dashboard.RefreshButton')}
								</div>
							</div>
							<div className="sectionHeader">
								{t('Dashboard.WorkingBranches.title')}
							</div>
							<div className="sectionContent">
								<DetailsList
									items={state.userWorkingBranches}
									columns={userWorkingBranchColumns}
									setKey="set"
									layoutMode={DetailsListLayoutMode.justified}
									ariaLabelForSelectionColumn={t(
										'Dashboard.WorkingBranches.ariaLabelForSelectionColumn'
									)}
									ariaLabelForSelectAllCheckbox={t(
										'Dashboard.WorkingBranches.ariaLabelForSelectAllCheckbox'
									)}
									checkButtonAriaLabel={t(
										'Dashboard.WorkingBranches.checkButtonAriaLabel'
									)}
									checkboxVisibility={2}
								/>
								{!state.userWorkingBranches.length && (
									<div style={{ textAlign: 'center' }}>
										{t('Dashboard.WorkingBranches.empty')}
									</div>
								)}
							</div>
							<div className="sectionHeader">
								{t('Dashboard.PendingPRs.title')}
							</div>
							<div className="sectionContent">
								<DetailsList
									items={prList}
									columns={prColumns}
									setKey="set"
									layoutMode={DetailsListLayoutMode.justified}
									ariaLabelForSelectionColumn={t(
										'Dashboard.PendingPRs.ariaLabelForSelectionColumn'
									)}
									ariaLabelForSelectAllCheckbox={t(
										'Dashboard.PendingPRs.ariaLabelForSelectAllCheckbox'
									)}
									checkButtonAriaLabel={t(
										'Dashboard.PendingPRs.checkButtonAriaLabel'
									)}
									checkboxVisibility={2}
								/>
								{!prList.length && (
									<div style={{ textAlign: 'center' }}>
										{t('Dashboard.WorkingBranches.empty')}
									</div>
								)}
							</div>
							<div className="sectionHeader">
								{t('Dashboard.LocationUpdates.title')}
							</div>
							<div className="sectionContent">
								<DetailsList
									items={issueList}
									columns={issueColumns}
									setKey="set"
									layoutMode={DetailsListLayoutMode.justified}
									ariaLabelForSelectionColumn={t(
										'Dashboard.LocationUpdates.ariaLabelForSelectionColumn'
									)}
									ariaLabelForSelectAllCheckbox={t(
										'Dashboard.LocationUpdates.ariaLabelForSelectAllCheckbox'
									)}
									checkButtonAriaLabel={t(
										'Dashboard.LocationUpdates.checkButtonAriaLabel'
									)}
									checkboxVisibility={2}
								/>
								{!issueList.length && (
									<div style={{ textAlign: 'center' }}>
										{t('Dashboard.LocationUpdates.empty')}
									</div>
								)}
							</div>
						</section>
					) : (
						<section>
							<ProgressIndicator description={t('Dashboard.loading')} />
						</section>
					)}
				</div>
			</div>
			<Dialog
				hidden={hideDialog}
				onDismiss={toggleHideDialog}
				dialogContentProps={{
					type: DialogType.normal,
					closeButtonAriaLabel: 'Close',
					title: t('Dashboard.RefreshButton'),
				}}
				modalProps={{ isBlocking: false }}
			>
				<div className="dialogBodyText">
					{t('Dashboard.PendingChangesDialog.text', true)}
				</div>
				<DialogFooter>
					<PrimaryButton
						onClick={refreshData}
						text={t('Dashboard.PendingChangesDialog.submit')}
					/>
					<DefaultButton
						onClick={toggleHideDialog}
						text={t('Dashboard.PendingChangesDialog.cancel')}
					/>
				</DialogFooter>
			</Dialog>
		</div>
	)
})

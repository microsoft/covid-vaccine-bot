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
	DefaultButton
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import React, { useState, useEffect, useCallback } from 'react'
import { initializeGitData } from '../actions/repoActions'
import { getAppStore } from '../store/store'



import './Dashboard.scss'

export default observer(function Dashboard() {

	const state = getAppStore()

	const [prList, setPRList] = useState<any[]>([])
	const [issueList, setIssueList] = useState<any[]>([])
	const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);

	useEffect(() => { 
		if(state.issues){
			const tempPRList:any = [];
			const tempIssueList:any = [];
			state.issues.forEach( (item:any) => {

				const requestUpdate:Date = new Date(item.updated_at);
				const isScrappedIssue = item.labels.some( (x:any) => x.name.toLowerCase() === "scrapped changes" )

				if(item.pull_request){

					tempPRList.push({ title:item.title, author:item.user.login, update:requestUpdate.toLocaleString(), action:item});
				}
				else if (isScrappedIssue){
					tempIssueList.push({ title:item.title, author:item.user.login, update:requestUpdate.toLocaleString(), action:item});
				}

			} );

			setPRList(tempPRList);
			setIssueList(tempIssueList);
		}
	},[state.issues])

	const onIssueActionRender =  (item?: any, index?: number, column?: IColumn) =>  {

		return (<a className="tableActionLink" href={item?.action?.html_url} target="_blank" rel="noreferrer">
							<FontIcon
								iconName="CircleAdditionSolid"
							/> 
							View</a>)

	};


	const onPRActionRender =  (item?: any, index?: number, column?: IColumn) =>  {

		return (<a className="tableActionLink" href={item?.action?.html_url} target="_blank" rel="noreferrer">
							<FontIcon
								iconName="CircleAdditionSolid"
							/> 
							Approve</a>)

	};

	const prColumns = [
		{
			key: 'titleCol',
			name: 'Title',
			fieldName: 'title',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'authorCol',
			name: 'Author',
			fieldName: 'author',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'updateCol',
			name: 'Last Update',
			fieldName: 'update',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'actionCol',
			name: '',
			ariaLabel:'Actions Column',
			fieldName: 'action',
			minWidth: 200,
			isResizable: true,
			onRender: onPRActionRender
		},
	];

	const issueColumns = [
		{
			key: 'titleCol',
			name: 'Title',
			fieldName: 'title',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'authorCol',
			name: 'Author',
			fieldName: 'author',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'updateCol',
			name: 'Last Update',
			fieldName: 'update',
			minWidth: 200,
			isResizable: true,
		},
		{
			key: 'actionCol',
			name: '',
			ariaLabel:'Actions Column',
			fieldName: 'action',
			minWidth: 200,
			isResizable: true,
			onRender: onIssueActionRender
		},

	];

	const refreshData = useCallback(() => {
		initializeGitData()
		toggleHideDialog()
	},[toggleHideDialog])

	const onRefreshDataClick = useCallback(() => {
		if (state.pendingChanges) {
			toggleHideDialog()
		} else {
			initializeGitData()
		}
	},[state.pendingChanges, toggleHideDialog])

	return (
		<div className="dashboardPageWrapper">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ Dashboard</div>
						<div className="mainTitle">Dashboard</div>
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
								<FontIcon
									iconName="Refresh"
									className="refreshIcon"
								/>
								Refresh Data
							</div>
						</div>
						<div className="sectionHeader">Pending PRs</div>
						<div className="sectionContent">
						<DetailsList
							items={prList}
							columns={prColumns}
							setKey="set"
							layoutMode={DetailsListLayoutMode.justified}
							ariaLabelForSelectionColumn="Toggle selection"
							ariaLabelForSelectAllCheckbox="Toggle selection for all items"
							checkButtonAriaLabel="Row checkbox"
							checkboxVisibility={2}
						/>
						{ !prList.length && (
							<div style={{textAlign:"center"}}>No pending PRs at this time.</div>
						) }
						</div>
						<div className="sectionHeader">Location Updates</div>
						<div className="sectionContent">
							<DetailsList
							items={issueList}
							columns={issueColumns}
							setKey="set"
							layoutMode={DetailsListLayoutMode.justified}
							ariaLabelForSelectionColumn="Toggle selection"
							ariaLabelForSelectAllCheckbox="Toggle selection for all items"
							checkButtonAriaLabel="Row checkbox"
							checkboxVisibility={2}
						/>
						{ !issueList.length && (
							<div style={{textAlign:"center"}}>No pending location updates at this time.</div>
						) }
						</div>
					</section>):(
					<section>
						<ProgressIndicator description="Loading content..." />
					</section>
					) }
				</div>
			</div>
			<Dialog
				hidden={hideDialog}
				onDismiss={toggleHideDialog}
				dialogContentProps={{
					type: DialogType.normal,
					closeButtonAriaLabel: 'Close',
					title: 'Refresh Data'
				}}
				modalProps={{isBlocking: false}}
			>
			<div className="dialogBodyText">You have pending changes in the review tab to be submitted, refreshing the data will revert those changes.<br/><br/>Do you want to proceed?</div>
			<DialogFooter>
				<PrimaryButton onClick={refreshData} text="Ok" />
				<DefaultButton onClick={toggleHideDialog} text="Cancel" />
				</DialogFooter>
			</Dialog>
		</div>
	)
})

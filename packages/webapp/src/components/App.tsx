/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	Dropdown,
	IconButton,
	Persona,
	PersonaSize,
	Pivot,
	PivotItem,
	ContextualMenu,
	MessageBar,
	MessageBarButton,
	Modal,
	Spinner
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { loginUser, reLoginUser } from '../actions/authActions'
import { initializeGitData, saveContinue } from '../actions/repoActions'
import { setAppLanguage } from '../actions/intlActions'
import { logoutUser } from '../mutators/authMutators'
import { getAppStore } from '../store/store'
import { getLanguageOptions } from '../utils/textUtils'
import Dashboard from './Dashboard'
import { Footer } from './Footer'
import Locations from './Locations'
import Login from './Login'
import QualifierPanel from './QualifierPanel'
import Review from './Review'
import Translate from './Translate'
import UnAuthorized from './UnAuthorized'
import UserAccessExpirationForm from './UserAccessExpirationForm'

import './App_reset_styles.scss'
import './App.scss'
import { setCurrentLanguage } from '../mutators/repoMutators'

export default observer(function App() {
	const state = getAppStore()
	const [isPanelOpen, { setTrue: showPanel, setFalse: hidePanel }] = useBoolean(
		false
	)
	const [
		isPersonaMenuOpen,
		{ setTrue: showPersonaMenu, setFalse: hidePersonaMenu },
	] = useBoolean(false)
	const [branchWasSaved, setBranchWasSaved] = useState(false)
	const [
		isAccessExpiration,
		{ setTrue: showAccessExpirationModal, setFalse: hideAccessExpirationModal },
	] = useBoolean(false)
	const [selectedKey, setSelectedKey] = useState<string>('Dashboard')
	const personaComponent = useRef(null)

	useEffect(() => {
		if (state.accessToken && !state.globalFileData) 
			loginUser()
	}, [state.accessToken, state.globalFileData])

	useEffect(() => {
		if(state.userAccessExpired)
			showAccessExpirationModal()
	}, [state.userAccessExpired, showAccessExpirationModal])

	useEffect(() => {
		if (state.pendingChanges) {
			window.onbeforeunload = function () {
				return true
			}
		} else {
			window.onbeforeunload = null
		}
	}, [state.pendingChanges])

	useEffect(() => {
		setAppLanguage(state.currentLanguage)
	},[state.currentLanguage])

	const togglePanel = useCallback(
		(item?: any) => {
			if (item.props.headerText === 'Locations') {
				showPanel()
			} else {
				hidePanel()
			}
			setSelectedKey(item.props.headerText)
		},
		[showPanel, hidePanel, setSelectedKey]
	)

	const showDashboard = useCallback(() => {
		setSelectedKey('Dashboard')
	}, [setSelectedKey])

	const onAccessExpirationFormSubmit = useCallback(() => {
		if(state.globalFileData)
			reLoginUser()
		else 
			loginUser()

		hideAccessExpirationModal()
	}, [state.globalFileData, hideAccessExpirationModal])

	const renderRepoMessageBar = () => {
		if (state.loadedPRData && state.prChanges && !state.isDataRefreshing) {
			return (
				<MessageBar
					messageBarType={5}
					isMultiline={true}
					styles={{ root: { margin: '10px 5px' } }}
				>
					You are currently working on:{' '}
					<strong>
						PR: {state.loadedPRData.number} - {state.loadedPRData.title}
					</strong>
					<br />
					Last updated by:{' '}
					{state.prChanges?.last_commit?.commit?.committer?.name}
					<br />
					Last updated on:{' '}
					{new Date(state.loadedPRData.updated_at).toLocaleString()}
				</MessageBar>
			)
		}

		return null
	}

	const renderSaveContinueMessageBar = () => {
		if (state.pendingChanges) {
			return (
				<MessageBar
					styles={{ root: { margin: '10px 5px' } }}
					actions={
						!!state.loadedPRData ? undefined : (
							<div>
								{!state.isSavingCommits ? (
								<>
									<MessageBarButton disabled={state.isDataRefreshing} onClick={initializeGitData}>
										Discard
									</MessageBarButton>
									<MessageBarButton
										disabled={state.isDataRefreshing}
										onClick={() => {
											setBranchWasSaved(true)
											saveContinue()
										}}
									>
										Save and Continue
									</MessageBarButton>
								</>
								) : (
									<Spinner label="Saving changes..." ariaLive="assertive" labelPosition="left" />
								)}
							</div>
						)
					}
				>
					You have pending changes, please click on the review tab to submit
					these changes.
				</MessageBar>
			)
		} else if (state.userWorkingBranch) {
			return (
				<MessageBar
					messageBarType={4}
					styles={{ root: { margin: '10px 5px' } }}
				>
					{branchWasSaved
						? 'Your changes have been saved  to'
						: 'You are now working on branch '}{' '}
					{state.userWorkingBranch}, <br />
					please click on the review tab to submit these changes.
				</MessageBar>
			)
		}

		return null
	}

	return (
		<div className="rootContentWrapper">
			{state.isAuthenticated ? (
				<>
					<Switch>
						<Route exact path="/">
							<div className="appPageContainer">
								<div className="appHeaderWrapper">
									<div className="appHeaderContainer">
										<IconButton
											iconProps={{ iconName: 'waffle' }}
											title="Apps"
											styles={{
												icon: { fontSize: '24px', color: 'white' },
												rootHovered: { backgroundColor: 'transparent' },
												rootPressed: { backgroundColor: 'transparent' },
											}}
										/>
										<div className="appHeaderTitle">{state.localization?.app?.title}</div>
									</div>
									<div className="appHeaderPersona">
										<div>
											<Dropdown
												defaultSelectedKey={state.currentLanguage}
												onChange={(e, o) => setCurrentLanguage(o)}
												ariaLabel="Pick Language"
												options={getLanguageOptions()}
												styles={{
													dropdown: { border: 'none' },
													title: {
														fontSize: '14px',
														color: 'white !important',
														border: 'none',
														backgroundColor: 'transparent',
													},
													caretDown: {
														color: 'white !important',
														fontSize: '14px',
													},
													dropdownOptionText: { fontSize: '14px' },
													root: {
														selectors: {
															':hover': {
																backgroundColor: 'rgba(0,0,0,.25);',
															},
														},
													},
												}}
											/>
										</div>
										<div
											ref={personaComponent}
											onClick={showPersonaMenu}
											className="appHeaderPersonaDetails"
										>
											<div className="appHeaderUsername">
												{state.userDisplayName}
											</div>
											<Persona
												text={state.userDisplayName}
												size={PersonaSize.size32}
												hidePersonaDetails={true}
											/>
										</div>
										<ContextualMenu
											items={[
												{
													key: 'logoutUserPersonaMenu',
													text: 'Logout',
													onClick: () => {
														logoutUser()
													},
												},
											]}
											hidden={!isPersonaMenuOpen}
											target={personaComponent}
											onItemClick={hidePersonaMenu}
											onDismiss={hidePersonaMenu}
										/>
									</div>
								</div>
								<div className="appBodyWrapper">
									{state.isAuthorized ? (
										<>
											<div className="appBodyLeft">
												<Pivot
													onLinkClick={togglePanel}
													selectedKey={selectedKey}
												>
													<PivotItem headerText="Dashboard" itemKey="Dashboard">
														{renderSaveContinueMessageBar()}
														{renderRepoMessageBar()}
														<Dashboard />
													</PivotItem>
													<PivotItem headerText="Locations" itemKey="Locations">
														{renderSaveContinueMessageBar()}
														{renderRepoMessageBar()}
														<Locations />
													</PivotItem>
													{state.isEditable && (
														<PivotItem
															headerText="Translate"
															itemKey="Translate"
														>
															{renderSaveContinueMessageBar()}
															{renderRepoMessageBar()}
															<Translate />
														</PivotItem>
													)}
													{(state.pendingChanges ||
														state.userWorkingBranch) && (
														<PivotItem headerText="Review" itemKey="Review">
															<Review showDashboard={showDashboard} />
														</PivotItem>
													)}
												</Pivot>
											</div>
											{state.isEditable && isPanelOpen && (
												<div className="appBodyRight">
													<QualifierPanel />
												</div>
											)}
										</>
									) : (
										<UnAuthorized />
									)}
								</div>
							</div>
							<Modal
								isOpen={isAccessExpiration}
								isModeless={false}
								isDarkOverlay={true}
								isBlocking={false}
							>
								<UserAccessExpirationForm
									onSubmit={onAccessExpirationFormSubmit}
								/>
							</Modal>
						</Route>
						<Route path="*">
							<div>404 page not found.</div>
						</Route>
					</Switch>
				</>
			) : (
				<Switch>
					<Route exact path="/">
						<Login />
					</Route>
					<Route path="*">
						<Redirect to="/" />
					</Route>
				</Switch>
			)}
			<Footer />
		</div>
	)
})

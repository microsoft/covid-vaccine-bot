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
	Spinner,
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { loginUser, reLoginUser } from '../actions/authActions'
import { setAppLanguage } from '../actions/intlActions'
import { initializeGitData, saveContinue } from '../actions/repoActions'
import { logoutUser } from '../mutators/authMutators'
import { setCurrentLanguage } from '../mutators/repoMutators'
import { getText as t } from '../selectors/intlSelectors'
import { getAppStore } from '../store/store'
import { getLanguageOptions } from '../utils/textUtils'
import Dashboard from './Dashboard'
import Footer from './Footer'
import Locations from './Locations'
import Login from './Login'
import QualifierPanel from './QualifierPanel'
import Review from './Review'
import Translate from './Translate'
import UnAuthorized from './UnAuthorized'
import UserAccessExpirationForm from './UserAccessExpirationForm'

import './App_reset_styles.scss'
import './App.scss'

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
		if (state.accessToken && !state.repoFileData) loginUser()
	}, [state.accessToken, state.repoFileData])

	useEffect(() => {
		if (state.userAccessExpired) showAccessExpirationModal()
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
	}, [state.currentLanguage])

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
		if (state.repoFileData) reLoginUser()
		else loginUser()

		hideAccessExpirationModal()
	}, [state.repoFileData, hideAccessExpirationModal])

	const renderRepoMessageBar = () => {
		if (state.loadedPRData && state.prChanges && !state.isDataRefreshing) {
			return (
				<MessageBar
					messageBarType={5}
					isMultiline={true}
					styles={{ root: { margin: '10px 5px' } }}
				>
					{t('App.RepoMessageBar.current')}{' '}
					<strong>
						PR: {state.loadedPRData.number} - {state.loadedPRData.title}
					</strong>
					<br />
					{t('App.RepoMessageBar.updatedBy')}{' '}
					{state.prChanges?.last_commit?.commit?.committer?.name}
					<br />
					{t('App.RepoMessageBar.updatedOn')}{' '}
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
										<MessageBarButton
											disabled={state.isDataRefreshing}
											onClick={initializeGitData}
										>
											{t('App.SaveContinueMessageBar.cancel')}
										</MessageBarButton>
										<MessageBarButton
											disabled={state.isDataRefreshing}
											onClick={() => {
												setBranchWasSaved(true)
												saveContinue()
											}}
										>
											{t('App.SaveContinueMessageBar.submit')}
										</MessageBarButton>
									</>
								) : (
									<Spinner
										label={t('App.SaveContinueMessageBar.saving')}
										ariaLive="assertive"
										labelPosition="left"
									/>
								)}
							</div>
						)
					}
				>
					{t('App.SaveContinueMessageBar.text')}
				</MessageBar>
			)
		} else if (state.userWorkingBranch) {
			return (
				<MessageBar
					messageBarType={4}
					styles={{ root: { margin: '10px 5px' } }}
				>
					{branchWasSaved
						? t('App.branchWasSaved.pass')
						: t('App.branchWasSaved.fail')}{' '}
					{state.userWorkingBranch}, <br />
					{t('App.branchWasSaved.text')}
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
											styles={{
												icon: { fontSize: '24px', color: 'white' },
												rootHovered: { backgroundColor: 'transparent' },
												rootPressed: { backgroundColor: 'transparent' },
											}}
										/>
										<div className="appHeaderTitle">{t('App.title', true)}</div>
									</div>
									<div className="appHeaderPersona">
										<div>
											<Dropdown
												defaultSelectedKey={state.currentLanguage}
												onChange={(e, o) => setCurrentLanguage(o)}
												ariaLabel={t('App.LanguageDropDown.ariaLabel')}
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
													text: t('App.Persona.logout'),
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
													<PivotItem
														headerText={t('App.Pivot.Dashboard').toString()}
														itemKey="Dashboard"
													>
														{renderSaveContinueMessageBar()}
														{renderRepoMessageBar()}
														<Dashboard />
													</PivotItem>
													<PivotItem
														headerText={t('App.Pivot.Locations').toString()}
														itemKey="Locations"
													>
														{renderSaveContinueMessageBar()}
														{renderRepoMessageBar()}
														<Locations />
													</PivotItem>
													{state.isEditable && (
														<PivotItem
															headerText={t('App.Pivot.Translate').toString()}
															itemKey="Translate"
														>
															{renderSaveContinueMessageBar()}
															{renderRepoMessageBar()}
															<Translate />
														</PivotItem>
													)}
													{(state.pendingChanges ||
														state.userWorkingBranch) && (
														<PivotItem
															headerText={t('App.Pivot.Review').toString()}
															itemKey="Review"
														>
															<Review showDashboard={showDashboard} />
														</PivotItem>
													)}
												</Pivot>
											</div>
											{state.isEditable && isPanelOpen && Object.keys(state.breadCrumbs).length > 0 && (
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
							<div>{t('App.NotFound')}</div>
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

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
	MessageBar
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useEffect } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { setCurrentLanguage } from '../mutators/repoMutators'
import {
	isUserAuthenticated,
	isUserAuthorized,
} from '../selectors/authSelectors'
import { getAppStore } from '../store/store'
import { getLanguageOptions } from '../utils/textUtils'
import Dashboard from './Dashboard'
import { Footer } from './Footer'
import Locations from './Locations'
import Login from './Login'
import QualifierPanel from './QualifierPanel'
import Review from './Review'
import Translate from './Translate'

import './App_reset_styles.scss'
import './App.scss'

export default observer(function App() {
	const state = getAppStore()
	const [isPanelOpen, { setTrue: showPanel, setFalse: hidePanel }] = useBoolean(
		false
	)
	const [selectedKey, setSelectedKey] = useState<string>('Dashboard')

	useEffect(() => {
		if (state.pendingChanges) {
			window.onbeforeunload = function() {
				return true;
			};
		} else {
			window.onbeforeunload = null
		}
	}, [state.pendingChanges]);

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

	return (
		<div className="rootContentWrapper">
			{isUserAuthenticated() ? (
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
										<div className="appHeaderTitle">Data Composer</div>
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
										<div className="appHeaderUsername">
											{state.userDisplayName}
										</div>
										<Persona
											text={state.userDisplayName}
											size={PersonaSize.size32}
											hidePersonaDetails={true}
										/>
									</div>
								</div>
								<div className="appBodyWrapper">
									{isUserAuthorized() ? (
										<>
											<div className="appBodyLeft">
												<Pivot
													onLinkClick={togglePanel}
													selectedKey={selectedKey}
												>
													<PivotItem headerText="Dashboard" itemKey="Dashboard">
														{state.pendingChanges && (
															<MessageBar
																styles={{ root: { margin: '10px 5px' } }}
															>
																You have pending changes, please click on the
																review tab to submit these changes.
															</MessageBar>
														)}
														{state.loadedPRData && (
															<MessageBar
																messageBarType={5}
																styles={{ root: { margin: '10px 5px' } }}
															>
																You are currently working on: {state.loadedPRData.title} (PR: {state.loadedPRData.number}, last updated on: {new Date(state.loadedPRData.updated_at).toLocaleString()})
															</MessageBar>
														)}
														<Dashboard />
													</PivotItem>
													<PivotItem headerText="Locations" itemKey="Locations">
														{state.pendingChanges && (
															<MessageBar
																styles={{ root: { margin: '10px 5px' } }}
															>
																You have pending changes, please click on the
																review tab to submit these changes.
															</MessageBar>
														)}
														{state.loadedPRData && (
															<MessageBar
																messageBarType={5}
																styles={{ root: { margin: '10px 5px' } }}
															>
																You are currently working on: {state.loadedPRData.title} (PR: {state.loadedPRData.number}, last updated on: {new Date(state.loadedPRData.updated_at).toLocaleString()})
															</MessageBar>
														)}
														<Locations />
													</PivotItem>
													{state.isEditable && (
														<PivotItem
															headerText="Translate"
															itemKey="Translate"
														>
															{state.pendingChanges && (
																<MessageBar
																	styles={{ root: { margin: '10px 5px' } }}
																>
																	You have pending changes, please click on the
																	review tab to submit these changes.
																</MessageBar>
															)}
															{state.loadedPRData && (
																<MessageBar
																	messageBarType={5}
																	styles={{ root: { margin: '10px 5px' } }}
																>
																	You are currently working on: {state.loadedPRData.title} (PR: {state.loadedPRData.number}, last updated on: {new Date(state.loadedPRData.updated_at).toLocaleString()})
																</MessageBar>
															)}
															<Translate />
														</PivotItem>
													)}
													{state.pendingChanges && (
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
										<div className="appBodyLeft">
											<div className="dashboardPageWrapper">
												<div className="bodyContainer">
													<div className="bodyHeader">
														<div className="bodyHeaderTitle">
															<div className="mainTitle">Welcome!</div>
														</div>
													</div>
												</div>
												<section style={{ width: '70%', margin: '0px auto' }}>
													<p>
														Thank you for your interest in helping to manage the
														data, unfortunately right now access to this tool
														requires collaborator permissions on{' '}
														<a
															target="_blank"
															rel="noreferrer"
															href={`https://www.github.com/${process.env.REACT_APP_REPO_OWNER}/${process.env.REACT_APP_REPO_NAME}`}
														>
															this repo
														</a>
														. Feel free to request access over on GitHub!
													</p>
												</section>
											</div>
										</div>
									)}
								</div>
							</div>
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

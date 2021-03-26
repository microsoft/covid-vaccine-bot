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
} from '@fluentui/react'
import { useBoolean } from '@uifabric/react-hooks'
import { observer } from 'mobx-react-lite'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { logoutUser } from '../mutators/authMutators'
import { setCurrentLanguage } from '../mutators/repoMutators'
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

import './App_reset_styles.scss'
import './App.scss'
import { loginUser } from '../actions/authActions'

export default observer(function App() {
	const state = getAppStore()
	const [isPanelOpen, { setTrue: showPanel, setFalse: hidePanel }] = useBoolean(
		false
	)
	const [
		isPersonaMenuOpen,
		{ setTrue: showPersonaMenu, setFalse: hidePersonaMenu },
	] = useBoolean(false)
	const [selectedKey, setSelectedKey] = useState<string>('Dashboard')
	const personaComponent = useRef(null)

	useEffect(() => {
		if (state.accessToken) loginUser()
	}, [state.accessToken])

	useEffect(() => {
		if (state.pendingChanges) {
			window.onbeforeunload = function () {
				return true
			}
		} else {
			window.onbeforeunload = null
		}
	}, [state.pendingChanges])

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
										<div
											ref={personaComponent}
											onClick={showPersonaMenu}
											style={{ cursor: 'pointer' }}
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
														{state.pendingChanges && (
															<MessageBar
																styles={{ root: { margin: '10px 5px' } }}
															>
																You have pending changes, please click on the
																review tab to submit these changes.
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
										<UnAuthorized />
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

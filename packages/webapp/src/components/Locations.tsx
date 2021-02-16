/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { IconButton, Persona, PersonaSize, Dropdown } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { setCurrentLanguage } from '../mutators/repoMutators'
import { getAppStore } from '../store/store'
import { getLanguageDisplayText } from '../utils/textUtils'
import LocationsRegions from './LocationsRegions'
import LocationsStates from './LocationsStates'
import QualifierPanel from './QualifierPanel'

import './Locations.scss'

export default observer(function Locations() {
	const [selectedState, setSelectedState] = React.useState<any>(null)
	const state = getAppStore()

	const onNavigateBack = React.useCallback(() => {
		setSelectedState(null)
	}, [])

	const languageKeys = 'en-us,ko-kr,vi-vn,zh-cn,es-us,de-de,es-es,fi-fi,fr-fr,he-il,it-it,ja-jp,pt-pt,sv-se,th-th'.split(
		','
	)
	const languageOptions = languageKeys.map((key) => {
		return {
			key: key,
			text: getLanguageDisplayText(key, key),
		}
	})

	return (
		<div className="locationPageContainer">
			<div className="locationHeaderWrapper">
				<div className="headerContainer">
					<IconButton
						iconProps={{ iconName: 'waffle' }}
						title="Apps"
						styles={{
							icon: { fontSize: '24px', color: 'white' },
							rootHovered: { backgroundColor: 'transparent' },
							rootPressed: { backgroundColor: 'transparent' },
						}}
					/>
					<div className="headerTitle">Covid-19 Vaccine Policy Composer</div>
				</div>
				<div className="headerPersona">
					<div>
						<Dropdown
							defaultSelectedKey={state.currentLanguage}
							onChange={(e, o) => setCurrentLanguage(o)}
							ariaLabel="Pick Language"
							options={languageOptions}
							styles={{
								dropdown: { border: 'none' },
								title: {
									fontSize: '14px',
									color: 'white !important',
									border: 'none',
									backgroundColor: 'transparent',
								},
								caretDown: { color: 'white !important', fontSize: '14px' },
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
					<div className="headerUsername">{state.userDisplayName}</div>
					<Persona
						text={state.userDisplayName}
						size={PersonaSize.size32}
						hidePersonaDetails={true}
					/>
				</div>
			</div>

			<div className="locationBodyWrapper">
				<div className="locationBodyLeft">
					{!selectedState ? (
						<LocationsStates onSelectedItem={setSelectedState} />
					) : (
						<LocationsRegions
							selectedState={selectedState}
							onNavigateBack={onNavigateBack}
						/>
					)}
					<div className="footerPrivacy">
						<div
							style={{ cursor: 'pointer' }}
							onClick={() =>
								window.open(
									'https://go.microsoft.com/fwlink/?LinkId=521839',
									'_blank'
								)
							}
						>
							Privacy &amp; Cookies
						</div>
						&nbsp;&nbsp;&nbsp;&nbsp;
						<div>© Microsoft 2021</div>
					</div>
				</div>
				{state.toggleQualifier && (
					<div className="locationBodyRight">
						<QualifierPanel />
					</div>
				)}
			</div>
		</div>
	)
})

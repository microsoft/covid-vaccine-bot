/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export interface AppState {
	isAuthenticated: boolean
	accessToken?: string
	username?: string
	email?: string
	userDisplayName?: string
	branches?: any[]
	mainBranch?: any
	repoFileData?: any[]
	globalFileData?: any
	fileChanges?: any[]
	currentLanguage: string
	toggleQualifier: boolean
	toggleAddLocation: boolean
	isEditable: boolean
}

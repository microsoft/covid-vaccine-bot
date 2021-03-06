/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { action } from 'satcheljs'

export const createPR = action('createPR', (fileData: any) => ({
	fileData,
}))

export const loadAllStringsData = action('loadAllStringsData')

export const initializeGitData = action('initializeGitData')

export const loadPR = action('loadPR', (prNumber: any) => ({
	prNumber,
}))

export const loadBranch = action('loadBranch', (branch: any) => ({
	branch,
}))

export const saveContinue = action('saveContinue')

export const getLocationData = action('getLocationData', (location: any) => ({
	location
}))

export const loadAllLocationData = action('loadAllLocationData', (location:any) => ({location}))
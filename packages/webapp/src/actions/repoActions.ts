/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { action } from 'satcheljs'

export const getBranches = action('getBranches')

//export const createPR = action('createPR');

export const createPR = action('createPR', (fileData: any) => ({
	fileData,
}))

export const getRepoFileData = action('getRepoFileData')

export const initializeGitData = action('initializeGitData')

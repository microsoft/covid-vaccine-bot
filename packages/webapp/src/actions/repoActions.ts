import { action } from 'satcheljs'

export const getBranches = action('getBranches')

//export const createPR = action('createPR');

export const createPR = action('createPR', (fileData: any) => ({
	fileData,
}))

export const getRepoFileData = action('getRepoFileData')

export const initializeGitData = action('initializeGitData')

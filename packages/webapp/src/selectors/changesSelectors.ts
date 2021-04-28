/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'


export const getChanges = (): any => {
	const {pendingChangeList} = getAppStore()
	const changesList: any[] = []
	const { added, modified, deleted } = pendingChangeList

	if (added.length > 0) {
		added.forEach((item: any) => {
			changesList.push({label: `Added new ${item.section}: ${toProperCase(item.name)}`})
		})
	}

	if (modified.length > 0) {
		modified.forEach((item: any) => {
			changesList.push({label: `Updated ${item.section}: ${toProperCase(item.name)}`})
		})
	}

	if (deleted.length > 0) {
		deleted.forEach((item: any) => {
			changesList.push({label: `Removed ${item.section}: ${toProperCase(item.name)}`})
		})
	}

	return changesList
}
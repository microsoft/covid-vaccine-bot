/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'
import { StringFormat, toProperCase } from '../utils/textUtils'
import { getText as t } from '../selectors/intlSelectors'

export const getChanges = (): any => {
	const {pendingChangeList} = getAppStore()
	const changesList: any[] = []
	const { added, modified, deleted } = pendingChangeList

	if (added.length > 0) {
		added.forEach((item: any) => {
			const label = StringFormat(t('Review.ChangesList.addPrefixText'), t(`Review.ChangesList.sections.${item.section}`))
			changesList.push({label: `${label}: ${toProperCase(item.name)}`})
		})
	}

	if (modified.length > 0) {
		modified.forEach((item: any) => {
			const label = StringFormat(t('Review.ChangesList.modifiedPrefixText'), t(`Review.ChangesList.sections.${item.section}`))
			changesList.push({label: `${label}: ${toProperCase(item.name)}`})
		})
	}

	if (deleted.length > 0) {
		deleted.forEach((item: any) => {
			const label = StringFormat(t('Review.ChangesList.removedPrefixText'), t(`Review.ChangesList.sections.${item.section}`))
			changesList.push({label: `${label}: ${toProperCase(item.name)}`})
		})
	}

	return changesList
}
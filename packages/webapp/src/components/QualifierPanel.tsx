/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { IGroup, DetailsList } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { getAppStore } from '../store/store'
import { toProperCase } from '../utils/textUtils'

import './QualifierPanel.scss'

export default observer(function QualifierPanel() {
	const { globalFileData, currentLanguage } = getAppStore()
	const [qualifierGroup, setQualifierGroup] = React.useState<IGroup[]>([])
	const [qualifierGroupItems, setQualifierGroupItems] = React.useState<any[]>(
		[]
	)

	React.useEffect(() => {
		if (globalFileData?.customStrings) {
			const groupKeys: any[] = []
			const questionItemKeys: any[] = []

			const tempQualifierGroup: IGroup[] = []
			const tempQualifierGroupItems: any[] = []

			const contentObj = globalFileData.customStrings.content
			const questionKeys = Object.keys(contentObj).filter((k) =>
				k.includes('eligibility.question')
			)

			questionKeys.forEach((key) => {
				const questionGroupKey = key.split('/')[1].split('.')

				if (!groupKeys.includes(questionGroupKey[0])) {
					groupKeys.push(questionGroupKey[0])

					tempQualifierGroup.push({
						key: questionGroupKey[0],
						name: toProperCase(questionGroupKey[0]),
						startIndex: tempQualifierGroupItems.length,
						count: 1,
						isCollapsed: true,
					})
				} else {
					const groupIdx = tempQualifierGroup.findIndex(
						(obj) => obj.key === questionGroupKey[0]
					)
					tempQualifierGroup[groupIdx].count++
				}

				if (!questionItemKeys.includes(key)) {
					questionItemKeys.push(key)

					tempQualifierGroupItems.push({
						key: key,
						text: contentObj[key][currentLanguage]
							? contentObj[key][currentLanguage]
							: `*Translation Not Found* (${currentLanguage})`,
					})
				}
			})

			// open the first group:
			tempQualifierGroup[0].isCollapsed = false

			setQualifierGroup(tempQualifierGroup)
			setQualifierGroupItems(tempQualifierGroupItems)
		}
	}, [
		globalFileData,
		currentLanguage,
		setQualifierGroup,
		setQualifierGroupItems,
	])

	const columns = [
		{
			key: 'questionColKey',
			name: 'Question',
			fieldName: 'text',
			minWidth: 100,
			isResizable: false,
		},
	]

	return (
		<div className="qualifierPanelContainer">
			<div className="panelHeader">
				<div className="panelHeaderTitle">Qualifiers</div>
			</div>
			<div className="panelBody">
				<section>
					<DetailsList
						items={qualifierGroupItems}
						groups={qualifierGroup}
						columns={columns}
						groupProps={{
							showEmptyGroups: false,
						}}
						compact={true}
						isHeaderVisible={false}
						checkboxVisibility={2}
						className="qualifierGroupItem"
					/>
				</section>
			</div>
		</div>
	)
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'

import './LocationForm.scss'

export default observer(function DataIsStaleForm(props: any) {
	const { onSubmit } = props

	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">{t('DataIsStaleForm.title')}</div>
			</div>
			<div className="modalBody">
				<p>{t('DataIsStaleForm.text', true)}</p>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text={t('DataIsStaleForm.RefreshButton')}
					onClick={onSubmit}
				/>
			</div>
		</div>
	)
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrimaryButton, DefaultButton } from '@fluentui/react'
import { observer } from 'mobx-react-lite'
import { getText as t } from '../selectors/intlSelectors'

import './LocationForm.scss'

export default observer(function DeleteLocationForm(props: any) {
	const { onSubmit, onCancel, location } = props
	
	return (
		<div className="modalWrapper">
			<div className="modalHeader">
				<div className="title">{t('DeleteLocationForm.title')}</div>
			</div>
			<div className="modalBody">
				<p>
				{t('DeleteLocationForm.text')} <strong>{location.text ?? location.name}</strong>?
				</p>
			</div>
			<div className="modalFooter">
				<PrimaryButton
					text={t('DeleteLocationForm.title')}
					onClick={() => onSubmit?.(location)}
				/>
				<DefaultButton text={t('DeleteLocationForm.cancel')} onClick={() => onCancel?.()} />
			</div>
		</div>
	)
})

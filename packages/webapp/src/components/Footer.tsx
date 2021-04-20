/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { FC, memo } from 'react'
import { getText as t } from '../selectors/intlSelectors'

const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_US_EMAIL
const CODE_OF_CONDUCT_URL = process.env.REACT_APP_CODE_OF_CONDUCT_URL

export default observer(function Footer() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div className="appFooterRow">
				<Link href="https://go.microsoft.com/fwlink/?LinkId=521839">
					{t('App.Footer.privacyCookies')}
				</Link>
				{' | '}
				<Link href={`mailto:${CONTACT_EMAIL}`}>
					{t('App.Footer.contactUs')}
				</Link>
				{' | '}
				<Link href={CODE_OF_CONDUCT_URL}>{t('App.Footer.codeOfConduct')}</Link>
			</div>
		</div>
	)
})

const Link: FC<{
	href?: string
}> = memo(function Link({ children, href }) {
	return (
		<div
			className="div"
			style={{
				cursor: 'pointer',
				marginLeft: 15,
				marginRight: 15,
				display: 'flex',
				alignContent: 'center',
			}}
			onClick={() => href && window.open(href, '_blank')}
		>
			{children}
		</div>
	)
})

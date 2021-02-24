/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { FC, memo } from 'react'

const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_US_EMAIL
const CODE_OF_CONDUCT_URL = process.env.REACT_APP_CODE_OF_CONDUCT_URL

export const Footer: FC = memo(function Footer() {
	const year = new Date().getFullYear()
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div className="appFooterRow">
				<Link href="https://go.microsoft.com/fwlink/?LinkId=521839">
					Privacy &amp; Cookies
				</Link>
				{' | '}
				<Link href={`mailto:${CONTACT_EMAIL}`}>Contact Us</Link>
				{' | '}
				<Link href={CODE_OF_CONDUCT_URL}>Code of Conduct</Link>
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

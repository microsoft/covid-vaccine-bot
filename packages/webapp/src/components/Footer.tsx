import React, { FC, memo } from 'react'

export const Footer: FC = memo(function Footer() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div className="footerPrivacy">
				<Link href="mailto:covidbot-feedback@microsoft.com">Contact Us</Link>
				{' | '}
				<Link href="https://go.microsoft.com/fwlink/?LinkId=521839">
					Privacy &amp; Cookies
				</Link>
				{' | '}
				<Link href="https://go.microsoft.com/fwlink/?LinkID=246338">
					Terms of Use
				</Link>
				{' | '}
				<Link href="https://github.com/microsoft/covid-vaccine-bot/blob/main/CODE_OF_CONDUCT.md">
					Code of Conduct
				</Link>
				{' | '}
				<Link href="https://www.microsoft.com/en-us/legal/intellectualproperty/Trademarks/EN-US.aspx">
					Trademarks
				</Link>
				{' | '}
				<Link>&copy; 2021 Microsoft</Link>
			</div>
			<div className="footerPrivacy">
				<Link href="https://microsoft.com">
					<span style={{ marginRight: 10 }}>Microsoft</span>
					<img alt="Microsoft Logo" src="mslogo.jpg" height={20} width={20} />
				</Link>
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
			style={{ cursor: 'pointer', marginLeft: 15, marginRight: 15 }}
			onClick={() => href && window.open(href, '_blank')}
		>
			{children}
		</div>
	)
})

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as React from 'react'
import { observer } from 'mobx-react-lite'

import './App.scss'

export default observer(function AppFooter() {
	return (
		<div className="appFooterPrivacy">
			<div
				style={{ cursor: 'pointer' }}
				onClick={() =>
					window.open(
						'https://go.microsoft.com/fwlink/?LinkId=521839',
						'_blank'
					)
				}
			>
				Privacy &amp; Cookies
			</div>
			&nbsp;&nbsp;&nbsp;&nbsp;
			<div>© Microsoft 2021</div>
		</div>
	)
})

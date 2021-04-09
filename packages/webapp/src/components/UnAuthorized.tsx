/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { clearState } from '../store/localStorage'
import { getText as t } from '../selectors/intlSelectors'
const GH_REPO = process.env.REACT_APP_REPO_NAME
const GH_REPO_OWNER = process.env.REACT_APP_REPO_OWNER

export default observer(function UnAuthorized() {
	useEffect(() => {
		clearState()
	}, [])

	return (
		<div className="appBodyLeft">
			<div className="dashboardPageWrapper">
				<div className="bodyContainer">
					<div className="bodyHeader">
						<div className="bodyHeaderTitle">
							<div className="mainTitle">{t('UnAuthorized.title')}</div>
						</div>
					</div>
				</div>
				<section style={{ width: '70%', margin: '0px auto' }}>
					<p>
						{t('UnAuthorized.body[0]')}
						{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href={`https://www.github.com/${GH_REPO_OWNER}/${GH_REPO}`}
							>
							{t('UnAuthorized.link')}
						</a>
							{t('UnAuthorized.body[1]')}
					</p>
				</section>
			</div>
		</div>
	)
})

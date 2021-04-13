/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { getText as t } from '../selectors/intlSelectors'
import { clearState } from '../store/localStorage'
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
					<p>{t('UnAuthorized.body', true, `${GH_REPO_OWNER}/${GH_REPO}`)}</p>
				</section>
			</div>
		</div>
	)
})

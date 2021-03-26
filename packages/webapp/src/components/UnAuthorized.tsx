/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
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
							<div className="mainTitle">Welcome!</div>
						</div>
					</div>
				</div>
				<section style={{ width: '70%', margin: '0px auto' }}>
					<p>
						Thank you for your interest in helping to manage the data,
						unfortunately right now access to this tool requires collaborator
						permissions on{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href={`https://www.github.com/${GH_REPO_OWNER}/${GH_REPO}`}
						>
							this repo
						</a>
						. Feel free to request access over on GitHub!
					</p>
				</section>
			</div>
		</div>
	)
})

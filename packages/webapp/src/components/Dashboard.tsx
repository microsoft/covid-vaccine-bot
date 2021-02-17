/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'

import './Dashboard.scss'

export default observer(function Dashboard() {
	return (
		<div className="dashboardPageWrapper">
			<div className="bodyContainer">
				<div className="bodyHeader">
					<div className="bodyHeaderTitle">
						<div className="breadCrumbs">/ Dashboard</div>
						<div className="mainTitle">Dashboard</div>
					</div>
				</div>
				<div className="bodyContent">
					<section>
						<div className="sectionHeader">Pending PRs</div>
						<div className="sectionContent">list of PRs</div>
					</section>
					<section>
						<div className="sectionHeader">Location Updates</div>
						<div className="sectionContent">list of updated locations</div>
					</section>
				</div>
			</div>
		</div>
	)
})

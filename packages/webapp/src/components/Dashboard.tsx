/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'
import * as React from 'react'

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
					<section>this is the body</section>
				</div>
			</div>
		</div>
	)
})

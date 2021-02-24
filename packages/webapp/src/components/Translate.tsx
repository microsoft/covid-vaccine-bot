/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { observer } from 'mobx-react-lite'

import './Translate.scss'

export default observer(function Translate() {
	return (
		<div className="translatePageContainer">
            <div className="bodyContainer">
                <div className="bodyHeader">
                    <div className="bodyHeaderTitle">
                        <div className="breadCrumbs">/ Translate</div>
                        <div className="mainTitle">Translate</div>
                    </div>
                </div>
                <div className="bodyContent">
                    <section>
                        this is where contents go
                    </section>
                </div>
            </div>
        </div>
	)
})

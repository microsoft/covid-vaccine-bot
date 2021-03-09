/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { createDistDir } from '../createDistDir'
import { assembleAllData } from './assembleAllData'
import { assembleRegions } from './assembleRegions'

createDistDir()
assembleRegions()
assembleAllData()

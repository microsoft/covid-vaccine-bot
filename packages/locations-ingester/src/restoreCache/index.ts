/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { restoreCache } from '../cache'

console.log('restoring cache')
restoreCache().then(() => console.log('cache restored'))

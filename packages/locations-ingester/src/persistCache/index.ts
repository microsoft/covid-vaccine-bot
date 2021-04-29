/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { persistCache } from '../cache'

console.log('persisting cache')
persistCache().then(() => console.log('cache persisted'))

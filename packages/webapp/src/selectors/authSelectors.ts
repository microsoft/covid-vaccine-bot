/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { getAppStore } from '../store/store'

export const isUserAuthenticated = (): boolean => {
	return getAppStore().isAuthenticated
}

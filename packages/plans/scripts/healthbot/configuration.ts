/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import config from 'config'
import { sign } from 'jsonwebtoken'
import moment from 'moment'

export function token(): string {
	const secret = config.get<string>('healthbot.apiSecret')
	const tenantName = config.get<string>('healthbot.tenantName')

	if (!secret) {
		throw new Error('process.env.HEALTHBOT_API_SECRET not defined')
	}
	if (!tenantName) {
		throw new Error('process.env.HEALTHBOT_TENANT not defined')
	}

	const iat = moment().subtract(1, 'minutes').unix()
	const token = sign({ tenantName, iat }, secret)
	return token
}

export function urlPrefix(): string {
	const host = config.get<string>('healthbot.host')
	const tenantName = config.get<string>('healthbot.tenantName')
	if (!host) {
		throw new Error('process.env.HEALTHBOT_HOST not defined')
	}
	if (!tenantName) {
		throw new Error('process.env.HEALTHBOT_TENANT not defined')
	}
	return `${host}/api/account/${tenantName}`
}

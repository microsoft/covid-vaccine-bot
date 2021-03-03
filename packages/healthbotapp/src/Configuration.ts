/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { IConfig } from 'config'

export class Configuration {
	private config: IConfig

	public constructor(config: IConfig) {
		this.config = config
	}

	public get port(): number {
		return this.config.get<number>('service.port')
	}

	public get region(): string {
		return this.config.get<string>('service.region')
	}

	public get webchatSecret(): string {
		return this.config.get<string>('healthbot.webchatSecret')
	}

	public get directlineEndpoint(): string {
		return this.config.get<string>('healthbot.directlineEndpointUri')
	}

	public get tokenEndpoint(): string {
		const uri = this.directlineEndpoint || 'directline.botframework.com'
		return `https://${uri}/v3/directline/tokens/generate`
	}

	public get debug(): boolean {
		return process.env.DEBUG != null && process.env.DEBUG !== 'false'
	}

	public get appSecret(): string {
		return this.config.get<string>('service.appSecret')
	}
}

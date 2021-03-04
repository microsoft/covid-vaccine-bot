/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import crypto from 'crypto'
import { Server } from 'http'
import path from 'path'
import express, { Express, Response } from 'express'
import got from 'got'
import jwt from 'jsonwebtoken'
import { Configuration } from './Configuration'

export class Application {
	private app: Express
	private config: Configuration
	private isHealthy = false

	public constructor(config: Configuration) {
		this.config = config
		this.app = express()
		this._serveStaticFolder()
		this._defineEndpoints()
	}

	public start(): Server {
		const port = this.config.port
		return this.app.listen(port, function () {
			console.log(`application server listening on port ${port}`)
		})
	}

	private _defineEndpoints(): void {
		const app = this.app
		app.get('/health', async (req, res) => {
			this._getHealth()
				.then(() => this._healthyResponse(res))
				.catch(() => this._unhealthyResponse(res))
		})

		app.post('/chatBot', async (req, res) => {
			try {
				const jwtToken = await this._createChatbotToken(
					req.query.userId as string,
					req.query.userName as string,
					req.query.locale as string,
					req.query.lat as string,
					req.query.lng as string
				)
				res.send(jwtToken)
			} catch (err) {
				console.error('error creating chatbox token', err)
				this.isHealthy = false
				res.status(err?.statusCode ?? 500).send()
			}
		})
	}

	private _serveStaticFolder(): void {
		const staticFolder = path.join(__dirname, '../public')
		this.app.use(
			express.static(staticFolder, {
				// uncomment the lines below if you wish to allow only specific domains to embed this page as a frame
				setHeaders: (res, path, stat) => {
					res.set('Content-Security-Policy', 'frame-ancestors bing.com')
				},
			})
		)
	}

	private async _getHealth(): Promise<void> {
		if (this.isHealthy) {
			return
		}
		await got.post(this.config.directlineEndpoint, {
			headers: {
				Authorization: `Bearer ${this.config.webchatSecret}`,
			},
			responseType: 'json',
		})
		this.isHealthy = true
	}

	public async _createChatbotToken(
		userId: string | undefined,
		userName: string,
		locale: string,
		lat: string | undefined,
		long: string | undefined
	): Promise<string> {
		const { body } = await got.post(this.config.tokenEndpoint, {
			headers: {
				Authorization: `Bearer ${this.config.webchatSecret}`,
			},
			responseType: 'json',
		})

		const response = {
			userId: userId ?? crypto.randomBytes(4).toString('hex'),
			userName,
			locale,
			connectorToken: (body as any).token,
			directLineURI: this.config.directlineEndpoint,
			location: lat && long ? { lat, long } : undefined,
		}
		return jwt.sign(response, this.config.appSecret)
	}

	private _healthResponse(
		res: Response,
		statusCode: number,
		message: string
	): void {
		res.status(statusCode).send({
			health: message,
			region: this.config.region,
		})
	}

	private _healthyResponse(res: Response): void {
		this._healthResponse(res, 200, 'Ok')
	}

	private _unhealthyResponse(res: Response): void {
		this._healthResponse(res, 503, 'Unhealthy')
	}
}

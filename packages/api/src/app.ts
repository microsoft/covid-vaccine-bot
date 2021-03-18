/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import { initialize } from 'express-openapi'
import { apiDoc } from './apiDoc'
import { OpenApiError } from './types'

export function createApp() {
	const app = express()
	app.use(cors())
	app.use(bodyParser.json())

	initialize({
		apiDoc,
		app,
		paths: path.resolve(__dirname, 'api-routes'),
		routesGlob: '**/*.{ts,js}',
		routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
		errorMiddleware: (
			err: OpenApiError,
			req: Request,
			res: Response,
			next: any
		) => {
			res.status(err.status).json(err)
		},
	})

	return app
}

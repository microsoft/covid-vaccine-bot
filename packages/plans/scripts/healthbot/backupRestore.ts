/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import config from 'config'
import moment from 'moment'
import { token, urlPrefix } from './configuration'

const tenantName = config.get('healthbot.tenantName')

async function backup(): Promise<string> {
	const fileName: string = path.join(
		__dirname,
		`backup-${tenantName}-${moment().unix()}.hbs`
	)
	const response = await axios.get(`${urlPrefix()}/backup`, {
		headers: { Authorization: `Bearer ${token()}` },
	})
	fs.writeFileSync(fileName, response.data)
	return fileName
}

async function restore(fileName: string): Promise<void> {
	const hbs = fs.readFileSync(fileName).toString()
	try {
		await axios({
			method: 'POST',
			url: `${urlPrefix()}/backup`,
			headers: { Authorization: `Bearer ${token()}` },
			data: { hbs },
		})
	} catch (e) {
		console.log(e)
	} finally {
		fs.unlinkSync(fileName)
	}
}

backup().then((filename) => restore(filename))

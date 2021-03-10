/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import { token, urlPrefix } from './configuration'

const RESOURCES_URL = `${urlPrefix()}/resources`

export class Resources {
	/**
	 * Red available
	 */
	public async read(): Promise<void> {
		try {
			const files = await axios.get(RESOURCES_URL, {
				headers: { Authorization: `Bearer ${token()}` },
			})
			console.table(files.data.entries)
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	public async upload(files: string[]): Promise<void> {
		try {
			console.log(`uploading files to ${RESOURCES_URL}`, files)
			const form = new FormData()
			for (const file of files) {
				const basename = path.basename(file)
				console.log('add file', basename)
				form.append(basename, fs.createReadStream(file))
			}
			await axios.post(RESOURCES_URL, form, {
				headers: {
					Authorization: `Bearer ${token()}`,
					...form.getHeaders(),
				},
			})
			console.log('uploading files completed !')
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	public async remove(files: string[]): Promise<void> {
		try {
			await axios.delete(RESOURCES_URL, {
				headers: { Authorization: `Bearer ${token()}` },
				params: { name: files },
			})
			console.log(`removing ${files} completed`)
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}

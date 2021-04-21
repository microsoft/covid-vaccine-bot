/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import config from 'config'
import { CACHE_DIR } from '../cacheDir'

const region = config.get<string>('vaccinefinder.region')
const Bucket = config.get<string>('vaccinefinder.bucket')

export async function fetchS3Data(): Promise<void> {
	const s3Client = new AWS.S3({ region, params: { Bucket } })

	return new Promise<void>((resolve, reject) => {
		s3Client.listObjectsV2(async (err, data) => {
			if (err) {
				reject(err)
			} else {
				const readDataPromises =
					data.Contents?.map((c) => readDataObject(s3Client, c)) || []
				Promise.all(readDataPromises).then(() => resolve())
			}
		})
	})
}

function readDataObject(client: AWS.S3, { Key }: AWS.S3.Object): Promise<void> {
	return new Promise((resolve, reject) => {
		if (
			Key &&
			Key.endsWith('.csv') &&
			Key.indexOf('*') === -1 &&
			Key.indexOf('test') === -1
		) {
			const filename = path.join(CACHE_DIR, Key)
			fs.mkdirSync(path.dirname(filename), { recursive: true })

			if (fs.existsSync(filename)) {
				// file already exists
				resolve()
			} else {
				console.log(`downloading ${filename}`)
				client.getObject({ Bucket, Key }, (err, data) => {
					if (err) {
						reject(err)
					} else {
						if (data.Body) {
							fs.writeFileSync(filename, data.Body.toString())
						}
						resolve()
					}
				})
			}
		} else {
			resolve()
		}
	})
}

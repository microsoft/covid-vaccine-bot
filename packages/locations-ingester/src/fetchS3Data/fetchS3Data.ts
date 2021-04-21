/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import config from 'config'
import { CACHE_DIR } from '../cacheDir'
import { getLatestFile } from '../io'

const region = config.get<string>('vaccinefinder.region')
const Bucket = config.get<string>('vaccinefinder.bucket')

export async function fetchS3Data(): Promise<void> {
	const s3Client = new AWS.S3({ region, params: { Bucket } })
	const objects = await readBucket(s3Client)
	const latestKey = getLatestFile(getFilenames(objects))
	const latestObject = objects.find((t) => t.Key === latestKey)
	console.log('latest is', latestKey)
	if (latestObject != null) {
		await readDataObject(s3Client, latestObject)
	} else {
		throw new Error('could not determine latest')
	}
}

function readBucket(s3Client: AWS.S3): Promise<AWS.S3.Object[]> {
	return new Promise((resolve, reject) => {
		s3Client.listObjectsV2(async (err, data) => {
			if (err) {
				reject(err)
			} else {
				const keys = data.Contents ?? []
				resolve(keys)
			}
		})
	})
}

function getFilenames(objects: AWS.S3.Object[]): string[] {
	return objects
		.map((o) => o.Key)
		.filter((Key) => {
			return (
				Key &&
				Key.endsWith('.csv') &&
				Key.indexOf('*') === -1 &&
				Key.indexOf('test') === -1
			)
		}) as string[]
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

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import config from 'config'
import { CACHE_DIR } from '../cache'
import { getLatestFile } from '../io'

const region = config.get<string>('vaccinefinder.region')
const Bucket = config.get<string>('vaccinefinder.bucket')

export async function fetchS3Data(): Promise<void> {
	console.log('fetching S3 Data')
	const s3Client = new AWS.S3({ region, params: { Bucket } })
	const objects = await readBucket(s3Client)
	const latestKey = getLatestFile(getFilenames(objects))
	const latestObject = objects.find((t) => t.Key === latestKey)
	console.log('latest S3 datafile is', latestKey)
	if (latestObject != null) {
		await readDataObject(s3Client, latestObject)
		console.log('finished fetching S3 Data')
	} else {
		console.error('could not determine latest')
		throw new Error('could not determine latest')
	}
}

function readBucket(s3Client: AWS.S3): Promise<AWS.S3.Object[]> {
	return new Promise((resolve, reject) => {
		s3Client.listObjectsV2(async (err, data) => {
			if (err) {
				console.error('error listing objects', err)
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
		try {
			if (Key == null) {
				console.error('could not find key ', Key)
				resolve()
			} else {
				const filename = path.join(CACHE_DIR, Key)
				fs.mkdirSync(path.dirname(filename), { recursive: true })
				if (fs.existsSync(filename)) {
					console.log(`${Key} already exists`)
					// file already exists
					resolve()
				} else {
					console.log(`downloading ${filename}`)
					client.getObject({ Bucket, Key }, (err, data) => {
						if (err) {
							console.error('error fetching object', err)
							reject(err)
						} else {
							if (data.Body) {
								fs.writeFileSync(filename, data.Body.toString())
							}
							resolve()
						}
					})
				}
			}
		} catch (err) {
			console.error('s3 read error', err)
			reject(err)
		}
	})
}

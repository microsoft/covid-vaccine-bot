import AWS from 'aws-sdk'
import fs from 'fs'
import path from 'path'

const region = 'us-east-1'
const Bucket = 'vaccinefinder-data'

export async function readS3Data(): Promise<void> {
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
			const filename = path.join(__dirname, '../dist/', Key)
			fs.mkdirSync(path.dirname(filename), { recursive: true })

			if (fs.existsSync(filename)) {
				console.log(`file ${filename} already exists`)
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

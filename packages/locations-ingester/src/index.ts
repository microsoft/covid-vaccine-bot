import { readS3Data } from './readS3Data'

readS3Data()
	.then(() => console.log('read data'))
	.catch((err) => {
		console.error('error reading data', err)
		process.exit(1)
	})

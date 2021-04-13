import { fetchS3Data } from './fetchS3Data/fetchS3Data'
import { geocodeData } from './geocodeData/geocodeData'
import { getLatestFilePath } from './io'
import { transformData } from './transformData/transformData'
import { writeCosmosData } from './writeCosmosData/writeCosmosData'

async function ingest() {
	try {
		console.log('fetching S3 Data')
		await fetchS3Data()
		console.log('transforming data to JSON')
		await transformData(getLatestFilePath())
		console.log('geocoding data')
		await geocodeData()
		console.log('writing data to cosmosdb')
		await writeCosmosData()
	} catch (err) {
		console.error(`error ingesting data`, err)
	}
}
ingest().catch((err) => console.error(`error ingesting data`, err))

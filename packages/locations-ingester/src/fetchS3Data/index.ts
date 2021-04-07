import { fetchS3Data } from './fetchS3Data'

fetchS3Data()
	.then(() => console.log('fetched remote data'))
	.catch((err) => console.log('error fetching data', err))

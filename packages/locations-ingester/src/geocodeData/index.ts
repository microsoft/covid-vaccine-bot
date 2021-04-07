import { geocodeData } from './geocodeData'

geocodeData()
	.then(() => console.log('finished geocoding'))
	.catch((err) => console.error('geocoding error', err))

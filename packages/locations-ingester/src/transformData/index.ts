import { transformData } from './transformData'
import { getLatestFilePath } from '../io'

transformData(getLatestFilePath())
	.then(() => console.log('finished data transform'))
	.catch((err) => console.log('error transforming data', err))

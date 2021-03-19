import { LocationRetriever } from './types'
import washington from './washington'
import arizona from './arizona'

export const vaccineLocationRetrievers: Record<string, LocationRetriever> = {
	WA: washington,
	AZ: arizona,
}

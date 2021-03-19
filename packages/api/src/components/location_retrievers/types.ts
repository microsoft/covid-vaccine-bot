import { GeoPoint } from '../Locator'

export interface DailySchedule {
	open?: boolean
	hours?: string
}
export interface Link {
	url?: string
	text?: string
}

export interface Location {
	name: string
	address1?: string
	address2?: string
	city?: string
	zip?: string
	lat?: number
	long?: number
	availability?: string
	vaccine_manufacturers?: string[]
	instructions?: string
	phone?: string
	email?: string
	scheduling_link?: Link
	staff_language?: {
		// whether staff provide translation resources.
		// Locations in the US assume "en-us" is true implicitly.
		[key: string]: boolean
	}
	schedule?: {
		mon?: string
		tue?: string
		wed?: string
		thu?: string
		fri?: string
		sat?: string
		sun?: string
	}
}
export type LocationRetriever = (location: GeoPoint) => Promise<Location[]>

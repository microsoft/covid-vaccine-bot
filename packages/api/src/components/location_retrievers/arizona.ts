/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import axios from 'axios'
import { locator } from '..'
import { GeoPoint } from '../Locator'
import { Location } from './types'

const URL = `https://services1.arcgis.com/mpVYz37anSdrK4d8/arcgis/rest/services/Vaccine_Finder_Locations_public/FeatureServer/0/query?f=json&where=(enddate%20NOT%20BETWEEN%20CURRENT_TIMESTAMP%20-%20300%20AND%20CURRENT_TIMESTAMP)%20OR%20(enddate%20IS%20NULL)&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A-12848727.506728297%2C%22ymin%22%3A3601490.663753893%2C%22xmax%22%3A-11834866.76355399%2C%22ymax%22%3A4468592.312620702%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&orderByFields=county%20asc&resultOffset=0&resultRecordCount=500&resultType=standard`

export default async function retrieveLocations(
	location: GeoPoint
): Promise<Array<Location>> {
	const response = await axios.get(URL)
	if (response.status < 400) {
		// TODO:
		// The locatinos provided by this API are all the sites in AZ.
		// they are not sorted by
		// * sort by distance from query point, return <= 25m
		// * cache response in database, pre-geocode?
		const locations = response.data.features.map(
			({ attributes: attrs, geometry }: any) => {
				const result: Location = {
					name: attrs.loc_name,
					address1: attrs.addr1,
					address2: attrs.addr2,
					city: attrs.city,
					zip: attrs.zip,
					vaccine_manufacturers: (attrs.vaccine_manufacturer || '').split(','),
					scheduling_link: {
						url: attrs.prereg_website,
						text: attrs.prereg_comments,
					},
					phone: attrs.prereg_phone,
					instructions: attrs.prereg_comments,
					staff_language: {
						'en-us': true,
						'en-es': attrs.spanish_staff_y_n === 'Yes',
					},
					schedule: {
						mon: attrs.mon_hrs,
						tue: attrs.tues_hrs,
						wed: attrs.wed_hrs,
						thu: attrs.thur_hrs,
						fri: attrs.fri_hrs,
						sat: attrs.sat_hrs,
						sun: attrs.sun_hrs,
					},
					lat: geometry.y,
					long: geometry.x,
				}
				return result
			}
		)
		locations.sort((a: Location, b: Location) => {
			const aDist = distanceBetween(a as GeoPoint, location)
			const bDist = distanceBetween(b as GeoPoint, location)
			return aDist - bDist
		})
		return locations
	} else {
		throw new Error(
			`Error fetching locations: ${response.status}, ${response.statusText}`
		)
	}
}

const distanceBetween = (a: GeoPoint, b: GeoPoint): number =>
	Math.pow(a.lat - b.lat, 2) + Math.pow(a.long - b.long, 2)

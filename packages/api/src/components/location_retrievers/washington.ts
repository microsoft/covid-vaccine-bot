/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import axios from 'axios'
import { locator } from '..'
import { GeoPoint } from '../Locator'
import { Location } from './types'

const URL = `https://apim-vaccs-prod.azure-api.net/graphql`
const fields = [
	'locationName',
	'locationType',
	'providerId',
	'providerName',
	'departmentId',
	'departmentName',
	'addressLine1',
	'addressLine2',
	'city',
	'state',
	'zipcode',
	'latitude',
	'longitude',
	'description',
	'contactLastName',
	'contactFirstName',
	'fax',
	'phone',
	'email',
	'schedulingLink',
	'vaccineAvailability',
	'directions',
	'updatedAt',
]

export default async function retrieveLocations(
	location: GeoPoint
): Promise<Location[]> {
	const { postalCode: zip } = await locator.getLocationInformation(location)
	try {
		const response = await axios.post(
			URL,
			{
				operationName: null,
				variables: {},
				query: `{ findLocations(originZip:"${zip}", radiusMiles: 25){ locations { ${fields.join(
					' '
				)} } } }`,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
		if (response.status >= 400) {
			throw new Error(
				`error retrieving locations, ${response.status}, ${response.statusText}`
			)
		}
		const locations = response.data.data.findLocations.locations
		const result: Array<Location> = locations.map((loc: any) => ({
			name: loc.locationName,
			address1: loc.addressLine1,
			address2: loc.addressLine2,
			city: loc.city,
			zip: loc.zipcode,
			lat: loc.latitude,
			long: loc.longitude,
			scheduling_link: {
				url: loc.schedulingLink,
			},
			email: loc.email,
			phone: loc.phone,
			availability: loc.vaccineAvailability,
		}))
		return result
	} catch (err) {
		console.log(err.toJSON())
		throw err
	}
}

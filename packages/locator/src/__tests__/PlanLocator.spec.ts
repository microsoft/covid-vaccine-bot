/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { BingLocation, resolvePlanPolicy } from '../PlanLocator'
import { Region } from '@ms-covidbot/state-plan-schema'
import statesData from '@ms-covidbot/state-plans/dist/states.json'

describe('The Plan Locator', () => {
	it('exists', () => {
		expect(resolvePlanPolicy).toBeDefined()
	})

	it('can look up a plan in WA', () => {
		const location: BingLocation = {
			adminDistrict: 'WA',
			adminDistrict2: 'Kitsap County',
			countryRegion: 'United States',
			formattedAddress: '98311, WA',
			locality: 'Bremerton',
			postalCode: '98311',
		}
		const plan = resolvePlanPolicy(location, statesData)
		expect(plan).toBeDefined()
		expect(plan.phase).toBeDefined()
		expect(plan.phase.id).toBeDefined()
		expect(plan.phase?.qualifications.length > 0).toBeTruthy()
	})

	it('can look up a plan in MA', () => {
		const location: BingLocation = {
			adminDistrict: 'MA',
			adminDistrict2: 'Suffolk County',
			countryRegion: 'United States',
			formattedAddress: '02109, MA',
			locality: 'Boston',
			postalCode: '02109',
		}
		const plan = resolvePlanPolicy(location, statesData)
		expect(plan).toBeDefined()
		expect(plan.phase).toBeDefined()
		expect(plan.phase.id).toBeDefined()
		expect(plan.phase?.qualifications.length > 0).toBeTruthy()
	})
})

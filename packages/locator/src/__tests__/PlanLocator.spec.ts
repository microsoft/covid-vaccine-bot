/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PlanLocator } from '../PlanLocator'
import { Region } from '@ms-covidbot/state-plan-schema'
import statesData from '@ms-covidbot/state-plans/dist/states.json'

describe('The Plan Locator', () => {
	let locator: PlanLocator

	beforeEach(() => {
		locator = new PlanLocator(statesData as Region[])
	})

	it('can look up a state', () => {
		const waPlan = locator.getPlan('washington')
		console.log('WA', waPlan)
		expect(waPlan).toBeDefined()
	})
})

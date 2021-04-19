/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { BingLocation, resolvePlan } from '..'
import { Region } from '@covid-vax-bot/plan-schema'
import statesData from '@covid-vax-bot/plans/dist/policies.json'

describe('The Plan Locator', () => {
	it('exists', () => {
		expect(resolvePlan).toBeDefined()
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
		const plan = resolvePlan(location, statesData as Region[])
		expect(plan).toBeDefined()
		expect(plan.phase).toBeDefined()
		expect(plan.phase?.id).toBeDefined()
		expect(plan.phase?.qualifications).not.toHaveLength(0)
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
		const plan = resolvePlan(location, statesData as Region[])
		expect(plan).toBeDefined()
		expect(plan.phase).toBeDefined()
		expect(plan.phase?.id).toBeDefined()
		expect(plan.phase?.qualifications).not.toHaveLength(0)
		expect(plan.noPhaseLabel).toEqual(false)
	})

	it('can look up a plan in NY', () => {
		const location: BingLocation = {
			adminDistrict: 'NY',
			adminDistrict2: 'New York',
			countryRegion: 'United States',
			formattedAddress: '00011, NY',
			locality: 'New York',
			postalCode: '00011',
		}
		const plan = resolvePlan(location, statesData as Region[])
		expect(plan).toBeDefined()
		expect(plan.phase).toBeDefined()
		expect(plan.phase?.id).toBeDefined()
		expect(plan.phase?.qualifications).not.toHaveLength(0)
		expect(plan.noPhaseLabel).toEqual(true)
	})

	it('can look up an overridden link with parent scope still available', () => {
		const regions: Region[] = [
			{
				id: 'arizona',
				name: 'Arizona',
				type: 'state',
				metadata: {
					code_alpha: 'AZ',
				},
				plan: {
					links: {
						info: {
							text: 'INF',
							url: 'INF_URL',
						},
						scheduling: {
							text: 'SCHED',
							url: 'SCHED_URL',
						},
					},
					activePhase: 'phase_1a',
					phases: [
						{ id: 'phase_1a', qualifications: [{ question: 'q1' }] },
						{ id: 'phase_1b', qualifications: [{ question: 'q1' }] },
						{ id: 'phase_1c', qualifications: [{ question: 'q1' }] },
					],
				},
				regions: [
					{
						id: 'maricopa',
						name: 'Maricopa',
						type: 'county',
						metadata: {
							id_bing: 'Maricopa',
						},
						plan: {
							activePhase: 'phase_1b',
							links: {
								// override info link in county
								info: {
									text: 'INF_MC',
									url: 'INF_MC_URL',
								},
							},
						},
					},
				],
			},
		]
		const plan = resolvePlan(
			{
				adminDistrict: 'AZ',
				adminDistrict2: 'Maricopa',
			} as BingLocation,
			regions
		)
		expect(plan).toBeDefined()
		expect(plan.links.info).toBeDefined()
		expect(plan.phase?.id).toEqual('phase_1b')
		expect(plan.links.info?.text).toEqual('INF_MC')
		expect(plan.links.info?.url).toEqual('INF_MC_URL')
		expect(plan.links.scheduling?.text).toEqual('SCHED')
		expect(plan.links.scheduling?.url).toEqual('SCHED_URL')
	})

	it('will use parent phase if no child phase is set', () => {
		const regions: Region[] = [
			{
				id: 'arizona',
				name: 'Arizona',
				type: 'state',
				metadata: {
					code_alpha: 'AZ',
				},
				plan: {
					activePhase: 'phase_1a',
					phases: [{ id: 'phase_1a', qualifications: [{ question: 'q1' }] }],
				},
				regions: [
					{
						id: 'maricopa',
						name: 'Maricopa',
						type: 'county',
						metadata: {
							id_bing: 'Maricopa',
						},
					},
				],
			},
		]
		const plan = resolvePlan(
			{
				adminDistrict: 'AZ',
				adminDistrict2: 'Maricopa',
			} as BingLocation,
			regions
		)
		expect(plan).toBeDefined()
		expect(plan.phase?.id).toEqual('phase_1a')
	})

	it('can look up a plan in Paulau', () => {
		const location: BingLocation = {
			adminDistrict: 'PW',
			adminDistrict2: '',
			countryRegion: 'United States',
			formattedAddress: '',
			locality: '',
			postalCode: '',
		}
		const plan = resolvePlan(location, statesData as Region[])
		expect(plan).toBeDefined()
		expect(plan.unknownPhase).toEqual(false)
		expect(plan.phase).toBeDefined()
		expect(plan.phase?.id).toBeDefined()
		expect(plan.phase?.qualifications).not.toHaveLength(0)
		expect(plan.noPhaseLabel).toEqual(true)
	})
})

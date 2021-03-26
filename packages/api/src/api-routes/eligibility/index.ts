/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Request, Response } from 'express'
import { Operation } from 'express-openapi'
import { locator, localizer } from '../../components'
import { resolvePlan } from '@covid-vax-bot/plan-locator'
import { Link } from '@covid-vax-bot/plan-schema'
import regions from '@covid-vax-bot/plans/dist/policies.json'

export const GET: Operation = [
	async (req: Request, res: Response) => {
		const lat = (req.query.lat as any) as number
		const long = (req.query.long as any) as number
		const loc = ((req.query.localization as string) || '').trim()

		const address = await locator.getLocationInformation(lat, long)
		const response = resolvePlan(
			{
				adminDistrict: address.countrySubdivision,
				adminDistrict2: address.countrySecondarySubdivision,
				countryRegion: address.countryCode,
				locality: address.municipality,
				formattedAddress: address.freeformAddress,
				postalCode: address.postalCode,
			},
			regions as any
		)

		if (loc) {
			Object.keys(response.links).forEach((linkKey) => {
				const link: Link = response.links[linkKey]!
				if (link.text) {
					link.text = localizer.localize(link.text, loc)
				}
				if (link.description) {
					link.description = localizer.localize(link.description, loc)
				}
			})
			response.phase?.qualifications.forEach((q) => {
				q.question = localizer.localize(q.question, loc) || q.question
				q.questionSms = localizer.localize(q.questionSms, loc) || q.questionSms
				q.questionVoice =
					localizer.localize(q.questionVoice, loc) || q.questionVoice
				q.moreInfoText =
					localizer.localize(q.moreInfoText, loc) || q.moreInfoText
				q.moreInfoTextSms =
					localizer.localize(q.moreInfoTextSms, loc) || q.moreInfoTextSms
				q.moreInfoTextVoice =
					localizer.localize(q.moreInfoTextVoice, loc) || q.moreInfoTextVoice
			})
		}
		res.json(response)
	},
]
GET.apiDoc = {
	description: 'Retrieves C19 vaccine eligibility rules based on a location.',
	tags: ['eligibility'],
	operationId: 'getEligibility',
	parameters: [
		{
			in: 'query',
			name: 'lat',
			type: 'number',
			format: 'double',
			required: true,
		},
		{
			in: 'query',
			name: 'long',
			type: 'number',
			format: 'double',
			required: true,
		},
		{
			in: 'query',
			name: 'localization',
			type: 'string',
		},
	],
	responses: {
		default: {
			description: 'Unexpected error',
			schema: {
				$ref: '#/definitions/Error',
			},
		},
	},
}

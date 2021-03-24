/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

/* If you encounter any issues with the base_url or path, make sure that you are
using the latest endpoint: https://docs.microsoft.com/azure/cognitive-services/translator/reference/v3-0-translate */
export async function translateText(
	input: string[],
	to: string
): Promise<string[]> {
	const subscriptionKey = getEnvVar('TRANSLATOR_TEXT_SUBSCRIPTION_KEY')
	const endpoint = getEnvVar('TRANSLATOR_TEXT_ENDPOINT')
	const region = getEnvVar('TRANSLATOR_TEXT_REGION')

	const response = await axios.post(
		`${endpoint}/translate`,
		input.map((i) => ({ text: i })),
		{
			params: {
				'api-version': '3.0',
				from: 'en',
				to: [to],
			},
			headers: {
				'Ocp-Apim-Subscription-Key': subscriptionKey,
				'Ocp-Apim-Subscription-Region': region,
				'Content-type': 'application/json',
				'X-ClientTraceId': uuidv4().toString(),
			},
		}
	)

	return response.data.map((d: any) => d.translations[0].text)
}

function getEnvVar(key: string): string {
	const value = process.env[key]
	if (!value) {
		throw new Error(
			'Please set/export the following environment variable: ' + key
		)
	}
	return value
}

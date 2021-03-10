/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import axios from 'axios'
import { token, urlPrefix } from './configuration'

const LOCALIZATION_URL = `${urlPrefix()}/localization`

export class Localizations {
	/**
	 * Red available
	 */
	public async read(): Promise<Record<string, string>[]> {
		try {
			const localization = await axios.get(LOCALIZATION_URL, {
				headers: { Authorization: `Bearer ${token()}` },
			})
			console.table(localization.data)
			return localization.data
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	public async upload(records: Record<string, string>[]): Promise<void> {
		try {
			console.log(
				`uploading ${records.length} localization records to ${LOCALIZATION_URL}`
			)
			await axios.post(LOCALIZATION_URL, {
				headers: {
					Authorization: `Bearer ${token()}`,
				},
				data: {
					custom: records,
				},
			})
			console.log('uploading localizations completed !')
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}

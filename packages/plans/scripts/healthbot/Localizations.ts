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
		const localization = await axios.get(LOCALIZATION_URL, {
			headers: { Authorization: `Bearer ${token()}` },
		})
		console.table(localization.data)
		return localization.data
	}

	public async upload(records: Record<string, string>[]): Promise<void> {
		console.log(
			`uploading ${records.length} localization records to ${LOCALIZATION_URL}`
		)
		const uploadRecords: Record<string, string>[] = []
		records.forEach((rec) => {
			// Add an object for each localization
			Object.keys(rec)
				.filter((t) => t !== 'String ID')
				.forEach((loc) => {
					const localization = rec[loc]
					if (localization) {
						uploadRecords.push({
							'String ID': rec['String ID'],
							[loc]: localization,
						})
					}
				})
		})
		const response = await axios({
			method: 'POST',
			url: LOCALIZATION_URL,
			headers: {
				Authorization: `Bearer ${token()}`,
			},
			data: {
				custom: uploadRecords,
				system: [],
			},
		})
		if (response.status >= 400) {
			throw new Error(`error uploading files: ${response.status} - ${response.statusText}
			
	${response.data}
			`)
		}
		console.log(
			`uploading localizations completed! response=${response.status}`
		)
	}
}

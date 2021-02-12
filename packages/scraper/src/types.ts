/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import ssri from 'ssri'
import { Link } from '@ms-covidbot/state-plan-schema'

export type RunResult = {
	integrity: Record<string, string>
	changes: Link[]
	errors: Error[]
}

export interface PageScrapeResult {
	link: Link
	integrity: ssri.Integrity
	content: string
}

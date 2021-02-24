/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import ssri from 'ssri'
import { Link } from '@covid-vax-bot/state-plan-schema'

export type ScrapeLink = Link & { RootLocation: string }

export type RunResult = {
	integrity: Record<string, string>
	changes: ScrapeLink[]
	errors: Error[]
}

export interface PageScrapeResult {
	link: ScrapeLink
	integrity: ssri.Integrity
	content: string
}

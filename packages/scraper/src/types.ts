/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Link } from '@covid-vax-bot/plan-schema'
import ssri from 'ssri'

/* Extending this Link type definition to include
 * the root level path from the GitHub repo link set.
 * This is needed to help group issue creation from
 * the scraper results.
 */
export type ScrapeLink = Link & { LocationPath: string }

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

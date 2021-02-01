/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { Region } from '@ms-covidbot/state-plan-schema'

export interface PlanResult {
	phase: string
	phaseLabel: string
}

export class PlanLocator {
	public constructor(private data: Region[]) {}

	public getPlan(localePath: string): PlanResult {
		/* TBD */
	}
}

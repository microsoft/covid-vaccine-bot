/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { Region } from '@ms-covidbot/state-plan-schema'

export interface PlanResult {}

export class PlanLocator {
	public constructor(private data: Region[]) {}

	public getPlan(localePath: string): PlanResult {
		const pathSegments = localePath.split('.')
		let found: Region | undefined
		let context: Region[] | undefined = this.data

		while (pathSegments.length > 0) {
			if (context == null) {
				throw new Error(`could not find region with path ${localePath}`)
			}
			const pathSegment = pathSegments.shift()
			const current: Region | undefined = context?.find(
				(r) => r.id === pathSegment
			)
			found = current
			context = current?.regions
		}

		// TODO process found into result type
		return found as any
	}
}

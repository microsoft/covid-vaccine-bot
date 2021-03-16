/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export class StringChecker {
	private idSet = new Set<string>()
	private visitedSet = new Set<string>()
	private duplicateIds = new Set<string>()

	public constructor(idList: string[]) {
		this.idSet = new Set<string>()
		idList.forEach((id) => {
			if (this.idSet.has(id)) {
				this.duplicateIds.add(id)
			} else {
				this.idSet.add(id.toLowerCase())
			}
		})
	}

	public get duplicates(): Set<string> {
		return this.duplicateIds
	}

	public has(id: string): boolean {
		const result = this.idSet.has(id.toLowerCase())
		this.visitedSet.add(id.toLowerCase())
		return result
	}

	public getUnvisited(): string[] {
		const result: string[] = []
		this.idSet.forEach((value) => {
			if (!this.visitedSet.has(value)) {
				result.push(value)
			}
		})
		return result
	}
}

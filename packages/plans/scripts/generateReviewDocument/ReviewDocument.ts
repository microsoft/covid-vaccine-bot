/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Link, Region, RolloutPhase } from '@covid-vax-bot/state-plan-schema'

interface Section {
	level: number
	title: string
	text?: string | null
	requiresText?: boolean
}
export class ReviewDocument {
	public constructor(
		private localization: Map<string, string>,
		private policies: Region[]
	) {}

	public generate(): string {
		return this.policies.map((r) => this.printRegion(r)).join('\n\n')
	}

	private printRegion(region: Region, prefix = '', level = 1): string {
		const links =
			(region.plan?.links as Record<string, Link>) ||
			({} as Record<string, Link>)
		const phases: RolloutPhase[] = region.plan?.phases || []
		const subregions = region.regions || []
		const activePhase = region.plan?.activePhase
		const phase = phases.find((p) => p.id === activePhase)
		const name = `${prefix}${region.name}`

		const regionName: Section = {
			level,
			title: name,
		}
		const linksSection: Section | null =
			!activePhase && phase == null
				? null
				: {
						level: level + 1,
						title: `${name} Links`,
						text: this.printLinkTable(links),
						requiresText: true,
				  }

		const phaseSection: Section = {
			level: level + 1,
			title: `${name} Active Phase (${activePhase})`,
			text: this.printPhase(phase!),
		}

		const subregionSection: Section | null =
			subregions.length === 0
				? null
				: {
						level: level + 1,
						title: `${name} Regions`,
						text: region.regions
							?.map((r) => this.printRegion(r, `${name}::`, level + 1))
							.join('\n\n'),
				  }

		return [regionName, linksSection, phaseSection, subregionSection]
			.filter((t) => !!t)
			.map((sec) => this.printSection(sec as Section))
			.filter((r) => !!r)
			.join('\n\n')
	}

	private printLinkTable(links: Record<string, Link>): string | null {
		if (links == null) {
			return null
		}
		const rows = Object.keys(links).map((linkKey) => {
			const link = links[linkKey]
			const linkText = (link.text || '').trim()
			const linkUrl = (link.url || '').trim()
			const linkTextToShow =
				linkText.length > 0
					? this.localization.get(linkText.toLowerCase())
					: linkUrl
			return linkUrl.length === 0
				? null
				: `| ${linkKey} | [${linkTextToShow}](${linkUrl}) |`
		})

		return `| link type | link |
| --- | --- |
${rows.filter((r) => !!r).join('\n')}
`
	}

	private printPhase(phase: RolloutPhase | undefined): string | null {
		if (phase == null) {
			return null
		}
		const qualifications = phase.qualifications.map(
			({ question, moreInfoText: moreInfoTextId, moreInfoUrl }) => {
				const questionText = this.localization.get(question.toLowerCase())
				const moreInfoText = moreInfoTextId
					? this.localization.get(moreInfoTextId.toLowerCase())
					: ''

				let result = `* ${questionText}`

				if (moreInfoText) {
					result += `\n\t* ${moreInfoText}`
				}
				if (moreInfoUrl) {
					result += ` (see [here](${moreInfoUrl}))`
				}
				return result
			}
		)
		return `${qualifications.join('\n')}`
	}

	private printSection(section: Section): string | null {
		if (section.requiresText && section.text == null) {
			return null
		}
		let heading = ''
		for (let i = 0; i < section.level; ++i) {
			heading += '#'
		}

		let result = `${heading} ${section.title}`
		if (section.text) {
			result += '\n\n' + section.text
		}
		return result
	}
}

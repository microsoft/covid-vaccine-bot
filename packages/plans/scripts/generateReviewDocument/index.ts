/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs'
import * as path from 'path'
import { readCsvFile } from '../readCsvFile'
import {
	Qualification,
	Region,
	RolloutPhase,
} from '@ms-covidbot/state-plan-schema'

const REPO_TOP = path.join(__dirname, '../../../../')
const DIST_DIR = path.join(__dirname, '../../dist')
const OUTPUT_FILE = path.join(REPO_TOP, 'DATA_REVIEW.md')
const STATES_DATA_JSON = path.join(DIST_DIR, 'states.json')
const LOCALIZATION_CSV = path.join(DIST_DIR, 'localization.csv')

type LocalizationRecord = Record<string, string>
type LocalizationMap = Map<string, LocalizationRecord>

function generateReviewDocument(): void {
	const statesData = require(STATES_DATA_JSON)
	const csvData: LocalizationRecord[] = []
	readCsvFile(LOCALIZATION_CSV, csvData)

	const translationMap: LocalizationMap = new Map()
	csvData.forEach((datum) => {
		translationMap.set(datum['String ID'], datum)
	})

	const result = `${statesData
		.map((state: Region) => writeStateInfo(state, translationMap))
		.join('\n\n')}
	
${writeNonEligibilityTable(csvData.filter((r) => !isEligibilityRecord(r)))}
	`

	fs.writeFileSync(OUTPUT_FILE, result, { encoding: 'utf8' })
}

function isEligibilityRecord(record: LocalizationRecord): boolean {
	return record['String ID'].startsWith('c19.eligibility')
}

function writeNonEligibilityTable(records: LocalizationRecord[]): string {
	return `# Non-Eligibility Localizations (strings used in the Bot flow):
${writeLocalizationHeader()}
${records.map((r) => writeLocalizationRecord(r)).join('\n')}
`
}

function writeStateInfo(
	state: Region,
	translationMap: LocalizationMap
): string {
	const [activePhase, activeOrUpcomingPhases] = getActivePhases(state)
	const phaseLabel = getPhaseLabel(activePhase)

	return `# ${state.name}
Active Phase: **${phaseLabel}**

## Phases: 
${activeOrUpcomingPhases
	.map((phase) => writePhaseInfo(phase, translationMap, phase === activePhase))
	.join('\n\n')}
`
}

function getActivePhases(state: Region): [RolloutPhase, RolloutPhase[]] {
	const phaseId = state.plan?.activePhase || ''
	let phaseIndex = 0
	const allPhases = state.plan?.phases || []
	const phase = allPhases.find((phase, idx) => {
		phaseIndex = idx
		return phase.id === phaseId
	})
	if (phase == null) {
		throw new Error(`Could not find ${phaseId} in ${state.name}`)
	}
	const activeOrUpcomingPhases = allPhases.slice(phaseIndex)
	return [phase, activeOrUpcomingPhases]
}

function writePhaseInfo(
	phase: RolloutPhase,
	translationMap: LocalizationMap,
	isActive: boolean
): string {
	function writeQualificationRow(row: Qualification): string {
		const questionLoc = translationMap.get(row.question)
		const moreInfoLoc: LocalizationRecord | undefined = row.moreInfoText
			? translationMap.get(row.moreInfoText)
			: undefined
		if (questionLoc == null) {
			throw new Error(`could not find string with id ${row.question}`)
		}
		return (
			writeLocalizationRecord(questionLoc) +
			(moreInfoLoc
				? '\n' + writeLocalizationRecord(moreInfoLoc, row.moreInfoUrl || '')
				: '')
		)
	}

	return `### *${getPhaseLabel(phase)}* ${
		isActive ? '**(CURRENTLY ACTIVE)**' : ''
	}
${writeLocalizationHeader()}
${phase.qualifications.map(writeQualificationRow).join('\n')} 
`
}

function getPhaseLabel(phase: RolloutPhase): string {
	return phase.label ? phase.label : `Phase ${phase.id.toUpperCase()}`
}

function writeLocalizationHeader(): string {
	return `| id | en-us | es-us | zh-cn | ko-kr | vi-vn | other info |
| --- | --- | --- | --- | --- | --- | --- |`
}
function writeLocalizationRecord(
	loc: LocalizationRecord,
	moreInfo = 'none'
): string {
	return (
		'|' +
		[
			loc['String ID'],
			loc['en-us'] || 'not defined',
			loc['es-us'] || 'not defined',
			loc['zh-cn'] || 'not defined',
			loc['ko-kr'] || 'not defined',
			loc['vi-vn'] || 'not defined',
			moreInfo,
		].join('|')
	)
}

generateReviewDocument()

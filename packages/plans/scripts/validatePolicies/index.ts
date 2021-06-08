/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as path from 'path'
import {
	VaccinationPlan,
	Link,
	RolloutPhase,
	Qualification,
	LinkType,
} from '@covid-vax-bot/plan-schema'
import chalk from 'chalk'
import { StringChecker } from '../StringChecker'
import { DIST_DIR } from '../createDistDir'
import { getFiles, DATA_DIR } from '../getFiles'
import { readCsvFile } from '../readCsvFile'
import {
	validateRegionInfoSchema,
	validateVaccinationPlanSchema,
	SchemaValidationError,
} from './validateSchema'

const ILLEGAL_CHARS = `✓’–`
const LOCALIZATION_TABLE_PATH = path.join(DIST_DIR, 'localization.csv')

/**
 * Validate that state-level data files adhere to the schema
 */
function validateDataFiles() {
	const records = readRecords()
	const stringChecker = getStringChecker(records)

	let errorCount = 0
	const schemaValidationErrors: SchemaValidationError[] = []
	const linkErrors: string[] = []

	inspectLocalizationRecords()

	// Validate data files
	getFiles(DATA_DIR, (f) => f === 'info.json').forEach(validateStateInfo)
	getFiles(DATA_DIR, (f) => f === 'vaccination.json').forEach(
		validateVaccinationInfo
	)

	// Check duplicates
	stringChecker.duplicates.forEach((key) => {
		errorCount++
		linkErrors.push(`duplicated id: ${key}`)
	})

	// Check unvisited
	stringChecker
		.getUnvisited()
		.filter(
			(s) =>
				s.startsWith('c19.eligibility.question') ||
				s.startsWith('c19.eligibility.moreinfo')
		)
		.forEach((s) => {
			console.warn(chalk.yellow(`unused string id ${s}`))
		})

	if (errorCount > 0) {
		if (schemaValidationErrors.length > 0) {
			console.log(schemaValidationErrors)
		}
		if (linkErrors.length > 0) {
			console.log(linkErrors)
		}
		console.log('💥 ' + chalk.red(`${errorCount} errors`))
		process.exit(1)
	} else {
		console.log('🚀 ' + chalk.green(`all files passed validation`))
	}

	function inspectLocalizationRecords() {
		records.forEach((rec) => {
			const id = rec['String ID']
			if (!rec['en-us']) {
				errorCount++
				linkErrors.push(`string "${id} is missing an en-us localization"`)
			}
			if (id !== 'c19.test/special_chars') {
				Object.keys(rec).forEach((key) => {
					const stringToCheck = rec[key]
					for (
						let charIndex = 0;
						charIndex < ILLEGAL_CHARS.length;
						charIndex++
					) {
						const illegalChar = ILLEGAL_CHARS[charIndex]
						if (stringToCheck.indexOf(illegalChar) > -1) {
							errorCount++
							linkErrors.push(
								`string "${id} is using illegal character: ${illegalChar}"`
							)
						}
					}
				})
			}
		})
	}

	function validateStateInfo(file: string) {
		try {
			/* eslint-disable-next-line @typescript-eslint/no-var-requires */
			const data = require(file)
			const validationErrors = validateRegionInfoSchema(data)
			schemaValidationErrors.push(...validationErrors)
			errorCount += validationErrors.length

			// handle results
			if (validationErrors.length === 0) {
				console.log(chalk.green(`✔ ${file}`))
			}
			if (validationErrors.length > 0) {
				console.log(
					chalk.red(`❌ ${file} has ${validationErrors.length} schema errors`)
				)
			}
		} catch (err) {
			console.log(`error in ${file}`, err)
		}
	}

	function validateVaccinationInfo(file: string) {
		try {
			/* eslint-disable-next-line @typescript-eslint/no-var-requires */
			const data = require(file) as VaccinationPlan

			const validationErrors = validateVaccinationPlanSchema(data)
			const dataLinkErrors: string[] = []
			checkStringIds(data, stringChecker, dataLinkErrors)
			linkErrors.push(...dataLinkErrors)
			schemaValidationErrors.push(...validationErrors)
			errorCount += dataLinkErrors.length + validationErrors.length
			const phaseErrors = checkForPhaseErrors(data)
			dataLinkErrors.push(...phaseErrors)
			errorCount += phaseErrors.length

			// handle results
			if (validationErrors.length === 0 && dataLinkErrors.length === 0) {
				console.log(chalk.green(`✔ ${file}`))
			}
			if (validationErrors.length > 0) {
				console.log(
					chalk.red(`❌ ${file} has ${validationErrors.length} schema errors`)
				)
			}
			if (dataLinkErrors.length > 0) {
				console.log(chalk.red(`❌ ${file} has ${dataLinkErrors} linker errors`))
			}
		} catch (err) {
			console.log(`error caught in ${file}`, err)
		}
	}
}

validateDataFiles()

function checkForPhaseErrors(plan: VaccinationPlan): string[] {
	const errors: string[] = []
	const links: Partial<Record<LinkType, Link>> = plan.links ?? {}
	const idSet = new Set<string>()

	Object.keys(links).forEach((k) => {
		const link = links[k as LinkType]
		if (link && link.url != null && link.url.trim() === '') {
			errors.push(`links.${k}.url must not be empty string`)
		}
	})

	plan?.phases?.forEach((phase) => {
		if (idSet.has(phase.id)) {
			errors.push(`found duplicate phase id ${phase.id} in vaccination plan`)
		}
		idSet.add(phase.id)
	})
	if (plan.activePhase?.trim() === '') {
		errors.push('activePhase must not be an empty string')
	}
	return errors
}

function readRecords(): Record<string, string>[] {
	const records: Record<string, string>[] = []
	readCsvFile(LOCALIZATION_TABLE_PATH, records)
	return records
}

function getStringChecker(records: Record<string, string>[]): StringChecker {
	const recordIds = records.map((r) => r['String ID'])
	return new StringChecker(recordIds)
}

function checkStringIds(
	vaccinationPlan: VaccinationPlan,
	validStrings: StringChecker,
	errors: string[]
): void {
	function checkString(str: string): void {
		if (!validStrings.has(str)) {
			errors.push(`no defined string with id "${str}"`)
		}
	}

	const links = vaccinationPlan.links as Record<string, Link>
	if (vaccinationPlan.links) {
		Object.keys(links).forEach((linkKey) => {
			const link = links[linkKey]
			if (link.text != null) {
				checkString(link.text)
			}
			if (link.description != null) {
				checkString(link.description as string)
			}
		})
	}
	if (vaccinationPlan.phases) {
		vaccinationPlan.phases.forEach((phase: RolloutPhase) => {
			if (phase.id.indexOf('.') >= 0) {
				errors.push(`phase id should not contain dots`)
			}
			phase.qualifications.forEach((qual: Qualification) => {
				checkString(qual.question)
				if (qual.moreInfoText) {
					checkString(qual.moreInfoText)
				}
			})
		})
	}
}

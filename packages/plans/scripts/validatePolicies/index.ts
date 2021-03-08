/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import * as path from 'path'
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
import {
	VaccinationPlan,
	Link,
	RolloutPhase,
	Qualification,
} from '@covid-vax-bot/state-plan-schema'

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

	records.forEach((rec) => {
		if (!rec['en-us']) {
			errorCount++
			linkErrors.push(
				`string "${rec['String ID']} is missing an en-us localization"`
			)
		}
	})

	// Validate data files
	getFiles(DATA_DIR, (f) => f === 'info.json').forEach(validateStateInfo)
	getFiles(DATA_DIR, (f) => f === 'vaccination.json').forEach(
		validateVaccinationInfo
	)
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
			const phaseErrors = verifyPhaseIdsNotDuplicated(data)
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
		} catch (err) {
			console.log(`error caught in ${file}`, err)
		}
	}
}

validateDataFiles()

function verifyPhaseIdsNotDuplicated(plan: VaccinationPlan): string[] {
	const errors: string[] = []
	const idSet = new Set<string>()
	plan?.phases?.forEach((phase) => {
		if (idSet.has(phase.id)) {
			errors.push(`found duplicate phase id ${phase.id} in vaccination plan`)
		}
		idSet.add(phase.id)
	})
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

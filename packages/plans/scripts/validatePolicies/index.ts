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
	validateRegionInfo,
	validateVaccinationPlan,
	SchemaValidationError,
} from '../schema'
import {
	VaccinationPlan,
	Link,
	RolloutPhase,
	Qualification,
} from '@ms-covidbot/state-plan-schema'

const LOCALIZATION_TABLE_PATH = path.join(DIST_DIR, 'localization.csv')

/**
 * Validate that state-level data files adhere to the schema
 */
function validateDataFiles() {
	const stringChecker = getStringChecker()

	let errorCount = 0
	const schemaValidationErrors: SchemaValidationError[] = []
	const linkErrors: string[] = []

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
			const validationErrors = validateRegionInfo(data)
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
			const data = require(file)
			const validationErrors = validateVaccinationPlan(data)
			const dataLinkErrors: string[] = []
			checkStringIds(data, stringChecker, dataLinkErrors)
			linkErrors.push(...dataLinkErrors)
			schemaValidationErrors.push(...validationErrors)
			errorCount += dataLinkErrors.length + validationErrors.length

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

function getStringChecker(): StringChecker {
	const records: Record<string, string>[] = []
	readCsvFile(LOCALIZATION_TABLE_PATH, records)

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
		Object.keys(links).forEach((link) => {
			if (links[link].text) {
				checkString(links[link].text)
			}
			if (links[link].description) {
				checkString(links[link].description as string)
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

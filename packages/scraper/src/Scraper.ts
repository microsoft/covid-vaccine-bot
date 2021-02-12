/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @essex/adjacent-await */
import puppeteer from 'puppeteer'
import ssri from 'ssri'
import { PubSub, Handler, Unsubscribe } from './PubSub'
import { extractPageData } from './extractPageData'
import { PageScrapeResult, RunResult } from './types'
import { Link } from '@ms-covidbot/state-plan-schema'

const createRunResult = (): RunResult => ({
	integrity: {},
	changes: [],
	errors: [],
})

export class Scraper {
	private lastRun: RunResult
	private result: RunResult | undefined
	private browser: puppeteer.Browser | undefined
	private links: Link[]
	private onLinkStartedHandlers = new PubSub<Link>()
	private onIntegrityMismatchHandlers = new PubSub<Link>()
	private onLinkScrapedHandlers = new PubSub<[Link, PageScrapeResult]>()

	public constructor(lastRun: RunResult, links: Link[]) {
		this.lastRun = lastRun
		this.links = links
	}

	public async execute(): Promise<RunResult> {
		this.result = createRunResult()
		this.browser = await puppeteer.launch({ product: 'chrome' })
		await this._scrapeLinks()
		await this.browser.close()
		this.browser = undefined
		return this.result
	}

	public onLinkStarted(handler: Handler<Link>): Unsubscribe {
		return this.onLinkStartedHandlers.subscribe(handler)
	}

	public onIntegrityMismatch(handler: Handler<Link>): Unsubscribe {
		return this.onIntegrityMismatchHandlers.subscribe(handler)
	}

	public onLinkScraped(
		handler: Handler<[Link, PageScrapeResult]>
	): Unsubscribe {
		return this.onLinkScrapedHandlers.subscribe(handler)
	}

	private async _scrapeLinks(): Promise<void> {
		if (!this.result) {
			throw new Error('bad state')
		}
		const textLinks = this.links.filter((l) => l.content == null)
		for (const link of textLinks) {
			try {
				// scrape the link
				this.onLinkStartedHandlers.fire(link)
				const scrapeResult = await this._scrapeLink(link)
				this.onLinkScrapedHandlers.fire([link, scrapeResult])

				// check content integrity
				const integrityHash = scrapeResult.integrity.toString()
				this.result.integrity[link.url] = integrityHash
				if (integrityHash !== this.lastRun.integrity[link.url]) {
					this.onIntegrityMismatchHandlers.fire(link)
				}
			} catch (err) {
				this.result.errors.push(err)
			}
		}

		// TODO: Handle PDF, Image Links
	}

	private async _scrapeLink(link: Link): Promise<PageScrapeResult> {
		if (!this.browser) {
			throw new Error('bad state')
		}
		const page = await this.browser.newPage()
		try {
			// navigate to the page and wait for it to load
			await page.goto(link.url)
			await page.waitForSelector('body')

			const pageResult = await page.evaluate(
				extractPageData,
				link as Record<string, any>
			)

			return {
				...pageResult,
				integrity: ssri.fromData(pageResult.content),
			} as PageScrapeResult
		} finally {
			page.close()
		}
	}
}

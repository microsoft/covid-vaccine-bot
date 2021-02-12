/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Link } from '@ms-covidbot/state-plan-schema'

export interface PageExtractResult {
	content: string
}

/**
 * This function is injected into the headless browser instance
 * and is run inside the browser. It converts the live DOM into an extracted
 * form for our scraper
 *
 * @param link The link to extract data from
 */
export function extractPageData(link: Link): PageExtractResult {
	function strip(html: string) {
		const tmp = document.createElement('div')
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText
	}

	let content = ''
	if (!link.scrapeQuery) {
		// scrape the whole page
		content = strip(document.body.innerHTML)
	} else {
		link.scrapeQuery.forEach((query) => {
			document.querySelectorAll(query).forEach((node) => {
				content += strip(node.innerHTML) + '\n'
			})
		})
	}

	return { content }
}

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
async function scrapeSites(): Promise<void> {}

scrapeSites()
	.then(() => console.log('sites scraped'))
	.catch((err) => {
		console.error('error while scraping sites', err)
		process.exit(1)
	})

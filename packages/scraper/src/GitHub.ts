/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/* eslint-disable @typescript-eslint/no-var-requires */

// import { config } from 'dotenv'

// config()

import fetch from 'node-fetch';

export async function checkConnection(): Promise<void> {
	const loadBranchesResponse = await fetch(
				`https://api.github.com/repos/${process.env.SCRAPER_REPO_OWNER}/${process.env.SCRAPER_REPO_NAME}/branches`,
				{
					method: 'GET',
					headers: {
						Authorization: `token ${process.env.SCRAPER_REPO_TOKEN}`,
					},
				}
			)

			const returnVal = await loadBranchesResponse.json();
			console.log(returnVal)
}

export async function createIssue(titleVal:string, bodyVal:string ): Promise<void>{
	const createIssueResp = await fetch(
				`https://api.github.com/repos/${process.env.SCRAPER_REPO_OWNER}/${process.env.SCRAPER_REPO_NAME}/issues`,
				{
					method: 'POST',
					headers: {
						Authorization: `token ${process.env.SCRAPER_REPO_TOKEN}`,
					},
					body:JSON.stringify({title:titleVal, body:bodyVal, labels:["scrapped changes"]})
				}
			)

			const returnVal = await createIssueResp.json();

}
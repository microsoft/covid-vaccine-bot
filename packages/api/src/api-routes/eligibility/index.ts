import { Request, Response } from 'express'
import { Operation } from 'express-openapi'

export const POST: Operation = [
	(req: Request, res: Response) => {
		res.json({ test: 'hello world' })
	},
]
// POST.apiDoc = {
//   description: 'A description for retrieving a user.',
//   tags: ['users'],
//   operationId: 'getUser',
//   // parameters for this operation
//   parameters: [
//     {
//       in: 'query',
//       name: 'firstName',
//       type: 'string'
//     }
//   ],
//   responses: {
//     default: {
//       $ref: '#/definitions/Error'
//     }
//   }
// };

export const GET: Operation = [
	(req: Request, res: Response) => {
		res.json({ test: 'hello world' })
	},
]

/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export type Handler<T> = (payload: T) => void
export type Unsubscribe = () => void

export class PubSub<T> {
	private handlers: Handler<T>[] = []

	public subscribe(handler: Handler<T>): Unsubscribe {
		this.handlers.push(handler)
		return () => {
			this.handlers = this.handlers.filter((h) => h !== handler)
		}
	}

	public fire(arg: T): void {
		this.handlers.forEach((h) => h(arg))
	}
}

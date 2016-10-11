import angular = require("angular");

declare module 'angular' {
	export namespace ui {
		export type StateDefaultSpecifier = string
			| ((...args: any[]) => string)
			| ((...args: any[]) => ng.IPromise<string>)
			| (string | ((...args: any[]) => string))[]
			| (string | ((...args: any[]) => ng.IPromise<string>))[];
		interface IState {
			default?: StateDefaultSpecifier
		}
	}
}

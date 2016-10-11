import angular = require("angular");

declare module 'angular' {
	export namespace ui {
		export type DefaultSpecifier = string | (() => string) | (() => ng.IPromise<string>);
		interface IState {
			default?: DefaultSpecifier
		}
	}
}

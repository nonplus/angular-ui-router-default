"use strict";

var moduleName = 'ui.router.default';

/* commonjs package manager support (eg componentjs) */
declare var module, exports;
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
	module.exports = moduleName;
}

var max_redirects = 10;
angular.module(moduleName, ['ui.router'])
	.config(['$provide', function($provide: ng.auto.IProvideService) {

		$provide.decorator('$state', ['$delegate', '$injector', '$q', function(
			$delegate: ng.ui.IStateService,
			$injector: ng.auto.IInjectorService,
			$q: ng.IQService
		) {
			var transitionTo = $delegate.transitionTo;
			var pendingPromise;
			$delegate.transitionTo = function(to, toParams, options): ng.IPromise<any> {
				var numRedirects = 0;
				var $state = this;
				var nextState = to.name || to;
				var nextParams = toParams;
				var nextOptions = options;

				return fetchTarget();

				function fetchTarget(): ng.IPromise<any> {
					var target = $state.get(nextState, $state.$current);
					nextState = (target || {}).name;

					var absRedirectPromise = getAbstractRedirect(target);
					pendingPromise = absRedirectPromise;
					return $q.when(absRedirectPromise)
						.then(abstractTargetResolved);

					function abstractTargetResolved(abstractTarget) {
						if (absRedirectPromise !== pendingPromise) {
							return $q.reject(new Error('transition superseded'));
						}
						// we didn't get anything from the abstract target
						if (!abstractTarget) {
							return transitionTo.call($delegate, nextState, nextParams, nextOptions);
						}
						checkForMaxRedirect();
						nextState = abstractTarget;
						return fetchTarget();
					}

					function checkForMaxRedirect() {
						if (numRedirects === max_redirects) {
							throw new Error('Too many abstract state default redirects');
						}
						numRedirects += 1;
					}
				}

				function getAbstractRedirect(state: ng.ui.IState) {
					if (!state || !state.abstract || (state.abstract === true && !state.default)) {
						return null;
					}
					return invokeAbstract(state).then(abstractInvoked);

					function abstractInvoked(newState): string {
						if (newState[0] === '.') {
							return nextState + newState;
						} else {
							return newState;
						}
					}

				}

				function invokeAbstract(state: ng.ui.IState) {
					var defaultState: ng.ui.DefaultSpecifier;

					if (state.default) {
						defaultState = state.default;
					} else {
						defaultState = state.abstract as any;
					}

					if (!angular.isString(defaultState)) {
						return $q.when($injector.invoke(defaultState));
					} else {
						return $q.when(defaultState);
					}
				}

			};

			return $delegate;
		}]);
	}]);
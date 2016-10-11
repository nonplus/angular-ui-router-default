"use strict";

let mock = angular.mock;
type IStateService = ng.ui.IStateService;

interface StateScope {
	state: string;
}

describe('navigating to state', function() {

	beforeEach(mock.module('ui.router.default'));

	describe("with non-existant absolute state", function() {
		it("should throw an informative error", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
			expect(function() {
				$state.go('somewhere'); $rootScope.$digest();
			}).toThrowError(/^Could not resolve/);
		}));
	}); // with non-existant absolute state

	describe("with non-existant relative state", function() {
		beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
			$stateProvider.state('base', {});
		}));

		it("should throw an informative error", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
			$state.go('base'); $rootScope.$digest();
			expect(function() {
				$state.go('.somewhere'); $rootScope.$digest();
			}).toThrowError(/^Could not resolve/);
		}));
	}); // with non-existant relative state

	describe("with abstract = false", function() {

		beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.concrete', {
				});
		}));

		it("should use specified state", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
			$state.go('base'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');

			$state.go('.concrete'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.concrete');

			$state.go('^'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');
		}));

	}); // with abstract = false


	describe("with abstract = true", function() {

		beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: true
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.child2', {
				});
		}));

		it("should fail", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
			expect(function(){
				$state.go('base.abstract');
					$rootScope.$digest();
			}).toThrowError("Cannot transition to abstract state 'base.abstract'");

		}));

		it("should fail to ^", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {

			$state.go('base.abstract.child2'); $rootScope.$digest();

			expect(function() {
				$state.go('^');
				$rootScope.$digest();
			}).toThrowError("Cannot transition to abstract state 'base.abstract'");
		}));

	}); // with abstract = true

	let members = ["abstract", "default"];

	for (let member of members) {

		describe("abstract with " + member + " =", () => {

			describe("'.child'", function() {

				beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
					$stateProvider
						.state('base', {
						})
						.state('base.abstract', {
							abstract: true,
							[member]: '.child2'
						})
						.state('base.abstract.child1', {
						})
						.state('base.abstract.child2', {
						});
				}));

				it("should transition to child", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
					$state.go('base'); $rootScope.$digest();
					expect($state.current.name).toEqual('base');

					$state.go('.abstract'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.child2');

					$state.go('^'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.child2');
				}));

			}); // with abstract = '.child'

			describe("'.abstractChild'", function() {

				beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
					$stateProvider
						.state('base', {
						})
						.state('base.abstract', {
							abstract: true,
							[member]: '.abstractChild'
						})
						.state('base.abstract.child1', {
						})
						.state('base.abstract.abstractChild', {
							abstract: true,
							[member]: '.grandChild'
						})
						.state('base.abstract.abstractChild.grandChild', {
						})
					;
				}));

				it("should transition to concrete grand child", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
					$state.go('base'); $rootScope.$digest();
					expect($state.current.name).toEqual('base');

					$state.go('.abstract'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.abstractChild.grandChild');

					$state.go('^'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.abstractChild.grandChild');

					$state.go('^.^'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.abstractChild.grandChild');

					$state.go('^.^.^'); $rootScope.$digest();
					expect($state.current.name).toEqual('base');
				}));

			}); // with abstract = '.child'

			describe("() => state", function() {

				var state;

				beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
					$stateProvider
						.state('base', {
						})
						.state('base.abstract', {
							abstract: true,
							[member]: function() {
								return state;
							}
						})
						.state('base.abstract.child1', {
						})
						.state('base.abstract.child2', {
						});
				}));

				it("should transition to child", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
					$state.go('base'); $rootScope.$digest();
					expect($state.current.name).toEqual('base');

					state = '.child1';
					$state.go('.abstract'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.child1');

					state = '.child2';
					$state.go('^'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.child2');
				}));

			}); // with abstract = function() { return ...; }

			describe("['$rootScope', function($rootScope) => $rootScope.state]", function() {

				beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
					$stateProvider
						.state('base', {
						})
						.state('base.abstract', {
							abstract: true,
							[member]: ['$rootScope', function($rootScope: ng.IRootScopeService & StateScope) {
								return $rootScope.state;
							}]
						})
						.state('base.abstract.child1', {
						})
						.state('base.abstract.child2', {
						});
				}));

				it("should transition to child", mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService & StateScope) {
					$state.go('base'); $rootScope.$digest();
					expect($state.current.name).toEqual('base');

					$rootScope.state = '.child1';
					$state.go('.abstract'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.child1');

					$rootScope.state = '.child2';
					$state.go('^'); $rootScope.$digest();
					expect($state.current.name).toEqual('base.abstract.child2');
				}));

			}); // with abstract = ['$rootScope', function($rootScope: ng.IRootScopeService) { return ...; }]

			describe("() => IPromise<string> that resolves", function() {

				beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {

					$stateProvider
						.state('base', {
						})
						.state('base.abstract', {
							abstract: true,
							[member]: ['$q', '$rootScope', function($q: ng.IQService, $rootScope: ng.IRootScopeService) {
								var defer = $q.defer();
								setTimeout(function(){
									defer.resolve('base.abstract.child');
									$rootScope.$digest();
								});
								return defer.promise;
							}]
						})
						.state('base.abstract.child', {
						})
						.state('base.abstract2', {
							abstract: true,
							[member]: ['$q', '$rootScope', function($q: ng.IQService, $rootScope: ng.IRootScopeService) {
								var defer = $q.defer();
								setTimeout(function(){
									defer.resolve('base.abstract2.child');
									$rootScope.$digest();
								});
								return defer.promise;
							}]
						})
						.state('base.abstract2.child', {
						});
				}));

				it("should transition from promise", function(done) {
					mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
						$state.go('base.abstract')
							.then(function() {
								expect($state.current.name).toBe('base.abstract.child');
							})
							.catch(function() {
								throw new Error('Should not be here');
							})
							.finally(done);

						$rootScope.$digest();
					});
				});

				it("should override first transition", function(done) {
					mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService) {
						var firstResolved = false,
							secondResolved = false;
						$state.go('base.abstract')
							.then(function() {

								throw new Error('Should not be here');
							})
							.catch(function(ex) {
								expect(ex.message).toBe('transition superseded');
							})
							.finally(function(){
								firstResolved = true;
								checkForDone();
							});
						$state.go('base.abstract2').then(function(){
							expect($state.current.name).toBe('base.abstract2.child');
						})
							.finally(function() {
								secondResolved = true;
								checkForDone();
							});
						$rootScope.$digest();

						function checkForDone() {
							if (firstResolved && secondResolved) {
								done();
							} else {
								if ($rootScope.$$phase !== 'digest') {
									$rootScope.$digest();
								}
							}
						}
					});
				});

			}); // with promise returned from abstract

			describe('() => IPromise<string> that rejects', function(){

				beforeEach(mock.module(function($stateProvider: ng.ui.IStateProvider) {
					$stateProvider
						.state('base', {
						})
						.state('base.abstract', {
							abstract: true,
							[member]: ['$q', '$rootScope', function($q: ng.IQService, $rootScope: ng.IRootScopeService) {
								var defer = $q.defer();
								setTimeout(function(){
									defer.reject('This is a rejection');
									$rootScope.$apply();
								});
								return defer.promise;
							}]
						})
						.state('base.abstract.child', {
						});
				}));

				it('should not transition due to rejected promise', function(done){
					mock.inject(function($state: IStateService, $rootScope: ng.IRootScopeService){
						$state.go('base');
						$rootScope.$digest();
						$state.go('base.abstract')
							.then(function(){
								done.fail("The transition should've failed");
							})
							.catch(function(err){
								expect($state.current.name).toBe('base');
								expect(err).toBe('This is a rejection');
							})
							.finally(done);
					});
				});

			}); // with reject promise from abstract

		});
	} // for member in members

}); // navigating to state
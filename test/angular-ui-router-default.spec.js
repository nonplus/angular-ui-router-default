describe('navigating to state', function() {

	var $stateProvider;

	beforeEach(module('ui.router.default'));

	beforeEach(module('ui.router', function(_$stateProvider_) {
		$stateProvider = _$stateProvider_;
	}));

	describe("with abstract = false", function() {

		beforeEach(module(function($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.concrete', {
				});
		}));

		it("should use specified state", inject(function($state, $rootScope) {
			$state.go('base'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');

			$state.go('.concrete'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.concrete');

			$state.go('^'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');
		}));

	}); // with abstract = false


	describe("with abstract = true", function() {

		beforeEach(module(function($stateProvider) {
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

		it("should fails", inject(function($state, $rootScope) {
			expect(function(){
				$state.go('base.abstract');
			}).toThrow(new Error("Cannot transition to abstract state 'base.abstract'"));

			$state.go('base.abstract.child2'); $rootScope.$digest();
			expect(function(){
				$state.go('^');
			}).toThrow(new Error("Cannot transition to abstract state '^'"));
		}));

	}); // with abstract = true


	describe("with abstract = '.child'", function() {

		beforeEach(module(function($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: '.child2'
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.child2', {
				});
		}));

		it("should transition to child", inject(function($state, $rootScope) {
			$state.go('base'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');

			$state.go('.abstract'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.abstract.child2');

			$state.go('^'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.abstract.child2');
		}));

	}); // with abstract = '.child'


	describe("with abstract = '.abstractChild'", function() {

		beforeEach(module(function($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: '.abstractChild'
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.abstractChild', {
					abstract: '.grandChild'
				})
				.state('base.abstract.abstractChild.grandChild', {
				})
			;
		}));

		it("should transition to concrete grand child", inject(function($state, $rootScope) {
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


	describe("with abstract = function() { return ...; }", function() {

		var state;

		beforeEach(module(function($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: function() { return state; }
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.child2', {
				});
		}));

		it("should transition to child", inject(function($state, $rootScope) {
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


	describe("with abstract = ['$rootScope', function($rootScope) { return ...; }]", function() {

		beforeEach(module(function($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: ['$rootScope', function($rootScope) { return $rootScope.state; }]
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.child2', {
				});
		}));

		it("should transition to child", inject(function($state, $rootScope) {
			$state.go('base'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');

			$rootScope.state = '.child1';
			$state.go('.abstract'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.abstract.child1');

			$rootScope.state = '.child2';
			$state.go('^'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.abstract.child2');
		}));

	}); // with abstract = ['$rootScope', function($rootScope) { return ...; }]

}); // navigating to state

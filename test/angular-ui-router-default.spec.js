describe('navigating to state', function () {

	var $stateProvider;

	beforeEach(module('ui.router.default'));

	beforeEach(module('ui.router', function (_$stateProvider_) {
		$stateProvider = _$stateProvider_;
	}));

	describe("with non-existant absolute state", function () {
		it("should throw an informative error", inject(function ($state, $rootScope) {
			expect(function () {
				$state.go('somewhere'); $rootScope.$digest();
			}).toThrowError(/^Could not resolve/);
		}));
	})

	describe("with non-existant relative state", function () {
		beforeEach(module(function ($stateProvider) {
			$stateProvider.state('base', {});
		}));

		it("should throw an informative error", inject(function ($state, $rootScope) {
			$state.go('base'); $rootScope.$digest();
			expect(function () {
				$state.go('.somewhere'); $rootScope.$digest();
			}).toThrowError(/^Could not resolve/);
		}));
	})

	describe("with abstract = false", function () {

		beforeEach(module(function ($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.concrete', {
				});
		}));

		it("should use specified state", inject(function ($state, $rootScope) {
			$state.go('base'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');

			$state.go('.concrete'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.concrete');

			$state.go('^'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');
		}));

	}); // with abstract = false


	describe("with abstract = true", function () {

		beforeEach(module(function ($stateProvider) {
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

		it("should fail", inject(function ($state, $rootScope) {
			expect(function(){
				$state.go('base.abstract');
					$rootScope.$digest();
			}).toThrowError("Cannot transition to abstract state 'base.abstract'");
			 
		}));

		it("should fail to ^", inject(function ($state, $rootScope) {

			$state.go('base.abstract.child2'); $rootScope.$digest();

			expect(function () {
				$state.go('^');
				$rootScope.$digest();
			}).toThrowError("Cannot transition to abstract state 'base.abstract'");
		}));

	}); // with abstract = true


	describe("with abstract = '.child'", function () {

		beforeEach(module(function ($stateProvider) {
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

		it("should transition to child", inject(function ($state, $rootScope) {
			$state.go('base'); $rootScope.$digest();
			expect($state.current.name).toEqual('base');

			$state.go('.abstract'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.abstract.child2');

			$state.go('^'); $rootScope.$digest();
			expect($state.current.name).toEqual('base.abstract.child2');
		}));

	}); // with abstract = '.child'


	describe("with abstract = '.abstractChild'", function () {

		beforeEach(module(function ($stateProvider) {
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

		it("should transition to concrete grand child", inject(function ($state, $rootScope) {
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


	describe("with abstract = function() { return ...; }", function () {

		var state;

		beforeEach(module(function ($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: function () { return state; }
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.child2', {
				});
		}));

		it("should transition to child", inject(function ($state, $rootScope) {
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


	describe("with abstract = ['$rootScope', function($rootScope) { return ...; }]", function () {

		beforeEach(module(function ($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: ['$rootScope', function ($rootScope) { return $rootScope.state; }]
				})
				.state('base.abstract.child1', {
				})
				.state('base.abstract.child2', {
				});
		}));

		it("should transition to child", inject(function ($state, $rootScope) {
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

	describe("with promise returned from abstract", function () {
		beforeEach(module(function ($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: ['$q','$rootScope', function ($q, $rootScope) {
						var defer = $q.defer();
						setTimeout(function(){
							defer.resolve('base.abstract.child');
							$rootScope.$digest();
						},100);
						return defer.promise;
					}]
				})
				.state('base.abstract.child', {
				})
				.state('base.abstract2',{
					abstract: ['$q','$rootScope', function ($q, $rootScope) {
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
		it("should transition from promise", function (done) {
			inject(function ($state, $rootScope) {
				$state.go('base.abstract')
					.then(function () {
						expect($state.current.name).toBe('base.abstract.child');
					})
					.catch(function () {
						throw new Error('Should not be here');
					})
					.finally(done);

				$rootScope.$digest();
			});
		});
		it("should override first transition", function (done) {
			inject(function ($state, $rootScope) {
				var firstResolved = false,
					secondResolved = false;
				$state.go('base.abstract')
					.then(function () {
						
						throw new Error('Should not be here');
					})
					.catch(function (ex) {
						expect(ex.message).toBe('transition superseded');
					})
					.finally(function(){
						firstResolved = true;
						checkForDone();
					})
				$state.go('base.abstract2').then(function(){
					expect($state.current.name).toBe('base.abstract2.child');
				})
				.finally(function(){
					secondResolved = true;
					checkForDone()});
				$rootScope.$digest();

				function checkForDone(){
					if(firstResolved && secondResolved) {
						done();
					} else {
						if($rootScope.$$phase !== 'digest'){
							$rootScope.$digest();
						}	
					}
				}
			});
		});
	})
	describe('with reject promise from abstract',function(){
		beforeEach(module(function ($stateProvider) {
			$stateProvider
				.state('base', {
				})
				.state('base.abstract', {
					abstract: ['$q','$rootScope', function ($q, $rootScope) {
						var defer = $q.defer();
						setTimeout(function(){
							defer.reject('This is a rejection');
							$rootScope.$apply();
						});
						return defer.promise;
					}]
				})
				.state('base.abstract.child', {
				})
		}));
		it('should not transition due to rejected promise',function(done){
			inject(function($state, $rootScope){
				$state.go('base');
				$rootScope.$digest();
				$state.go('base.abstract')
					.then(function(){
						done("The transition should've failed");
					})
					.catch(function(err){
						expect($state.current.name).toBe('base');
						expect(err).toBe('This is a rejection');
					})
					.finally(done);
			});
		});
	});

}); // navigating to state
angular-ui-router-default
=========================
[![Build Status](https://travis-ci.org/nonplus/angular-ui-router-default.svg?branch=master)](https://travis-ci.org/nonplus/angular-ui-router-default)

Motivation
----------

Abstract state are useful for resolving values used by multiple child states.  However, since one cannot navigate to an abstract state (`$state.go('abstract_parent')`) any part of the application that transitions state (`$state.go()`, `ui-sref`, etc.) must explicitly specify a non-abstract child state (`$state.go('abstract_parent.concrete-child')`).

Abstract are also useful in top-level navigation links, since `ui-sref-active` is set for all their child states.  However, since you can't directly navigate to the (`ui-sref="abstract_state"`), implementing these menu items usually requires an `ng-click` handler that navigates to a concrete state.

The options for [How to: Set up a default/index child state](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-set-up-a-defaultindex-child-state]) are tedious, non-intuitive and depend on URL routing.  There is a need for a more convenient way of defining default child states with some great [ideas on how to configure these](https://github.com/angular-ui/ui-router/issues/27).

This module provides basic support for specifying the default child state as a string.

Loading the Module
------------------

This module declares itself as ui.router.default, so it can be declared as a dependency of your application as normal:

```javascript
var app = angular.module('myApp', ['ng', 'ui.router.default']);
```

Defining Default Child State
----------------------------

In your state definition for an abstract state, set the `abstract` property to the name of a child state (relative or absolute).
The child state name can be provided statically as a string dynamically as a function callback.

When a state transtion targets this abstract state, it will be redirected to the default child state instead.

```javascript
$stateProvider
    .state('parent', {
      abstract: '.index',
      template: '<ui-view/>'
    })
    .state('parent.index', {
      ...
    })
    .state('parent.page2', {
      ...
    })
    .state('another', {
      abstract: ['$rootScope', function($rootScope) {
        return $rootScope.edit ? '.edit' : '.display';
      }]
    })
    .state('another.display', {
      ...
    })
    .state('another.edit', {
      ...
    })
    )
```

Using Default Child State
-------------------------

When a default child state is defined, the application can now navigate to the abstract parent state.
```javascript
$state.go('parent');
```

```html
<li ui-sref-active="active">
  <a ui-sref="parent">Go to Parent</a>
</li>
```

Copyright & License
-------------------

Copyright 2015 Stepan Riha. All Rights Reserved.

This may be redistributed under the MIT licence. For the full license terms, see the LICENSE file which
should be alongside this readme.

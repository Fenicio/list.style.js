(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function( window, undefined ) {
"use strict";


var classes = require('classes'),
    events = require('event');

var ListStyle = function(options) {
  options = options || {};

  var list;

  var refresh = function() {
    var item;
    console.log(list);
  };


  return {
    init: function(parentList) {
      list = parentList;
      console.log("INIT");
    },
    name: options.name || "style"
  };
};

if (typeof define === 'function' && define.amd) {
  define(function () { return ListStyle; });
}
module.exports = ListStyle;
window.ListStyle = ListStyle;
});
},{"classes":2,"event":3}],2:[function(require,module,exports){
/**
 * A simple JavaScript class system
 *
 * @author     James Brumond
 * @version    0.3.0
 * @copyright  Copyright 2013 James Brumond
 * @license    Dual licensed under MIT and GPL
 */

/*jshint browser: true, bitwise: false, camelcase: false, eqnull: true, latedef: false,
  plusplus: false, jquery: true, shadow: true, smarttabs: true, loopfunc: true */

(function() {
	var _global = this;
	var namespace = _global;

	// The class constructor
	var createClass = function(name, parent, mixins, constructor) {
		
		// If an array was given for a name, we only want the
		// actual name value
		if (typeof name === 'object' && name) {
			name = name[1] || false;
			if (! name) {
				throw new TypeError('Invalid class name value');
			}
		}

		// Default the parent to the global Object
		if (! parent) {
			parent = Object;
		}

		// The actual constructor function
		var self = function() {
			var inst = this;
			if (! inst instanceof self) {
				throw new Error('Classes should be invoked with the new keyword.');
			}
			// This allows .apply() type expansion with constructor calls
			var _args = arguments[0];
			if (! (_args && _args.__shouldExpand__)) {
				_args = arguments;
			}
			// If a function was given as the constructor, it should
			// be called every time a new instance is created
			if (typeof constructor === 'function') {
				constructor.apply(inst, _args);
			}
			// If a construct() method exists, it should also be called
			if (typeof inst.construct === 'function') {
				inst.construct.apply(inst, _args);
			}
		};
		
		// Fetch the parent if a string is given
		if (typeof parent === 'string') {
			parent = namespace[parent];
		}
		
		// Inherit from the parent if one was given (inheritence model
		// based roughly on CoffeeScript classes)
		var _super = parent.prototype;
		for (var i in parent) {
			if (parent.hasOwnProperty(i)) {
				self[i] = parent[i];
			}
		}
		var ctor = function() {
			this._super = _super;
			this.constructor = self;
		};
		ctor.prototype = _super;
		self.prototype = new ctor();
		
		// Inherit from mixins
		if (mixins) {
			for (var j = 0, c = mixins.length; j < c; j++) {
				if (typeof mixins[j] === 'string') {
					mixins[j] = namespace[mixins[j]];
				}
				mixins[j].mixinTo(self);
			}
		}
		
		// The class/parent name
		self.prototype.__class__ = self.__class__ = name;
		self.prototype.__parent__ = self.__parent__ = parent.__class__ || getNativeClassName(parent);
		self.prototype.__mixins__ = self.__mixins__ = mixins;
		
		// Expose the parent
		self.parent = parent;

		// If an object was given as the constructor, the properties
		// should be placed on the prototype
		if (typeof constructor === 'object') {
			for (var k in constructor) {
				self.prototype[k] = constructor[k];
				// Build a parent method on all class methods that will allow
				// calling supers with this.method.parent(this, ...)
				if (isFunc(self.prototype[k])) {
					(function(method) {
						var func = self.prototype[method];
						func.__scope__ = self;

						func.parent = function(that) {
							return func.parentApply(that, slice(arguments, 1));
						};

						func.parentApply = function(that, args) {
							var oldScope = func.__scope__;
							var scope = func.__scope__ = func.__scope__.parent;
							try {
								return scope.prototype[method].apply(that, args);
							} finally {
								// We put this in a finally block to make sure the scope is
								// always reset, even in the event of an error
								func.__scope__ = oldScope;
							}
						};
					}(k));
				}
			}
		}

	// ----------------------------------------------------------------------------
	//  Create the external functions
		
		/**
		 * Extend the current class
		 *
		 * @access  public
		 * @param   string    the class name
		 * @param   function  the constructor function
		 * @return  void
		 */
		self.extend = function(name, constructor) {
			Class(name, self, constructor);
		};

		/**
		 * Create a new instance of the class
		 *
		 * @access  public
		 * @return  object
		 */
		self.create = function() {
			var args = slice(arguments);
			args.__shouldExpand__ = true;
			return new self(args);
		};
		
		/**
		 * A toString method that identifies this as a class
		 */
		self.toString = function() {
			return '[object Class]';
		};
		
		return self;
	};

// ----------------------------------------------------------------------------
//  Used for the extends() and uses() syntax
	
	var TempClass = function(name) {
		this.parent = null;
		this.mixins = [ ];
		this.Uses = function(mixins, constructor) {
			this.mixins.push.apply(this.mixins, mixins);
			if (constructor) {
				return assignTo(name,
					createClass(name, this.parent, this.mixins, constructor)
				);
			}
			return this;
		};
		this.Extends = function(parent, constructor) {
			this.parent = parent;
			if (constructor) {
				return assignTo(name,
					createClass(name, this.parent, this.mixins, constructor)
				);
			}
			return this;
		};
		// For backwards-compat
		this['extends'] = this.Extends;
	};

// ----------------------------------------------------------------------------
//  Main Functions
	
	function Class(name, parent, constructor) {
		if (arguments.length <= 1) {
			if (name && (typeof name === 'object' || isFunc(name)) && ! isArray(name)) {
				return createClass(null, null, [ ], name);
			}
			return new TempClass(name);
		} else if (arguments.length === 2) {
			return assignTo(name,
				createClass(name, null, [ ], parent)
			);
		}
		return assignTo(name,
			createClass(name, parent, [ ], constructor)
		);
	}
	
	Class.mixin = function(name, constructor) {
		if (arguments.length === 1) {
			constructor = name;
			name = null;
		}
		return assignTo(name, new Mixin(constructor));
	};
	
	Class.namespace = function(ns) {
		namespace = ns ? ns : _global;
	};
	
	function Mixin(constructor) {
		this.mixinTo = function(func) {
			for (var i in constructor) {
				if (constructor.hasOwnProperty(i)) {
					func.prototype[i] = constructor[i];
				}
			}
		};
		this.extend = function(obj) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					constructor[i] = obj[i];
				}
			}
		};
	}

// ----------------------------------------------------------------------------
//  Helper functions
	
	var toString = Object.prototype.toString;
	
	function isFunc(value) {
		return (toString.call(value) === '[object Function]');
	}

	function isArray(value) {
		return (toString.call(value) === '[object Array]');
	}

	function slice(value, index) {
		return Array.prototype.slice.call(value, index);
	}
	
	function assignTo(name, constructor) {
		if (! name) {
			return constructor;
		} else if (typeof name === 'object' && name.length === 2) {
			name[0][name[1]] = constructor;
		} else if (typeof name === 'string') {
			namespace[name] = constructor;
		} else {
			throw new TypeError('Invalid class/mixin name value');
		}
	}
	
	function getNativeClassName(constructor) {
		return toString.call(new constructor()).slice(8, -1);
	}
	
// ------------------------------------------------------------------
//  Expose
	
	try {
		module.exports.Class = Class;
	} catch (e) {
		_global.Class = Class;
	}
	
}).call();
},{}],3:[function(require,module,exports){
"use strict";

var send = require("./send")
var reduce = require("reducible/reduce")
var isReduced = require("reducible/is-reduced")
var isError = require("reducible/is-error")
var reduced = require("reducible/reduced")
var end = require("reducible/end")

// `Event` is data type representing a stream of values that can be dispatched
// manually in an imperative style by calling `send(event, value)`
function Event() {}

// `Event` type has internal property of for aggregating `watchers`. This
// property has a unique name and is intentionally made non-enumerable (in
// a future it will be a private names
// http://wiki.ecmascript.org/doku.php?id=harmony:private_name_objects) so
// that it's behavior can not be tempered.
var reducer = "watchers@" + module.id
var state = "state@" + module.id
var ended = "ended@" + module.id
Object.defineProperty(Event.prototype, state, {
  value: void(0), enumerable: false, configurable: false, writable: true
})
Object.defineProperty(Event.prototype, reducer, {
  value: void(0), enumerable: false, configurable: false, writable: true
})
Object.defineProperty(Event.prototype, ended, {
  value: false, enumerable: false, configurable: false, writable: true
})



// ## send
//
// `Event` type implements `send` as a primary mechanism for dispatching new
//  values of the given `event`. All of the `watchers` of the `event` will
//  be invoked in FIFO order. Any new `watchers` added in side effect to this
//  call will not be invoked until next `send`. Note at this point `send` will
//  return `false` if no watchers have being invoked and will return `true`
//  otherwise, although this implementation detail is not guaranteed and may
//  change in a future.
send.define(Event, function sendEvent(event, value) {
  // Event may only be reduced by one consumer function.
  // Other data types built on top of signal may allow for more consumers.
  if (event[ended]) return reduced()
  if (value === end || isError(value)) event[ended] = true

  var next = event[reducer]
  if (next) {
    var result = next(value, event[state])
    if (isReduced(result) || event[ended])
      event[reducer] = event[state] = void(0)
    else event[state] = result
  }
})

reduce.define(Event, function(event, next, initial) {
  // Event may only be reduced by one consumer function.
  // Other data types built on top of signal may allow for more consumers.
  if (event[reducer] || event[ended])
    return next(Error("Event is already reduced"), initial)
  event[reducer] = next
  event[state] = initial
})

function event() {
  /**
  Function creates new `Event` that can be `watched` for a new values `send`-ed
  on it. Also `send` function can be used on returned instance to send new
  values.

  ## Example

      var e = event()

      send(e, 0)

      reduce(e, function(index, value) {
        console.log("=>", index, value)
        return index + 1
      }, 0)

      send(e, "a") // => 0 "a"
      send(e, "b") // => 0 "b"
  **/
  return new Event()
}
event.type = Event

module.exports = event

},{"./send":11,"reducible/end":5,"reducible/is-error":6,"reducible/is-reduced":7,"reducible/reduce":9,"reducible/reduced":10}],4:[function(require,module,exports){
"use strict";

var defineProperty = Object.defineProperty || function(object, name, property) {
  object[name] = property.value
  return object
}

// Shortcut for `Object.prototype.toString` for faster access.
var typefy = Object.prototype.toString

// Map to for jumping from typeof(value) to associated type prefix used
// as a hash in the map of builtin implementations.
var types = { "function": "Object", "object": "Object" }

// Array is used to save method implementations for the host objects in order
// to avoid extending them with non-primitive values that could cause leaks.
var host = []
// Hash map is used to save method implementations for builtin types in order
// to avoid extending their prototypes. This also allows to share method
// implementations for types across diff contexts / frames / compartments.
var builtin = {}

function Primitive() {}
function ObjectType() {}
ObjectType.prototype = new Primitive()
function ErrorType() {}
ErrorType.prototype = new ObjectType()

var Default = builtin.Default = Primitive.prototype
var Null = builtin.Null = new Primitive()
var Void = builtin.Void = new Primitive()
builtin.String = new Primitive()
builtin.Number = new Primitive()
builtin.Boolean = new Primitive()

builtin.Object = ObjectType.prototype
builtin.Error = ErrorType.prototype

builtin.EvalError = new ErrorType()
builtin.InternalError = new ErrorType()
builtin.RangeError = new ErrorType()
builtin.ReferenceError = new ErrorType()
builtin.StopIteration = new ErrorType()
builtin.SyntaxError = new ErrorType()
builtin.TypeError = new ErrorType()
builtin.URIError = new ErrorType()


function Method(hint) {
  /**
  Private Method is a callable private name that dispatches on the first
  arguments same named Method:

      method(object, ...rest) => object[method](...rest)

  Optionally hint string may be provided that will be used in generated names
  to ease debugging.

  ## Example

      var foo = Method()

      // Implementation for any types
      foo.define(function(value, arg1, arg2) {
        // ...
      })

      // Implementation for a specific type
      foo.define(BarType, function(bar, arg1, arg2) {
        // ...
      })
  **/

  // Create an internal unique name if `hint` is provided it is used to
  // prefix name to ease debugging.
  var name = (hint || "") + "#" + Math.random().toString(32).substr(2)

  function dispatch(value) {
    // Method dispatches on type of the first argument.
    // If first argument is `null` or `void` associated implementation is
    // looked up in the `builtin` hash where implementations for built-ins
    // are stored.
    var type = null
    var method = value === null ? Null[name] :
                 value === void(0) ? Void[name] :
                 // Otherwise attempt to use method with a generated private
                 // `name` that is supposedly in the prototype chain of the
                 // `target`.
                 value[name] ||
                 // Otherwise assume it's one of the built-in type instances,
                 // in which case implementation is stored in a `builtin` hash.
                 // Attempt to find a implementation for the given built-in
                 // via constructor name and method name.
                 ((type = builtin[(value.constructor || "").name]) &&
                  type[name]) ||
                 // Otherwise assume it's a host object. For host objects
                 // actual method implementations are stored in the `host`
                 // array and only index for the implementation is stored
                 // in the host object's prototype chain. This avoids memory
                 // leaks that otherwise could happen when saving JS objects
                 // on host object.
                 host[value["!" + name]] ||
                 // Otherwise attempt to lookup implementation for builtins by
                 // a type of the value. This basically makes sure that all
                 // non primitive values will delegate to an `Object`.
                 ((type = builtin[types[typeof(value)]]) && type[name])


    // If method implementation for the type is still not found then
    // just fallback for default implementation.
    method = method || Default[name]


    // If implementation is still not found (which also means there is no
    // default) just throw an error with a descriptive message.
    if (!method) throw TypeError("Type does not implements method: " + name)

    // If implementation was found then just delegate.
    return method.apply(method, arguments)
  }

  // Make `toString` of the dispatch return a private name, this enables
  // method definition without sugar:
  //
  //    var method = Method()
  //    object[method] = function() { /***/ }
  dispatch.toString = function toString() { return name }

  // Copy utility methods for convenient API.
  dispatch.implement = implementMethod
  dispatch.define = defineMethod

  return dispatch
}

// Create method shortcuts form functions.
var defineMethod = function defineMethod(Type, lambda) {
  return define(this, Type, lambda)
}
var implementMethod = function implementMethod(object, lambda) {
  return implement(this, object, lambda)
}

// Define `implement` and `define` polymorphic methods to allow definitions
// and implementations through them.
var implement = Method("implement")
var define = Method("define")


function _implement(method, object, lambda) {
  /**
  Implements `Method` for the given `object` with a provided `implementation`.
  Calling `Method` with `object` as a first argument will dispatch on provided
  implementation.
  **/
  return defineProperty(object, method.toString(), {
    enumerable: false,
    configurable: false,
    writable: false,
    value: lambda
  })
}

function _define(method, Type, lambda) {
  /**
  Defines `Method` for the given `Type` with a provided `implementation`.
  Calling `Method` with a first argument of this `Type` will dispatch on
  provided `implementation`. If `Type` is a `Method` default implementation
  is defined. If `Type` is a `null` or `undefined` `Method` is implemented
  for that value type.
  **/

  // Attempt to guess a type via `Object.prototype.toString.call` hack.
  var type = Type && typefy.call(Type.prototype)

  // If only two arguments are passed then `Type` is actually an implementation
  // for a default type.
  if (!lambda) Default[method] = Type
  // If `Type` is `null` or `void` store implementation accordingly.
  else if (Type === null) Null[method] = lambda
  else if (Type === void(0)) Void[method] = lambda
  // If `type` hack indicates built-in type and type has a name us it to
  // store a implementation into associated hash. If hash for this type does
  // not exists yet create one.
  else if (type !== "[object Object]" && Type.name) {
    var Bulitin = builtin[Type.name] || (builtin[Type.name] = new ObjectType())
    Bulitin[method] = lambda
  }
  // If `type` hack indicates an object, that may be either object or any
  // JS defined "Class". If name of the constructor is `Object`, assume it's
  // built-in `Object` and store implementation accordingly.
  else if (Type.name === "Object")
    builtin.Object[method] = lambda
  // Host objects are pain!!! Every browser does some crazy stuff for them
  // So far all browser seem to not implement `call` method for host object
  // constructors. If that is a case here, assume it's a host object and
  // store implementation in a `host` array and store `index` in the array
  // in a `Type.prototype` itself. This avoids memory leaks that could be
  // caused by storing JS objects on a host objects.
  else if (Type.call === void(0)) {
    var index = host.indexOf(lambda)
    if (index < 0) index = host.push(lambda) - 1
    // Prefix private name with `!` so it can be dispatched from the method
    // without type checks.
    implement("!" + method, Type.prototype, index)
  }
  // If Got that far `Type` is user defined JS `Class`. Define private name
  // as hidden property on it's prototype.
  else
    implement(method, Type.prototype, lambda)
}

// And provided implementations for a polymorphic equivalents.
_define(define, _define)
_define(implement, _implement)

// Define exports on `Method` as it's only thing being exported.
Method.implement = implement
Method.define = define
Method.Method = Method
Method.method = Method
Method.builtin = builtin
Method.host = host

module.exports = Method

},{}],5:[function(require,module,exports){
"use strict";

module.exports = String("End of the collection")

},{}],6:[function(require,module,exports){
"use strict";

var stringifier = Object.prototype.toString

function isError(value) {
  return stringifier.call(value) === "[object Error]"
}

module.exports = isError

},{}],7:[function(require,module,exports){
"use strict";

var reduced = require("./reduced")

function isReduced(value) {
  return value && value.is === reduced
}

module.exports = isReduced

},{"./reduced":10}],8:[function(require,module,exports){
"use strict";

var defineProperty = Object.defineProperty || function(object, name, property) {
  object[name] = property.value
  return object
}

// Shortcut for `Object.prototype.toString` for faster access.
var typefy = Object.prototype.toString

// Map to for jumping from typeof(value) to associated type prefix used
// as a hash in the map of builtin implementations.
var types = { "function": "Object", "object": "Object" }

// Array is used to save method implementations for the host objects in order
// to avoid extending them with non-primitive values that could cause leaks.
var host = []
// Hash map is used to save method implementations for builtin types in order
// to avoid extending their prototypes. This also allows to share method
// implementations for types across diff contexts / frames / compartments.
var builtin = {}

function Primitive() {}
function ObjectType() {}
ObjectType.prototype = new Primitive()
function ErrorType() {}
ErrorType.prototype = new ObjectType()

var Default = builtin.Default = Primitive.prototype
var Null = builtin.Null = new Primitive()
var Void = builtin.Void = new Primitive()
builtin.String = new Primitive()
builtin.Number = new Primitive()
builtin.Boolean = new Primitive()

builtin.Object = ObjectType.prototype
builtin.Error = ErrorType.prototype

builtin.EvalError = new ErrorType()
builtin.InternalError = new ErrorType()
builtin.RangeError = new ErrorType()
builtin.ReferenceError = new ErrorType()
builtin.StopIteration = new ErrorType()
builtin.SyntaxError = new ErrorType()
builtin.TypeError = new ErrorType()
builtin.URIError = new ErrorType()


function Method(id) {
  /**
  Private Method is a callable private name that dispatches on the first
  arguments same named Method:

      method(object, ...rest) => object[method](...rest)

  It is supposed to be given **unique** `id` preferably in `"jump@package"`
  like form so it won't collide with `id's` other users create. If no argument
  is passed unique id is generated, but it's proved to be problematic with
  npm where it's easy to end up with a copies of same module where each copy
  will have a different name.

  ## Example

      var foo = Method("foo@awesomeness")

      // Implementation for any types
      foo.define(function(value, arg1, arg2) {
        // ...
      })

      // Implementation for a specific type
      foo.define(BarType, function(bar, arg1, arg2) {
        // ...
      })
  **/

  // Create an internal unique name if one is not provided, also prefix it
  // to avoid collision with regular method names.
  var name = "λ:" + String(id || Math.random().toString(32).substr(2))

  function dispatch(value) {
    // Method dispatches on type of the first argument.
    // If first argument is `null` or `void` associated implementation is
    // looked up in the `builtin` hash where implementations for built-ins
    // are stored.
    var type = null
    var method = value === null ? Null[name] :
                 value === void(0) ? Void[name] :
                 // Otherwise attempt to use method with a generated private
                 // `name` that is supposedly in the prototype chain of the
                 // `target`.
                 value[name] ||
                 // Otherwise assume it's one of the built-in type instances,
                 // in which case implementation is stored in a `builtin` hash.
                 // Attempt to find a implementation for the given built-in
                 // via constructor name and method name.
                 ((type = builtin[(value.constructor || "").name]) &&
                  type[name]) ||
                 // Otherwise assume it's a host object. For host objects
                 // actual method implementations are stored in the `host`
                 // array and only index for the implementation is stored
                 // in the host object's prototype chain. This avoids memory
                 // leaks that otherwise could happen when saving JS objects
                 // on host object.
                 host[value["!" + name]] ||
                 // Otherwise attempt to lookup implementation for builtins by
                 // a type of the value. This basically makes sure that all
                 // non primitive values will delegate to an `Object`.
                 ((type = builtin[types[typeof(value)]]) && type[name])


    // If method implementation for the type is still not found then
    // just fallback for default implementation.
    method = method || Default[name]

    // If implementation is still not found (which also means there is no
    // default) just throw an error with a descriptive message.
    if (!method) throw TypeError("Type does not implements method: " + name)

    // If implementation was found then just delegate.
    return method.apply(method, arguments)
  }

  // Make `toString` of the dispatch return a private name, this enables
  // method definition without sugar:
  //
  //    var method = Method()
  //    object[method] = function() { /***/ }
  dispatch.toString = function toString() { return name }

  // Copy utility methods for convenient API.
  dispatch.implement = implementMethod
  dispatch.define = defineMethod

  return dispatch
}

// Create method shortcuts form functions.
var defineMethod = function defineMethod(Type, lambda) {
  return define(this, Type, lambda)
}
var implementMethod = function implementMethod(object, lambda) {
  return implement(this, object, lambda)
}

// Define `implement` and `define` polymorphic methods to allow definitions
// and implementations through them.
var implement = Method("implement@method")
var define = Method("define@method")


function _implement(method, object, lambda) {
  /**
  Implements `Method` for the given `object` with a provided `implementation`.
  Calling `Method` with `object` as a first argument will dispatch on provided
  implementation.
  **/
  return defineProperty(object, method.toString(), {
    enumerable: false,
    configurable: false,
    writable: false,
    value: lambda
  })
}

function _define(method, Type, lambda) {
  /**
  Defines `Method` for the given `Type` with a provided `implementation`.
  Calling `Method` with a first argument of this `Type` will dispatch on
  provided `implementation`. If `Type` is a `Method` default implementation
  is defined. If `Type` is a `null` or `undefined` `Method` is implemented
  for that value type.
  **/

  // Attempt to guess a type via `Object.prototype.toString.call` hack.
  var type = Type && typefy.call(Type.prototype)

  // If only two arguments are passed then `Type` is actually an implementation
  // for a default type.
  if (!lambda) Default[method] = Type
  // If `Type` is `null` or `void` store implementation accordingly.
  else if (Type === null) Null[method] = lambda
  else if (Type === void(0)) Void[method] = lambda
  // If `type` hack indicates built-in type and type has a name us it to
  // store a implementation into associated hash. If hash for this type does
  // not exists yet create one.
  else if (type !== "[object Object]" && Type.name) {
    var Bulitin = builtin[Type.name] || (builtin[Type.name] = new ObjectType())
    Bulitin[method] = lambda
  }
  // If `type` hack indicates an object, that may be either object or any
  // JS defined "Class". If name of the constructor is `Object`, assume it's
  // built-in `Object` and store implementation accordingly.
  else if (Type.name === "Object")
    builtin.Object[method] = lambda
  // Host objects are pain!!! Every browser does some crazy stuff for them
  // So far all browser seem to not implement `call` method for host object
  // constructors. If that is a case here, assume it's a host object and
  // store implementation in a `host` array and store `index` in the array
  // in a `Type.prototype` itself. This avoids memory leaks that could be
  // caused by storing JS objects on a host objects.
  else if (Type.call === void(0)) {
    var index = host.indexOf(lambda)
    if (index < 0) index = host.push(lambda) - 1
    // Prefix private name with `!` so it can be dispatched from the method
    // without type checks.
    implement("!" + method, Type.prototype, index)
  }
  // If Got that far `Type` is user defined JS `Class`. Define private name
  // as hidden property on it's prototype.
  else
    implement(method, Type.prototype, lambda)
}

// And provided implementations for a polymorphic equivalents.
_define(define, _define)
_define(implement, _implement)

// Define exports on `Method` as it's only thing being exported.
Method.implement = implement
Method.define = define
Method.Method = Method
Method.method = Method
Method.builtin = builtin
Method.host = host

module.exports = Method

},{}],9:[function(require,module,exports){
"use strict";

var method = require("method")

var isReduced = require("./is-reduced")
var isError = require("./is-error")
var end = require("./end")

var reduce = method("reduce@reducible")

// Implementation of `reduce` for the empty collections, that immediately
// signals reducer that it's ended.
reduce.empty = function reduceEmpty(empty, next, initial) {
  next(end, initial)
}

// Implementation of `reduce` for the singular values which are treated
// as collections with a single element. Yields a value and signals the end.
reduce.singular = function reduceSingular(value, next, initial) {
  next(end, next(value, initial))
}

// Implementation of `reduce` for the array (and alike) values, such that it
// will call accumulator function `next` each time with next item and
// accumulated state until it's exhausted or `next` returns marked value
// indicating that it's reduced. Either way signals `end` to an accumulator.
reduce.indexed = function reduceIndexed(indexed, next, initial) {
  var state = initial
  var index = 0
  var count = indexed.length
  while (index < count) {
    var value = indexed[index]
    state = next(value, state)
    index = index + 1
    if (value === end) return end
    if (isError(value)) return state
    if (isReduced(state)) return state.value
  }
  next(end, state)
}

// Both `undefined` and `null` implement accumulate for empty sequences.
reduce.define(void(0), reduce.empty)
reduce.define(null, reduce.empty)

// Array and arguments implement accumulate for indexed sequences.
reduce.define(Array, reduce.indexed)

function Arguments() { return arguments }
Arguments.prototype = Arguments()
reduce.define(Arguments, reduce.indexed)

// All other built-in data types are treated as single value collections
// by default. Of course individual types may choose to override that.
reduce.define(reduce.singular)

// Errors just yield that error.
reduce.define(Error, function(error, next) { next(error) })
module.exports = reduce

},{"./end":5,"./is-error":6,"./is-reduced":7,"method":8}],10:[function(require,module,exports){
"use strict";


// Exported function can be used for boxing values. This boxing indicates
// that consumer of sequence has finished consuming it, there for new values
// should not be no longer pushed.
function reduced(value) {
  /**
  Boxes given value and indicates to a source that it's already reduced and
  no new values should be supplied
  **/
  return { value: value, is: reduced }
}

module.exports = reduced

},{}],11:[function(require,module,exports){
"use strict";

var method = require("method")
var send = method("send")

module.exports = send

},{"method":4}]},{},[1]);

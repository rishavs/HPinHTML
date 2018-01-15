// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({8:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.app = app;
function h(name, props) {
  var node;
  var children = [];

  for (var stack = [], i = arguments.length; i-- > 2;) {
    stack.push(arguments[i]);
  }

  while (stack.length) {
    if (Array.isArray(node = stack.pop())) {
      for (var i = node.length; i--;) {
        stack.push(node[i]);
      }
    } else if (node == null || node === true || node === false) {} else {
      children.push(node);
    }
  }

  return typeof name === "string" ? {
    name: name,
    props: props || {},
    children: children
  } : name(props || {}, children);
}

function app(state, actions, view, container) {
  var patchLock;
  var lifecycle = [];
  var root = container && container.children[0];
  var node = vnode(root, [].map);

  repaint(init([], state = copy(state), actions = copy(actions)));

  return actions;

  function vnode(element, map) {
    return element && {
      name: element.nodeName.toLowerCase(),
      props: {},
      children: map.call(element.childNodes, function (element) {
        return element.nodeType === 3 ? element.nodeValue : vnode(element, map);
      })
    };
  }

  function render(next) {
    patchLock = !patchLock;
    next = view(state, actions);

    if (container && !patchLock) {
      root = patch(container, root, node, node = next);
    }

    while (next = lifecycle.pop()) {
      next();
    }
  }

  function repaint() {
    if (!patchLock) {
      patchLock = !patchLock;
      setTimeout(render);
    }
  }

  function copy(a, b) {
    var target = {};

    for (var i in a) {
      target[i] = a[i];
    }for (var i in b) {
      target[i] = b[i];
    }return target;
  }

  function set(path, value, source, target) {
    if (path.length) {
      target[path[0]] = 1 < path.length ? set(path.slice(1), value, source[path[0]], {}) : value;
      return copy(source, target);
    }
    return value;
  }

  function get(path, source) {
    for (var i = 0; i < path.length; i++) {
      source = source[path[i]];
    }
    return source;
  }

  function init(path, slice, actions) {
    for (var key in actions) {
      typeof actions[key] === "function" ? function (key, action) {
        actions[key] = function (data) {
          slice = get(path, state);

          if (typeof (data = action(data)) === "function") {
            data = data(slice, actions);
          }

          if (data && data !== slice && !data.then) {
            repaint(state = set(path, copy(slice, data), state, {}));
          }

          return data;
        };
      }(key, actions[key]) : init(path.concat(key), slice[key] = slice[key] || {}, actions[key] = copy(actions[key]));
    }
  }

  function getKey(node) {
    return node && node.props ? node.props.key : null;
  }

  function setElementProp(element, name, value, oldValue) {
    if (name === "key") {} else if (name === "style") {
      for (var i in copy(oldValue, value)) {
        element[name][i] = value == null || value[i] == null ? "" : value[i];
      }
    } else {
      try {
        element[name] = value == null ? "" : value;
      } catch (_) {}

      if (typeof value !== "function") {
        if (value == null || value === false) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value);
        }
      }
    }
  }

  function createElement(node, isSVG) {
    var element = typeof node === "string" || typeof node === "number" ? document.createTextNode(node) : (isSVG = isSVG || node.name === "svg") ? document.createElementNS("http://www.w3.org/2000/svg", node.name) : document.createElement(node.name);

    if (node.props) {
      if (node.props.oncreate) {
        lifecycle.push(function () {
          node.props.oncreate(element);
        });
      }

      for (var i = 0; i < node.children.length; i++) {
        element.appendChild(createElement(node.children[i], isSVG));
      }

      for (var name in node.props) {
        setElementProp(element, name, node.props[name]);
      }
    }

    return element;
  }

  function updateElement(element, oldProps, props) {
    for (var name in copy(oldProps, props)) {
      if (props[name] !== (name === "value" || name === "checked" ? element[name] : oldProps[name])) {
        setElementProp(element, name, props[name], oldProps[name]);
      }
    }

    if (props.onupdate) {
      lifecycle.push(function () {
        props.onupdate(element, oldProps);
      });
    }
  }

  function removeChildren(element, node, props) {
    if (props = node.props) {
      for (var i = 0; i < node.children.length; i++) {
        removeChildren(element.childNodes[i], node.children[i]);
      }

      if (props.ondestroy) {
        props.ondestroy(element);
      }
    }
    return element;
  }

  function removeElement(parent, element, node, cb) {
    function done() {
      parent.removeChild(removeChildren(element, node));
    }

    if (node.props && (cb = node.props.onremove)) {
      cb(element, done);
    } else {
      done();
    }
  }

  function patch(parent, element, oldNode, node, isSVG, nextSibling) {
    if (node === oldNode) {} else if (oldNode == null) {
      element = parent.insertBefore(createElement(node, isSVG), element);
    } else if (node.name && node.name === oldNode.name) {
      updateElement(element, oldNode.props, node.props);

      var oldElements = [];
      var oldKeyed = {};
      var newKeyed = {};

      for (var i = 0; i < oldNode.children.length; i++) {
        oldElements[i] = element.childNodes[i];

        var oldChild = oldNode.children[i];
        var oldKey = getKey(oldChild);

        if (null != oldKey) {
          oldKeyed[oldKey] = [oldElements[i], oldChild];
        }
      }

      var i = 0;
      var j = 0;

      while (j < node.children.length) {
        var oldChild = oldNode.children[i];
        var newChild = node.children[j];

        var oldKey = getKey(oldChild);
        var newKey = getKey(newChild);

        if (newKeyed[oldKey]) {
          i++;
          continue;
        }

        if (newKey == null) {
          if (oldKey == null) {
            patch(element, oldElements[i], oldChild, newChild, isSVG);
            j++;
          }
          i++;
        } else {
          var recyledNode = oldKeyed[newKey] || [];

          if (oldKey === newKey) {
            patch(element, recyledNode[0], recyledNode[1], newChild, isSVG);
            i++;
          } else if (recyledNode[0]) {
            patch(element, element.insertBefore(recyledNode[0], oldElements[i]), recyledNode[1], newChild, isSVG);
          } else {
            patch(element, oldElements[i], null, newChild, isSVG);
          }

          j++;
          newKeyed[newKey] = newChild;
        }
      }

      while (i < oldNode.children.length) {
        var oldChild = oldNode.children[i];
        if (getKey(oldChild) == null) {
          removeElement(element, oldElements[i], oldChild);
        }
        i++;
      }

      for (var i in oldKeyed) {
        if (!newKeyed[oldKeyed[i][1].props.key]) {
          removeElement(element, oldKeyed[i][0], oldKeyed[i][1]);
        }
      }
    } else if (node.name === oldNode.name) {
      element.nodeValue = node;
    } else {
      element = parent.insertBefore(createElement(node, isSVG), nextSibling = element);
      removeElement(parent, nextSibling, oldNode);
    }
    return element;
  }
}
},{}],12:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = Link;

var _hyperapp = require("hyperapp");

function Link(props, children) {
  var to = props.to;
  var location = props.location || window.location;

  props.href = to;
  props.onclick = function (e) {
    if (e.button !== 0 || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || props.target === "_blank" || e.currentTarget.origin !== location.origin) {} else {
      e.preventDefault();

      if (to !== location.pathname) {
        history.pushState(location.pathname, "", to);
      }
    }
  };

  return (0, _hyperapp.h)("a", props, children);
}
},{"hyperapp":8}],17:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseRoute = parseRoute;
function createMatch(isExact, path, url, params) {
  return {
    isExact: isExact,
    path: path,
    url: url,
    params: params
  };
}

function trimTrailingSlash(url) {
  for (var len = url.length; "/" === url[--len];) {}
  return url.slice(0, len + 1);
}

function parseRoute(path, url, options) {
  if (path === url || !path) {
    return createMatch(path === url, path, url);
  }

  var exact = options && options.exact;
  var paths = trimTrailingSlash(path).split("/");
  var urls = trimTrailingSlash(url).split("/");

  if (paths.length > urls.length || exact && paths.length < urls.length) {
    return;
  }

  for (var i = 0, params = {}, len = paths.length, url = ""; i < len; i++) {
    if (":" === paths[i][0]) {
      try {
        params[paths[i].slice(1)] = urls[i] = decodeURI(urls[i]);
      } catch (_) {
        continue;
      }
    } else if (paths[i] !== urls[i]) {
      return;
    }
    url += urls[i] + "/";
  }

  return createMatch(false, path, url.slice(0, -1), params);
}
},{}],11:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Route = Route;

var _parseRoute = require("./parseRoute");

function Route(props) {
  var location = props.location || window.location;
  var match = (0, _parseRoute.parseRoute)(props.path, location.pathname, {
    exact: !props.parent
  });

  return match && props.render({
    match: match,
    location: location
  });
}
},{"./parseRoute":17}],13:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Switch = Switch;
function Switch(props, children) {
  return children[0];
}
},{}],14:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Redirect = Redirect;
function Redirect(props) {
  var location = props.location || window.location;
  history.replaceState(props.from || location.pathname, "", props.to);
}
},{}],15:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function wrapHistory(keys) {
  return keys.reduce(function (next, key) {
    var fn = history[key];

    history[key] = function (data, title, url) {
      fn.call(this, data, title, url);
      dispatchEvent(new CustomEvent("pushstate", { detail: data }));
    };

    return function () {
      history[key] = fn;
      next && next();
    };
  }, null);
}

var location = exports.location = {
  state: {
    pathname: window.location.pathname,
    previous: window.location.pathname
  },
  actions: {
    go: function go(pathname) {
      history.pushState(null, "", pathname);
    },
    set: function set(data) {
      return data;
    }
  },
  subscribe: function subscribe(actions) {
    function handleLocationChange(e) {
      actions.set({
        pathname: window.location.pathname,
        previous: e.detail ? window.location.previous = e.detail : window.location.previous
      });
    }

    var unwrap = wrapHistory(["pushState", "replaceState"]);

    addEventListener("pushstate", handleLocationChange);
    addEventListener("popstate", handleLocationChange);

    return function () {
      removeEventListener("pushstate", handleLocationChange);
      removeEventListener("popstate", handleLocationChange);
      unwrap();
    };
  }
};
},{}],9:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Link = require("./Link");

Object.defineProperty(exports, "Link", {
  enumerable: true,
  get: function get() {
    return _Link.Link;
  }
});

var _Route = require("./Route");

Object.defineProperty(exports, "Route", {
  enumerable: true,
  get: function get() {
    return _Route.Route;
  }
});

var _Switch = require("./Switch");

Object.defineProperty(exports, "Switch", {
  enumerable: true,
  get: function get() {
    return _Switch.Switch;
  }
});

var _Redirect = require("./Redirect");

Object.defineProperty(exports, "Redirect", {
  enumerable: true,
  get: function get() {
    return _Redirect.Redirect;
  }
});

var _location = require("./location");

Object.defineProperty(exports, "location", {
  enumerable: true,
  get: function get() {
    return _location.location;
  }
});
},{"./Link":12,"./Route":11,"./Switch":13,"./Redirect":14,"./location":15}],16:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (prevState, action, nextState) {
  console.group("%c action", "color: gray; font-weight: lighter;", action.name);
  console.log("%c prev state", "color: #9E9E9E; font-weight: bold;", prevState);
  console.log("%c data", "color: #03A9F4; font-weight: bold;", action.data);
  console.log("%c next state", "color: #4CAF50; font-weight: bold;", nextState);
  console.groupEnd();
};
},{}],10:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  options = options || {};
  options.log = typeof options.log === "function" ? options.log : _defaultLog2.default;

  return function (app) {
    return function (initialState, actionsTemplate, view, container) {
      function enhanceActions(actions, prefix) {
        var namespace = prefix ? prefix + "." : "";
        return Object.keys(actions || {}).reduce(function (otherActions, name) {
          var namedspacedName = namespace + name;
          var action = actions[name];
          otherActions[name] = typeof action === "function" ? function (data) {
            return function (state, actions) {
              var result = action(data);
              result = typeof result === "function" ? result(state, actions) : result;
              options.log(state, { name: namedspacedName, data: data }, result);
              return result;
            };
          } : enhanceActions(action, namedspacedName);
          return otherActions;
        }, {});
      }

      var enhancedActions = enhanceActions(actionsTemplate);

      var appActions = app(initialState, enhancedActions, view, container);
      return appActions;
    };
  };
};

var _defaultLog = require("./defaultLog");

var _defaultLog2 = _interopRequireDefault(_defaultLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./defaultLog":16}],6:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperapp = require("hyperapp");

var _router = require("@hyperapp/router");

var Navbar = function Navbar() {
  return (0, _hyperapp.h)("nav", {}, [(0, _hyperapp.h)(_router.Link, { "to": "/" }, "Home |"), (0, _hyperapp.h)(_router.Link, { "to": "/about" }, "About")]);
};

exports.default = Navbar;
},{"hyperapp":8,"@hyperapp/router":9}],4:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperapp = require("hyperapp");

var _Navbar = require("./Navbar.js");

var _Navbar2 = _interopRequireDefault(_Navbar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Layout = function Layout(props, page) {
  return (0, _hyperapp.h)("div", { class: "container" }, [(0, _hyperapp.h)(_Navbar2.default), (0, _hyperapp.h)("article", {}, page)]);
};

exports.default = Layout;
},{"hyperapp":8,"./Navbar.js":6}],3:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperapp = require("hyperapp");

var Home = (0, _hyperapp.h)("h1", {}, "Home");

exports.default = Home;
},{"hyperapp":8}],5:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hyperapp = require("hyperapp");

var About = (0, _hyperapp.h)("h1", {}, "About");

exports.default = About;
},{"hyperapp":8}],2:[function(require,module,exports) {
'use strict';

var _hyperapp = require("hyperapp");

var _router = require("@hyperapp/router");

var _logger = require("@hyperapp/logger");

var _logger2 = _interopRequireDefault(_logger);

var _Layout = require("./components/Layout.js");

var _Layout2 = _interopRequireDefault(_Layout);

var _Home = require("./pages/Home.js");

var _Home2 = _interopRequireDefault(_Home);

var _About = require("./pages/About.js");

var _About2 = _interopRequireDefault(_About);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = {
  location: _router.location.state
};

var actions = {
  location: _router.location.actions
};

var view = function view() {
  return (0, _hyperapp.h)("div", { class: "main" }, [(0, _hyperapp.h)(_router.Route, { path: "/", render: function render() {
      return (0, _Layout2.default)({}, _Home2.default);
    } }), (0, _hyperapp.h)(_router.Route, { path: "/about", render: function render() {
      return (0, _Layout2.default)({}, _About2.default);
    } })]);
};

var main = (0, _logger2.default)()(_hyperapp.app)(state, actions, view, document.body);
var unsubscribe = _router.location.subscribe(main.location);
},{"hyperapp":8,"@hyperapp/router":9,"@hyperapp/logger":10,"./components/Layout.js":4,"./pages/Home.js":3,"./pages/About.js":5}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://' + window.location.hostname + ':4119/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,2])
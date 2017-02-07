var extend = require('extend');

var ListStyle = function(options) {
  options = options || {
    callback: function(item) {
      return {};
    }
  };

  extend({
    callback: function(item) {
      return {};
    }
  }, options);

  var list;

  var refresh = function() {
    var callback = options.callback;
    list.visibleItems.forEach(function(e, i) {
      var result = options.callback(e);
      if(result === undefined) {
        throw "Callback must return an object";
      }
      if(result.rowClass !== undefined) {
        $(e.elm).addClass(result.rowClass);
      }
      list.valueNames.forEach(function(valueName) {
        if(valueName && valueName!=="") {
          if(result[valueName] !== undefined) {
            $(e.elm).find('.'+valueName+'').addClass(result[valueName]);
          }
        }
      });

    });
  };

  return {
    refresh: refresh,
    init: function(parentList) {
      list = parentList;
      list.on('updated', refresh);
      refresh();
      return;
    },
    name: options.name || "style"

  };
};
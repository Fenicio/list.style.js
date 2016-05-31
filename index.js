var classes = require('classes'),
    events = require('event');

module.exports = function(options) {
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
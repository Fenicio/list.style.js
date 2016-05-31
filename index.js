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
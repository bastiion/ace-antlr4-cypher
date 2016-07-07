importScripts("../bower_components/ace-worker/worker.js");
importScripts("../bower_components/ace-builds/src-min-noconflict/ace.js");
importScripts("../bower_components/ace-worker/mirror.js");
importScripts("../bower_components/antlr4-javascript-cypher/release/antlr4-cypher.js");

ace.define('ace/worker/cypher-worker',["require","exports","module","ace/lib/oop","ace/worker/mirror"], function(require, exports, module) {
  "use strict";

  var oop = require("ace/lib/oop");
  var Mirror = require("ace/worker/mirror").Mirror;

  var CypherParserWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(200);
    this.$dialect = null;
  };

  oop.inherits(CypherParserWorker, Mirror);

  // load nodejs compatible require
  var ace_require = require;
  var Honey = { 'requirePath': ['..'] }; // walk up to js folder, see Honey docs

  // load antlr4 and myLanguage
  var antlr4 = returnExports.antlr4;
  var CypherLexer = returnExports.CypherLexer;
  var CypherParser = returnExports.CypherParser;
 /* var antlr4, CypherLexer, CypherParser;
  try {
    window.require = antlr4_require;
    antlr4 = antlr4_require('antlr4/index');
    CypherLexer = antlr4_require('parser/CypherLexer').CypherLexer;
    CypherParser = antlr4_require('parser/CypherParser').CypherParser;
  } finally {
    window.require = ace_require;
  }*/

  // class for gathering errors and posting them to ACE editor
  var AnnotatingErrorListener = function(annotations) {
    antlr4.error.ErrorListener.call(this);
    this.annotations = annotations;
    return this;
  };

  AnnotatingErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype);
  AnnotatingErrorListener.prototype.constructor = AnnotatingErrorListener;

  AnnotatingErrorListener.prototype.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
    this.annotations.push({
      row: line - 1,
      column: column,
      text: msg,
      type: "error"
    });
  };

  function validate(input) {
    var stream = new antlr4.InputStream(input);
    var lexer = new CypherLexer(stream);
    var tokens = new antlr4.CommonTokenStream(lexer);
    var parser = new CypherParser(tokens);
    var annotations = [];
    var listener = new AnnotatingErrorListener(annotations);
    parser.removeErrorListeners();
    parser.addErrorListener(listener);
    parser.cypher();
    return annotations;
  }

  (function() {

    this.onUpdate = function() {
      var value = this.doc.getValue();
      var annotations = validate(value);
      this.sender.emit("annotate", annotations);
    };

  }).call(CypherParserWorker.prototype);

  exports.CypherWorker = CypherParserWorker;
});

ace.define('antlr4/index', function (require, exports, module) {
  module.exports = returnExports.antlr4;
});
ace.define(
  'ace/mode/cypher-mode',
  [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text",
    "ace/mode/text_highlight_rules",
    "ace/ext/antlr4/token-type-map",
    "ace/ext/antlr4/tokenizer",
    "ace/mode/text_highlight_rules",
    "ace/worker/worker_client",
    "ace/ext/language_tools"
  ],
  function(require, exports, module) {
    var tokenTypeMapping = {
      literals: {
        'keyword.operator': ['=', '-', '!', '*', '+', '==', '=~', '->', '<-'],
        'paren.lparen': ['(', '{', '['],
        'paren.rparen': [')', '}', ']'],
        'punctuation.operator': [',', ';', '.']
      },
      symbols: {
        'identifier': 'pattern',
        'keyword.control': ["UNION", "OPTIONAL", "MATCH", "UNWIND", "AS", "MERGE", "ON", "CREATE", "SET", "DELETE", "DETACH", "REMOVE", "WITH", "DISTINCT", "RETURN", "ORDER", "BY", "L_SKIP", "LIMIT", "DESCENDING", "DESC", "ASCENDING", "ASC", "WHERE", "OR", "XOR", "AND", "NOT", "IN", "IS"  ],
        'keyword.other': [ "ALL", "ANY", "FILTER", "EXTRACT", "ANY", "NONE", "SINGLE", "COUNT", "STARTS", "ENDS", "CONTAINS"],
        'comment': 'Comment',
        'constant.language': ["TRUE", "FALSE", "NULL"],
        'variable.other': ['UnescapedSymbolicName'],
        'string.quoted': "StringLiteral"
      }
    };
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var createTokenTypeMap = require('ace/ext/antlr4/token-type-map').createTokenTypeMap;
    var tokenTypeToNameMap = createTokenTypeMap(tokenTypeMapping);
    //var CypherLexer = require('antlr4/index').CypherLexer;
    var Antlr4Tokenizer = require('ace/ext/antlr4/tokenizer').Antlr4Tokenizer;
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
    var CypherLexer = returnExports.CypherLexer;

    var CypherMode = function() {
    };
    oop.inherits(CypherMode, TextMode);


    (function() {

      this.$id = "ace/mode/cypher-mode";

      var CypherHighlightRules =  function() {};
      oop.inherits(CypherHighlightRules, TextHighlightRules);

      (function() {
        //nothing in here yet
        //this.$rules = 
      }).call(CypherHighlightRules.prototype);
      
      this.getTokenizer = function() {
        if (!this.$tokenizer) {
          this.$highlightRules = this.$highlightRules || new CypherHighlightRules();
          this.$tokenizer = new Antlr4Tokenizer(CypherLexer, tokenTypeToNameMap);
        }
        return this.$tokenizer;
      };

      var WorkerClient = require("ace/worker/worker_client").WorkerClient;
      this.createWorker = function(session) {
        this.$worker = new WorkerClient(["ace"], "ace/worker/cypher-worker", "CypherWorker");
        this.$worker.attachToDocument(session.getDocument());

        this.$worker.on("errors", function(e) {
          session.setAnnotations(e.data);
        });

        this.$worker.on("annotate", function(e) {
          session.setAnnotations(e.data);
        });

        this.$worker.on("terminate", function() {
          session.clearAnnotations();
        });

        return this.$worker;

      };

    }).call(CypherMode.prototype);

    exports.Mode = CypherMode;
});
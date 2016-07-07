var editor = ace.edit('editor');
editor.setTheme("ace/theme/tomorrow");
editor.setOptions({'enableBasicAutocompletion': true});
editor.getSession().setMode('ace/mode/cypher-mode');
var langTools = ace.require('ace/ext/language_tools');
langTools.addCompleter({
    getCompletions: function(editor, session, pos, prefix, callback) {
        if (prefix.length === 0) { callback(null, []); return }
        callback(null,
            [{name: "MATCH", value: "MATCH", score: 1, meta: "Statement"}]
        );
    }
});

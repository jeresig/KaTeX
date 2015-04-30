
var buildHTML = require("./buildHTML");
var buildMathML = require("./buildMathML");
var buildA11y = require("./buildA11y");
var buildCommon = require("./buildCommon");

var makeSpan = buildCommon.makeSpan;

var buildTree = function(tree, expression, settings) {
    // `buildHTML` sometimes messes with the parse tree (like turning bins ->
    // ords), so we build the MathML version first.
    var mathMLNode = buildMathML(tree, expression, settings);
    var htmlNode = buildHTML(tree, settings);
    var a11yNode = buildA11y(tree, settings);

    var katexNode = makeSpan(["katex"], [
        mathMLNode, htmlNode, a11yNode
    ]);

    if (settings.displayMode) {
        return makeSpan(["katex-display"], [katexNode]);
    } else {
        return katexNode;
    }
};

module.exports = buildTree;

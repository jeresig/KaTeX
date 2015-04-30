var stringMap = {
    "(": "left parenthesis",
    ")": "right parenthesis",
    "|": "vertical bar",
    ",": "comma",
    ".": "point",
    "-": "negative",
    "=": "equals",
    "\\geq": "greater than or equal to",
    "\\leq": "less than or equal to",
    ">": "greather than",
    "<": "less than",
    "\\$": "dollar sign",
    "\\angle": "angle",
    "\\degree": "degree",
    "\\circ": "degree",
    "\\vec": "vector",
    "\\pi": "pi"
};

var openMap = {
    "|": "open vertical bar"
};

var closeMap = {
    "|": "close vertical bar"
};

var binMap = {
    "+": "plus",
    "-": "minus",
    "*": "times",
    "\\times": "times",
    "\\div": "divided by"
};

var buildString = function(str, type, a11yStrings) {
    var ret;

    if (type === "open") {
        ret = openMap[str] || stringMap[str] || str;
    } else if (type === "close") {
        ret = closeMap[str] || stringMap[str] || str;
    } else if (type === "math") {
        ret = mathMap[str] || str;
    } else {
        ret = stringMap[str] || str;
    }

    // If nothing was found and it's not a plain string or number
    if (ret === str && !/^\w+$/.test(str)) {
        // This is likely a case that we'll need to handle
        console.error("KaTeX a11y string not found:", str);
    }

    // If the text to add is a number and there is already a string
    // in the list and the last string is a number then we should
    // combine them into a single number
    if (/^\d+$/.test(ret) && a11yStrings.length > 0 &&
            /^\d+$/.test(a11yStrings[a11yStrings.length - 1])) {
        a11yStrings[a11yStrings.length - 1] += ret;

    } else {
        a11yStrings.push(ret);
    }
};

var typeHandlers = {
    accent: function(tree, a11yStrings) {
        buildA11yStrings(tree.value.base, a11yStrings);
        a11yStrings.push("with");
        buildA11yStrings(tree.value.accent, a11yStrings);
        a11yStrings.push("on top");
    },

    bin: function(tree, a11yStrings) {
        buildString(tree.value, "bin", a11yStrings);
    },

    close: function(tree, a11yStrings) {
        buildString(tree.value, "close", a11yStrings);
    },

    // color
    // delimsizing

    genfrac: function(tree, a11yStrings) {
        buildA11yStrings(tree.value.numer, a11yStrings);
        a11yStrings.push("divided by");
        buildA11yStrings(tree.value.denom, a11yStrings);
    },

    // inner
    // katex

    leftright: function(tree, a11yStrings) {
        buildString(tree.value.left, "open", a11yStrings);
        buildA11yStrings(tree.value.body, a11yStrings);
        buildString(tree.value.right, "close", a11yStrings);
    },

    // llap

    mathord: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },

    // op

    open: function(tree, a11yStrings) {
        buildString(tree.value, "open", a11yStrings);
    },

    ordgroup: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    },

    // overline
    // punct
    // rel
    // rlap
    // rule
    // sizing
    // spacing
    // styling
    // sqrt

    supsub: function(tree, a11yStrings) {
        buildA11yStrings(tree.value.base, a11yStrings);

        if (tree.value.sub) {
            a11yStrings.push("subscript");
            buildA11yStrings(tree.value.sub, a11yStrings);
        }

        if (tree.value.sup) {
            // TODO: Build some kind of map to handle these edge cases
            if (tree.value.sup !== "\\degree") {
                a11yStrings.push("to the power of");
            }
            buildA11yStrings(tree.value.sup, a11yStrings);
        }
    },

    text: function(tree, a11yStrings) {
        buildString(tree, "normal", a11yStrings);
    },

    textord: function(tree, a11yStrings) {
        buildA11yStrings(tree.value, a11yStrings);
    }
};

var buildA11yStrings = function(tree, a11yStrings) {
    a11yStrings = a11yStrings || [];

    // Handle strings
    if (typeof tree === "string") {
        buildString(tree, "normal", a11yStrings);

    // Handle arrays
    } else if (tree.constructor === Array) {
        for (var i = 0; i < tree.length; i++) {
            buildA11yStrings(tree[i], a11yStrings);
        }

    // Everything else is assumed to be an object...
    } else {
        if (!tree.type || !(tree.type in typeHandlers)) {
            console.error("KaTeX a11y un-recognized type:", tree.type);

            // Attempt to handle it anyway, even though it might fail
            buildA11yStrings(tree.value, a11yStrings);
        } else {
            typeHandlers[tree.type](tree, a11yStrings);
        }
    }

    return a11yStrings;
};

var buildA11y = function(tree, settings) {
    console.log(JSON.stringify(tree, null, "    "));

    var a11yStrings = buildA11yStrings(tree);
    var a11yString = a11yStrings.join(" ");

    var a11yNode = document.createElement("span");
    a11yNode.className = "katex-a11y";
    a11yNode.appendChild(document.createTextNode(a11yString));

    return {
        toNode: function() {
            return a11yNode;
        }
    };
};

module.exports = buildA11y;
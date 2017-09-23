/**
 * Run this file to generate serialized grammar to be rendered as diagrams
 * It will serialize to ../gen/generated_serialized_grammar.js
 * The diagrams can be viewed in ../diagrams.html
 */
const path = require('path');
const fs = require('fs');

const JDLParser = require('../parser').JDLParser;

const parserInstance = new JDLParser();
const outPath = path.join(
  __dirname,
  '../gen/generated_serialized_grammar.js'
);

const serializedGrammar = parserInstance.getSerializedGastProductions();
const serializedGrammarText = JSON.stringify(serializedGrammar, null, '\t');

// generated a JavaScript file which exports the serialized grammar on the global scope (Window)
fs.writeFileSync(
  outPath,
  `
/*eslint-disable */
  var serializedGrammar = ${serializedGrammarText}`
);


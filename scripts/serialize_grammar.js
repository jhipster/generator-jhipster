/** Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Run this file to generate serialized grammar to be rendered as diagrams
 * It will serialize to ../gen/generated_serialized_grammar.js
 * The diagrams can be viewed in ../grammar.html
 */
const path = require('path');
const fs = require('fs');

const JDLParser = require('../lib/dsl/jdl_parser');

const parser = JDLParser.getParser();
parser.parse();

const serializedGrammarText = JSON.stringify(parser.getSerializedGastProductions(), null, '\t');

const copyright = `/** Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 `;

// generated a JavaScript file which exports the serialized grammar on the global scope (Window)
fs.writeFileSync(
  path.join(__dirname, '..', 'lib', 'dsl', 'gen', 'generated_serialized_grammar.js'),
  `${copyright}
/* eslint-disable no-unused-vars */
const serializedGrammar = ${serializedGrammarText}`
);

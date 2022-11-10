/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import normalize from 'normalize-path';
import path from 'path';

export const normalizeOutputPath = outputPath => {
  return outputPath ? normalize(outputPath) : outputPath;
};

export const applyPathCustomizer = (context, outputPath, outputPathCustomizer) => {
  if (Array.isArray(outputPathCustomizer)) {
    outputPathCustomizer.forEach(customizer => {
      outputPath = customizer.call(context, outputPath);
    });
    return outputPath;
  }
  return outputPathCustomizer.call(context, outputPath);
};

export const getOutputPathCustomizer = (options, configOptions) => {
  let outputPathCustomizer = options.outputPathCustomizer;
  if (!outputPathCustomizer && configOptions) {
    outputPathCustomizer = configOptions.outputPathCustomizer;
  }
  return outputPathCustomizer;
};

export const applyOutputPathCustomizer = (context, outputPath, options, configOptions) => {
  const outputPathCustomizer = getOutputPathCustomizer(options, configOptions);
  if (!outputPathCustomizer) {
    return outputPath;
  }
  outputPath = normalizeOutputPath(outputPath);
  return applyPathCustomizer(context, outputPath, outputPathCustomizer);
};

export const destinationPath = (context, paths, fallbackDestinationPathMethod, options, configOptions) => {
  paths = path.join(...paths);
  paths = applyOutputPathCustomizer(context, paths, options, configOptions);
  return paths ? fallbackDestinationPathMethod(paths) : paths;
};

import * as React from 'react';
import { get } from 'lodash';
import * as sanitizeHtml from 'sanitize-html';
import TranslatorContext from './translator-context';

export interface ITranslateProps {
  contentKey: string;
  children?: string | JSX.Element | Array<string | JSX.Element>;
  interpolate?: any;
  component?: string;
}

const REACT_ELEMENT = Symbol.for('react.element');

const isFlattenable = value => {
  const type = typeof value;
  return type === 'string' || type === 'number';
};

const flatten = array => {
  if (array.every(isFlattenable)) {
    return array.join('');
  }
  return array;
};

const toTemplate = string => {
  const expressionRe = /{{\s?\w+\s?}}/g;
  const match = string.match(expressionRe) || [];
  return [ string.split(expressionRe), ...match ];
};

const normalizeValue = (value, key) => {
  if (value == null || [ 'boolean', 'string', 'number' ].includes(typeof value)) {
    return value;
  }
  if (value.$$typeof === REACT_ELEMENT) {
    return React.cloneElement(value, { key });
  }
};

/**
 * Adapted from https://github.com/bloodyowl/react-translate
 * licenced under The MIT License (MIT) Copyright (c) 2014 Matthias Le Brun
 */
const render = (string, values) => {
  if (!values || !string) return string;
  const [ parts, ...expressions ] = toTemplate(string);
  return flatten(parts.reduce(
    (acc, item, index, array) => {
      if (index === array.length - 1) {
        return [
          ...acc,
          item
        ];
      }
      const match = expressions[index] && expressions[index].match(/{{\s?(\w+)\s?}}/);
      const value = match != null ? values[match[1]] : null;
      return [
        ...acc,
        item,
        normalizeValue(value, index)
      ];
    },
    []
  ));
};

/**
 * A dirty find to split non standard keys and find data from json
 * @param obj json object
 * @param path path to find
 * @param placeholder is placeholder
 */
const deepFindDirty = (obj, path, placeholder) => {
  const paths = path.split('.');
  let current = obj;
  if (placeholder) { // dirty fix for placeholders, the json files needs to be corrected
      paths[paths.length - 2] = `${paths[paths.length - 2]}.${paths[paths.length - 1]}`;
      paths.pop();
  }
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < paths.length; ++i) {
      if (current[paths[i]] === undefined) {
          return undefined;
      }
      current = current[paths[i]];
  }
  return current;
};

const showMissingOrDefault = (key, children) => {
  const renderInnerTextForMissingKeys = TranslatorContext.context.renderInnerTextForMissingKeys;
  if (renderInnerTextForMissingKeys && children && typeof children === 'string') {
    return children;
  }
  return `${TranslatorContext.context.missingTranslationMsg}[${key}]`;
};

const doTranslate = (key, interpolate, children) => {
  const translationData = TranslatorContext.context.translations;
  const currentLocale = TranslatorContext.context.locale || TranslatorContext.context.defaultLocale;
  const data = translationData[currentLocale];
  const preRender = data ? get(data, key) || deepFindDirty(data, key, true) : null;
  const preSanitize = render(preRender, interpolate) || showMissingOrDefault(key, children);
  if (/<[a-z][\s\S]*>/i.test(preSanitize)) {
    // String contains HTML tags. Allow only a super restricted set of tags and attributes
    const content = sanitizeHtml(preSanitize, {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'br', 'hr' ],
      allowedAttributes: {
        a: [ 'href', 'target' ]
      }
    });
    return {
      content, html: true
    };
  }
  return {
    content: preSanitize, html: false
  };
};

class Translate extends React.Component<ITranslateProps> {
  static defaultProps = {
    component: 'span'
  };

  shouldComponentUpdate() {
    const currentLocale = TranslatorContext.context.locale || TranslatorContext.context.defaultLocale;
    const prevLocale = TranslatorContext.context.previousLocale;
    return currentLocale !== prevLocale;
  }

  render() {
    const { contentKey, interpolate, component, children } = this.props;
    const processed = doTranslate(contentKey, interpolate, children);
    if (processed.html) {
      return React.createElement(component, { dangerouslySetInnerHTML: { __html: processed.content } });
    }
    return React.createElement(component, null, processed.content);
  }
}

export const translate = (contentKey: string, interpolate?: any, children?: string) => doTranslate(contentKey, interpolate, children).content;

export default Translate;

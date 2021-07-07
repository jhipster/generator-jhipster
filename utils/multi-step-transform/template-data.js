module.exports.TemplateData = class TemplateData {
  constructor(templateFile, defaultData = {}) {
    this.templateFile = templateFile;
    this.defaultData = defaultData;
    this.sections = {};
  }

  registerSections(sections) {
    this.sections = sections;
    this.disableSections = Object.fromEntries(Object.keys(this.sections).map(section => [section, false]));
    Object.keys(this.sections).forEach(section => {
      this[section] = (fragmentData, suffix) => this.renderSection(section, fragmentData, suffix);
    });
  }

  renderSection(section, fragmentData, suffix) {
    if (typeof fragmentData === 'string') {
      suffix = fragmentData;
      fragmentData = {};
    }
    if (!this[`_${section}`]) {
      this[`_${section}`] = this.render({ ...fragmentData, [section]: true, section, sections: this.sections }, suffix);
    }
    return this[`_${section}`];
  }

  /**
   * Render fragments using default join and suffix.
   */
  render(fragmentData = {}, suffix = '\n') {
    const renderedFragments = this.renderFragments(fragmentData).filter(fragment => fragment);
    const section = fragmentData.section || this.defaultData.section;
    if (section) {
      const limit = this.sections[section];
      if (limit && renderedFragments.length > limit) {
        throw new Error(`${section} must have at most ${limit} fragments`);
      }
    }
    const rendered = renderedFragments.join('\n');
    this.last = rendered;
    return rendered && suffix ? `${rendered}${suffix}` : rendered;
  }

  /**
   * Proxy to renderFragments for templates.
   */
  renderFragments(fragmentData) {
    return this.templateFile.renderFragments({ ...this.disableSections, ...this.defaultData, fragment: true, ...fragmentData });
  }
};

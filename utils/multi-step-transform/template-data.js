module.exports.TemplateData = class TemplateData {
  constructor(templateFile, defaultData = {}) {
    this._templateFile = templateFile;
    this._defaultData = defaultData;
    this._sections = {};
    this._defaultFragment = {};
  }

  registerSections(sections) {
    this._sections = sections;
    this._defaultFragment = Object.fromEntries(Object.keys(this._sections).map(section => [section, false]));
    Object.keys(this._sections).forEach(section => {
      this[section] = (fragmentData, suffix) => this.renderSection(section, fragmentData, suffix);
    });
  }

  renderSection(section, fragmentData, suffix) {
    if (typeof fragmentData === 'string') {
      suffix = fragmentData;
      fragmentData = {};
    }
    if (!this[`_${section}`]) {
      this[`_${section}`] = this.render(
        { ...fragmentData, fragment: { [section]: true }, section, sections: Object.keys(this._sections) },
        suffix
      );
    }
    return this[`_${section}`];
  }

  /**
   * Render fragments using default join and suffix.
   */
  render(fragmentData = {}, suffix = '\n') {
    const { join = '\n' } = fragmentData;
    const renderedFragments = this.renderFragments(fragmentData).filter(fragment => fragment);
    const section = fragmentData.section || this._defaultData.section;
    if (section) {
      const limit = this._sections[section];
      if (limit && renderedFragments.length > limit) {
        throw new Error(`${section} must have at most ${limit} fragments`);
      }
    }
    const rendered = renderedFragments.join(join);
    this.last = rendered;
    return rendered && suffix ? `${rendered}${suffix}` : rendered;
  }

  /**
   * Proxy to renderFragments for templates.
   */
  renderFragments(fragmentData = {}) {
    const fragment = { ...this._defaultData.fragment, ...fragmentData.fragment };
    if (this._defaultData.section && fragmentData.section) {
      // Disable section passed by the parent.
      fragment[this._defaultData.section] = false;
    }
    return this._templateFile.renderFragments({ ...this._defaultData, ...fragmentData, fragment });
  }
};

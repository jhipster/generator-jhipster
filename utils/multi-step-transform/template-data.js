module.exports.TemplateData = class TemplateData {
  constructor(templateFile, defaultData = {}) {
    this.templateFile = templateFile;
    this.defaultData = defaultData;
  }

  registerSections(sections) {
    this.sections = sections;
    this.disableSections = Object.fromEntries(Object.keys(this.sections).map(section => [section, false]));
    Object.keys(this.sections).forEach(section => {
      this[section] = (childData, suffix) => this.renderSection(section, childData, suffix);
    });
  }

  renderSection(section, childData, suffix) {
    if (typeof childData === 'string') {
      suffix = childData;
      childData = {};
    }
    if (!this[`_${section}`]) {
      this[`_${section}`] = this.render({ ...childData, [section]: true, section, sections: this.sections }, suffix);
    }
    return this[`_${section}`];
  }

  render(childData, suffix = '\n') {
    const renderedChilds = this.renderChilds(childData).filter(child => child);
    if (childData.section) {
      const limit = this.sections[childData.section];
      if (limit && renderedChilds.length > limit) {
        throw new Error(`${childData.section} must have at most ${limit} childs`);
      }
    }
    const rendered = renderedChilds.join('\n');
    this.last = rendered;
    return rendered && suffix ? `${rendered}${suffix}` : rendered;
  }

  renderChilds(childData) {
    return this.templateFile.renderChilds({ ...this.disableSections, ...this.defaultData, partial: true, ...childData });
  }
};

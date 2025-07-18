import type TemplateFile from './template-file.ts';

export default class TemplateData {
  private _templateFile: TemplateFile;
  private _defaultData: { fragment?: any; section?: string };
  private _sections: Record<string, number>;
  private _defaultFragment: any;
  private last: any;

  constructor(templateFile: TemplateFile, defaultData = {}) {
    this._templateFile = templateFile;
    this._defaultData = defaultData;
    this._sections = {};
    this._defaultFragment = {};
  }

  registerSections(sections: Record<string, number>) {
    this._sections = sections;
    this._defaultFragment = Object.fromEntries(Object.keys(this._sections).map(section => [section, false]));
    Object.keys(this._sections).forEach(section => {
      (this as any)[section] = (fragmentData: any, suffix?: string) => this.renderSection(section, fragmentData, suffix);
    });
  }

  renderSection(section: string, fragmentData: any, suffix?: string) {
    if (typeof fragmentData === 'string') {
      suffix = fragmentData;
      fragmentData = {};
    }
    if (!(this as any)[`_${section}`]) {
      (this as any)[`_${section}`] = this.render(
        { ...fragmentData, fragment: { [section]: true }, section, sections: Object.keys(this._sections) },
        suffix,
      );
    }
    return (this as any)[`_${section}`];
  }

  /**
   * Render fragments using default join and suffix.
   */
  render(fragmentData: { join?: string; section?: string } = {}, suffix = '\n') {
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
  renderFragments(fragmentData: { fragment?: any; section?: string } = {}) {
    const fragment = { ...this._defaultData.fragment, ...fragmentData.fragment };
    if (this._defaultData.section && fragmentData.section) {
      // Disable section passed by the parent.
      fragment[this._defaultData.section] = false;
    }
    return this._templateFile.renderFragments({ ...this._defaultData, ...fragmentData, fragment });
  }
}

export default class JDLEnumValue {
  name: string;
  value?: string;
  comment?: string;

  constructor(name: string, value?: string, comment?: string) {
    if (!name) {
      throw new Error('The enum value name has to be passed to create an enum.');
    }
    this.name = name;
    this.value = value;
    this.comment = comment;
  }

  toString() {
    const value = this.value ? ` (${this.value})` : '';
    return `${this.name}${value}`;
  }
}

class JDLEnumValue {
  constructor(name, value) {
    if (!name) {
      throw new Error('The enum value name has to be passed to create an enum.');
    }
    this.name = name;
    this.value = value;
  }

  toString() {
    const value = this.value ? ` (${this.value})` : '';
    return `${this.name}${value}`;
  }
}

module.exports = JDLEnumValue;

export default function matchField(jdlField) {
  return jdlField && jdlField.name && jdlField.type && jdlField.validations && jdlField.options;
}

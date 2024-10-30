export default function matchField(jdlField) {
  return jdlField?.name && jdlField.type && jdlField.validations && jdlField.options;
}

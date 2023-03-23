/**
 * Added new Options to jdl to collect communication parameters
 * @param client : Name of the application from which the communication will be sent
 * @param server : Name of the server to which the communication will be received
 * @cmi-tic-craxkumar
 */
const CommunicationOptionTypes = {
    STRING: 'string',
};

const optionNames = {
    CLIENT: 'client',
    SERVER: 'server',
};

const optionTypes = {
    [optionNames.CLIENT]: { type: CommunicationOptionTypes.STRING },
    [optionNames.SERVER]: { type: CommunicationOptionTypes.STRING },
}

/**
 * Returns the option's type, one of string, boolean, list or integer.
 * @param {String} optionName - the option's name.
 * @returns {string} the option's type.
 */
function getTypeForOption(optionName) {
    if (!optionName) {
        throw new Error('A name has to be passed to get the option type.');
    }
    if (!optionTypes[optionName]) {
        throw new Error(`Unrecognised communication option name: ${optionName}.`);
    }
    return optionTypes[optionName].type;
}

/**
* Checks whether the option's exists.
* @param {String} optionName - the option's name.
* @returns {Boolean} the option's existence.
*/
function doesOptionExist(optionName) {
    return !!optionName && !!optionTypes[optionName];
}

const OptionTypes = CommunicationOptionTypes;
const OptionNames = optionNames;
export default {
  OptionTypes,
  OptionNames,
  getTypeForOption,
  doesOptionExist,
};
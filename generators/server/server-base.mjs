/**
 * Read communications config from comm.yo-rc.json, if exists 
 * and initializes it in communications variable.
 * @cmi-tic-craxkumar
 */
import fs from 'fs';

let communications = [];
export function loadCommunicationConfigs() {
    const path = this.destinationPath("../" + this.jhipsterConfig.baseName);
    if (this.fs.exists(`${path}/comm.yo-rc.json`)) {
        var allCommunication;
        try {
            allCommunication = JSON.parse(fs.readFileSync(`${path}/comm.yo-rc.json`));
            communications = allCommunication;
        } catch (err) {
            throw new Error(err, `Cannot parse the file comm.yo-rc.json in '${this.directoryPath}'`);
        }
    }
}
export { communications };

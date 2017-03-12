/* global describe, beforeEach, it*/


const assert = require('assert');

describe('JHipster generator', () => {
    it('can be imported without blowing up', () => {
        const app = require('../generators/app');
        assert(app !== undefined);
    });
});

const expect = require('chai').expect;

const waitUntil = require('../../cli/wait-until');

describe('wait until', () => {
    let ready;
    let calls;

    beforeEach(() => {
        ready = false;
        calls = 0;
    });

    function check() {
        calls++;
        return ready;
    }

    function markReady(value) {
        if (typeof value == 'undefined') {
            value = true;
        }
        ready = value;
    }

    it('uses the full fluent interface', done => {
        waitUntil()
            .interval(50)
            .times(10)
            .condition(check)
            .done(result => {
                expect(result).to.equal(true);
                expect(calls).to.equal(3);
                done();
            });

        setTimeout(markReady, 125);
    });

    it('allows async check functions', done => {
        waitUntil()
            .interval(40)
            .times(10)
            .condition(cb => {
                setTimeout(() => {
                    cb(check());
                }, 10);
                return false;
            })
            .done(result => {
                expect(result).to.equal(true);
                expect(calls).to.equal(3);
                done();
            });

        setTimeout(markReady, 125);
    });

    it('allows infinite times', done => {
        waitUntil()
            .interval(10)
            .times(Infinity)
            .condition(check)
            .done(result => {
                expect(result).to.equal(true);
                done();
            });

        setTimeout(markReady, 500);
    });

    it('expires', done => {
        let expired = false;

        waitUntil()
            .interval(10)
            .times(5)
            .condition(check)
            .done(result => {
                expect(result).to.equal(false);
                expect(calls).to.equal(5);
                expired = true;
            });

        setTimeout(() => {
            markReady();
            expect(expired).to.equal(true);
            done();
        }, 150);
    });

    it('uses a truthy value passed from the condition function', done => {
        waitUntil()
            .interval(100)
            .times(5)
            .condition(check)
            .done(result => {
                expect(result).to.eql({ a: 1, b: 2 });
                expect(calls).to.equal(2);
                done();
            });

        setTimeout(() => {
            markReady({ a: 1, b: 2 });
        }, 150);
    });

    it('uses a falsy value passed from the condition function', done => {
        waitUntil()
            .interval(100)
            .times(2)
            .condition(check)
            .done(result => {
                expect(isNaN(result)).to.equal(true);
                expect(calls).to.equal(2);
                done();
            });

        markReady(false);
        setTimeout(() => {
            markReady(NaN);
        }, 150);
    });
});

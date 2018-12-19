/**
 * Adapted from https://github.com/nylen/wait-until since it suits our use case but is not maintained.
 */
class WaitUntil {
    /**
     * The interval frequency to check
     * @param {int} interval in milliseconds
     */
    interval(interval) {
        this._interval = interval;
        return this;
    }

    /**
     * Number of times to check before expiring and calling done
     * @param {int} times
     */
    times(times) {
        this._times = times;
        return this;
    }

    /**
     * The condition to be checked for
     * @param {function} condition callback function
     */
    condition(condition) {
        this._condition = condition;
        return this;
    }

    /**
     * Work to be done after waiting or expiring
     * @param {function} cb callback function
     */
    done(cb) {
        if (!this._times) {
            throw new Error('waitUntil.times() not called yet');
        }
        if (!this._interval) {
            throw new Error('waitUntil.interval() not called yet');
        }
        if (!this._condition) {
            throw new Error('waitUntil.condition() not called yet');
        }
        const runCheck = (i, prevResult) => {
            if (i === this._times) {
                cb(prevResult);
            } else {
                setTimeout(() => {
                    const gotConditionResult = result => {
                        if (result) {
                            cb(result);
                        } else {
                            runCheck(i + 1, result);
                        }
                    };

                    if (this._condition.length) {
                        this._condition(gotConditionResult);
                    } else {
                        process.nextTick(() => {
                            gotConditionResult(this._condition());
                        });
                    }
                }, this._interval);
            }
        };

        runCheck(0);

        return this;
    }
}

module.exports = exports = () => new WaitUntil();

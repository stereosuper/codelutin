const timerService = require('../services/TimerService.js');

class _Timeout {
    constructor(start, duration, remaining, timeoutId, resolve, reject) {
        this.start = start;
        this.duration = duration;
        this.remaining = remaining;
        this.timeoutId = timeoutId;

        // Promise callback to resolve the timeout promise
        this.resolve = resolve;
        this.reject = reject;
    }

    static of(duration, resolve, reject) {
        return new _Timeout(
            Date.now(),
            duration,
            duration,
            setTimeout(resolve, duration),
            resolve, reject
        );
    }
};

module.exports = class Timeout {

    constructor(duration) {
        if (duration != null) {
            this.promise = new Promise((resolve, reject) => {
                this.internal = _Timeout.of(duration, resolve, reject);
            });

            timerService.register(this);
        }
    }

    pause() {
        if (this.internal.remaining) {
            clearTimeout(this.internal.timeoutId);
            this.internal.remaining = Math.max(this.internal.start + this.internal.duration - Date.now(), 0);
        }

        return this;
    }

    resume() {
        if (this.internal.remaining) {
            this.internal.timeoutId = setTimeout(this.internal.resolve, this.internal.remaining);
        }

        return this;
    }

    cancel() {
        clearTimeout(this.internal.timeoutId);
        this.internal.reject();

        return this;
    }

    then(onSuccess, onError) {
        return this._then(this.promise, onSuccess, onError);
    }

    catch(onError) {
        return this._then(this.promise, null, onError);
    }

    _then(parentPromise, onSuccess, onError) {
        const promise = parentPromise.then(onSuccess, onError);
        return this._chain(promise);
    }

    _chain(promise) {
        const result = new Timeout();
        result.internal = this.internal;
        result.promise = promise;

        return result;
    }
}

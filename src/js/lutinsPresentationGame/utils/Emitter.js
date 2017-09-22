/**
 * This is a just simple emitter utility class
 */
module.exports = class Emitter {
    constructor() {
        this._subscribers = new Map();
    }

    on(eventName, callback) {
        var callbacks = this._subscribers.get(eventName) || [];
        callbacks.push(callback);
        this._subscribers.set(eventName, callbacks);
    }

    emit(eventName, ...params) {
        var callbacks = this._subscribers.get(eventName) || [];
        callbacks.forEach(cb => cb(...params));
    }

    unsubscribe(eventName, callback) {
        var callbacks = this._subscribers.get(eventName) || [];
        callbacks.splice(callbacks.indexOf(callback), 1);
    }
}

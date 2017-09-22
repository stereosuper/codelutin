const Ctrl = require('./Ctrl.js');
const TweenMax = require('gsap/TweenMax');
const gameService = require('../services/GameService.js');
const $ = require('jquery-slim');

const hammerAnimDuration = 0.3; // animation duration in seconds

module.exports = class HammerCtrl extends Ctrl {

    load() {
        this.hide();
        gameService.on(gameService.GAME_STARTED_EVENT, () => this.show());
    }

    show() {
        $(this.node).removeClass("hide");
    }

    hide() {
        $(this.node).addClass("hide");
    }

    strike() {
        return new Promise((resolve, reject) => {
            this._prepareAnimation(resolve, reject);

            if (this.player) {
                this.player.restart();
            } else {
                this.player = TweenMax.to(this.node, hammerAnimDuration, {
                    rotation: '-=110',
                    ease: Power2.easeIn,
                    onComplete: this._notifyAnimationEnd,
                    onReverseComplete: this._notifyAnimationEnd,
                    callbackScope: this
                });
            }
        });
    }

    release() {
        if (!this.player) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this._prepareAnimation(resolve, reject);
            this.player.reverse();
        });
    }

    _prepareAnimation(resolve, reject) {
        if (this._reject) {
            this._reject(); // We reject the previous promise (in the case where an animation in on goin)
        }

        this._resolve = resolve;
        this._reject = reject;
    }

    _notifyAnimationEnd() {
        this._resolve();
    }
};

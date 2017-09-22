const Ctrl = require('./Ctrl.js');

const $ = require('jquery-slim');
const TweenMax = require('gsap/TweenMax');
const TimelineLite = require('gsap/TimelineLite');

const gameService = require('../services/GameService.js');
const Timeout = require('../utils/Timeout.js');

module.exports = class HoleCtrl extends Ctrl {

    constructor() {
        super();
        gameService.registerHole(this);
        gameService.on(gameService.GAME_STARTED_EVENT, () => this.clear());
    }

    isOccupied() {
        return this.currentLutin != null;
    }

    show(lutin) {

        this.currentLutin = lutin;

        return new Promise(resolve => {

            // Make lutin appear in the hole
            this.svg = $(this.node);
            this.lutinNode = $(this.node).siblings('.lutin-game');
            this.pafNode = $(this.node).siblings('.paf');
            if (lutin.smallHead) {
                this.lutinNode.addClass('small-head');
            }else {
                this.lutinNode.removeClass('small-head');
            }
            this.lutinNode.find('.heads>use').attr('xlink:href', '#icon-' + lutin.id);

            this.lutinNode.removeClass('hide');
            this.pafNode.removeClass('show');
            TweenMax.fromTo(this.lutinNode, 0.3, {scaleX: 0.2}, {scaleX: 1});
            TweenMax.fromTo(this.lutinNode.find('.hats'), 0.8, {rotation: -15}, {ease: Bounce.easeOut, rotation:0, delay:0.05});
            TweenMax.fromTo(this.lutinNode, 0.3, {y : 170}, {y :0, ease: Back.easeOut.config(1.2)});

            this.resolve = resolve;

            this.timer = new Timeout(gameService.getLutinShowTimeDuration())
                .then(() => {
                    gameService.decrementLives();
                    this.clear();
                }, () => {});
        });
    }

    paf() {
        return new Promise(resolve => {
            // La fonction à déclencher sur le smash du lutin (pour l'instant dans le onClick)

            this.pafNode = $(this.node).siblings('.paf');
            this.pafHands = this.pafNode.find('.paf-hands');
            this.pafHats = this.pafNode.find('.paf-hats');

            var tl = new TimelineLite();
            var tlHat = new TimelineLite({onCompleteScope: this, onComplete: function(){
                this.pafNode.removeClass('show');
                this.reset();
                resolve();
            }});
            var tlPif = new TimelineLite({delay : 0.1});

            this.lutinNode.addClass('hide');
            this.pafNode.addClass('show');
            tl.to(this.pafHands, 0, {scaleX : -1, scaleY : -1})
              .to(this.pafHands, 0, {scaleX : 1, scaleY : 1, delay: 0.1})
              .to(this.pafHands, 0, {scaleX : -1, scaleY : -1, delay: 0.1})
              .to(this.pafHands, 0, {scaleX : 1, scaleY : 1, delay: 0.1})
              .to(this.pafHands, 0.1, {scaleX : 0.1, delay: 0.3})
              .add([
                  TweenMax.to(this.pafHands, 0.3, { y: 100, ease: Power2.easeOut, delay: -0.05 }),
                  TweenMax.to(this.pafNode, 0.1, { zIndex: 1, ease: Power2.easeOut, delay: -0.05 })
                ]);

            tlHat.to(this.pafHats, 0, {rotation : -15})
                 .to(this.pafHats, 0.1, {rotation : 15})
                 .to(this.pafHats, 0.1, {rotation : -15})
                 .to(this.pafHats, 0.1, {rotation : 0})
                 .to(this.pafHats, 0.1, {zIndex: 2, scaleX : 0.4, delay : 0.3})
            .add([
                TweenMax.to(this.pafHats, 0.3, {y : 100, ease: Power2.easeOut, delay: -0.05})
            ]);

            tlPif.to(this.pafNode.find('.pif'), 0.2, {scale: 1.8})
            .to(this.pafNode.find('.pif'), 0.2, {scale: 0})
            .add([
                TweenMax.to(this.pafNode.find('.pouf'), 0.2, {scale: 1.5, delay : -0.35}),
                TweenMax.to(this.pafNode.find('.pouf'), 0.2, {scale: 0, delay: -0.15}),
                TweenMax.to(this.pafNode.find('.pouf path'), 0.05, {fill: 'yellow', delay: -0.35}),
                TweenMax.to(this.pafNode.find('.pouf path'), 0.05, {fill: 'cyan', delay: -0.25})
            ]);

            this.pafNode.find('.stars').each(function(){
                TweenMax.set($(this), {y : 0, x: 0, opacity: 1});
                var offsetX = Math.random() * (180 + 180) - 180;
                var offsetY = Math.random() * (- 300 + 150) - 150;
                TweenMax.to($(this), 0.4, {y : offsetY, x: offsetX});
                TweenMax.to($(this), 0.2, {opacity: 0, delay: 0.2});
            });
        });
    }

    reset(){
        TweenMax.set(this.pafNode.find('.pif, .pouf'), { scale: 0 });
        TweenMax.set(this.pafNode, { zIndex: 5});
        TweenMax.set(this.pafHats, {y : 0, rotation : 0, scaleX: 1, zIndex: 8});
        TweenMax.set(this.pafHands, {y : 0, scaleX: 1});
    }

    clear() {
        this.currentLutin = null;

        if (this.lutinNode) {
            // Make lutin diseappear into the hole
            TweenMax.to(this.lutinNode, 0.2, {scaleX: 0.2});
            TweenMax.to(this.lutinNode, 0.2, {y : 170, onCompleteScope: this, onComplete: function(){
                this.lutinNode.addClass('hide');
            }});
        }

        this.resolve && this.resolve();
    }

    touch() {
        if (this.currentLutin) {
            this.timer.cancel();

            return this.paf()
            .then(() => {
                // Let's increment the score
                gameService.score(this.currentLutin);

                // And show the details of the hammered lutin
                return this.showLutinDetails(this.currentLutin);
            })
            .then(() => this.clear(), () => this.clear());
        }

        return Promise.resolve();
    }

    showLutinDetails(lutin) {
        if (!lutin) {
            return Promise.resolve();
        }

        const popupNode = document.getElementById('popup');
        return popupNode.controller.open(lutin);
    }
};

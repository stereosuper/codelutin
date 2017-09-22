const Ctrl = require('./Ctrl.js');
const gameService = require('../services/GameService.js');
const $ = require('jquery-slim');

const DISCOVER_MODE = "discover";
const PLAY_MODE = "play";

module.exports = class OverlayCtrl extends Ctrl {

    hide() {
        $(this.node).addClass("hide");
        gameService.resume();
    }

    show() {
        gameService.pause();
        $(this.node).removeClass("hide");
    }

    onClick(e) {
        e.stopPropagation();

        const gameNode = this.node.parentNode;

        switch(e.target.id) {
        case PLAY_MODE:
            gameService.startNewGame(false);
            break;
        case DISCOVER_MODE:
            gameService.startNewGame(true);
            break;
        default:
            break;
        }
    }

    onMouseMove(e) {
        e.stopPropagation();
    }
};

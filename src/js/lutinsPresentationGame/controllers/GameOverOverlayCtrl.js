const OverlayCtrl = require('./OverlayCtrl.js');
const gameService = require('../services/GameService.js');

module.exports = class GameOverOverlayCtrl extends OverlayCtrl {
    load() {
        gameService.on(gameService.GAME_STARTED_EVENT, () => this.hide());
        gameService.on(gameService.GAME_OVER_EVENT, () => this.show());
    }
};

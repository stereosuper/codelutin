const OverlayCtrl = require('./OverlayCtrl.js');
const gameService = require('../services/GameService.js');

module.exports = class StartOverlayCtrl extends OverlayCtrl {
    load() {
        gameService.on(gameService.GAME_STARTED_EVENT, () => this.hide());
    }
};

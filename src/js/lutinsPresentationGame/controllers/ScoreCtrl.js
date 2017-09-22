const Ctrl = require('./Ctrl.js');
const gameService = require('../services/GameService.js');

module.exports = class ScoreCtrl extends Ctrl {
    load() {
        gameService.on(gameService.SCORE_CHANGED_EVENT, score => this.update(score));
        gameService.on(gameService.GAME_STARTED_EVENT, () => this.update(gameService.getScore()));
    }

    update(score) {
        this.refs.scoreValue.textContent = score;
    }
};

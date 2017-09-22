const Ctrl = require('./Ctrl.js');
const gameService = require('../services/GameService.js');

const LUTIN_ICON = '<svg class="live"><use xlink:href=\'#icon-logo-only\'></use></svg>';

module.exports = class LivesCtrl extends Ctrl {
    load() {
        gameService.on(gameService.LIVES_COUNT_CHANGED_EVENT, livesCount => this.update(livesCount));
        gameService.on(gameService.GAME_STARTED_EVENT, () => this.update(gameService.getLivesCount()));
    }

    update(livesCount) {
        const result = [];
        for (let i = 0; i < livesCount; i++) {
            result.push(LUTIN_ICON);
        }
        this.node.innerHTML = result.join('');
    }
};

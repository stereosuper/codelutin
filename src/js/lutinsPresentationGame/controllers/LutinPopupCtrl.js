const Ctrl = require('./Ctrl.js');
const lutinsService = require('../services/LutinsService.js');
const gameService = require('../services/GameService.js');
const $ = require('jquery-slim');

module.exports = class LutinPopupCtrl extends Ctrl {

    load() {
        gameService.on(gameService.GAME_STARTED_EVENT, () => {
            if (gameService.isDryRun()) {
                $(this.refs.goBackToGame).addClass("hide");
                $(this.refs.play).removeClass("hide");
                this.open(lutinsService.getLutins()[0]);
            }
        })
    }

    open(lutin) {
        if (gameService.isPopupDisabled()) {
            return Promise.resolve();
        }

        // Sets the game to pause
        gameService.pause();

        return new Promise((resolve, reject) => {
            this._openPromise = {resolve, reject};
            this.node.style.display = 'flex';
            this.set(lutin);
        });
    }

    close() {
        this.node.style.display = 'none';

        // Resume the game
        gameService.resume();

        if (this._openPromise) {
            this._openPromise.resolve();
            this._openPromise = null;
        }
    }

    onClick(e) {
        e.stopPropagation();
        switch (e.target.id) {
        case 'prevLutin':
            this.set(lutinsService.getPreviousLutin(this.currentLutin));
            break;
        case 'nextLutin':
            this.set(lutinsService.getNextLutin(this.currentLutin));
            break;
        case 'play':
            gameService.stop();
            this.close();
            gameService.startNewGame(false);
            break;
        default:
            if (!gameService.isDryRun()) {
                this.close();
            }
            break;
        }
    }

    onMouseMove(e) {
        e.stopPropagation();
    }

    set(lutin) {
        if (lutin !== this.currentLutin) {
            this.currentLutin = lutin;

            // Charge les informations relatives au lutin
            this.refs.lutinName.textContent = `${lutin.firstName} ${lutin.lastName}`;
            this.refs.lutinPosition.textContent = (lutinsService.isPresident(lutin) ? 'Président - ' : '') + lutin.position;

            // Affiche les liens vers les resources du profil s'il y en a
            const resourcesNode = this.refs.resources;
            const resources = lutin.resources || [];
            resourcesNode.innerHTML = resources.map(resource => `<a href=${resource.href}>${resource.label}</a>`).join(' - ');

            // Charge le visage du lutin correspondant
            this.refs.lutinHead.setAttribute('xlink:href', `#icon-${lutin.id}`);
            if (lutin.smallHead) {
                $(this.refs.lutinPicture).addClass('small-head');
            } else {
                $(this.refs.lutinPicture).removeClass('small-head');
            }
        }
    }
};

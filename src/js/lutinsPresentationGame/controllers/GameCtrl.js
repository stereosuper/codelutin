const Ctrl = require('./Ctrl.js');
const gameService = require('../services/GameService.js');
const $ = require('jquery-slim');

module.exports = class GameCtrl extends Ctrl {
    load() {
        // Listen for onmouse event and make the hammer follow the mouse when dragging it onto the game area
        this._linkHammerToCursor(this.node.getBoundingClientRect());

        // Display or hide game meta depending on wheither the user wants to play a real game or just discover the lutins
        gameService.on(gameService.GAME_STARTED_EVENT, () => {
            if (!gameService.isDryRun()) {
                $(this.refs.meta).removeClass("hide");
            } else {
                $(this.refs.meta).addClass("hide");
            }
        })
    }

    onClick(e) {
        e.stopPropagation();

        var hammer = document.getElementById('hammer').controller;
        hammer.strike()
        .then(() => {
            return hammer.release();

        }, () => {})
        .then(() => {
            let angleRadian = 10 * Math.PI / 180;
            let adjacent = 150;
            let oppositeY = adjacent * Math.tan(angleRadian);

            let element = document.elementFromPoint(e.clientX - adjacent, e.clientY + oppositeY);
            let controller = element && element.parentNode && element.parentNode.controller;
            if (controller && controller.touch) {
                // Touch the hole with the hammer, let's see if we catched a lutin...
                controller.touch();
            }
        });
    }

    _linkHammerToCursor(gameNodeBounds) {
        this.node.onmousemove = evt => {
            var h = document.getElementById('hammer');

            if (!h) return;

            if (!h._bounds) {
                h._bounds = h.getBoundingClientRect();
            }

            var hs = h.style;
            //OLD VALUE :
            //0.77 * h._bounds.width
            //1.3 * h._bounds.height
            hs.left = parseInt(evt.pageX - gameNodeBounds.left - 0.34 * h._bounds.width) + 'px';
            hs.top = parseInt(evt.pageY - gameNodeBounds.top - 0.78 * h._bounds.height) + 'px';
        };
    }
};

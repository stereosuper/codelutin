const lutinsData = require('../model/lutins.json');

/**
 * Ce service gère les données relatives aux lutins.
 *
 * Pour obtenir des informations concernant les lutins, il faut s'adresser à ce service.
 */
class LutinsService {

    constructor() {
        this.lutins = new Map();

        lutinsData.team.forEach(lutinId => {
            const lutin = lutinsData[lutinId];
            lutin.id = lutinId;
            this.lutins.set(lutinId, lutin);
        });
    }

    getLutins() {
        return Array.from(this.lutins.values());
    }

    getLutinById(lutinId) {
        return this.lutins.get(lutinId);
    }

    getPreviousLutin(lutinOrLutinId) {
        const id = this._getId(lutinOrLutinId);

        let nextIndex = lutinsData.team.indexOf(id) - 1;
        if (nextIndex < 0) {
            nextIndex = lutinsData.team.length - 1;
        }

        return this.getLutinById(lutinsData.team[nextIndex]);
    }

    getNextLutin(lutinOrLutinId) {
        const id = this._getId(lutinOrLutinId);

        let nextIndex = lutinsData.team.indexOf(id) + 1;
        if (nextIndex > lutinsData.team.length - 1) {
            nextIndex = 0;
        }

        return this.getLutinById(lutinsData.team[nextIndex]);
    }

    isPresident(lutinOrLutinId) {
        return lutinsData.president === this._getId(lutinOrLutinId);
    }

    _getId(lutinOrLutinId) {
        return lutinOrLutinId && lutinOrLutinId.id || lutinOrLutinId;
    }

}

module.exports = new LutinsService();

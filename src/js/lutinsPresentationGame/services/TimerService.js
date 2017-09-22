/**
 * Ce service gère les timers de l'application :
 * - liste les timers en cours
 * - permet de mettre en pause tous les timers
 * - permet de remettre en route tous les timers
 */
class TimerService {
    constructor() {
        this.timers = [];
    }

    register(timer) {
        this.timers.push(timer);

        // Retire le timers des timers actifs lorsque celui-ci a expiré
        timer.then(() => this.unregister(timer), () => this.unregister(timer));
    }

    unregister(timer) {
        this.timers.splice(this.timers.indexOf(timer), 1);
    }

    pause() {
        this.timers.forEach(timer => timer.pause());
    }

    resume() {
        this.timers.forEach(timer => timer.resume());
    }

    clear() {
        this.timers.forEach(timer => timer.cancel());
    }
}

module.exports = new TimerService();

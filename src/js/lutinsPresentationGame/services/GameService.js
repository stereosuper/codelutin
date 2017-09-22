const lutinsService = require('./LutinsService');
const timerService = require('./TimerService');

const Timeout = require('../utils/Timeout.js');
const Emitter = require('../utils/Emitter.js');

// Defining the boundaries of the period of time a lutin might be visible  in a hole(in ms)
const VISIBILITY_LONGEST_DELAY = 5 * 1000;
const VISIBILITY_SHORTEST_DELAY = 1 * 1000;

// Defining the number of point when cathcing a lutin
const UNDERLINGS_CATCH = 10;
const CHIEF_CATCH = 50;

// Defining the scores to reach before triggering new loops
const SECOND_LOOP_THRESHOLD = 100;
const THIRD_LOOP_THRESHOLD = 200;

/**
 * This service manage the game attributes :
 * - score
 * - level
 * - lutin appearance's duration within the holes
 * - game loops, ...
 */
class GameService extends Emitter {
    // Defining game events
    get GAME_STARTED_EVENT() { return 'game_started'; }
    get GAME_OVER_EVENT() { return 'game_over'; }
    get SCORE_CHANGED_EVENT() { return 'score_changed'; }
    get LIVES_COUNT_CHANGED_EVENT() { return 'lives_count_changed'; }

    constructor() {
        super();
        this._holes = [];
        this._nonce = Date.now();
    }

    registerHole(holeCtrl) {
        if (this._holes.indexOf(holeCtrl) <= 0) {
            this._holes.push(holeCtrl);
        }
    }

    /**
     * Start a new game :
     * - initialize the context of a game (score, ...)
     * - engage the first loop
     */
    startNewGame(isDemo) {
        // Init game context
        this._gameCtx = {
            start: new Date(),
            end: null,
            score: 0,
            livesCount: lutinsService.getLutins().length,
            showDetails: isDemo,
            dryRun: isDemo
        }

        // Notify listeners that the game has just started
        this.emit(this.GAME_STARTED_EVENT);

        // Start a game loop
        this.engage(this._gameCtx);
    }

    /**
     * Engage a game loop.
     *
     * The loop is responsible for :
     * 1. choosing a `lutin`
     * 2. choosing a hole
     * 3. triggering hole animation making the `lutin` appear/diseappear
     * 4. looping again
     */
    engage(gameCtx) {
        // If the game is over, we should stop looping
        if (gameCtx.end) {
            return;
        }

        // 1. Choose a `lutin`
        const lutin = this.pickLutin();

        // 2. Choose a hole
        const hole = this.pickHole();

        // 3. Trigger hole animation
        const promise = hole.show(lutin)
            .catch(err => console.log('An error occured while showing lutin', lutin, 'in hole', hole))

        // 4. loop again
        promise.then(() => {
            new Timeout(this.getLoopTimeoutDuration()).then(() => this.engage(gameCtx));
        });
    }

    /**
     * Choose a hole randomly among the available holes
     */
    pickHole() {
        const availableHoles = this._holes.filter(hole => !hole.isOccupied());
        return availableHoles[Math.floor(Math.random() * availableHoles.length)];
    }

    /**
     * Choose a lutin randomly among the available lutins
     */
    pickLutin() {
        const busyLutins = this._holes.filter(hole => hole.isOccupied()).map(hole => hole.currentLutin);
        const availableLutins = lutinsService.getLutins().filter(lutin => busyLutins.indexOf(lutin) < 0);
        return availableLutins[Math.floor(Math.random() * availableLutins.length)];
    }

    /**
     * Increment the score when a lutin has been catched
     */
    score(lutin) {
        // If it's a dry run we don't count the score
        if (this._gameCtx.dryRun) {
            return;
        }

        const oldScore = this._gameCtx.score;

        if (lutinsService.isPresident(lutin)) {
            this._gameCtx.score += CHIEF_CATCH;
        } else {
            this._gameCtx.score += UNDERLINGS_CATCH;
        }

        // Notify listeners that the score has changed
        this.emit(this.SCORE_CHANGED_EVENT, this._gameCtx.score, oldScore);

        // When the user reach a certain score, we start new loops
        if (this._gameCtx.score >= SECOND_LOOP_THRESHOLD && oldScore < SECOND_LOOP_THRESHOLD
            || this._gameCtx.score >= THIRD_LOOP_THRESHOLD && oldScore < THIRD_LOOP_THRESHOLD) {
            this.engage(this._gameCtx);
        }
    }

    decrementLives() {
        // If it's a dry run we don't count the score, neither the lives
        if (this._gameCtx.dryRun) {
            return;
        }

        const livesCount = --this._gameCtx.livesCount;

        this.emit(this.LIVES_COUNT_CHANGED_EVENT, livesCount);

        if (livesCount < 0) {
            this.stop();
            this.emit(this.GAME_OVER_EVENT);
        }
    }

    getScore() {
        return this._gameCtx && this._gameCtx.score || 0;
    }

    getLivesCount() {
        return this._gameCtx && this._gameCtx.livesCount || 0;
    }

    /**
     * Compute the duration during which a lutin will appear in a hole
     */
    getLutinShowTimeDuration() {
        return Math.random() * (VISIBILITY_LONGEST_DELAY - VISIBILITY_SHORTEST_DELAY) + VISIBILITY_SHORTEST_DELAY;
    }

    /**
     * Compute a random delay between 0 and 2 seconds a new game loop starts.
     */
    getLoopTimeoutDuration() {
        return Math.floor(Math.random() * 3) * 1000;
    }

    /**
     * Sets the game to pause.
     */
    pause() {
        timerService.pause();
    }

    /**
     * Résume the game.
     */
    resume() {
        timerService.resume();
    }

    /**
     * Stop the game
     */
    stop() {
        this._gameCtx.end = new Date();
        timerService.clear();
    }

    /**
     * Indicate whether the lutin details popup should be displayed or not
     */
    isPopupDisabled() {
        return !this._gameCtx.showDetails;
    }

    /**
     * Indicate whether it's a true game or just a dry run
     */
    isDryRun() {
        return this._gameCtx.dryRun;
    }

    nonce() {
        return this._nonce++;
    }
}

module.exports = new GameService();

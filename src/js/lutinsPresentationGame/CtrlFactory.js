/**
 * This factory is aimed to load controllers and control their lifecycle.
 *
 * Controllers have a very simple lifecycle :
 * - load() : this method is called on controller creation
 * - reload() : this method is called when trying to load controllers on a node for which the controllers have already been created.
 *
 * Controllers hold a basic reference mechanism to help you manipulate the child nodes of the node to which the controller is attached :
 * 1. In your templates, use a `data-ref` attribute to label a node.
 * 2. In your controller, retrieve the node link to your reference with `this.refs.yourReference` within your controller.
 *
 * Example :
 * <div data-ctrl='ApplicationCtrl'>
 *   <div data-ctrl='SectionCtrl'>
 *     <div>An element from my first section</div>
 *     <div data-ref='another'>Another element from my first section</div>
 *   </div>
 *   <div data-ctrl='SectionCtrl'>
 *     <div>An element from my second section</div>
 *     <div data-ref='another'>Another element from my second section</div>
 *   </div>
 * </div>
 *
 * To retrieve the node associated to `another` reference wihtin a SectionCtrl:
 * class SectionCtrl extends Ctrl {
 *     load() {
 *          const anotherElement = this.refs.another;
 *     }
 * }
 */
class CtrlFactory {

    constructor() {
        // Exisiting Controllers
        this.controllersTypes = {
            Ctrl: require('./controllers/Ctrl.js'),
            GameCtrl: require('./controllers/GameCtrl.js'),
            HoleCtrl: require('./controllers/HoleCtrl.js'),
            HammerCtrl: require('./controllers/HammerCtrl.js'),
            LutinPopupCtrl: require('./controllers/LutinPopupCtrl.js'),
            OverlayCtrl: require('./controllers/OverlayCtrl.js'),
            StartOverlayCtrl: require('./controllers/StartOverlayCtrl.js'),
            GameOverOverlayCtrl: require('./controllers/GameOverOverlayCtrl.js'),
            ScoreCtrl: require('./controllers/ScoreCtrl.js'),
            LivesCtrl: require('./controllers/LivesCtrl.js')
        };
    }

    /**
     * Filter all child nodes with a `data-ctrl` attribute of the given parent node
     * and load their controllers
     */
    loadControllers(parentNode) {
        const nodes = parentNode.querySelectorAll('[data-ctrl]');
        for (var i = 0, l = nodes.length; i < l; i++) {
            let node = nodes[i];
            let ctrl = node.controller;
            if (!ctrl) {

                // Let's instanciate the controller and attach it to the corresponding node
                let ctrlName = node.dataset && node.dataset.ctrl || node.getAttribute('data-ctrl');
                let CtrlClass = this.controllersTypes[ctrlName];
                node.controller = ctrl = new CtrlClass();
                ctrl.node = node;
                ctrl.refs = {};

                // Let's build the references set for each controller,
                // to help developpers mannipulate nodes with their reference
                const nodesWithRef = node.querySelectorAll('[data-ref]');
                for (let j = 0, m = nodesWithRef.length; j < m; j++) {
                    let n = nodesWithRef[j];
                    const ref = n.dataset && n.dataset.ref || n.getAttribute('data-ref');
                    Object.defineProperty(ctrl.refs, ref, {
                        configurable: true,
                        get: node.querySelector.bind(node, '[data-ref=' + ref + ']')
                    });
                }

                ctrl.registerEvents(); // Attach dom events to the controller
                ctrl.load && ctrl.load();

            } else {
                ctrl.reload && ctrl.reload();
            }
        }
    }

    nonce() {
        this._nonce = this._nonce || Date.now();
        return this._nonce++;
    }
}

module.exports = new CtrlFactory();

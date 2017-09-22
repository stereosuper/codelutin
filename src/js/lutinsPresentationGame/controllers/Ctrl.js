// This is the parent class of every controller
module.exports = class Ctrl {

    /**
     * Plug events onto the controller
     */
    registerEvents() {
        this.node.addEventListener('click', this.onClick && this.onClick.bind(this)); // onClick
        this.node.addEventListener('mousemove', this.onMouseMove && this.onMouseMove.bind(this)); // onMouseMove
    }
};

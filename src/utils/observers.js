const userEventHandler = require('../api/handler/event_handler');

const init = () => {
    initEventListener();
};
const initEventListener = () => {
    userEventHandler.addToCart();
    userEventHandler.removeFromCart();
    userEventHandler.moveToOrder();
};

module.exports = {
    init: init
};

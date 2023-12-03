const userEventHandler = require('../api/handler/event_handler');

const init = () => {
    initEventListener();
};
const initEventListener = () => {
    userEventHandler.addToCart();
    userEventHandler.removeFromCart();
    userEventHandler.moveToOrder();
    userEventHandler.cancelTxOrder();
    userEventHandler.payTxOrder();
};

module.exports = {
    init: init
};

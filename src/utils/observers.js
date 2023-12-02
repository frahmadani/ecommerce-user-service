const userEventHandler = require('../api/handler/event_handler');
// const logger = require('../helpers/utils/logger');

const init = () => {
    // logger.log('info','Observer is Running...','myEmitter.init');
    initEventListener();
};
const initEventListener = () => {
    userEventHandler.addToCart();
    userEventHandler.removeFromCart();
};

module.exports = {
    init: init
};

const kafkaConsumer = require('../../utils/kafka/kafka_consumer');
const User = require('../../services/user-service');
const logger = require('../../utils/app-logger');

const addToCart = async (userService) => {
    let user;
    if (userService) {
        user = userService;
    } else {
        user = new User();
    }

    const dataConsumer = {
        topic: 'ecommerce-service-add-to-cart',
        groupId: 'ecommerce-user-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'addToCart';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);
            logger.info(`${ctx} - Data received by User service - Add To Cart Event`);


            const parsedMessage = JSON.parse(message.value);

            const { userId, product, qty, isRemoving } = parsedMessage.data;

            const result = await user.ManageCart(userId, product, qty, isRemoving);

            if (result?.err) {
                logger.error(`${ctx} - Data not committed to Kafka`);
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        logger.error(`${ctx} - Data not committed to Kafka`);
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                    logger.info(`${ctx} - Data committed to Kafka`);
                    console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            console.log(ctx, error, 'Data error');
            logger.error(`${ctx} - Data not committed to Kafka`);
        }
    });


};

const removeFromCart = async (userService) => {
    let user;
    if (userService) {
        user = userService;
    } else {
        user = new User();
    }
    const dataConsumer = {
        topic: 'ecommerce-service-remove-from-cart',
        groupId: 'ecommerce-user-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'removeFromCart';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);
            logger.info(`${ctx} - Data received by User service - Remove From Cart Event`);

            const parsedMessage = JSON.parse(message.value);

            const userId = parsedMessage?.data?.userId;
            const product = parsedMessage?.data?.product;
            const orderId = parsedMessage?.data?.orderId;
            const status = parsedMessage?.data?.status;

            const result = Promise.all[
                user.RemoveFromCart(userId, product?._id),
                user.UpdateOrder(userId, orderId, status)
            ];

            if (result?.err) {
                logger.error(`${ctx} - Data not committed to Kafka`);
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        logger.error(`${ctx} - Data not committed to Kafka`);
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                    logger.info(`${ctx} - Data committed to Kafka`);

                    console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            console.log(ctx, error, 'Data error');
            logger.error(`${ctx} - Data not committed to Kafka`);
        }
    });
};


const moveToOrder = async (userService) => {
    let userSvc;
    if (userService) {
        userSvc = userService;
    } else {
        userSvc = new User();
    }
    const dataConsumer = {
        topic: 'ecommerce-service-create-order',
        groupId: 'ecommerce-user-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'moveToOrder';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);
            logger.info(`${ctx} - Data received by User service - Remove From Cart Event`);

            let { payload } = JSON.parse(message.value);
            console.log('payload:', payload);
            let data = payload?.data?.data;
            console.log('data:', data);
            if (data?.transactionId) {
                data.order.transactionId = data.transactionId;
            }

            const result = await userSvc.CreateOrder(data.userId, data.order);

            if (result?.err) {
                console.log(ctx, result.err, 'Data not commit Kafka');
                logger.error(`${ctx} - Data not committed to Kafka`);
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        console.log(ctx, err, 'Data not commit Kafka');
                        logger.error(`${ctx} - Data not committed to Kafka`);
                    }
                    console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            console.log(ctx, error, 'Data error');
        }
    });
};

const cancelTxOrder = async (userService) => {

    let userSvc;
    if (userService) {
        userSvc = userService;
    } else {
        userSvc = new User();
    }

    const dataConsumer = {
        topic: 'ecommerce-service-cancel-transaction',
        groupId: 'ecommerce-user-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'cancelTxOrder';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);

            const parsedMessage = JSON.parse(message.value);
            const { userId, transactionId } = parsedMessage?.payload?.data || {};

            const result = await userSvc.CancelTxOrder(userId, transactionId);

            console.log('userid: ', userId);

            if (result?.err || !transactionId) {
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                    console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            console.log(ctx, error, 'Data error');
        }
    });


};


const payTxOrder = async (userService) => {

    let userSvc;
    if (userService) {
        userSvc = userService;
    } else {
        userSvc = new User();
    }

    const dataConsumer = {
        topic: 'ecommerce-service-pay-transaction',
        groupId: 'ecommerce-user-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'payTxOrder';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);

            const parsedMessage = JSON.parse(message.value);
            const { userId, transactionId } = parsedMessage?.data || {};

            const result = await userSvc.PayTxOrder(userId, transactionId);

            console.log('userid: ', userId);

            if (result?.err || !transactionId) {
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                    console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            console.log(ctx, error, 'Data error');
        }
    });


};




module.exports = {
    addToCart,
    removeFromCart,
    moveToOrder,
    cancelTxOrder,
    payTxOrder,
};

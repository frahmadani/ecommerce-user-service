const kafkaConsumer = require('../../utils/kafka/kafka_consumer');
const User = require('../../services/user-service');

const addToCart = async (userService) => {
    let user;
    if (userService) {
        user = userService
    } else {
        user = new User()
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

            const parsedMessage = JSON.parse(message.value);

            const { userId, product, qty, isRemoving } = parsedMessage.data;

            const result = await user.ManageCart(userId, product, qty, isRemoving);

            if (result?.err) {
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

const removeFromCart = async (userService) => {
    let user;
    if (userService) {
        user = userService
    } else {
        user = new User()
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

            const parsedMessage = JSON.parse(message.value);

            const userId = parsedMessage?.data?.userId
            const product = parsedMessage?.data?.product

            const result = await user.RemoveFromCart(userId, product?._id);

            if (result?.err) {
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


const moveToOrder = async (userService) => {
    let userSvc;
    if (userService) {
        userSvc = userService
    } else {
        userSvc = new User()
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

            let { payload } = JSON.parse(message.value);
            console.log("payload:", payload)
            let data = payload?.data?.data;
            console.log("data:", data)

            const result = await userSvc.CreateOrder(data.userId, data.order);

            if (result?.err) {
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
};

const { UserModel } = require('../models');
const { APIError } = require('../../utils/app-errors');

class UserRepository {

    async CreateUser({ email, password, salt }) {
        try {

            const user = new UserModel({
                email, 
                password,
                salt
            });

            const userResult = await user.save();
            return userResult;

        } catch (err) {
            throw new APIError('API Error', 500, 'Unable to find user');
        }
    }

    async FindUser({ email }) {
        try {

            const existingUser = await UserModel.findOne({ email });
            return existingUser;

        } catch (err) {
            throw new APIError('API Error', 404, 'Unable to find user');
        }
    }

    async FindUserById({ id }) {
        try {

            const existingUser = await UserModel.findById(id);
            return existingUser;

        } catch (err) {
            throw new APIError('API Error', 404, 'Unable to find user');
        }
    }

    async GetWishlist(userId) {
        try {

            const user = await UserModel.findById(userId);
            return user.wishlist;

        } catch (err) {
            throw new APIError('API Error', 500, 'Unable to retrieve wishlist');
        }
    }

    async AddToWishlist(userId, { _id, name, desc, image, available, price }) {

        const product = {
            _id, name, desc, image, available, price
        };

        try {

            const user = await UserModel.findById(userId);

            if (user.wishlist) {

                let wishlist = user.wishlist;

                if (wishlist.length > 0) {
                    let isExist = false;

                    // Checking if item already exist in wishlist
                    wishlist.forEach(item => {
                        if (item._id.toString() === product._id.toString()) {
                            const index = wishlist.indexOf(item);
                            wishlist.splice(index, 1);
                            isExist = true;
                        }
                    });

                    if (!isExist) {
                        wishlist.push(product);
                    }
                } else {
                    // if wishlist is empty
                    wishlist.push(product);
                }

                user.wishlist = wishlist;
            }

            const userResult = await user.save();

            return userResult.wishlist;

        } catch (err) {
            throw new APIError('API Error', 500, 'Unable to add item to wishlist');
        }
    }

    async AddToCart(userId, { _id, name, desc, image, available, price }, qty, isRemoving ) {

        try {

            const user = await UserModel.findById(userId);

            if (user) {

                let product = { _id, name, image, price };

                const cartItem = {
                    product,
                    unit: qty
                };

                // Add to existing cart contents
                let cartItems = user.cart;

                if (cartItems.length > 0) {
                    let isExist = false;
                    cartItems.forEach(item => {
                        if (item.product._id.toString() === product._id.toString()) {
                            // If user action is removing from cart
                            if (isRemoving) {
                                cartItems.splice(cartItems.indexOf(item), 1);
                            } else {
                                item.unit = qty;
                            }
                            isExist = true;
                        }
                    });

                    if (!isExist) {
                        cartItems.push(cartItem);
                    }

                } else {
                    // if cart is empty
                    cartItems.push(cartItem);
                }

                user.cart = cartItems;

                const userWithUpdatedCart = await user.save();

                return userWithUpdatedCart.cart;

            }

            throw new Error('Unable to add item to cart');

        } catch (err) {

            throw new APIError('API Error', 500, 'Unable to add item to cart');
        }
    }

    async RemoveFromCart(userId, productId) {

        try {
            const user = await UserModel.findById(userId);

            if (user) {
                console.log(`product Id to remove ${productId}`)
                let cartItems = user.cart.filter(item => item.product._id !== productId)
                user.cart = cartItems;

                const userWithUpdatedCart = await user.save();

                return userWithUpdatedCart.cart;

            }
            throw new APIError("User not found", 404, 'Unable to add item to cart');
            
        } catch (error) {
            console.log(error)
            throw new APIError('API Error', 500, 'Unable to add item to cart');
        }
    }

    async CreateOrder(userId, order) {
        try {
            const user = await UserModel.findById(userId);
            if (user) {

                if (user.orders == undefined) {
                    user.orders = [];
                } 
                if (!user.cart) {
                    user.cart = []
                }
                order.status = "waiting_for_payment"

                user.orders.push(order);
                for (const orderItem of order.items) {
                    user.cart = user.cart.filter(cartItem => {
                        return cartItem?.product?._id !== orderItem?.product?._id
                    })
                }

                const userWithUpdatedOrder = await user.save();

                return userWithUpdatedOrder;
            }

            throw new APIError("Create Order", 404, 'No user found');

        } catch (err) {
            console.log(err)
            throw new APIError('API Error', 500, 'Unable to create order');
        }

    }

    async UpdateOrder(userId, orderId, newStatus) {
        console.log("orderId:", orderId)
        console.log("newStatus:", newStatus)
        try {
            const user = await UserModel.findById(userId);
            if (user) {
                for (let order of user.orders) {
                    console.log("order._id:", order._id)
                    if (order._id === orderId) {
                        order.status = newStatus
                        break
                    }
                }
                const userWithUpdatedOrder = await user.save();
                return userWithUpdatedOrder;
            }

            throw new APIError("Update Order", 404, 'No user found');

        } catch(e) {
            console.log(err)
            throw new APIError("Update Order", 500, "Unable to update order status")

        }
    }
}

module.exports = UserRepository;
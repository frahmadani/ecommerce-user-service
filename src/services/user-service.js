const { UserRepository } = require('../database');
const { formattedData, generatePassword, generateSalt, generateSignature, validatePassword  } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors');

class UserService {

    constructor(userRepo) {
        if (userRepo) {
            this.repository = userRepo;
        } else {
            this.repository = new UserRepository();
        }
    }

    async signIn(userInputs) {

        const { email, password } = userInputs;

        try {

            const existingUser = await this.repository.FindUser({ email });

            if (existingUser) {

                const validPassword = await validatePassword(password, existingUser.password, existingUser.salt);
                console.log('valid password', validPassword);

                if (validPassword) {
                    const token = await generateSignature({ email: existingUser.email, _id: existingUser._id});
                    return formattedData({ id: existingUser._id, token });
                }
            }

            return formattedData(null);
            
        } catch (err) {

            console.log('err', err);
            throw new APIError('Data not found');
        }
    }

    async signUp(userInputs) {

        const { email, password } = userInputs;

        try {
            const existingUser = await this.repository.FindUser({ email: email });

            if (existingUser) {
                throw new APIError('User already exist');
            }

            let salt = await generateSalt();
            let hashedPassword = await generatePassword(password, salt);

            const registeredUser = await this.repository.CreateUser({ email, password: hashedPassword, salt });

            const token = await generateSignature({ email, _id: registeredUser._id });

            return formattedData({ id: registeredUser._id, token });

        } catch (err) {
            throw new APIError('Failed signup user');
        }
    }

    async getProfile(id) {

        try {
            const existingUser = await this.repository.FindUserById({ id });

            return formattedData(existingUser);

        } catch (err) {
            throw new APIError('Data not found');
        }
    }

    async getProfileByEmail(email) {

        try {
            const existingUser = await this.repository.FindUser({ email });

            if (existingUser) {
                return formattedData(existingUser);
            }

            return;

        } catch (error) {
            throw new APIError('Error');

        }
    }

    async getWishlist(userId) {

        try {
            const wishlistItems = await this.repository.GetWishlist(userId);

            return formattedData(wishlistItems);
        } catch (err) {
            throw new APIError('Data not found');
        }
    }

    async AddToWishlist(userId, product) {
        try {
            const wishlistResult = await this.repository.AddToWishlist(userId, product);

            return formattedData(wishlistResult);

        } catch (err) {
            throw new APIError('Data not found');
        }
    }

    async ManageCart(userId, product, qty, isRemoving) {
        try {
            const cartResult = await this.repository.AddToCart(userId, product, qty, isRemoving);

            console.log('Finish managing cart');
            return formattedData(cartResult);
        } catch (err) {
            throw new APIError('Data not found');
        }
    }

    async RemoveFromCart(userId, productId) {
        try {
            const cartResult = await this.repository.RemoveFromCart(userId, productId);

            console.log('Finish removing item from cart');
            return formattedData(cartResult);
        } catch (err) {
            throw new APIError('Data not found');
        }
    }


    async ManageOrder(userId, order) {
        console.log('========= Entering ManageOrder =======');
        try {
            const orderResult = await this.repository.CreateOrder(userId, order);

            console.log('Finish managing order');
            return formattedData(orderResult);
        } catch (err) {
            throw new APIError('Data not found');
        }
    }

    async CreateOrder(userId, order) {
        let result = {}
        try {
            await this.repository.CreateOrder(userId, order)
        } catch (e) {
            console.log(e)
            result.err = e
            throw new APIError('Move To Order', 500, e)
        }
        return result
        
    }


    // SubscribeEvents tidak dipakai lagi. Lgsg call ke service dari event_handler
    async SubscribeEvents(topic, value) {

        const parsedPayload = JSON.parse(value);

        const { userId, product, order, qty } = parsedPayload.data;

        switch(topic){
        case 'ADD_TO_CART':
            console.log('Menerima event ADD_TO_CART');
            this.ManageCart(userId, product, qty, false);
            break;
        case 'REMOVE_FROM_CART':
            console.log('Menerima event REMOVE_FROM_CART');
            this.ManageCart(userId, product, qty, true);
            break;
        case 'CREATE_ORDER':
            console.log('Menerima event CREATE_ORDER');
            this.ManageOrder(userId, order);
            break;
        default:
            break;
        }

    }
}

module.exports = UserService;
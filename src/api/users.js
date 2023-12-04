const UserService = require('../services/user-service');
const UserAuth = require('./middlewares/auth');
const logger = require('../utils/app-logger');

module.exports = async (app, userSvc) => {
    if (userSvc) {
        this.userSvc = userSvc;
    } else {
        this.userSvc = new UserService();
    }

    app.post('/user/signup', async (req, res) => {
        logger.info('API /user/signup is called');
        try {
            const { email, password } = req.body;

            const existingUser = await this.userSvc.getProfileByEmail(email);

            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User already exist',
                });
            }

            const { data } = await this.userSvc.signUp({ email, password });
            return res.json({
                status: 'success',
                message: 'success',
                data,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to signup',
            });
        }
    });

    app.post('/user/signin', async (req, res) => {
        logger.info('API /user/signup is called');
        try {
            const { email, password } = req.body;
            const { data } = await this.userSvc.signIn({ email, password });
            if (data?.err) {
                return res.status(data.code).json({
                    status: 'error',
                    message: data.err,
                });
            }
            return res.json({
                status: 'success',
                message: 'success',
                data,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: error?.message,
            });
        }
    });

    app.get('/user/profile', UserAuth, async (req, res, next) => {
        logger.info('API /user/profile is called');
        try {
            const { _id } = req.user;
            const { data } = await this.userSvc.getProfile({ _id });

            return res.json({
                status: 'success',
                message: 'success',
                data,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: error?.message,
            });
        }
    });

    app.get('/user/wishlist', UserAuth, async (req, res, next) => {
        logger.info('API /user/wishlist is called');
        try {
            const { _id } = req.user;
            const { data } = await this.userSvc.getWishlist({ _id });

            return res.json({
                status: 'success',
                message: 'success',
                data,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: error?.message,
            });
        }
    });
};

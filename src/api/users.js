const UserService = require('../services/user-service');
const UserAuth = require('./middlewares/auth');
const logger = require('./utils/app-logger');


module.exports = async (app, userSvc) => {
    
    if (userSvc) {
        this.userSvc = userSvc;
    } else {
        this.userSvc = new UserService();
    }

    app.post('/user/signup', async (req, res, next) => {
        logger.info('API /user/signup is called')
        try {
            const { email, password } = req.body;

            const existingUser = await this.userSvc.getProfileByEmail(email);

            if (existingUser) {
                logger.error('Failed registering user: user already exist')
                return res.status(400).json({message: 'User already exist'});
            }

            const { data } = await this.userSvc.signUp({ email, password });

            logger.info(`Success registering user`)

            return res.json(data);            
        } catch (error) {
            logger.error(`Failed signing up user: ${error}`)
            return res.status(500).json({error: error, message: 'Failed to signup'});
        }
    });

    app.post('/user/signin', async (req, res, next) => {
        logger.info('API /user/signup is called')
        try {
            const { email, password } = req.body;
            const { data } = await this.userSvc.signIn({ email, password });

            logger.info('Success signing in user');
            return res.json(data);
        } catch (error) {
            logger.error(`Failed signing in user: ${error}`)
            next(error);
        }
    });

    app.get('/user/profile', UserAuth, async (req, res, next) => {
        logger.info('API /user/profile is called')
        try {
            const { _id } = req.user;
            const { data } = await this.userSvc.getProfile({ _id });
    
            logger.info('Success retrieving user profile')
            return res.json(data);
        } catch (error) {
            logger.error(`Failed getting user profile: ${error}`)
            next(error);
        }
    });

};
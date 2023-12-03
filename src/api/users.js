const UserService = require('../services/user-service');
const UserAuth = require('./middlewares/auth');

module.exports = async (app, userSvc) => {
    
    if (userSvc) {
        this.userSvc = userSvc;
    } else {
        this.userSvc = new UserService();
    }

    app.post('/user/signup', async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const existingUser = await this.userSvc.getProfileByEmail(email);

            if (existingUser) {
                return res.status(400).json({message: 'User already exist'});
            }

            const { data } = await this.userSvc.signUp({ email, password });
            
            return res.json(data);
        } catch (error) {
            return res.status(500).json({error: error, message: 'Failed to signup'});
        }
    });

    app.post('/user/signin', async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { data } = await this.userSvc.signIn({ email, password });
            return res.json(data);
        } catch (error) {
            next(error);
        }
    });

    app.get('/user/profile', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await this.userSvc.getProfile({ _id });
    
            return res.json(data);
        } catch (error) {
            next(error);
        }
    });


    app.get('/user/wishlist', UserAuth, async (req, res, next) => {
        try {
            const { _id } = req.user;
            const { data } = await this.userSvc.getWishlist({ _id });

            return res.json(data);
        } catch (error) {
            next(error);
        }
    });
};
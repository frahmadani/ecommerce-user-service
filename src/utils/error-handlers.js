const { createLogger, transports } = require('winston');
const { AppError } = require('./app-errors');

const LogErrors = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app-error.log' })
    ]
});

class ErrorLogger {

    async logError(err) {
        console.log('=== Start Error Logger ===');
        LogErrors.log({
            private: true,
            level: 'error',
            message: `${new Date()}-${JSON.stringify(err)}`
        });
        console.log('=== End Error Logger ===');
    }

    isTrustedError(error) {
        if (error instanceof AppError) {

            return error.isOperational;
        } else {

            return false; 
        }
    }
}

const ErrorHandler = async (err, req, res, next) => {

    const errorLogger = new ErrorLogger();

    process.on('uncaughtException', (reason, promise) => {
        console.log(reason, 'UNHANDLED');
        return res.status(500).json({ status: 'error', 'message': reason});
    });

    process.on('uncaughtException', (error) => {
        errorLogger.logError(error);
        if (errorLogger.isTrustedError(error)) {
            // process need exit
        }


    });

    if (err) {
        await errorLogger.logError(err);

        if (errorLogger.isTrustedError(err)) {
            if (errorLogger.errorStack) {
                const errorDescription = err.errorStack;
                return res.status(err.statusCode).json({ 'message': errorDescription });
            }
            return res.status(err.statusCode).json({ status: 'error', 'message': err.message });
        } else {
            // process need exit
        }

        return res.status(err.statusCode).json({ status: 'error', 'message': err.message });
    }

    next();
};

module.exports = ErrorHandler;
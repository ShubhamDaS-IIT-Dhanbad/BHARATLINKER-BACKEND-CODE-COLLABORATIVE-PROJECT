const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        try {
            Promise.resolve(requestHandler(req, res, next)).catch(next);
        } catch (err) {
            next(err);
        }
    };
};

export { asyncHandler };

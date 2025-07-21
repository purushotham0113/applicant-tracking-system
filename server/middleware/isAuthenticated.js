// middleware/isAuthenticated.js
export const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

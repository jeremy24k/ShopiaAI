import supabase from '../supabase/supabase.js';

/**
 * Middleware that validates the Supabase JWT from the Authorization header.
 * On success, attaches the authenticated user to req.user.
 * On failure, returns 401 Unauthorized.
 */
export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Missing or invalid Authorization header'
            });
        }

        const token = authHeader.split(' ')[1];

        // Validate the token against Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid or expired token'
            });
        }

        // Attach user to request for downstream use
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error in auth middleware'
        });
    }
};

/**
 * Middleware that checks the authenticated user can only access their own resources.
 * Should be used after requireAuth.
 * Checks userId from body, params, or query against req.user.id.
 */
export const requireSameUser = (req, res, next) => {
    const userId = req.params.userId || req.body.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'Missing userId'
        });
    }

    if (req.user.id !== userId) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden: You can only access your own resources'
        });
    }

    next();
};

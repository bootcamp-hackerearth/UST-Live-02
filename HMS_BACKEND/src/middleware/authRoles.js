const authRoles = (allowedRoles) => {
    return (req, res, next) => {
        console.log("REQ USER:", req.user);
        console.log("ROLE FROM TOKEN:", req.user?.role);
        console.log("ALLOWED ROLES:", allowedRoles);
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            })
        };
        next();
    };
};

module.exports = authRoles;
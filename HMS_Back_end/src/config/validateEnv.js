// Fail fast on missing or weak critical env vars before the server accepts traffic
const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];

// HS256 needs a high-entropy secret; reject anything trivially brute-forceable
const MIN_JWT_SECRET_LENGTH = 32;

const validateEnv = () => {
    const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

    if (missing.length) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }

    if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
        throw new Error(
            `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`
        );
    }
};

module.exports = validateEnv;

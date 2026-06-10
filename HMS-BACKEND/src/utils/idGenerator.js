const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    5
);

const generateId = () => {
    return nanoid();
};
module.exports = generateId;
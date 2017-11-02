const parser = require('uuid-parse');

exports.parse = function (uuid) {
    let uuidBytes = Buffer.alloc(16);
    parser.parse(uuid, uuidBytes);
    uuidBytes = '0x' + uuidBytes.toString('hex');
    return uuidBytes;
}
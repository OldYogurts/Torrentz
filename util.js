'use strict';
import crypto from 'crypto'
let id = null;
export const getId = function () {
    if (!id) {
        id = crypto.default.randomBytes(20);
        Buffer.form('-OY0000-').copy(id, 0);
    }
    return id;
};

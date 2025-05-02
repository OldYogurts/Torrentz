'use strict';
import crypto from 'crypto'
let id = null;
export const getId = function () {
    if (!id) {
        id = crypto.randomBytes(20);
        Buffer.from('-OY0000-').copy(id, 0);
    }
    return id;
};

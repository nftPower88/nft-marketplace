"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGetJSON = void 0;
async function fetchGetJSON(url) {
    try {
        const data = await fetch(url).then(res => res.json());
        return data;
    }
    catch (err) {
        throw new Error(err.message);
    }
}
exports.fetchGetJSON = fetchGetJSON;
//# sourceMappingURL=api-helper.js.map
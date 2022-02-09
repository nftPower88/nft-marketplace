"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaplexModal = void 0;
const react_1 = __importDefault(require("react"));
const antd_1 = require("antd");
const MetaplexModal = (props) => {
    const { children, ...rest } = props;
    return (react_1.default.createElement(antd_1.Modal, { footer: null, width: 500, ...rest }, children));
};
exports.MetaplexModal = MetaplexModal;
//# sourceMappingURL=index.js.map
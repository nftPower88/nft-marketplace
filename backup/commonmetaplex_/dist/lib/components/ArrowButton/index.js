"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrowButton = void 0;
const RightOutlined_1 = __importDefault(require("@ant-design/icons/lib/icons/RightOutlined"));
const antd_1 = require("antd");
const react_1 = __importDefault(require("react"));
const ArrowButton = ({ children, ...props }) => {
    return (react_1.default.createElement(antd_1.Button, { ...props },
        react_1.default.createElement(antd_1.Row, null,
            children && react_1.default.createElement(antd_1.Col, { flex: "0 0 auto" }, children),
            react_1.default.createElement(antd_1.Col, { flex: "1 0 auto" }, "\u2002"),
            react_1.default.createElement(antd_1.Col, { flex: "0 0 auto" },
                react_1.default.createElement(RightOutlined_1.default, null)))));
};
exports.ArrowButton = ArrowButton;
//# sourceMappingURL=index.js.map
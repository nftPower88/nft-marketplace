"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeProgramChanges = void 0;
const utils_1 = require("../../utils");
const loadAccounts_1 = require("./loadAccounts");
const onChangeAccount_1 = require("./onChangeAccount");
const getEmptyMetaState_1 = require("./getEmptyMetaState");
const subscribeProgramChanges = (connection, patchState, ...args) => {
    const updateStateValue = (prop, key, value) => {
        const state = (0, getEmptyMetaState_1.getEmptyMetaState)();
        (0, loadAccounts_1.makeSetter)(state)(prop, key, value);
        patchState(state);
    };
    let listeners = args.map(({ programId, processAccount }) => {
        const listenerId = connection.onProgramAccountChange((0, utils_1.toPublicKey)(programId), (0, onChangeAccount_1.onChangeAccount)(processAccount, updateStateValue));
        console.log(`listening to program changes for ${programId} with listener ${listenerId}`);
        return listenerId;
    });
    return () => {
        listeners.forEach(subscriptionId => {
            console.log('ending subscription: ', subscriptionId);
            connection.removeProgramAccountChangeListener(subscriptionId);
        });
        listeners = [];
        console.log('All listeners closed', listeners.length);
    };
};
exports.subscribeProgramChanges = subscribeProgramChanges;
//# sourceMappingURL=subscribeProgramChanges.js.map
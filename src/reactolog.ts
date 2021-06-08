/*********************************
 File:       reactolog.js
 Function:   Does Reactotron logging
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn
 **********************************/

import Reactotron from 'reactotron-react-native';

export type ReactotronInstance = typeof Reactotron;

let reactotronInstance: ReactotronInstance

export const log = (message: object) => {
    if (reactotronInstance !== undefined) {
        reactotronInstance.log!(message);
    }
};

export const logImportant = (message: object) => {
    if (reactotronInstance !== undefined) {
        reactotronInstance.logImportant!(message);
    }
};

export const display = (message: object) => {
    if (reactotronInstance !== undefined) {
        reactotronInstance.display(message);
    }
};

// Pass in the configured reference
export const setReactotronInstance = (instance: typeof Reactotron) => reactotronInstance = instance;

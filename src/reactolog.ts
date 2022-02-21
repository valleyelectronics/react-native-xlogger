/*********************************
 File:       reactolog.js
 Function:   Does Reactotron logging
 Copyright:  Bertco LLC
 Date:       2022-02-21
 Author:     mkahn, chreck
 **********************************/

import Reactotron from "reactotron-react-native";
import { Message, ReactotronInstance } from "./types";

let reactotronInstance: ReactotronInstance | undefined;

export const log = (message: Message): void => {
  reactotronInstance?.log?.(message);
};

export const logImportant = (message: Message): void => {
  reactotronInstance?.logImportant?.(message);
};

export const display = (message: Message): void => {
  reactotronInstance?.display(message);
};

// Pass in the configured reference
export const setReactotronInstance = (
  instance: typeof Reactotron | undefined
): void => {
  reactotronInstance = instance;
};

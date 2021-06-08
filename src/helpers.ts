import {Message} from "./types";

export const isStringOrNumber = (message: Message) => (typeof message === 'string' || typeof message === 'number');

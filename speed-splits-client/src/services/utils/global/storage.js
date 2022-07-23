import { ArgumentNullError } from "./errors";

export default class Storage {
  static Keys = {
    CURRENT_SPLIT: { id: "currentSplit", temporary: true },
    CURRENT_TIME: { id: "currentTime", temporary: true },
    SPLITS: { id: "splits", temporary: true },
    STATUS: { id: "status", temporary: true },
    TIMESTAMP_REF: { id: "timestampRef", temporary: true },
    RECORDED_TIMES: { id: "recordedTimes", temporary: true },
    ERROR_LOG: { id: "errorLog", temporary: false },
    SETTINGS: { id: "settings", temporary: false },
    RUNS: { id: "runs", temporary: false },
    SELECTED_RUN: { id: "selectedRun", temporary: false },
  };

  static AddOrUpdate(name, item, useSerializer = true, allowNulls = true) {
    this.#log("addOrUpdate", name, item, "START");
    const key = this.#getKey(name);
    if (!allowNulls) ArgumentNullError.Guard("item", item);
    const value = useSerializer ? JSON.stringify(item) : item;
    const store = this.#getStore(key);
    store.setItem(key.id, value);
    this.#log("addOrUpdate", key.id, value, "END");
  }

  static Get(name, useDeserializer = true) {
    this.#log("getFromStorage", name, null, "START");
    const key = this.#getKey(name);
    const store = this.#getStore(key);
    const val = store.getItem(key.id);
    const value = useDeserializer && val ? JSON.parse(val) : val;
    this.#log("getFromStorage", key.id, value, "END");
    return value;
  }

  static Delete(name) {
    const key = this.#getKey(name);
    const store = this.#getStore(key);
    store.removeItem(key.id);
    this.#log("deleteSingle", key.id, null, "DELETED ITEM");
  }

  static DeleteAll(onlyTemp = true) {
    if (onlyTemp) {
      sessionStorage.clear();
      this.#log("deleteAll", null, null, "CLEARED TEMP");
      return;
    }
    for (const key in Storage.Keys) {
      const store = this.#getStore(key);
      store.removeItem(key.id);
      this.#log("deleteAll", key.id, null, "DELETED ITEM");
    }
  }

  /** A hashtable of found keys to boost performance on lookups. */
  static #foundKeys = {};

  static #getKey(name, ensureValid = true) {
    this.#log("getKey", name, null, "START");
    ArgumentNullError.Guard("name", name);
    let foundKey = this.#foundKeys[name];
    if (foundKey && foundKey.key.id === name) {
      foundKey.requestCount++;
      this.#log("getKey", name, foundKey, "FOUND IN HASH TABLE");
      return foundKey.key;
    }
    for (let storageKey in Storage.Keys) {
      const key = Storage.Keys[storageKey];
      if (key.id === name) {
        foundKey = key;
        this.#log("getKey", name, foundKey, "FOUND IN LOOP");
        break;
      }
    }
    if (ensureValid) ArgumentNullError.Guard("foundKey", foundKey);
    if (foundKey) this.#foundKeys[name] = { key: foundKey, requestCount: 1 };
    this.#log("getKey", name, this.#foundKeys[name], "END");
    return foundKey;
  }

  static #getStore(key) {
    return key.temporary ? sessionStorage : localStorage;
  }

  /** Set to true to enable logging. */
  static #logActions = false;

  /** If empty, will log for all actions, else will only log for the specified actions. */
  static #logForActions = [
    /* e.g "getKey", ...*/
  ];

  /** Helper function for debugging. */
  static #log(action, id, value, msg) {
    value = JSON.stringify(value);
    const reqCount = this.#foundKeys[id]?.requestCount || 0;
    const canLog =
      this.#logActions &&
      (!this.#logForActions.length ||
        this.#logForActions.some((val) => val === action));
    if (canLog)
      console.info(
        `(${id}) ${action} - msg: ${msg}, val: ${value}, requestCount: ${reqCount}`
      );
  }
}
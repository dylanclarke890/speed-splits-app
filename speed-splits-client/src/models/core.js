export const timerActions = {
  INITIALIZE: "initialize",
  START: "start",
  TICK: "tick",
  PAUSE_RESUME: "pauseResume",
  SPLIT: "split",
  UNDO: "undo",
  RESET: "reset",
  STOP: "stop",
};

export const timerStorageKeys = {
  CURRENT_SPLIT: "currentSplit",
  CURRENT_TIME: "currentTime",
  SPLITS: "splits",
  STATUS: "status",
};

export const timerStatus = {
  INITIAL: "initial",
  RUNNING: "running",
  PAUSED: "paused",
  STOPPED: "stopped",
};

export class Split {
  constructor(title, time, order) {
    this.title = title || order;
    this.time = time;
    this.order = order;
  }
}

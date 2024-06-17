import { getLocalStorage, setLocalStorage } from "../utils/storage-helpers";
import { Logger } from "../logger/logger";
import { MAX_QUEUE_SIZE } from "../constants";

export async function insertInQueue(dataPacket: any, BATCH_execution: boolean) {
  return new Promise((resolve) => {
    let queueKey = BATCH_execution ? "queue_batch" : "queue";
    getLocalStorage(queueKey).then((result) => {
      if (result === undefined || !result.hasOwnProperty(queueKey))
        result = { [queueKey]: [] };
      let queue = result[queueKey];
      if (queue.length > MAX_QUEUE_SIZE) {
        // ignore this packet
        Logger.log("[🌐] : queue is full. Ignoring this packet");
        resolve(false);
      } else {
        queue.push(dataPacket);
        setLocalStorage(queueKey, queue).then(() => {
          resolve(true);
        });
      }
    });
  });
}

// Get last from queue (by shifting. Not optimized, but it's kind of ok because n is small)
export async function getLastFromQueue(BATCH_execution: boolean): Promise<{
  url: string;
  recordID: string;
  eventData: any;
  waitForElement: string;
  shouldSandbox: boolean;
  sandBoxAttributes: string;
  triggerDownload: boolean;
  skipHeaders: boolean;
  hostname: string;
  htmlVisualizer: boolean;
}> {
  return new Promise((resolve) => {
    let queueKey = BATCH_execution ? "queue_batch" : "queue";
    getLocalStorage(queueKey).then((result) => {
      if (result === undefined || !result.hasOwnProperty(queueKey))
        result = { [queueKey]: [] };
      let queue = result[queueKey];
      if (queue.length === 0)
        return resolve({
          url: "",
          recordID: "0123",
          eventData: {},
          waitForElement: "none",
          shouldSandbox: false,
          sandBoxAttributes: "",
          triggerDownload: false,
          skipHeaders: false,
          hostname: "",
          htmlVisualizer: false,
        });
      let last = queue.shift();
      setLocalStorage(queueKey, queue).then(() => {
        resolve(last);
      });
    });
  });
}

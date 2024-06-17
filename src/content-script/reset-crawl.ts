import { getLastFromQueue } from "./queue-crawl";
import {
  LIFESPAN_IFRAME,
  MAX_PARALLEL_EXECUTIONS,
  MAX_PARALLEL_EXECUTIONS_BATCH,
} from "../constants";
import { proceedWithActivation } from "./execute-crawl";
import { getFrameCount } from "../utils/utils";
import { enableXFrameHeaders } from "../utils/dnr-helpers";
import { Logger } from "../logger/logger";
import { resetTriggersDownload } from "../utils/triggers-download-helpers";

export async function resetAfterCrawl(
  recordID: string,
  BATCH_execution: boolean,
) {
  let dataPacket = await getLastFromQueue(BATCH_execution);
  if (dataPacket && dataPacket.url !== "") {
    let frameCount = getFrameCount(BATCH_execution);
    Logger.log("[🌐] : frameCount in cleanUpAfterCrawl  => " + frameCount);
    let max_parallel_executions = BATCH_execution
      ? MAX_PARALLEL_EXECUTIONS_BATCH
      : MAX_PARALLEL_EXECUTIONS;
    if (frameCount <= max_parallel_executions || BATCH_execution) {
      Logger.log("[🌐] getLastFromQueue : dataPacket => ");
      Logger.log(dataPacket);
      await proceedWithActivation(
        dataPacket.url,
        dataPacket.recordID,
        dataPacket.eventData,
        dataPacket.waitForElement,
        dataPacket.shouldSandbox,
        dataPacket.sandBoxAttributes,
        BATCH_execution,
        dataPacket.triggerDownload,
        dataPacket.skipHeaders,
        dataPacket.hostname,
        dataPacket.htmlVisualizer,
      );
    }
  } else {
    /*setTimeout(() => {
      let frameCount = getFrameCount(BATCH_execution);
      let frameCountOther = getFrameCount(!BATCH_execution);
      let frameCountTotal = frameCount + frameCountOther;
      Logger.log(
        "[🌐] : frameCountTotal in cleanUpAfterCrawl (before resetting headers)  => " +
          frameCountTotal,
      );
      if (frameCountTotal === 0 && !BATCH_execution) {
        Logger.log("[🌐] : Resetting headers!");
        enableXFrameHeaders("");
        resetTriggersDownload();
      } else if (frameCountTotal === 0 && BATCH_execution) {
        // wait for 1 minute before resetting headers
        setTimeout(() => {
          Logger.log("[🌐] : Resetting headers (BATCH_execution)!");
          enableXFrameHeaders("");
          resetTriggersDownload();
        }, 60000);
      } /* else {
        resetAfterCrawl(recordID, BATCH_execution);
      }/
    }, 15000);*/
  }
}

export function setLifespanForIframe(
  recordID: string,
  waitBeforeScraping: number,
  BATCH_execution: boolean,
) {
  Logger.log(
    "Setting lifespan for iframe => " +
      (LIFESPAN_IFRAME + waitBeforeScraping) +
      " ms. RecordID => " +
      recordID,
  );
  setTimeout(async () => {
    let iframe = document.getElementById(recordID);
    if (iframe) iframe.remove();
    await resetAfterCrawl(recordID, BATCH_execution);
  }, LIFESPAN_IFRAME + waitBeforeScraping);
}

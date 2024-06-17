import WebSocket from "isomorphic-ws";
import { MELLOWTEL_VERSION, REFRESH_INTERVAL } from "../constants";
import { preProcessCrawl } from "./execute-crawl";
import {
  getSharedMemory,
  removeSharedMemory,
  setSharedMemory,
} from "./shared-memory";
import { isMellowtelStarted } from "../utils/start-stop-helpers";
import { RateLimiter } from "../local-rate-limiting/rate-limiter";
import { Logger } from "../logger/logger";
import { setLocalStorage, getLocalStorage } from "../utils/storage-helpers";
import { getChromeExtensionIdentifier } from "../utils/identity-helpers";
import { MeasureConnectionSpeed } from "../utils/measure-connection-speed";

const ws_url: string =
  "wss://7joy2r59rf.execute-api.us-east-1.amazonaws.com/production/";

export async function startConnectionWs(identifier: string): WebSocket {
  await getSharedMemory("webSocketConnectedMellowtel").then(
    async (response) => {
      if (!response) {
        let LIMIT_REACHED: boolean = await RateLimiter.getIfRateLimitReached();
        if (LIMIT_REACHED) {
          Logger.log(`[🌐]: Rate limit, not connecting to websocket`);
          let { timestamp, count } = await RateLimiter.getRateLimitData();
          let now: number = Date.now();
          let timeElapsed = RateLimiter.calculateElapsedTime(now, timestamp);
          Logger.log(`[🌐]: Time elapsed since last request: ${timeElapsed}`);
          if (timeElapsed > REFRESH_INTERVAL) {
            Logger.log(
              `[🌐]: Time elapsed is greater than REFRESH_INTERVAL, resetting rate limit data`,
            );
            await setLocalStorage("mllwtl_rate_limit_reached", false);
            await RateLimiter.resetRateLimitData(now, false);
            startConnectionWs(identifier);
          }
        } else {
          const chrome_identifier: string =
            await getChromeExtensionIdentifier();
          const speedMpbs: number = await MeasureConnectionSpeed();
          Logger.log(`[🌐]: Connection speed: ${speedMpbs} Mbps`);
          const ws = new WebSocket(
            `${ws_url}?node_id=${identifier}&version=${MELLOWTEL_VERSION}&chrome_id=${chrome_identifier}&speedMbps=${speedMpbs}`,
          );

          ws.onopen = function open() {
            setSharedMemory("webSocketConnectedMellowtel", "true");
            Logger.log(
              `[🌐]: connected with node_id= ${identifier} and version= ${MELLOWTEL_VERSION}`,
            );
          };

          ws.onclose = async function close() {
            removeSharedMemory("webSocketConnectedMellowtel");
            if (await isMellowtelStarted()) {
              startConnectionWs(identifier);
            }
          };

          ws.onmessage = async function incoming(data: any) {
            if (await isMellowtelStarted()) {
              data = JSON.parse(data.data);
              if (
                data.hasOwnProperty("type_event") &&
                data.type_event === "heartbeat"
              ) {
                return;
              }

              // Check if the request is a POST request
              // So we can override the rate limit for POST requests
              let POST_request = false;
              if (data.hasOwnProperty("method") && data.method === "POST") {
                POST_request = true;
              }

              let BATCH_execution = false;
              let batch_id = "";
              if (
                data.hasOwnProperty("type_event") &&
                data.type_event === "batch"
              ) {
                BATCH_execution = true;
                batch_id = data.batch_id;
              }

              let htmlVisualizer = false;
              if (data.hasOwnProperty("htmlVisualizer")) {
                htmlVisualizer =
                  data.htmlVisualizer.toString().toLowerCase() === "true";
              }
              if (htmlVisualizer) {
                await preProcessCrawl(
                  data,
                  POST_request,
                  BATCH_execution,
                  batch_id,
                );
              }
            }
          };
          return ws;
        }
      }
    },
  );
}

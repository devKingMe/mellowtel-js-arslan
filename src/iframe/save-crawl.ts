import { tellToDeleteIframe } from "./message-background";
import { getIdentifier } from "../utils/identity-helpers";
import { Logger } from "../logger/logger";

export function saveCrawl(
  recordID: string,
  content: string,
  markDown: string,
  fastLane: boolean,
  url: string,
  htmlTransformer: string,
  orgId: string,
  saveText: string,
  BATCH_execution: boolean,
  batch_id: string,
) {
  // Logger.log("📋 Saving Crawl 📋");
  // Logger.log("RecordID:", recordID);
  const endpoint: string =
    "https://afcha2nmzsir4rr4zbta4tyy6e0fxjix.lambda-url.us-east-1.on.aws/";
  return tellToDeleteIframe(recordID, BATCH_execution);
  /*getIdentifier().then((node_identifier: string) => {
    Logger.log("Node Identifier:", node_identifier);
    const bodyData = {
      content: content,
      markDown: markDown,
      recordID: recordID,
      fastLane: fastLane,
      url: url,
      htmlTransformer: htmlTransformer,
      orgId: orgId,
      saveText: saveText,
      node_identifier: node_identifier,
      BATCH_execution: BATCH_execution,
      batch_id: batch_id,
      final_url: window.location.href,
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(bodyData),
    };

    Logger.log("Sending data to server:", bodyData);

    fetch(endpoint, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        Logger.log("Response from server:", data);
        return tellToDeleteIframe(recordID, BATCH_execution);
      })
      .catch((error) => {
        Logger.error("Error:", error);
        return tellToDeleteIframe(recordID, BATCH_execution);
      });
  });*/
}

export function saveHTMLVisualizer(
  recordID: string,
  base64: string,
  fastLane: boolean,
  url: string,
  htmlTransformer: string,
  orgId: string
) {
  return new Promise((resolve) => {
    Logger.log("📋 Saving HTML Visualizer 📋");
    const endpoint: string =
      "https://undj6uy4bmkkzyesswtqqeaun40oscby.lambda-url.us-east-1.on.aws/";

    Logger.log("ENDPOINT:", endpoint);
    const bodyData = {
      recordID: recordID,
      base64Image: base64,
      fastLane: fastLane,
      url: url,
      htmlTransformer: htmlTransformer,
      orgId: orgId,
      final_url: window.location.href,
    };
    Logger.log("[saveHTMLVisualizer] : Sending data to server =>");
    Logger.log(bodyData);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(bodyData),
    };

    fetch(endpoint, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "[saveHTMLVisualizer]: Network response was not ok",
          );
        }
        return response.json();
      })
      .then((data) => {
        Logger.log("[saveHTMLVisualizer] : Response from server:", data);
        resolve(data);
      })
      .catch((error) => {
        Logger.error("[saveHTMLVisualizer]: Error:", error);
        resolve(error);
      });
  });
}

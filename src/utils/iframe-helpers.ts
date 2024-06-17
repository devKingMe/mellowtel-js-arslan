export function injectHiddenIFrame(
  url: string,
  id: string,
  onload = function () {},
  width = "500px",
  data_id = "",
  should_sandbox = false,
  sandbox_attributes = "",
  htmlVisualizer = false,
) {
  let iframe: HTMLIFrameElement = document.createElement("iframe");
  iframe.id = id;
  // credentialles iframe to avoid leaking cookies & session data
  // https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless
  // Experimental feature, not supported by all browsers
  // @ts-ignore
  iframe.credentialless = true;

  if (htmlVisualizer) {
    iframe.style.position = "fixed"; // Ensures the iframe stays in place during scrolling
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100vh"; // 100% of the viewport height
    iframe.style.border = "none";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.height = "100%"; // Ensures the body can use full height
    document.body.style.height = "100%";
  } else {
    iframe.style.width = width;
    iframe.style.height = "200px";
    iframe.style.display = "none";
  }
  if (should_sandbox) {
    iframe.setAttribute("sandbox", "");
    if (sandbox_attributes !== "")
      iframe.setAttribute("sandbox", sandbox_attributes);
  }
  if (data_id !== "") iframe.setAttribute("data-id", data_id);
  iframe.src = url;
  iframe.onload = onload;
  document.body.prepend(iframe);
}

export function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

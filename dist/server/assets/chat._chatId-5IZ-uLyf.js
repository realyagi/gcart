import { U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { d as useParams } from "./router-9anDnhe5.js";
import { C as ChatView } from "./ChatView-f0xG2X21.js";
import { A as AppShell } from "./AppShell-CudvrAJZ.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-BDktm6KA.js";
import "./chevron-down-Ijtn5d56.js";
import "./index-DcQnUcEA.js";
function ChatPage() {
  const {
    chatId
  } = useParams({
    from: "/chat/$chatId"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatView, { chatId }, chatId) });
}
export {
  ChatPage as component
};

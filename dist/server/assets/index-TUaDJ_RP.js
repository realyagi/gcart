import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { u as useAuth, a as useNavigate } from "./router-9anDnhe5.js";
import { C as ChatView } from "./ChatView-f0xG2X21.js";
import { A as AppShell } from "./AppShell-CudvrAJZ.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-BDktm6KA.js";
import "./chevron-down-Ijtn5d56.js";
import "./index-DcQnUcEA.js";
function Index() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/auth"
      });
    }
  }, [loading, user, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatView, { chatId: null }) });
}
export {
  Index as component
};

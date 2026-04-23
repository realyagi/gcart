import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { s as supabase, u as useAuth, a as useNavigate, L as Link, t as toast } from "./router-9anDnhe5.js";
import { c as createLucideIcon, b as createSlot, a as cn, d as cva, m as motion, L as Logo, B as Button } from "./button-BDktm6KA.js";
import { I as Input } from "./input-csY8WOYh.js";
import { L as LoaderCircle } from "./loader-circle-D6s8uwX8.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
      key: "tonef"
    }
  ],
  ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }]
];
const Github = createLucideIcon("github", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$1);
const __iconNode = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode);
var EXPECTED_MESSAGE_TYPE = "authorization_response";
var DEFAULT_OAUTH_BROKER_URL = "/~oauth/initiate";
var DEFAULT_SUPPORTED_OAUTH_ORIGINS = ["https://oauth.lovable.app", "https://lovable.dev"];
var DEFAULT_MOBILE_DEEP_LINK_REDIRECT_URI = "lovable://oauth-callback";
var DEFAULT_DESKTOP_LOCALHOST_REDIRECT_URI = "http://127.0.0.1/iframe-oauth/callback";
var POPUP_CHECK_INTERVAL_MS = 500;
var IFRAME_FALLBACK_TIMEOUT_MS = 12e4;
function startWebMessageListener(supportedOrigins) {
  let resolvePromise;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });
  const callback = (e) => {
    const isValidOrigin = supportedOrigins.some((origin) => e.origin === origin);
    if (!isValidOrigin) {
      return;
    }
    const data = e.data;
    if (!data || typeof data !== "object") {
      return;
    }
    if (data.type !== EXPECTED_MESSAGE_TYPE) {
      return;
    }
    resolvePromise(data.response);
  };
  const cleanup = () => {
    window.removeEventListener("message", callback);
  };
  window.addEventListener("message", callback);
  return {
    cleanup,
    messagePromise: promise
  };
}
function getPopupDimensions(isInIframe) {
  const hasBrowserPosition = window.screenX !== 0 || window.screenY !== 0 || !isInIframe;
  const width = hasBrowserPosition ? window.outerWidth * 0.5 : window.screen.width * 0.5;
  const height = hasBrowserPosition ? window.outerHeight * 0.5 : window.screen.height * 0.5;
  const left = hasBrowserPosition ? window.screenX + (window.outerWidth - width) / 2 : (window.screen.width - width) / 2;
  const top = hasBrowserPosition ? window.screenY + (window.outerHeight - height) / 2 : (window.screen.height - height) / 2;
  return { width, height, left, top };
}
function processOAuthResponse(data, expectedState) {
  if (data.state !== expectedState) {
    return { error: new Error("State is invalid") };
  }
  if (data.error) {
    if (data.error === "legacy_flow") {
      return {
        error: new Error("This flow is not supported in Preview mode. Please open the app in a new tab to sign in.")
      };
    }
    return { error: new Error(data.error_description ?? "Sign in failed") };
  }
  if (!data.access_token || !data.refresh_token) {
    return { error: new Error("No tokens received") };
  }
  return {
    tokens: { access_token: data.access_token, refresh_token: data.refresh_token },
    error: null
  };
}
function isDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua))
    return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
    return true;
  return false;
}
function generateState() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
function createAuth(config = {}) {
  const oauthBrokerUrl = config.oauthBrokerUrl ?? DEFAULT_OAUTH_BROKER_URL;
  const supportedOAuthOrigins = config.supportedOAuthOrigins ?? DEFAULT_SUPPORTED_OAUTH_ORIGINS;
  async function signInWithOAuth(provider, opts = {}) {
    let isInIframe = false;
    try {
      isInIframe = window.self !== window.top;
    } catch {
      isInIframe = true;
    }
    const ua = navigator.userAgent;
    const isMobileApp = /LovableApp\//.test(ua);
    const isDesktopApp = !isMobileApp && /lovable/i.test(ua);
    const state = generateState();
    let redirectUri = opts.redirect_uri ?? window.location.origin;
    if (isMobileApp && isInIframe) {
      redirectUri = DEFAULT_MOBILE_DEEP_LINK_REDIRECT_URI;
    } else if (isDesktopApp && isInIframe) {
      redirectUri = DEFAULT_DESKTOP_LOCALHOST_REDIRECT_URI;
    }
    const params = new URLSearchParams({
      ...opts.extraParams,
      provider,
      redirect_uri: redirectUri,
      state
    });
    if (!isInIframe) {
      window.location.href = `${oauthBrokerUrl}?${params.toString()}`;
      return { error: null, redirected: true };
    }
    if (!isMobileApp && !isDesktopApp) {
      params.set("response_mode", "web_message");
    }
    const url = `${oauthBrokerUrl}?${params.toString()}`;
    const effectiveOrigins = isDesktopApp ? [...supportedOAuthOrigins, window.location.origin] : supportedOAuthOrigins;
    const { messagePromise, cleanup } = startWebMessageListener(effectiveOrigins);
    let popup;
    if (isDevice()) {
      popup = window.open(url, "_blank");
    } else {
      const { width, height, left, top } = getPopupDimensions(isInIframe);
      popup = window.open(url, "oauth", `width=${width},height=${height},left=${left},top=${top}`);
    }
    if (!popup && (isMobileApp || isDesktopApp)) {
      let webViewTimeoutId;
      const webViewTimeoutPromise = new Promise((_, reject) => {
        webViewTimeoutId = setTimeout(() => {
          reject(new Error("OAuth timed out waiting for response"));
        }, IFRAME_FALLBACK_TIMEOUT_MS);
      });
      try {
        const data = await Promise.race([messagePromise, webViewTimeoutPromise]);
        return processOAuthResponse(data, state);
      } catch (error) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      } finally {
        if (webViewTimeoutId)
          clearTimeout(webViewTimeoutId);
        cleanup();
      }
    }
    if (!popup) {
      cleanup();
      return { error: new Error("Popup was blocked") };
    }
    let popupCheckInterval;
    const popupClosedPromise = new Promise((_, reject) => {
      popupCheckInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval);
          reject(new Error("Sign in was cancelled"));
        }
      }, POPUP_CHECK_INTERVAL_MS);
    });
    try {
      const data = await Promise.race([messagePromise, popupClosedPromise]);
      return processOAuthResponse(data, state);
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error(String(error))
      };
    } finally {
      clearInterval(popupCheckInterval);
      cleanup();
      popup?.close();
    }
  }
  return {
    signInWithOAuth
  };
}
var package_default = {
  version: "1.1.1"
};
if (typeof window !== "undefined") {
  window.__lovable_cloud_auth_js_version = package_default.version;
}
function createLovableAuth(config = {}) {
  return createAuth(config);
}
const lovableAuth = createLovableAuth();
const lovable = {
  auth: {
    signInWithOAuth: async (provider, opts) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams
        }
      });
      if (result.redirected) {
        return result;
      }
      if (result.error) {
        return result;
      }
      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    }
  }
};
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node = reactExports.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
var NAME = "Label";
var Label$1 = reactExports.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        props.onMouseDown?.(event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label$1.displayName = NAME;
var Root = Label$1;
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root.displayName;
function AuthPage() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!authLoading && user) navigate({
      to: "/"
    });
  }, [user, authLoading, navigate]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: name || email.split("@")[0]
            }
          }
        });
        if (error) throw error;
        toast.success("Account created! You're signed in.");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  const oauth = async (provider) => {
    if (provider === "google") {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({
        to: "/"
      });
      return;
    }
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) toast.error(`GitHub sign-in: ${error.message}. Enable GitHub provider in Backend → Auth.`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh flex items-center justify-center px-4 gradient-mesh-bg relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-pulse", style: {
      animationDelay: "1s"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      y: 24,
      scale: 0.96
    }, animate: {
      opacity: 1,
      y: 0,
      scale: 1
    }, transition: {
      type: "spring",
      damping: 22,
      stiffness: 240
    }, className: "w-full max-w-md relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong glass-shadow rounded-3xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 justify-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-10 w-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display font-bold text-xl", children: [
          "GG",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Cart" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-center mb-1", children: mode === "signin" ? "Welcome back" : "Create your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center mb-6", children: mode === "signin" ? "Sign in to continue to GGCart AI" : "Get 10 free credits to start" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "glass border-border hover:bg-secondary", onClick: () => oauth("google"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4 mr-2", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
          ] }),
          "Google"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "glass border-border hover:bg-secondary", onClick: () => oauth("github"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-4 w-4 mr-2" }),
          "GitHub"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t border-border" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-[10px] uppercase tracking-wider", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-card/50 px-2 text-muted-foreground", children: "or with email" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", className: "text-xs", children: "Display name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name", className: "bg-input/50 border-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-xs", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "bg-input/50 border-border pl-9" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-xs", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "bg-input/50 border-border pl-9" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 mt-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : mode === "signin" ? "Sign in" : "Create account" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-center text-muted-foreground mt-5", children: [
        mode === "signin" ? "New here?" : "Already have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode(mode === "signin" ? "signup" : "signin"), className: "text-primary hover:underline font-medium", children: mode === "signin" ? "Create an account" : "Sign in" })
      ] })
    ] }) })
  ] });
}
export {
  AuthPage as component
};

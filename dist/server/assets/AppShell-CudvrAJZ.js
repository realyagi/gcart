import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { u as useAuth, a as useNavigate, d as useParams, s as supabase, L as Link } from "./router-9anDnhe5.js";
import { M as MotionConfigContext, i as isHTMLElement, f as useConstant, P as PresenceContext, g as usePresence, h as useIsomorphicLayoutEffect, j as LayoutGroupContext, c as createLucideIcon, m as motion, L as Logo, a as cn, B as Button } from "./button-BDktm6KA.js";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = children.props?.ref ?? children?.ref;
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      ref.current?.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender?.();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && safeToRemove?.();
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const __iconNode$j = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$j);
const __iconNode$i = [
  ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
  ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
  ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
];
const CodeXml = createLucideIcon("code-xml", __iconNode$i);
const __iconNode$h = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
];
const Ellipsis = createLucideIcon("ellipsis", __iconNode$h);
const __iconNode$g = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$g);
const __iconNode$f = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M7 3v18", key: "bbkbws" }],
  ["path", { d: "M3 7.5h4", key: "zfgn84" }],
  ["path", { d: "M3 12h18", key: "1i2n21" }],
  ["path", { d: "M3 16.5h4", key: "1230mu" }],
  ["path", { d: "M17 3v18", key: "in4fa5" }],
  ["path", { d: "M17 7.5h4", key: "myr1c1" }],
  ["path", { d: "M17 16.5h4", key: "go4c1d" }]
];
const Film = createLucideIcon("film", __iconNode$f);
const __iconNode$e = [
  [
    "path",
    {
      d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z",
      key: "1fr9dc"
    }
  ],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M12 10v2", key: "hh53o1" }],
  ["path", { d: "M16 10v6", key: "1d6xys" }]
];
const FolderKanban = createLucideIcon("folder-kanban", __iconNode$e);
const __iconNode$d = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  ["path", { d: "M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8", key: "1sqzm4" }],
  [
    "path",
    { d: "M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5", key: "kc0143" }
  ],
  ["rect", { x: "3", y: "7", width: "18", height: "4", rx: "1", key: "1hberx" }]
];
const Gift = createLucideIcon("gift", __iconNode$d);
const __iconNode$c = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$c);
const __iconNode$b = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
const LayoutGrid = createLucideIcon("layout-grid", __iconNode$b);
const __iconNode$a = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$a);
const __iconNode$9 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$9);
const __iconNode$8 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ["path", { d: "m16 15-3-3 3-3", key: "14y99z" }]
];
const PanelLeftClose = createLucideIcon("panel-left-close", __iconNode$8);
const __iconNode$7 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ["path", { d: "m14 9 3 3-3 3", key: "8010ee" }]
];
const PanelLeftOpen = createLucideIcon("panel-left-open", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999", key: "1lw9ds" }],
  [
    "path",
    {
      d: "M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024",
      key: "ffj4ej"
    }
  ],
  [
    "path",
    {
      d: "M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069",
      key: "8tj4zw"
    }
  ],
  [
    "path",
    {
      d: "M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z",
      key: "hh6h97"
    }
  ]
];
const Pickaxe = createLucideIcon("pickaxe", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode$5);
const __iconNode$4 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
const Shield = createLucideIcon("shield", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
      key: "1s2grr"
    }
  ],
  ["path", { d: "M20 2v4", key: "1rf3ol" }],
  ["path", { d: "M22 4h-4", key: "gwowj6" }],
  ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44",
      key: "k4qptu"
    }
  ],
  ["path", { d: "m13.56 11.747 4.332-.924", key: "19l80z" }],
  ["path", { d: "m16 21-3.105-6.21", key: "7oh9d" }],
  [
    "path",
    {
      d: "M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z",
      key: "m7xp4m"
    }
  ],
  ["path", { d: "m6.158 8.633 1.114 4.456", key: "74o979" }],
  ["path", { d: "m8 21 3.105-6.21", key: "1fvxut" }],
  ["circle", { cx: "12", cy: "13", r: "2", key: "1c1ljs" }]
];
const Telescope = createLucideIcon("telescope", __iconNode$1);
const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);
function Sidebar({
  collapsed,
  onToggle
}) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const [chats, setChats] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [moreOpen, setMoreOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("chats").select("id,title,updated_at").order("updated_at", { ascending: false });
      if (data) setChats(data);
    };
    load();
    const channel = supabase.channel(`chats-${user.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chats", filter: `user_id=eq.${user.id}` },
      load
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  const filtered = chats.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase())
  );
  const newChat = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("chats").insert({ user_id: user.id, title: "New chat" }).select("id").single();
    if (data && !error) navigate({ to: "/chat/$chatId", params: { chatId: data.id } });
  };
  const moreItems = [
    { icon: Image, label: "Image Studio", to: "/image" },
    { icon: Film, label: "Video Studio", to: "/video" },
    { icon: Telescope, label: "Deep Search", to: "/research" },
    { icon: LayoutGrid, label: "Apps", to: "/apps", badge: "BETA" },
    { icon: Pickaxe, label: "Plugin/Mod", to: "/minecraft" },
    { icon: Sparkles, label: "Pricing", to: "/pricing" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.aside,
    {
      initial: false,
      animate: { width: collapsed ? 64 : 280 },
      transition: { type: "spring", damping: 28, stiffness: 280 },
      className: "fixed left-0 top-0 z-40 h-dvh bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 h-14 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-8 w-8 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.span,
              {
                initial: { opacity: 0, width: 0 },
                animate: { opacity: 1, width: "auto" },
                exit: { opacity: 0, width: 0 },
                className: "font-display font-bold text-base whitespace-nowrap",
                children: [
                  "GG",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Cart" })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onToggle,
              className: "text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-sidebar-accent",
              "aria-label": "Toggle sidebar",
              children: collapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeftOpen, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeftClose, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarBtn, { icon: SquarePen, label: "New Chat", collapsed, onClick: newChat, highlight: true }),
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Search chats",
                className: "w-full bg-sidebar-accent/40 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarBtn, { icon: FolderKanban, label: "Projects", collapsed, to: "/codeit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarBtn, { icon: CodeXml, label: "Codeit Builder", collapsed, to: "/codeit", badge: "LIVE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SidebarBtn,
            {
              icon: Ellipsis,
              label: "More",
              collapsed,
              onClick: () => setMoreOpen((v) => !v),
              active: moreOpen
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: !collapsed && moreOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "overflow-hidden pl-3",
              children: moreItems.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                SidebarBtn,
                {
                  icon: it.icon,
                  label: it.label,
                  collapsed: false,
                  to: it.to,
                  badge: it.badge,
                  small: true
                },
                it.label
              ))
            }
          ) }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SidebarBtn,
            {
              icon: Shield,
              label: "Admin Access",
              collapsed,
              to: "/admin",
              adminGlow: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-2 mt-2", children: [
          !collapsed && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2 font-semibold", children: "Recent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: filtered.map((c) => {
            const active = params.chatId === c.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/chat/$chatId",
                params: { chatId: c.id },
                className: cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all group",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5 shrink-0 opacity-70" }),
                  !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.title })
                ]
              },
              c.id
            );
          }) })
        ] }),
        user && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-sidebar-border p-2 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group cursor-pointer"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 shadow-md", children: (profile?.display_name || profile?.email || "?")[0]?.toUpperCase() }),
              !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium truncate", children: profile?.display_name || profile?.email?.split("@")[0] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
                    profile?.plan?.toUpperCase() || "FREE",
                    " · ",
                    profile?.credits ?? 0,
                    " credits"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: signOut,
                    className: "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-sidebar-accent",
                    "aria-label": "Sign out",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" })
                  }
                )
              ] })
            ]
          }
        ) })
      ]
    }
  );
}
function SidebarBtn({
  icon: Icon,
  label,
  collapsed,
  onClick,
  to,
  active,
  highlight,
  adminGlow,
  badge,
  small
}) {
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex items-center gap-2.5 rounded-lg transition-all w-full",
        small ? "px-2.5 py-1.5 text-xs" : "px-2.5 py-2 text-sm",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        highlight && "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-foreground",
        adminGlow && "bg-gradient-to-r from-amber-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-pink-500/20 text-foreground"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("shrink-0", small ? "h-3.5 w-3.5" : "h-4 w-4") }),
        !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-left", children: label }),
        !collapsed && badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
          "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
          badge === "LIVE" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
          badge === "BETA" && "bg-purple-500/20 text-purple-300 border border-purple-500/30",
          badge === "LOCKED" && "bg-muted text-muted-foreground",
          badge === "SOON" && "bg-muted text-muted-foreground",
          !["LIVE", "BETA", "LOCKED", "SOON"].includes(badge) && "bg-gradient-to-r from-primary to-accent text-primary-foreground"
        ), children: badge })
      ]
    }
  );
  if (to) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: "block", children: inner });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: "block w-full", children: inner });
}
const DISCORD_URL = "https://discord.gg/785G7nCPY7";
function UpgradeBanner() {
  const { profile } = useAuth();
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const show = () => setOpen(true);
    const initial = setTimeout(show, 90 * 1e3);
    const interval = setInterval(show, 5 * 60 * 1e3);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);
  if (profile && (profile.plan === "pro" || profile.plan === "business")) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 40, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { type: "spring", damping: 22, stiffness: 280 },
      className: "fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-2rem))]",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong glass-shadow rounded-2xl p-5 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-30 gradient-mesh-bg pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setOpen(false),
            className: "absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-base", children: "Need more credits?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4 leading-relaxed", children: "PRO ₹99/mo gets you 119 credits. BUSINESS ₹299/mo for 770 credits. Upgrade in our Discord." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/pricing", onClick: () => setOpen(false), children: "View Plans" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "flex-1 glass border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: DISCORD_URL, target: "_blank", rel: "noopener noreferrer", children: [
              "Discord ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "ml-1.5 h-3 w-3" })
            ] }) })
          ] })
        ] })
      ] })
    }
  ) });
}
const DISCORD = "https://discord.gg/785G7nCPY7";
const STORAGE_KEY = "ggcart_welcome_seen_v1";
function WelcomePopup() {
  const { user, profile } = useAuth();
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user || !profile) return;
    try {
      const seen = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (!seen) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
    }
  }, [user, profile]);
  const close = () => {
    setOpen(false);
    if (user) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
      } catch {
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4",
      onClick: close,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 24, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 16, scale: 0.95 },
          transition: { type: "spring", damping: 24, stiffness: 280 },
          onClick: (e) => e.stopPropagation(),
          className: "w-full max-w-md glass-strong glass-shadow rounded-3xl p-6 relative overflow-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/30 blur-3xl pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent/30 blur-3xl pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: close,
                className: "absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent z-10",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { scale: 0, rotate: -45 },
                  animate: { scale: 1, rotate: 0 },
                  transition: { type: "spring", damping: 12, stiffness: 200, delay: 0.1 },
                  className: "h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/40",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-7 w-7 text-primary-foreground" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-bold mb-2", children: [
                "You got ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "gradient-text", children: [
                  profile?.credits ?? 10,
                  " FREE credits"
                ] }),
                " 🎉"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-5 leading-relaxed", children: [
                "Welcome to ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "Codeit by ggcart" }),
                "! Use them to try Chat, Image Studio, Deep Search, and the new Codeit Builder. For more credits, grab a plan or join our Discord."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-1.5 mb-5 text-[10px] text-center", children: [
                ["Chat", "1"],
                ["Image", "3"],
                ["MC", "4"],
                ["Search", "5"],
                ["Codeit", "7"]
              ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-lg py-2 px-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-bold text-primary", children: v }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: k })
              ] }, k)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/pricing", onClick: close, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-2 h-3.5 w-3.5" }),
                  " View Plans"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "flex-1 glass border-border hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: DISCORD, target: "_blank", rel: "noopener noreferrer", onClick: close, children: [
                  "Join Discord ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5" })
                ] }) })
              ] })
            ] })
          ]
        }
      )
    }
  ) });
}
function CreditsBadge() {
  const { profile } = useAuth();
  if (!profile) return null;
  const credits = profile.credits;
  const low = credits <= 3;
  const isPaid = profile.plan === "pro" || profile.plan === "business";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/pricing",
      className: cn(
        "fixed top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2 glass-strong glass-shadow rounded-full pl-3 pr-3.5 py-1.5 text-xs font-medium transition-all hover:scale-105",
        low && !isPaid && "ring-2 ring-destructive/60 animate-pulse"
      ),
      "aria-label": "Credits",
      children: [
        low && !isPaid ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-destructive" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(low && !isPaid && "text-destructive"), children: [
          credits,
          " ",
          isPaid ? "credits" : "left"
        ] }),
        isPaid && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground px-1.5 py-0.5 rounded-full", children: profile.plan })
      ]
    }
  );
}
function AppShell({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary typing-dot" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary typing-dot" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary typing-dot" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, { collapsed, onToggle: () => setCollapsed((v) => !v) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "main",
      {
        className: "transition-[padding] duration-300",
        style: { paddingLeft: collapsed ? 64 : 280 },
        children
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreditsBadge, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UpgradeBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomePopup, {})
  ] });
}
export {
  AppShell as A,
  CircleAlert as C,
  ExternalLink as E,
  Film as F,
  Image as I,
  LayoutGrid as L,
  MessageSquare as M,
  Pickaxe as P,
  Search as S,
  Telescope as T,
  X,
  Sparkles as a,
  AnimatePresence as b,
  CodeXml as c,
  Shield as d
};

// src/core/css.ts
function cssColor(v, fallback) {
  const value = v ?? fallback;
  if (value === "none") return "transparent";
  if (value.startsWith("$")) return `var(--wf-${value.slice(1)})`;
  return value;
}
function cssRadius(v, fallback) {
  const value = v ?? fallback;
  return typeof value === "number" ? `${value}px` : `var(--wf-radius-${value})`;
}
function cssFontSize(v, fallback) {
  const value = v ?? fallback;
  return typeof value === "number" ? `${value}px` : `var(--wf-size-${value})`;
}
function mergeStyle(defaults, el) {
  return {
    ...defaults,
    ...el.base ?? {},
    ...el.style ?? {}
  };
}
function paintCss(s) {
  let css = `background:${cssColor(s.fill, "none")};`;
  css += s.border === void 0 || s.border === "none" ? "border:none;" : `border:1px solid ${cssColor(s.border, "$border")};`;
  css += `border-radius:${cssRadius(s.radius, 0)};`;
  return css;
}
function fieldStyle(el, defaults) {
  return paintCss(mergeStyle(defaults, el));
}
function textStyle(el, defaults) {
  const s = mergeStyle(defaults, el);
  let css = `color:${cssColor(s.color, "$text")};`;
  css += `font-size:${cssFontSize(s.size, "md")};`;
  css += `font-weight:${s.weight ?? "normal"};`;
  css += `text-align:${s.align ?? "left"};`;
  return css;
}

// src/core/types/text.ts
var text = () => ({
  color: "$text"
});
var spec = {
  name: "text",
  label: "\u6587\u5B57",
  defaults: () => ({
    w: 200,
    h: 24
  }),
  props: {},
  text,
  render: (el, h) => [
    h("div", {
      class: "wf-text",
      style: textStyle(el, text())
    }, el.text ?? "")
  ]
};

// src/core/types/button.ts
var VARIANTS = [
  "filled",
  "outline",
  "ghost"
];
var text2 = (el) => ({
  color: !el.variant || el.variant === "filled" ? "$onPrimary" : "$primary",
  weight: "bold",
  align: "center"
});
var spec2 = {
  name: "button",
  label: "\u30DC\u30BF\u30F3",
  defaults: () => ({
    w: 160,
    h: 48
  }),
  props: {},
  variants: VARIANTS,
  box: (el) => {
    if (el.variant === "outline") return {
      fill: "none",
      border: "$primary",
      radius: "md"
    };
    if (el.variant === "ghost") return {
      fill: "none",
      border: "none",
      radius: "md"
    };
    return {
      fill: "$primary",
      border: "none",
      radius: "md"
    };
  },
  text: text2,
  render: (el, h) => [
    h("div", {
      class: "wf-button",
      style: textStyle(el, text2(el))
    }, el.text ?? "")
  ]
};

// src/core/types/input.ts
var text3 = () => ({
  color: "$muted",
  size: "sm"
});
var box = () => ({
  fill: "$surface",
  border: "$border",
  radius: "sm"
});
var spec3 = {
  name: "input",
  label: "\u5165\u529B\u6B04",
  defaults: (_device, el) => ({
    w: 280,
    h: el.props?.multiline === true ? 96 : 56
  }),
  props: {
    placeholder: {
      kind: "string",
      default: ""
    },
    kind: {
      kind: "string",
      default: "text",
      oneOf: [
        "text",
        "select",
        "search"
      ]
    },
    multiline: {
      kind: "boolean",
      default: false
    }
  },
  box,
  innerBox: true,
  text: text3,
  // `props.value` is what was typed during play (triggers spec §4.7); a file never holds it.
  render: (el, h) => {
    const kind = String(el.props.kind ?? "text");
    const typed = typeof el.props.value === "string" ? el.props.value : "";
    const multi = el.props.multiline === true;
    const adorn = kind === "select" ? "\u25BE" : kind === "search" ? "\u2315" : "";
    const nodes = [];
    if (el.text) {
      nodes.push(h("div", {
        class: "wf-label",
        style: textStyle(el, text3())
      }, el.text));
    }
    nodes.push(h("div", {
      class: "wf-field" + (multi ? " wf-field-multi" : ""),
      style: fieldStyle(el, box())
    }, typed !== "" ? h("span", {
      class: "wf-value"
    }, typed) : h("span", {
      class: "wf-placeholder"
    }, String(el.props.placeholder ?? "")), h("span", {
      class: "wf-adorn"
    }, adorn)));
    return [
      h("div", {
        class: "wf-input"
      }, ...nodes)
    ];
  }
};

// src/core/types/checkbox.ts
var text4 = () => ({
  color: "$text"
});
var spec4 = {
  name: "checkbox",
  label: "\u30C1\u30A7\u30C3\u30AF",
  defaults: () => ({
    w: 200,
    h: 32
  }),
  props: {
    checked: {
      kind: "boolean",
      default: false
    }
  },
  text: text4,
  render: (el, h) => [
    h("div", {
      class: "wf-check"
    }, h("span", {
      class: "wf-checkbox" + (el.props.checked === true ? " is-on" : "")
    }), h("span", {
      class: "wf-check-label",
      style: textStyle(el, text4())
    }, el.text ?? ""))
  ]
};

// src/core/types/toggle.ts
var text5 = () => ({
  color: "$text"
});
var spec5 = {
  name: "toggle",
  label: "\u30B9\u30A4\u30C3\u30C1",
  defaults: () => ({
    w: 200,
    h: 32
  }),
  props: {
    checked: {
      kind: "boolean",
      default: false
    }
  },
  text: text5,
  render: (el, h) => [
    h("div", {
      class: "wf-check"
    }, h("span", {
      class: "wf-switch" + (el.props.checked === true ? " is-on" : "")
    }, h("span", {
      class: "wf-knob"
    })), h("span", {
      class: "wf-check-label",
      style: textStyle(el, text5())
    }, el.text ?? ""))
  ]
};

// src/core/types/image.ts
var text6 = () => ({
  color: "$muted",
  size: "sm",
  align: "center"
});
var spec6 = {
  name: "image",
  label: "\u753B\u50CF",
  defaults: () => ({
    w: 200,
    h: 150
  }),
  props: {},
  box: () => ({
    fill: "$surface",
    border: "$border",
    radius: "sm"
  }),
  text: text6,
  render: (el, h) => [
    h("div", {
      class: "wf-image"
    }, h("span", {
      class: "wf-caption",
      style: textStyle(el, text6())
    }, el.text ?? "\u753B\u50CF"))
  ]
};

// src/core/types/icon.ts
var spec7 = {
  name: "icon",
  label: "\u30A2\u30A4\u30B3\u30F3",
  defaults: () => ({
    w: 24,
    h: 24
  }),
  props: {},
  box: () => ({
    fill: "none",
    border: "$border",
    radius: "sm"
  }),
  render: (el, h) => [
    h("div", {
      class: "wf-icon",
      title: el.text ?? ""
    }, el.text ?? "")
  ]
};

// src/core/types/rect.ts
var spec8 = {
  name: "rect",
  label: "\u7BB1",
  defaults: () => ({
    w: 200,
    h: 120
  }),
  props: {
    elevated: {
      kind: "boolean",
      default: false
    },
    /** Which way the contents may be sent when they reach past the box (scroll spec §3.1). */
    scroll: {
      kind: "string",
      default: "none",
      oneOf: [
        "none",
        "y",
        "x"
      ]
    }
  },
  allowsChildren: true,
  box: () => ({
    fill: "$surface",
    border: "$border",
    radius: "md"
  }),
  className: (el) => el.props.elevated === true ? "wf-elevated" : "",
  render: () => []
};

// src/core/types/divider.ts
var spec9 = {
  name: "divider",
  label: "\u533A\u5207\u308A\u7DDA",
  defaults: () => ({
    w: 342,
    h: 1
  }),
  props: {},
  box: () => ({
    fill: "$border",
    border: "none",
    radius: 0
  }),
  render: () => []
};

// src/core/schema.ts
var DEVICES = {
  phone: {
    w: 390,
    h: 844
  },
  "phone-android": {
    w: 412,
    h: 915
  },
  tablet: {
    w: 834,
    h: 1194
  },
  desktop: {
    w: 1440,
    h: 900
  }
};
function isDeviceName(v) {
  return typeof v === "string" && Object.hasOwn(DEVICES, v);
}
function deviceSize(d) {
  return typeof d === "string" ? {
    ...DEVICES[d]
  } : {
    w: d.w,
    h: d.h
  };
}
function deviceLabel(d) {
  return typeof d === "string" ? d : `${d.w}x${d.h}`;
}
var COLOR_NAMES = [
  "bg",
  "surface",
  "primary",
  "onPrimary",
  "text",
  "muted",
  "border"
];
var SIZE_TOKENS = [
  "sm",
  "md",
  "lg"
];
var STYLE_KEYS = [
  "fill",
  "color",
  "border",
  "radius",
  "size",
  "weight",
  "align",
  "opacity"
];
var LIST_LEADINGS = [
  "none",
  "icon",
  "avatar"
];
var LIST_TRAILINGS = [
  "none",
  "chevron",
  "toggle"
];
var LAYOUT_DIRS = [
  "column",
  "row"
];
var LAYOUT_ALIGNS = [
  "start",
  "center",
  "end",
  "stretch"
];
var LAYOUT_JUSTIFIES = [
  "start",
  "center",
  "end",
  "between"
];
var LAYOUT_KEYS = [
  "dir",
  "gap",
  "pad",
  "align",
  "justify"
];
var MOTION_SPEEDS = [
  "fast",
  "normal",
  "slow"
];
var MOTION_EASINGS = [
  "standard",
  "decelerate",
  "accelerate",
  "linear"
];
var MOTION_SPEED_MAX = 5e3;
var MOTION_KEYS = [
  "name",
  "speed",
  "easing"
];
var STATE_CHANGE_KEYS = [
  "x",
  "y",
  "w",
  "h",
  "text",
  "variant",
  "props",
  "style",
  "hidden",
  "motion"
];
var STATE_NAME_MAX = 40;
var BLOCK_EVENTS = [
  "press",
  "enter",
  "leave",
  "appear",
  "after",
  "key",
  "change",
  "hold",
  "swipe"
];
var BLOCK_KEY_NAMES = [
  "enter",
  "escape"
];
var SWIPE_DIRS = [
  "up",
  "down",
  "left",
  "right"
];
var HOLD_MS_DEFAULT = 500;
var HOLD_MS_MIN = 100;
var HOLD_MS_MAX = 5e3;
var BLOCK_MS_MAX = 6e4;
var TRIGGER_KEYS = [
  "event",
  "at",
  "dir",
  "ms",
  "key"
];
var RANGE_KEYS = [
  "min",
  "max"
];
var COMPARE_KEYS = [
  "is",
  "has",
  "length",
  "number"
];
var CONDITION_KEYS = [
  "box",
  "part",
  "state",
  "is",
  "has",
  "length",
  "number",
  "not"
];
var REF_KEYS = [
  "screen",
  "part"
];
var ACT_NAMES = [
  "set",
  "next",
  "reset",
  "go",
  "back",
  "wait",
  "value",
  "add",
  "remove",
  "prev",
  "play"
];
var ACTION_KEYS = [
  "act",
  "box",
  "part",
  "screen",
  "state",
  "to",
  "from",
  "at",
  "ms",
  "motion"
];
var BLOCK_KEYS = [
  "on",
  "if",
  "do",
  "else"
];
var ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
var HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
var PROPOSAL_ID_PATTERN = /^[a-z][a-z0-9]*$/;
var ELEMENT_NAME_MAX = 40;

// src/core/list.ts
var ROW_FIELDS = {
  text: {
    kind: "string"
  },
  sub: {
    kind: "string"
  },
  meta: {
    kind: "string"
  },
  leading: {
    kind: "oneOf",
    values: LIST_LEADINGS
  },
  trailing: {
    kind: "oneOf",
    values: LIST_TRAILINGS
  },
  selected: {
    kind: "boolean"
  },
  checked: {
    kind: "boolean"
  }
};
var ROW_FIELD_NAMES = Object.keys(ROW_FIELDS);
var ROW_LABELS = {
  text: "\u6587\u5B57",
  sub: "\u526F\u6587",
  meta: "\u53F3\u7AEF",
  leading: "\u5148\u982D",
  trailing: "\u672B\u5C3E",
  selected: "\u9078\u629E",
  checked: "\u30AA\u30F3"
};
var AS_LIST = "(\u4E00\u89A7\u3069\u304A\u308A)";
var isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function isRowArray(v) {
  return Array.isArray(v) && v.every(isObj);
}
function rowsOf(el) {
  const v = el.props.items;
  return isRowArray(v) ? v : [];
}
var emptiedInPlay = (el) => el.props.rows === 0;
function hasRows(el) {
  return rowsOf(el).length > 0 || emptiedInPlay(el);
}
function rowCount(el) {
  const n = rowsOf(el).length;
  if (n > 0) return n;
  return emptiedInPlay(el) ? 0 : Math.max(1, Number(el.props.rows ?? 3));
}
function rowHeightOf(el) {
  return Math.max(8, Number(el.props.rowHeight ?? 56));
}
var asLeading = (v, fallback) => LIST_LEADINGS.includes(v) ? v : fallback;
var asTrailing = (v, fallback) => LIST_TRAILINGS.includes(v) ? v : fallback;
function filledRows(el) {
  const leading = asLeading(el.props.leading, "none");
  const trailing = asTrailing(el.props.trailing, "none");
  const written2 = rowsOf(el);
  const rows = written2.length > 0 ? written2 : placeholderRows(el);
  return rows.map((r) => {
    const out = {
      text: typeof r.text === "string" ? r.text : "",
      leading: asLeading(r.leading, leading),
      trailing: asTrailing(r.trailing, trailing),
      selected: r.selected === true
    };
    if (typeof r.sub === "string" && r.sub !== "") out.sub = r.sub;
    if (typeof r.meta === "string" && r.meta !== "") out.meta = r.meta;
    if (r.checked === true) out.checked = true;
    return out;
  });
}
function placeholderRows(el) {
  return Array.from({
    length: rowCount(el)
  }, () => ({}));
}
var q = (s) => `\u300C${typeof s === "string" ? s : ""}\u300D`;
function fieldText(field, v) {
  const spec25 = ROW_FIELDS[field];
  if (spec25.kind === "string") return q(v);
  if (spec25.kind === "boolean") return v === true ? "\u3042\u308A" : "\u306A\u3057";
  return typeof v === "string" ? v : AS_LIST;
}
function rowLine(i, b, a) {
  const parts = [];
  for (const f of ROW_FIELD_NAMES) {
    const bv = fieldText(f, b[f]);
    const av = fieldText(f, a[f]);
    if (bv !== av) parts.push(`${ROW_LABELS[f]} ${bv} -> ${av}`);
  }
  return parts.length ? `${i + 1} \u884C\u76EE ${parts.join(", ")}` : void 0;
}
var sorted = (rows) => rows.map((r) => JSON.stringify(r)).sort().join("\n");
function rowLines(before, after) {
  const b = isRowArray(before) ? before : [];
  const a = isRowArray(after) ? after : [];
  if (b.length === 0 && a.length === 0) return [];
  if (b.length === 0) return [
    `\u884C \u306A\u3057 -> ${a.length}`
  ];
  if (a.length === 0) return [
    `\u884C ${b.length} -> \u306A\u3057`
  ];
  const out = [];
  if (b.length === a.length && sorted(b) === sorted(a)) {
    if (JSON.stringify(b) !== JSON.stringify(a)) out.push("\u884C \u4E26\u3073\u66FF\u3048");
    return out;
  }
  if (b.length !== a.length) out.push(`\u884C ${b.length} -> ${a.length}`);
  const common = Math.min(b.length, a.length);
  for (let i = 0; i < common; i++) {
    const line = rowLine(i, b[i], a[i]);
    if (line) out.push(line);
  }
  for (let i = common; i < a.length; i++) out.push(`\u884C \u8FFD\u52A0 ${i + 1} ${q(a[i].text)}`);
  for (let i = common; i < b.length; i++) out.push(`\u884C \u524A\u9664 ${i + 1} ${q(b[i].text)}`);
  return out;
}

// src/core/types/list.ts
var spec10 = {
  name: "list",
  label: "\u4E00\u89A7",
  defaults: () => ({
    w: 342,
    h: 168
  }),
  props: {
    rows: {
      kind: "number",
      default: 3,
      min: 1
    },
    rowHeight: {
      kind: "number",
      default: 56,
      min: 8
    },
    leading: {
      kind: "string",
      default: "none",
      oneOf: [
        "none",
        "icon",
        "avatar"
      ]
    },
    trailing: {
      kind: "string",
      default: "none",
      oneOf: [
        "none",
        "chevron",
        "toggle"
      ]
    },
    // The rows' contents (list items spec §3.1). When there are some, they are the row count.
    items: {
      kind: "rows",
      default: []
    }
  },
  box: () => ({
    fill: "$surface",
    border: "$border",
    radius: "md"
  }),
  render: (el, h) => {
    const rowHeight = rowHeightOf(el);
    const items = filledRows(el).map((row) => {
      const body = row.text === "" && row.sub === void 0 ? h("span", {
        class: "wf-line"
      }) : h("div", {
        class: "wf-row-body"
      }, row.text === "" ? h("span", {
        class: "wf-line"
      }) : h("span", {
        class: "wf-row-text"
      }, row.text), ...row.sub === void 0 ? [] : [
        h("span", {
          class: "wf-row-sub"
        }, row.sub)
      ]);
      return h("div", {
        class: "wf-row" + (row.selected ? " is-selected" : ""),
        style: `height:${rowHeight}px;`
      }, row.leading === "none" ? "" : h("span", {
        class: `wf-lead wf-lead-${row.leading}`
      }), body, ...row.meta === void 0 ? [] : [
        h("span", {
          class: "wf-row-meta"
        }, row.meta)
      ], row.trailing === "none" ? "" : h("span", {
        class: `wf-trail wf-trail-${row.trailing}` + (row.checked ? " is-on" : "")
      }, row.trailing === "chevron" ? "\u203A" : ""));
    });
    return [
      h("div", {
        class: "wf-list"
      }, ...items)
    ];
  }
};

// src/core/types/navbar.ts
var GLYPH = {
  back: "\u2039",
  close: "\xD7",
  menu: "\u2261",
  none: ""
};
var text7 = () => ({
  color: "$text",
  weight: "bold",
  align: "center"
});
var spec11 = {
  name: "navbar",
  label: "\u4E0A\u90E8\u306E\u5E2F",
  defaults: (device) => ({
    w: device.w,
    h: device.w >= 1024 ? 64 : 96
  }),
  props: {
    left: {
      kind: "string",
      default: "none",
      oneOf: [
        "none",
        "back",
        "close",
        "menu"
      ]
    },
    right: {
      kind: "string",
      default: "none"
    }
  },
  box: () => ({
    fill: "$surface",
    border: "none",
    radius: 0
  }),
  text: text7,
  className: () => "wf-navbar-box",
  render: (el, h) => {
    const right = String(el.props.right ?? "none");
    return [
      h("div", {
        class: "wf-navbar"
      }, h("span", {
        class: "wf-nav-side"
      }, GLYPH[String(el.props.left ?? "none")] ?? ""), h("span", {
        class: "wf-nav-title",
        style: textStyle(el, text7())
      }, el.text ?? ""), h("span", {
        class: "wf-nav-side"
      }, right === "none" ? "" : right))
    ];
  }
};

// src/core/types/tabbar.ts
var spec12 = {
  name: "tabbar",
  label: "\u4E0B\u90E8\u306E\u30BF\u30D6",
  defaults: (device) => ({
    w: device.w,
    h: 84
  }),
  props: {
    items: {
      kind: "string[]",
      default: []
    },
    active: {
      kind: "number",
      default: 0,
      min: 0
    }
  },
  box: () => ({
    fill: "$surface",
    border: "none",
    radius: 0
  }),
  className: () => "wf-tabbar-box",
  render: (el, h) => {
    const items = Array.isArray(el.props.items) ? el.props.items : [];
    const active = Number(el.props.active ?? 0);
    return [
      h("div", {
        class: "wf-tabbar"
      }, ...items.map((label, i) => h("div", {
        class: "wf-tab" + (i === active ? " is-active" : "")
      }, h("span", {
        class: "wf-tab-dot"
      }), h("span", {
        class: "wf-tab-label"
      }, String(label)))))
    ];
  }
};

// src/core/choice.ts
var CHOICE_TYPES = [
  "tabs",
  "radio",
  "sidenav"
];
function choiceItems(el) {
  const v = el.props.items;
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}
var radioHeight = (items, rowHeight) => Math.max(1, items) * rowHeight;

// src/core/types/tabs.ts
var text8 = () => ({
  color: "$muted",
  size: "sm"
});
function labelStyle(el, selected) {
  const s = mergeStyle(text8(), el);
  const own = mergeStyle({}, el);
  const color = own.color !== void 0 ? s.color : selected ? "$text" : s.color;
  const weight = own.weight ?? (selected ? "bold" : "normal");
  return `color:${cssColor(color, "$muted")};font-size:${cssFontSize(s.size, "sm")};font-weight:${weight};`;
}
var spec13 = {
  name: "tabs",
  label: "\u4E0A\u306E\u30BF\u30D6",
  defaults: () => ({
    w: 342,
    h: 36
  }),
  props: {
    items: {
      kind: "string[]",
      default: [
        "\u30BF\u30D6 1",
        "\u30BF\u30D6 2",
        "\u30BF\u30D6 3"
      ]
    },
    active: {
      kind: "number",
      default: 0,
      min: 0
    }
  },
  box: () => ({
    fill: "$border",
    border: "none",
    radius: "lg"
  }),
  text: text8,
  render: (el, h) => {
    const items = choiceItems(el);
    const active = Number(el.props.active ?? 0);
    return [
      h("div", {
        class: "wf-seg"
      }, ...items.map((label, i) => h("div", {
        class: "wf-seg-item" + (i === active ? " is-active" : "")
      }, h("span", {
        style: labelStyle(el, i === active)
      }, label))))
    ];
  }
};

// src/core/types/radio.ts
var text9 = () => ({
  color: "$text",
  size: "md"
});
function labelStyle2(el) {
  const s = mergeStyle(text9(), el);
  return `color:${cssColor(s.color, "$text")};font-size:${cssFontSize(s.size, "md")};font-weight:${s.weight ?? "normal"};`;
}
var spec14 = {
  name: "radio",
  label: "\u30E9\u30B8\u30AA",
  // The height follows the rows (spec §3.2); the unfilled element is what the author wrote.
  defaults: (_device, el) => ({
    w: 342,
    h: radioHeight(Array.isArray(el.props?.items) ? el.props.items.length : 3, typeof el.props?.rowHeight === "number" ? el.props.rowHeight : 48)
  }),
  props: {
    items: {
      kind: "string[]",
      default: [
        "\u9078\u629E\u80A2 1",
        "\u9078\u629E\u80A2 2",
        "\u9078\u629E\u80A2 3"
      ]
    },
    active: {
      kind: "number",
      default: 0,
      min: 0
    },
    rowHeight: {
      kind: "number",
      default: 48,
      min: 8
    }
  },
  box: () => ({
    fill: "$surface",
    border: "$border",
    radius: "md"
  }),
  text: text9,
  render: (el, h) => {
    const items = choiceItems(el);
    const active = Number(el.props.active ?? 0);
    const rowHeight = Number(el.props.rowHeight ?? 48);
    return [
      h("div", {
        class: "wf-radio"
      }, ...items.map((label, i) => h("div", {
        class: "wf-radio-row" + (i === active ? " is-active" : ""),
        style: `height:${rowHeight}px;`
      }, h("span", {
        class: "wf-radio-text",
        style: labelStyle2(el)
      }, label), ...i === active ? [
        h("span", {
          class: "wf-radio-mark"
        }, "\u2713")
      ] : [])))
    ];
  }
};

// src/core/slider.ts
function sliderNums(el) {
  const n = (k, d) => typeof el.props[k] === "number" && Number.isFinite(el.props[k]) ? el.props[k] : d;
  return {
    min: n("min", 0),
    max: n("max", 100),
    step: n("step", 1),
    value: n("value", 50)
  };
}
function stepDecimals(step) {
  const [m, e] = String(step).split("e-");
  const d = (m.split(".")[1]?.length ?? 0) + (e ? Number(e) : 0);
  return Math.min(10, d);
}
function snapSlider(el, n) {
  const { min, max, step } = sliderNums(el);
  if (!(max > min) || !(step > 0)) return min;
  const k = Math.round((Math.min(max, Math.max(min, n)) - min) / step);
  const d = Math.max(stepDecimals(step), stepDecimals(min));
  const v = Number((min + k * step).toFixed(d));
  return Math.min(max, Math.max(min, v));
}
function sliderText(el, n) {
  const d = stepDecimals(sliderNums(el).step);
  const num = n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  });
  return `${String(el.props.prefix ?? "")}${num}${String(el.props.suffix ?? "")}`;
}
var KNOB_R = 14;
function sliderRatio(el, n) {
  const { min, max } = sliderNums(el);
  return max > min ? Math.min(1, Math.max(0, (n - min) / (max - min))) : 0;
}
var onStep = (el, n) => snapSlider(el, n) === n;

// src/core/types/slider.ts
var text10 = () => ({
  color: "$muted",
  size: "sm"
});
var box2 = () => ({
  fill: "$primary",
  border: "$border"
});
var BAND = 2 * KNOB_R;
var LINE = 6;
var spec15 = {
  name: "slider",
  label: "\u30B9\u30E9\u30A4\u30C0\u30FC",
  defaults: () => ({
    w: 342,
    h: 48
  }),
  props: {
    min: {
      kind: "number",
      default: 0,
      decimal: true
    },
    max: {
      kind: "number",
      default: 100,
      decimal: true
    },
    step: {
      kind: "number",
      default: 1,
      decimal: true
    },
    value: {
      kind: "number",
      default: 50,
      decimal: true
    },
    prefix: {
      kind: "string",
      default: ""
    },
    suffix: {
      kind: "string",
      default: ""
    },
    ends: {
      kind: "boolean",
      default: true,
      label: "\u4E21\u7AEF\u306E\u5024",
      check: "\u51FA\u3059"
    }
  },
  box: box2,
  innerBox: true,
  text: text10,
  render: (el, h) => {
    const { min, max, value } = sliderNums(el);
    const ends = el.props.ends !== false;
    const paint = mergeStyle(box2(), el);
    const words = mergeStyle(text10(), el);
    const span = Math.max(0, el.w - 2 * KNOB_R);
    const along = sliderRatio(el, value) * span;
    const cy = ends ? BAND / 2 : el.h / 2;
    const lineTop = `top:${cy - LINE / 2}px;`;
    const border = paint.border === void 0 || paint.border === "none" ? "border:none;" : `border:1px solid ${cssColor(paint.border, "$border")};`;
    const endStyle = `top:${BAND}px;color:${cssColor(words.color, "$muted")};font-size:${cssFontSize(words.size, "sm")};font-weight:${words.weight ?? "normal"};`;
    return [
      h("div", {
        class: "wf-slider"
      }, h("div", {
        class: "wf-slider-track",
        style: `left:${KNOB_R}px;right:${KNOB_R}px;${lineTop}`
      }), h("div", {
        class: "wf-slider-fill",
        style: `left:${KNOB_R}px;width:${along}px;${lineTop}background:${cssColor(paint.fill, "$primary")};`
      }), h("div", {
        class: "wf-slider-knob",
        style: `left:${along}px;top:${cy - KNOB_R}px;${border}`
      }), ...ends ? [
        h("span", {
          class: "wf-slider-end",
          style: `left:0;${endStyle}`
        }, sliderText(el, min)),
        h("span", {
          class: "wf-slider-end is-max",
          style: `right:0;${endStyle}`
        }, sliderText(el, max))
      ] : [])
    ];
  }
};

// src/core/elements.ts
function flatten(elements, parent) {
  const out = [];
  elements.forEach((el, index) => {
    out.push({
      el,
      parent,
      index
    });
    if (el.children) out.push(...flatten(el.children, el.id));
  });
  return out;
}
function findById(elements, id) {
  return flatten(elements).find((l) => l.el.id === id);
}
function siblingIds(elements, parent) {
  if (parent === void 0) return elements.map((e) => e.id);
  return (findById(elements, parent)?.el.children ?? []).map((e) => e.id);
}

// src/core/layout.ts
var GROUP_TYPE = "group";
var LAYOUT_DEFAULTS = {
  gap: 8,
  pad: 0,
  align: "start",
  justify: "start"
};
function padOf(pad) {
  if (pad === void 0) return [
    0,
    0
  ];
  return typeof pad === "number" ? [
    pad,
    pad
  ] : [
    pad[0],
    pad[1]
  ];
}
function layoutOf(el) {
  const l = el.layout;
  if (!l || el.type !== "rect" && el.type !== GROUP_TYPE) return void 0;
  return {
    dir: l.dir,
    gap: l.gap ?? LAYOUT_DEFAULTS.gap,
    pad: padOf(l.pad),
    align: l.align ?? LAYOUT_DEFAULTS.align,
    justify: l.justify ?? LAYOUT_DEFAULTS.justify
  };
}
var mainAxis = (dir) => dir === "column" ? "h" : "w";
var crossAxis = (dir) => dir === "column" ? "w" : "h";
var posOf = (axis) => axis === "w" ? "x" : "y";
var padAlong = (pad, axis) => axis === "h" ? pad[0] : pad[1];
function inLayout(elements, id) {
  const parent = flatten(elements).find((l) => l.el.id === id)?.parent;
  if (parent === void 0) return void 0;
  const box7 = flatten(elements).find((l) => l.el.id === parent)?.el;
  return box7 && layoutOf(box7) ? box7 : void 0;
}
var FIT_TYPES = [
  "text",
  "button",
  "chip",
  "badge",
  "fab",
  "breadcrumb",
  "rect",
  "group"
];
function canFit(el) {
  if (el.type === "rect") return layoutOf(el) !== void 0;
  return FIT_TYPES.includes(el.type);
}
var styleOf = (el) => ({
  ...el.base ?? {},
  ...el.style ?? {}
});
var FONT_SIZES = {
  sm: 13,
  md: 16,
  lg: 22
};
function fontSizeOf(el) {
  const s = styleOf(el).size;
  if (typeof s === "number") return s;
  return (s && FONT_SIZES[s]) ?? 16;
}
var WIDE = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6\u{1F300}-\u{1FAFF}\u{20000}-\u{3FFFD}]/u;
var charWidth = (ch, size) => ch === " " || ch === "\u3000" ? size * 0.3 : WIDE.test(ch) ? size : size * 0.55;
function wrapLine(line, size, max) {
  let lines = 1;
  let used = 0;
  for (const ch of line) {
    const w = charWidth(ch, size);
    if (used > 0 && used + w > max) {
      lines++;
      used = 0;
    }
    used += w;
  }
  return lines;
}
function textSize(text18, size, bold, maxWidth) {
  const factor = bold ? 1.05 : 1;
  const lines = text18.split("\n");
  const widths = lines.map((l) => [
    ...l
  ].reduce((n, ch) => n + charWidth(ch, size), 0) * factor);
  let count = lines.length;
  let widest = Math.max(0, ...widths);
  if (maxWidth !== void 0) {
    const room = Math.max(1, (maxWidth - 4) / factor);
    count = lines.reduce((n, l) => n + wrapLine(l, size, room), 0);
    widest = Math.min(widest, maxWidth - 4);
  }
  return {
    w: Math.ceil(widest + 4),
    h: Math.ceil(count * size * 1.3)
  };
}
var CRUMB_GAP = 8;
function crumbsOf(el) {
  const raw = el.props?.items;
  const items = Array.isArray(raw) ? raw.filter((t) => typeof t === "string") : [];
  const s = styleOf(el).size;
  const size = typeof s === "number" ? s : s && FONT_SIZES[s] || 13;
  const sepW = textSize("/", size, false).w;
  const steps = [];
  const seps = [];
  let x = 0;
  items.forEach((text18, i) => {
    if (i > 0) {
      seps.push({
        x: x + CRUMB_GAP,
        w: sepW
      });
      x += CRUMB_GAP + sepW + CRUMB_GAP;
    }
    const w = textSize(text18, size, i === items.length - 1).w;
    steps.push({
      x,
      w
    });
    x += w;
  });
  return {
    steps,
    seps,
    w: x
  };
}
var isBold = (el) => el.type === "button" || styleOf(el).weight === "bold";
var modeOf = (el, axis) => el.sizing?.[axis];
var shown = (list) => list.filter((c) => c.hidden !== true);
var isFreeGroup = (el) => el.type === GROUP_TYPE && !layoutOf(el) && el.children !== void 0;
var prePlaced = (el) => isFreeGroup(el) ? placeBox(el, {}) : el;
var fixedWidth = (el) => modeOf(el, "w") === void 0 ? el.w : void 0;
function natural(el, axis, width) {
  if (isFreeGroup(el)) return placeBox(el, {})[axis];
  const mode = modeOf(el, axis);
  if (mode === void 0) return el[axis];
  if (mode === "fill") return el.sizing.own[axis];
  if (el.type === "text") {
    const t = textSize(el.text ?? "", fontSizeOf(el), isBold(el), axis === "h" ? width : void 0);
    return t[axis];
  }
  if (el.type === "button") {
    return axis === "w" ? textSize(el.text ?? "", 16, true).w - 4 + 32 : el.sizing.own.h;
  }
  if (el.type === "chip") {
    return axis === "w" ? textSize(el.text ?? "\u672D", 13, false).w - 4 + 24 : el.sizing.own.h;
  }
  if (el.type === "badge") {
    if (axis === "h") return el.sizing.own.h;
    return el.text ? 14 + textSize(el.text, 13, false).w - 4 : 10;
  }
  if (el.type === "fab") {
    return axis === "w" ? textSize(el.text ?? "+ \u8FFD\u52A0", 16, true).w - 4 + 40 : el.sizing.own.h;
  }
  if (el.type === "breadcrumb") {
    return axis === "w" ? crumbsOf(el).w : el.sizing.own.h;
  }
  const L = layoutOf(el);
  if (!L) return el[axis];
  const kids = shown(el.children ?? []).map(prePlaced);
  const inner = width === void 0 ? void 0 : Math.max(0, width - 2 * padAlong(L.pad, crossAxis(L.dir)));
  if (axis === mainAxis(L.dir)) {
    const lengths = kids.map((c) => natural(c, axis, L.dir === "column" ? crossLength(c, L, inner) : void 0));
    const sum = lengths.reduce((a, b) => a + b, 0);
    return 2 * padAlong(L.pad, axis) + sum + Math.max(0, kids.length - 1) * L.gap;
  }
  return 2 * padAlong(L.pad, axis) + Math.max(0, ...kids.map((c) => natural(c, axis, axis === "h" ? fixedWidth(c) : void 0)));
}
function crossLength(c, L, inner) {
  const axis = crossAxis(L.dir);
  if (inner !== void 0 && (L.align === "stretch" || modeOf(c, axis) === "fill")) return inner;
  if (modeOf(c, axis) === void 0) return c[axis];
  return natural(c, axis, axis === "h" ? fixedWidth(c) : void 0);
}
function placeBox(el, given) {
  const measured = (axis) => modeOf(el, axis) === "fit" && !isFreeGroup(el);
  const w = given.w ?? (measured("w") ? natural(el, "w") : el.w);
  const h = given.h ?? (measured("h") ? natural(el, "h", w) : el.h);
  const L = layoutOf(el);
  if (!L || !el.children) {
    const kids2 = el.children ? el.children.map((c) => placeBox(c, {})) : void 0;
    const size2 = el.type === GROUP_TYPE && kids2 && kids2.length > 0 ? {
      w: Math.max(1, ...kids2.map((c) => c.x + c.w)),
      h: Math.max(1, ...kids2.map((c) => c.y + c.h))
    } : {
      w,
      h
    };
    return {
      ...el,
      ...size2,
      ...kids2 ? {
        children: kids2
      } : {}
    };
  }
  const main = mainAxis(L.dir);
  const cross = crossAxis(L.dir);
  const size = {
    w,
    h
  };
  const innerMain = Math.max(0, size[main] - 2 * padAlong(L.pad, main));
  const innerCross = Math.max(0, size[cross] - 2 * padAlong(L.pad, cross));
  const kids = el.children.map(prePlaced);
  const crossOf = /* @__PURE__ */ new Map();
  const mainOf = /* @__PURE__ */ new Map();
  for (const c of kids) {
    const cl = crossLength(c, L, innerCross);
    crossOf.set(c.id, cl);
    const m = modeOf(c, main);
    mainOf.set(c.id, m === "fill" ? c.hidden === true ? c.sizing.own[main] : 0 : m === "fit" ? natural(c, main, L.dir === "column" ? cl : void 0) : c[main]);
  }
  const visible = shown(kids);
  const fills = visible.filter((c) => modeOf(c, main) === "fill");
  const fixed = visible.filter((c) => modeOf(c, main) !== "fill").reduce((a, c) => a + mainOf.get(c.id), 0);
  const gaps = Math.max(0, visible.length - 1) * L.gap;
  const fitBox = modeOf(el, main) === "fit";
  const rest = fitBox ? 0 : Math.max(0, innerMain - fixed - gaps);
  if (fills.length > 0) {
    const share = Math.floor(rest / fills.length);
    fills.forEach((c, i) => {
      const own = fitBox ? c.sizing.own[main] : share + (i === fills.length - 1 ? rest - share * fills.length : 0);
      mainOf.set(c.id, own);
    });
  }
  let cursor = padAlong(L.pad, main);
  let gap = L.gap;
  if (fills.length === 0 && !fitBox && rest > 0) {
    if (L.justify === "center") cursor += Math.floor(rest / 2);
    else if (L.justify === "end") cursor += rest;
    else if (L.justify === "between" && visible.length > 1) {
      gap = L.gap + rest / (visible.length - 1);
    } else if (L.justify === "between") cursor += Math.floor(rest / 2);
  }
  const children = kids.map((c) => {
    const cl = crossOf.get(c.id);
    const ml = mainOf.get(c.id);
    let crossPos = padAlong(L.pad, cross);
    if (L.align === "center") crossPos += Math.floor((innerCross - cl) / 2);
    else if (L.align === "end") crossPos += innerCross - cl;
    const at = {
      [posOf(main)]: Math.round(cursor),
      [posOf(cross)]: crossPos
    };
    const placed = placeBox({
      ...c,
      ...at
    }, {
      [main]: ml,
      [cross]: cl
    });
    if (c.hidden !== true) cursor += ml + gap;
    return placed;
  });
  return {
    ...el,
    w,
    h,
    children
  };
}
function placeElements(elements) {
  return elements.map((el) => el.children || el.sizing ? placeBox(el, {}) : el);
}
function contentLength(el, axis) {
  const L = layoutOf(el);
  const size = axis === "y" ? "h" : "w";
  let far = 0;
  for (const c of el.children ?? []) {
    if (c.hidden === true) continue;
    far = Math.max(far, c[axis] + c[size]);
  }
  if (!L || !el.children) return far;
  if (mainAxis(L.dir) !== size) return far + padAlong(L.pad, size);
  return shown(el.children).length === 0 ? 2 * padAlong(L.pad, size) : far + padAlong(L.pad, size);
}
function dropFill(el) {
  if (!el.sizing || el.sizing.w !== "fill" && el.sizing.h !== "fill") return el;
  const { w, h, own } = el.sizing;
  const kept = {
    own,
    ...w === "fit" ? {
      w
    } : {},
    ...h === "fit" ? {
      h
    } : {}
  };
  const { sizing: _s, ...rest } = el;
  return {
    ...rest,
    ...kept.w || kept.h ? {
      sizing: kept
    } : {}
  };
}

// src/core/types/progress.ts
var SPIN_MS = 900;
var text11 = () => ({
  color: "$onPrimary",
  size: "sm",
  weight: "bold"
});
var box3 = () => ({
  fill: "$primary",
  border: "none"
});
var SIZES = {
  sm: 13,
  md: 16,
  lg: 22
};
var isInt = (v) => typeof v === "number" && Number.isInteger(v);
function progressNums(el) {
  const max = isInt(el.props.max) && el.props.max >= 1 ? el.props.max : 100;
  const raw = isInt(el.props.value) ? el.props.value : 40;
  return {
    max,
    value: Math.min(max, Math.max(0, raw))
  };
}
function progressPct(el) {
  const { max, value } = progressNums(el);
  return Math.round(value / max * 100);
}
function barNodes(el, h) {
  const paint = mergeStyle(box3(), el);
  const own = mergeStyle({}, el);
  const words = mergeStyle(text11(), el);
  const { max, value } = progressNums(el);
  const fw = Math.round(el.w * value / max);
  const radius = `border-radius:${cssRadius(paint.radius, el.h / 2)};`;
  const nodes = [
    h("div", {
      class: "wf-progress-track",
      style: radius
    }),
    h("div", {
      class: "wf-progress-fill",
      style: `width:${fw}px;${radius}background:${cssColor(paint.fill, "$primary")};`
    })
  ];
  if (el.props.label !== false && el.h >= 12) {
    const label = `${progressPct(el)}%`;
    const size = typeof words.size === "number" ? words.size : SIZES[words.size ?? "sm"] ?? 13;
    const tw = textSize(label, size, words.weight !== "normal").w - 4;
    const inside = fw >= tw + 16;
    const color = own.color ?? (inside ? "$onPrimary" : "$text");
    const at = inside ? `right:${el.w - fw + 8}px;` : `left:${fw + 6}px;`;
    nodes.push(h("span", {
      class: "wf-progress-label",
      style: at + `color:${cssColor(color, "$text")};font-size:${cssFontSize(words.size, "sm")};font-weight:${words.weight ?? "bold"};`
    }, label));
  }
  return [
    h("div", {
      class: "wf-progress"
    }, ...nodes)
  ];
}
function spinNodes(el, h) {
  const paint = mergeStyle(box3(), el);
  const d = el.h;
  const gap = d / 2;
  const left = (el.w - (3 * d + 2 * gap)) / 2;
  const dots = [
    1,
    0.6,
    0.3
  ].map((opacity, i) => h("div", {
    class: "wf-spin-dot",
    style: `left:${left + i * (d + gap)}px;top:0px;width:${d}px;height:${d}px;background:${cssColor(paint.fill, "$primary")};opacity:${opacity};--wf-spin-i:${i * (SPIN_MS / 3) - SPIN_MS}ms;`
  }));
  return [
    h("div", {
      class: "wf-spin"
    }, ...dots)
  ];
}
var spec16 = {
  name: "progress",
  label: "\u9032\u307F\u5177\u5408",
  defaults: (_device, el) => el.props?.kind === "spinner" ? {
    w: 32,
    h: 8
  } : {
    w: 342,
    h: 14
  },
  props: {
    kind: {
      kind: "string",
      default: "bar",
      oneOf: [
        "bar",
        "spinner"
      ]
    },
    value: {
      kind: "number",
      default: 40,
      min: 0
    },
    max: {
      kind: "number",
      default: 100,
      min: 1
    },
    label: {
      kind: "boolean",
      default: true,
      label: "\u5272\u5408\u306E\u6587\u5B57",
      check: "\u51FA\u3059"
    }
  },
  box: box3,
  innerBox: true,
  text: text11,
  render: (el, h) => el.props.kind === "spinner" ? spinNodes(el, h) : barNodes(el, h)
};

// src/core/types/chip.ts
var box4 = () => ({
  fill: "$primary",
  border: "none",
  radius: 999
});
var text12 = (el) => ({
  color: el.props.checked === true ? "$onPrimary" : "$text",
  size: "sm",
  align: "center"
});
var CHIP_TEXT = "\u672D";
var spec17 = {
  name: "chip",
  label: "\u672D",
  defaults: () => ({
    w: 64,
    h: 32
  }),
  props: {
    checked: {
      kind: "boolean",
      default: false,
      label: "\u9078\u629E",
      check: "\u9078\u3093\u3067\u3044\u308B"
    }
  },
  box: box4,
  innerBox: true,
  text: text12,
  render: (el, h) => {
    const paint = mergeStyle(box4(), el);
    const fill = el.props.checked === true ? paint.fill : "$border";
    const border = paint.border === void 0 || paint.border === "none" ? "border:none;" : `border:1px solid ${cssColor(paint.border, "$border")};`;
    return [
      h("div", {
        class: "wf-chip",
        style: `background:${cssColor(fill, "$border")};${border}border-radius:${cssRadius(paint.radius, 999)};`
      }, h("span", {
        class: "wf-chip-text",
        style: textStyle(el, text12(el))
      }, el.text ?? CHIP_TEXT))
    ];
  }
};

// src/core/types/badge.ts
var box5 = () => ({
  fill: "#E5484D",
  border: "$bg"
});
var text13 = () => ({
  color: "$text",
  size: "sm"
});
var ring = (border) => border === void 0 || border === "none" ? "" : `box-shadow:0 0 0 2px ${cssColor(border, "$bg")};`;
var spec18 = {
  name: "badge",
  label: "\u30D0\u30C3\u30B8",
  defaults: (_device, el) => el.text ? {
    w: 80,
    h: 20
  } : {
    w: 10,
    h: 10
  },
  props: {},
  box: box5,
  innerBox: true,
  text: text13,
  render: (el, h) => {
    const paint = mergeStyle(box5(), el);
    const fill = `background:${cssColor(paint.fill, "#E5484D")};`;
    if (!el.text) {
      const d = Math.min(el.w, el.h);
      return [
        h("div", {
          class: "wf-badge"
        }, h("div", {
          class: "wf-badge-dot",
          style: `left:${(el.w - d) / 2}px;top:${(el.h - d) / 2}px;width:${d}px;height:${d}px;` + fill + ring(paint.border)
        }))
      ];
    }
    return [
      h("div", {
        class: "wf-badge"
      }, h("div", {
        class: "wf-badge-dot",
        style: `left:0px;top:${(el.h - 8) / 2}px;width:8px;height:8px;` + fill + ring(paint.border)
      }), h("span", {
        class: "wf-badge-text",
        style: `left:14px;` + textStyle(el, text13())
      }, el.text))
    ];
  }
};

// src/core/types/avatar.ts
var box6 = () => ({
  fill: "$border",
  border: "none",
  radius: 999
});
var spec19 = {
  name: "avatar",
  label: "\u9854\u5199\u771F",
  defaults: () => ({
    w: 48,
    h: 48
  }),
  props: {
    online: {
      kind: "boolean",
      default: false,
      label: "\u5728\u5E2D\u306E\u70B9",
      check: "\u51FA\u3059"
    }
  },
  box: box6,
  innerBox: true,
  render: (el, h) => {
    const d = Math.min(el.w, el.h);
    const left = (el.w - d) / 2;
    const top = (el.h - d) / 2;
    const photo = h("div", {
      class: "wf-avatar-photo",
      style: `left:${left}px;top:${top}px;width:${d}px;height:${d}px;` + fieldStyle(el, box6())
    }, h("div", {
      class: "wf-avatar-head"
    }), h("div", {
      class: "wf-avatar-body"
    }));
    if (el.props.online !== true) return [
      h("div", {
        class: "wf-avatar"
      }, photo)
    ];
    const dd = Math.round(d * 0.28);
    return [
      h("div", {
        class: "wf-avatar"
      }, photo, h("div", {
        class: "wf-avatar-dot",
        style: `left:${left + d - dd}px;top:${top + d - dd}px;width:${dd}px;height:${dd}px;`
      }))
    ];
  }
};

// src/core/types/fab.ts
var text14 = () => ({
  color: "$onPrimary",
  weight: "bold",
  align: "center"
});
var FAB_TEXT = "+ \u8FFD\u52A0";
var spec20 = {
  name: "fab",
  label: "\u6D6E\u3044\u305F\u30DC\u30BF\u30F3",
  defaults: (_device, el) => el.text !== void 0 && [
    ...el.text
  ].length <= 2 ? {
    w: 56,
    h: 56
  } : {
    w: 120,
    h: 48
  },
  props: {},
  box: () => ({
    fill: "$primary",
    border: "none",
    radius: 999
  }),
  text: text14,
  className: () => "wf-elevated",
  render: (el, h) => [
    h("div", {
      class: "wf-button wf-fab",
      style: textStyle(el, text14())
    }, el.text ?? FAB_TEXT)
  ]
};

// src/core/desktop.ts
var strings = (v) => Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
var TABLE_HEAD_H = 40;
var TABLE_ROW_H = 48;
var tableCells = (row) => row.split("|").map((c) => c.trim());
var tableColumns = (el) => strings(el.props.columns);
var tableRows = (el) => strings(el.props.rows).map(tableCells);
function tableColumnCount(el) {
  const n = tableColumns(el).length;
  return n > 0 ? n : Math.max(1, ...tableRows(el).map((r) => r.length));
}
var tableHeadH = (el) => tableColumns(el).length > 0 ? TABLE_HEAD_H : 0;
var tableHeight = (columns, rows) => (columns > 0 ? TABLE_HEAD_H : 0) + TABLE_ROW_H * Math.max(1, rows);
var written = (v) => Array.isArray(v) ? v.length : 3;
var tableHeightOf = (props) => tableHeight(written(props?.columns), written(props?.rows));
var NUMBER_CELL = /^[-+]?[¥￥$€]?[-+]?[0-9][0-9,]*(\.[0-9]+)?(%|円)?$/;
var isNumberCell = (cell) => NUMBER_CELL.test(cell.trim());
function numberColumns(el) {
  const rows = tableRows(el);
  return Array.from({
    length: tableColumnCount(el)
  }, (_v, j) => {
    const cells = rows.map((r) => r[j] ?? "").filter((c) => c !== "");
    return cells.length > 0 && cells.every(isNumberCell);
  });
}
function tableRowTops(el) {
  const head = tableHeadH(el);
  return tableRows(el).map((_r, i) => head + i * TABLE_ROW_H).filter((y) => y < el.h);
}
var NAV_TITLE_AT = 20;
var NAV_ITEMS_TOP = 72;
var NAV_ITEM_H = 40;
var NAV_ITEM_STEP = 44;
var NAV_INSET = 12;
var navTitle = (el) => typeof el.props.title === "string" ? el.props.title : "";
var navItems = (el) => choiceItems(el);
function navItemTops(el) {
  const top = navTitle(el) === "" ? NAV_TITLE_AT : NAV_ITEMS_TOP;
  return navItems(el).map((_t, i) => top + i * NAV_ITEM_STEP).filter((y) => y + NAV_ITEM_H <= el.h);
}

// src/core/types/table.ts
var text15 = () => ({
  color: "$text",
  size: "sm"
});
var HEAD_LOOK = "color:var(--wf-muted);font-size:var(--wf-size-sm);font-weight:bold;";
function cellLook(el) {
  const s = mergeStyle(text15(), el);
  return `color:${cssColor(s.color, "$text")};font-size:${cssFontSize(s.size, "sm")};font-weight:${s.weight ?? "normal"};`;
}
var spec21 = {
  name: "table",
  label: "\u8868",
  // The height follows the band and the rows written (spec §3.1); the unfilled element is what the
  // author wrote, so a table whose h is written keeps it.
  defaults: (device, el) => ({
    w: Math.min(device.w - 48, 600),
    h: tableHeightOf(el.props)
  }),
  props: {
    columns: {
      kind: "string[]",
      default: [
        "\u5217 1",
        "\u5217 2",
        "\u5217 3"
      ],
      label: "\u5217",
      lines: true
    },
    rows: {
      kind: "string[]",
      default: [
        "\u9805\u76EE 1 | \u8AAC\u660E | 100",
        "\u9805\u76EE 2 | \u8AAC\u660E | 200",
        "\u9805\u76EE 3 | \u8AAC\u660E | 300"
      ],
      label: "\u884C(| \u3067\u533A\u5207\u308B)",
      lines: true
    }
  },
  box: () => ({
    fill: "$bg",
    border: "$border",
    radius: "md"
  }),
  text: text15,
  render: (el, h) => {
    const n = tableColumnCount(el);
    const cw = el.w / n;
    const right = numberColumns(el);
    const cell = (t, j, look2) => h("span", {
      class: "wf-table-cell",
      style: `left:${j * cw}px;width:${cw}px;` + (right[j] ? "text-align:right;" : "") + look2
    }, t);
    const columns = tableColumns(el);
    const rows = tableRows(el);
    const look = cellLook(el);
    const nodes = [];
    if (columns.length > 0) {
      nodes.push(h("div", {
        class: "wf-table-head",
        style: `height:${TABLE_HEAD_H}px;`
      }, ...columns.map((t, j) => cell(t, j, HEAD_LOOK))));
    }
    tableRowTops(el).forEach((top, i) => {
      nodes.push(h("div", {
        class: "wf-table-row",
        style: `top:${top}px;height:${TABLE_ROW_H}px;`
      }, ...Array.from({
        length: n
      }, (_v, j) => cell(rows[i][j] ?? "", j, look))));
      const line = top + TABLE_ROW_H - 1;
      if (i < rows.length - 1 && line < el.h) {
        nodes.push(h("div", {
          class: "wf-table-line",
          style: `top:${line}px;`
        }));
      }
    });
    return [
      h("div", {
        class: "wf-table"
      }, ...nodes)
    ];
  }
};

// src/core/types/sidenav.ts
var text16 = () => ({
  color: "$text",
  size: "md"
});
function itemLook(el, current) {
  const s = mergeStyle(text16(), el);
  const own = mergeStyle({}, el);
  const color = own.color !== void 0 ? s.color : current ? "$primary" : s.color;
  const weight = own.weight ?? (current ? "bold" : "normal");
  return `color:${cssColor(color, "$text")};font-size:${cssFontSize(s.size, "md")};font-weight:${weight};`;
}
var spec22 = {
  name: "sidenav",
  label: "\u5DE6\u306E\u6848\u5185\u6B04",
  defaults: (device) => ({
    w: 200,
    h: device.h
  }),
  props: {
    title: {
      kind: "string",
      default: "\u30E1\u30CB\u30E5\u30FC",
      label: "\u984C"
    },
    items: {
      kind: "string[]",
      default: [
        "\u30DB\u30FC\u30E0",
        "\u9805\u76EE 2",
        "\u9805\u76EE 3",
        "\u8A2D\u5B9A"
      ]
    },
    active: {
      kind: "number",
      default: 0,
      min: 0,
      label: "\u4ECA\u306E\u9805\u76EE"
    }
  },
  box: () => ({
    fill: "$surface",
    border: "none",
    radius: 0
  }),
  text: text16,
  render: (el, h) => {
    const title = navTitle(el);
    const items = navItems(el);
    const active = Number(el.props.active ?? 0);
    return [
      h("div", {
        class: "wf-sidenav"
      }, ...title === "" ? [] : [
        h("div", {
          class: "wf-sidenav-head"
        }, title)
      ], ...navItemTops(el).map((top, i) => h("div", {
        class: "wf-sidenav-item" + (i === active ? " is-active" : ""),
        style: `top:${top}px;left:${NAV_INSET}px;width:${Math.max(0, el.w - 2 * NAV_INSET)}px;`
      }, h("span", {
        class: "wf-sidenav-icon"
      }), h("span", {
        class: "wf-sidenav-text",
        style: itemLook(el, i === active)
      }, items[i]))))
    ];
  }
};

// src/core/types/breadcrumb.ts
var text17 = () => ({
  color: "$muted",
  size: "sm"
});
var spec23 = {
  name: "breadcrumb",
  label: "\u9053\u3057\u308B\u3079",
  defaults: () => ({
    w: 320,
    h: 20
  }),
  props: {
    items: {
      kind: "string[]",
      default: [
        "\u30DB\u30FC\u30E0",
        "\u4E00\u89A7",
        "\u8A73\u7D30"
      ]
    }
  },
  // No box of its own (spec §3.3): nothing is painted on the part, whatever fill or border say.
  innerBox: true,
  text: text17,
  render: (el, h) => {
    const s = mergeStyle(text17(), el);
    const size = `font-size:${cssFontSize(s.size, "sm")};`;
    const before = `color:${cssColor(s.color, "$muted")};` + size + "font-weight:normal;";
    const last = "color:var(--wf-text);" + size + `font-weight:${s.weight ?? "bold"};`;
    const items = choiceItems(el);
    const { steps, seps } = crumbsOf(el);
    const at = (c) => `left:${c.x}px;width:${c.w}px;`;
    const nodes = [];
    steps.forEach((c, i) => {
      const sep = seps[i - 1];
      if (sep && sep.x < el.w) {
        nodes.push(h("span", {
          class: "wf-crumb-sep",
          style: at(sep) + before
        }, "/"));
      }
      if (c.x >= el.w) return;
      const current = i === steps.length - 1;
      nodes.push(h("span", {
        class: "wf-crumb" + (current ? " is-current" : ""),
        style: at(c) + (current ? last : before)
      }, items[i]));
    });
    return [
      h("div", {
        class: "wf-crumbs"
      }, ...nodes)
    ];
  }
};

// src/core/types/group.ts
var spec24 = {
  name: "group",
  label: "\u30B0\u30EB\u30FC\u30D7",
  // Only for a group without children (an invalid file); the real size comes from the children.
  defaults: () => ({
    w: 8,
    h: 8
  }),
  props: {},
  allowsChildren: true,
  sizeFromChildren: true,
  render: () => []
};

// src/core/registry.ts
var UNKNOWN_SIZE = {
  w: 200,
  h: 120
};
function createRegistry(specs) {
  const map = /* @__PURE__ */ new Map();
  for (const s of specs) {
    if (map.has(s.name)) throw new Error(`duplicate part type: ${s.name}`);
    map.set(s.name, s);
  }
  return map;
}
var registry = createRegistry([
  spec,
  spec2,
  spec3,
  spec4,
  spec5,
  spec6,
  spec7,
  spec8,
  spec9,
  spec10,
  spec11,
  spec12,
  spec13,
  spec14,
  spec15,
  spec16,
  spec17,
  spec18,
  spec19,
  spec20,
  spec21,
  spec22,
  spec23,
  spec24
]);

// src/core/steps.ts
var STEP_ITEMS = [
  "progress",
  "dx",
  "dy",
  "scale",
  "opacity",
  "fill",
  "border",
  "color",
  "radius"
];
var ITEM_LABEL = {
  progress: "\u9032\u307F",
  dx: "\u305A\u308C \u6A2A",
  dy: "\u305A\u308C \u7E26",
  scale: "\u5927\u304D\u3055",
  opacity: "\u6FC3\u3055",
  fill: "\u5857\u308A",
  border: "\u67A0\u7DDA\u306E\u8272",
  color: "\u6587\u5B57\u306E\u8272",
  radius: "\u89D2\u306E\u4E38\u307F"
};
var IDENTITY = {
  progress: 1,
  dx: 0,
  dy: 0,
  scale: 1,
  opacity: 1,
  fill: null,
  border: null,
  color: null,
  radius: null
};
var START_VALUE = {
  ...IDENTITY,
  progress: 0
};
var STEPS_MAX = 10;
var DELAY_MAX = 5e3;
var REPEAT_MAX = 20;
var OFFSET_MAX = 2e3;
var RADIUS_MAX = 999;
var LABEL_MAX = 40;
var ALL_TYPES = [
  "text",
  "button",
  "input",
  "checkbox",
  "toggle",
  "image",
  "icon",
  "rect",
  "divider",
  "list",
  "navbar",
  "tabbar",
  "tabs",
  "radio",
  "slider",
  "progress",
  "chip",
  "badge",
  "avatar",
  "fab",
  "table",
  "sidenav",
  "breadcrumb",
  "group"
];
var BORDERED = [
  "rect",
  "button",
  "list",
  "image",
  "icon",
  "tabs",
  "radio",
  "chip",
  "badge",
  "avatar",
  "fab",
  "table",
  "sidenav"
];
var ROUNDED = [
  "rect",
  "button",
  "list",
  "image",
  "icon",
  "tabs",
  "radio",
  "progress",
  "chip",
  "avatar",
  "fab",
  "table",
  "sidenav"
];
var ITEM_TYPES = {
  progress: ALL_TYPES,
  dx: ALL_TYPES,
  dy: ALL_TYPES,
  scale: ALL_TYPES,
  opacity: ALL_TYPES,
  fill: [
    "rect",
    "button",
    "list",
    "image",
    "navbar",
    "tabbar",
    "tabs",
    "radio",
    "slider",
    "icon",
    "divider",
    "progress",
    "chip",
    "badge",
    "avatar",
    "fab",
    "table",
    "sidenav"
  ],
  border: BORDERED,
  radius: ROUNDED,
  color: [
    "text",
    "button",
    "input",
    "checkbox",
    "toggle",
    "navbar",
    "tabs",
    "radio",
    "slider",
    "image",
    "progress",
    "chip",
    "badge",
    "fab",
    "table",
    "sidenav",
    "breadcrumb"
  ]
};
var isObj2 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var isInt2 = (v) => typeof v === "number" && Number.isInteger(v);
var twoPlaces = (v) => Math.round(v * 100) / 100 === v;
function isStepMotion(m) {
  return isObj2(m) && "steps" in m;
}
function itemsOf(m) {
  const used = new Set(Object.keys(m.start ?? {}));
  for (const s of m.steps) for (const k of Object.keys(s.to)) used.add(k);
  return STEP_ITEMS.filter((k) => used.has(k));
}
function blockedBy(m, type) {
  return itemsOf(m).filter((k) => !ITEM_TYPES[k].includes(type));
}
function waypoints(m, item) {
  const out = [
    item in (m.start ?? {}) ? m.start[item] : START_VALUE[item]
  ];
  for (const s of m.steps) out.push(item in s.to ? s.to[item] : out[out.length - 1]);
  return out;
}
function endProblems(m) {
  return itemsOf(m).filter((item) => {
    const w = waypoints(m, item);
    const end = m.alternate && item !== "progress" ? w[0] : w[w.length - 1];
    return end !== IDENTITY[item];
  });
}
var COLOR_TEXT = `\u8272\u306F ${COLOR_NAMES.map((c) => "$" + c).join(" ")} \u304B #RRGGBB \u304B none \u304B null`;
function checkValue(item, v) {
  switch (item) {
    case "progress":
      return typeof v === "number" && v >= 0 && v <= 2 && twoPlaces(v) ? void 0 : "\u9032\u307F \u306F 0\u301C2 \u306E\u6570(\u5C0F\u6570 2 \u6841\u307E\u3067)";
    case "dx":
    case "dy":
      return isInt2(v) && Math.abs(v) <= OFFSET_MAX ? void 0 : `\u305A\u308C \u306F \u2212${OFFSET_MAX}\u301C${OFFSET_MAX} \u306E\u6574\u6570`;
    case "scale":
      return typeof v === "number" && v >= 0 && v <= 3 && twoPlaces(v) ? void 0 : "\u5927\u304D\u3055 \u306F 0\u301C3 \u306E\u6570(\u5C0F\u6570 2 \u6841\u307E\u3067)";
    case "opacity":
      return typeof v === "number" && v >= 0 && v <= 1 && twoPlaces(v) ? void 0 : "\u6FC3\u3055 \u306F 0\u301C1 \u306E\u6570(\u5C0F\u6570 2 \u6841\u307E\u3067)";
    case "fill":
    case "border":
    case "color": {
      const ok = v === null || v === "none" || typeof v === "string" && (HEX_COLOR.test(v) || v.startsWith("$") && COLOR_NAMES.includes(v.slice(1)));
      return ok ? void 0 : COLOR_TEXT;
    }
    case "radius":
      return v === null || SIZE_TOKENS.includes(v) || isInt2(v) && v >= 0 && v <= RADIUS_MAX ? void 0 : `\u89D2\u306E\u4E38\u307F \u306F sm / md / lg \u304B 0\u301C${RADIUS_MAX} \u306E\u6574\u6570\u304B null`;
  }
}
function checkValues(v, path, use, errors, empty) {
  if (!isObj2(v)) {
    errors.push({
      path,
      message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return;
  }
  if (!empty && Object.keys(v).length === 0) {
    errors.push({
      path,
      message: "\u9805\u76EE\u304C 1 \u3064\u4EE5\u4E0A\u8981\u308A\u307E\u3059"
    });
  }
  for (const [k, x] of Object.entries(v)) {
    if (!STEP_ITEMS.includes(k)) {
      errors.push({
        path: `${path}.${k}`,
        message: `${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`
      });
      continue;
    }
    if (k === "progress" && use === "effect") {
      errors.push({
        path: `${path}.${k}`,
        message: "\u305D\u306E\u5834\u3067\u52D5\u304F\u52D5\u304D\u306B \u9032\u307F \u306F\u4F7F\u3048\u307E\u305B\u3093"
      });
      continue;
    }
    const bad = checkValue(k, x);
    if (bad) errors.push({
      path: `${path}.${k}`,
      message: bad
    });
  }
}
function checkStepMotion(value, path, use, errors) {
  const before = errors.length;
  if (!isObj2(value)) {
    errors.push({
      path,
      message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return void 0;
  }
  const keys = [
    "label",
    "start",
    "steps",
    "delay",
    ...use === "effect" ? [
      "repeat",
      "alternate"
    ] : []
  ];
  for (const k of Object.keys(value)) {
    if (!keys.includes(k)) {
      errors.push({
        path: `${path}.${k}`,
        message: `motion \u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`
      });
    }
  }
  if (value.label !== void 0 && !(typeof value.label === "string" && value.label.trim() !== "" && value.label.length <= LABEL_MAX)) {
    errors.push({
      path: `${path}.label`,
      message: `label \u306F 1\u301C${LABEL_MAX} \u5B57`
    });
  }
  if (value.start !== void 0) checkValues(value.start, `${path}.start`, use, errors, true);
  const steps = value.steps;
  if (!Array.isArray(steps) || steps.length === 0 || steps.length > STEPS_MAX) {
    errors.push({
      path: `${path}.steps`,
      message: `\u6BB5\u306F 1\u301C${STEPS_MAX} \u500B`
    });
  } else {
    steps.forEach((s, i) => {
      const sp = `${path}.steps.${i}`;
      if (!isObj2(s)) return errors.push({
        path: sp,
        message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
      for (const k of Object.keys(s)) {
        if (![
          "to",
          "ms",
          "easing"
        ].includes(k)) {
          errors.push({
            path: `${sp}.${k}`,
            message: `\u6BB5\u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`
          });
        }
      }
      checkValues(s.to, `${sp}.to`, use, errors, false);
      if (s.ms !== void 0 && !(MOTION_SPEEDS.includes(s.ms) || isInt2(s.ms) && s.ms >= 0 && s.ms <= MOTION_SPEED_MAX)) {
        errors.push({
          path: `${sp}.ms`,
          message: `\u9577\u3055\u306F ${MOTION_SPEEDS.join(" / ")} \u304B 0\u301C${MOTION_SPEED_MAX} \u306E\u6574\u6570`
        });
      }
      if (s.easing !== void 0 && !MOTION_EASINGS.includes(s.easing)) {
        errors.push({
          path: `${sp}.easing`,
          message: `\u7DE9\u6025\u306F ${MOTION_EASINGS.join(" / ")}`
        });
      }
    });
  }
  if (value.delay !== void 0 && !(isInt2(value.delay) && value.delay >= 0 && value.delay <= DELAY_MAX)) {
    errors.push({
      path: `${path}.delay`,
      message: `\u9045\u308C\u306F 0\u301C${DELAY_MAX} \u306E\u6574\u6570`
    });
  }
  if (use === "effect") {
    if (value.repeat !== void 0 && !(isInt2(value.repeat) && value.repeat >= 1 && value.repeat <= REPEAT_MAX)) {
      errors.push({
        path: `${path}.repeat`,
        message: `\u7E70\u308A\u8FD4\u3057\u306F 1\u301C${REPEAT_MAX} \u306E\u6574\u6570`
      });
    }
    if (value.alternate !== void 0 && typeof value.alternate !== "boolean") {
      errors.push({
        path: `${path}.alternate`,
        message: "\u5F80\u5FA9\u306F true \u304B false"
      });
    }
  }
  if (errors.length > before) return void 0;
  const m = value;
  if (use === "value" && !itemsOf(m).includes("progress")) {
    errors.push({
      path: `${path}.steps`,
      message: "\u5024\u304C\u5909\u308F\u308B\u52D5\u304D\u306F \u9032\u307F \u3092\u4F7F\u3044\u307E\u3059"
    });
  }
  const off = endProblems(m);
  if (off.length) {
    errors.push({
      path: `${path}.steps`,
      message: `${off.map((k) => ITEM_LABEL[k]).join("\u30FB")} \u304C\u6700\u5F8C\u306B \u305D\u306E\u307E\u307E \u306B\u623B\u3063\u3066\u3044\u307E\u305B\u3093`
    });
  }
  return errors.length > before ? void 0 : m;
}
function orderValues(v) {
  const out = {};
  for (const k of STEP_ITEMS) if (k in v) out[k] = v[k];
  return out;
}
function normalizeStepMotion(m) {
  const out = {};
  if (m.label !== void 0) out.label = m.label;
  if (m.start && Object.keys(m.start).length > 0) out.start = orderValues(m.start);
  out.steps = m.steps.map((s) => {
    const step = {
      to: orderValues(s.to)
    };
    if (s.ms !== void 0 && s.ms !== "normal") step.ms = s.ms;
    if (s.easing !== void 0) step.easing = s.easing;
    return step;
  });
  if (m.delay) out.delay = m.delay;
  if (m.repeat !== void 0 && m.repeat !== 1) out.repeat = m.repeat;
  if (m.alternate) out.alternate = true;
  return out;
}

// src/core/motions.ts
var MOTIONS = [
  {
    name: "smooth",
    label: "Smooth",
    rows: "value",
    note: "\u5024\u304C\u3001\u901F\u3055\u3068\u7DE9\u6025\u306E\u3068\u304A\u308A\u306B\u79FB\u308B(\u65E2\u5B9A)"
  },
  {
    name: "spring",
    label: "Spring",
    rows: "value",
    note: "\u884C\u304D\u904E\u304E\u3066\u304B\u3089\u623B\u308B\u3002\u7DE9\u6025\u306F\u4F7F\u308F\u306A\u3044"
  },
  {
    name: "fade",
    label: "Fade",
    rows: "appear",
    note: "\u6FC3\u3055\u304C\u79FB\u3063\u3066\u73FE\u308C\u3001\u6D88\u3048\u308B(\u65E2\u5B9A)"
  },
  {
    name: "slide-up",
    label: "Slide up",
    rows: "appear",
    note: "\u4E0B\u304B\u3089\u4E0A\u3078\u6ED1\u3063\u3066\u73FE\u308C\u308B"
  },
  {
    name: "slide-down",
    label: "Slide down",
    rows: "appear",
    note: "\u4E0A\u304B\u3089\u4E0B\u3078\u6ED1\u3063\u3066\u73FE\u308C\u308B"
  },
  {
    name: "slide-left",
    label: "Slide left",
    rows: "appear",
    note: "\u53F3\u304B\u3089\u5DE6\u3078\u6ED1\u3063\u3066\u73FE\u308C\u308B"
  },
  {
    name: "slide-right",
    label: "Slide right",
    rows: "appear",
    note: "\u5DE6\u304B\u3089\u53F3\u3078\u6ED1\u3063\u3066\u73FE\u308C\u308B"
  },
  {
    name: "scale",
    label: "Scale",
    rows: "appear",
    note: "\u5C11\u3057\u5C0F\u3055\u3044\u59FF\u304B\u3089\u5E83\u304C\u3063\u3066\u73FE\u308C\u308B"
  },
  {
    name: "instant",
    label: "Instant",
    rows: "both",
    note: "\u52D5\u304B\u3055\u306A\u3044\u3002\u901F\u3055\u3068\u7DE9\u6025\u306F\u4F7F\u308F\u306A\u3044"
  }
];
var DEFAULT_MOTION = {
  value: "smooth",
  appear: "fade"
};
var ROWS_TEXT = {
  value: "\u5024\u304C\u5909\u308F\u308B",
  appear: "\u73FE\u308C\u308B\u30FB\u6D88\u3048\u308B",
  both: "\u3069\u3061\u3089\u3082"
};
function findMotion(name) {
  return MOTIONS.find((m) => m.name === name);
}
function motionsFor(kind) {
  return MOTIONS.filter((m) => m.rows === kind || m.rows === "both");
}
function motionFits(name, kind) {
  return motionsFor(kind).some((m) => m.name === name);
}
function isMotionOnly(row) {
  return row.motion !== void 0 && Object.keys(row).every((k) => k === "motion");
}
function rowKind(row) {
  return row.hidden !== void 0 || isMotionOnly(row) ? "appear" : "value";
}
function isStepped(m) {
  return isStepMotion(m);
}
function motionName(row) {
  const m = row.motion;
  if (isStepped(m)) return "custom";
  return m?.name ?? DEFAULT_MOTION[rowKind(row)];
}
var CUSTOM_LABEL = "\u81EA\u5206\u3067\u7D44\u3093\u3060\u52D5\u304D";
function sameMotion(a, b) {
  if (isStepped(a) || isStepped(b)) {
    return isStepped(a) && isStepped(b) && JSON.stringify(normalizeStepMotion(a)) === JSON.stringify(normalizeStepMotion(b));
  }
  return a?.name === b?.name && a?.speed === b?.speed && a?.easing === b?.easing;
}

// src/core/blocks.ts
var EVENTS = [
  {
    event: "press",
    label: "\u62BC\u3059",
    targets: "part",
    takes: "at: tabbar\u30FBtabs\u30FBradio\u30FBsidenav \u306F\u4F55\u756A\u76EE\u3001list\u30FBtable \u306F\u4F55\u884C\u76EE\u3001breadcrumb \u306F\u4F55\u756A\u76EE\u306E\u6BB5(0 \u304B\u3089)\u3001navbar \u306F left / right\u3002\u7701\u3051\u3070\u90E8\u54C1\u5168\u4F53",
    note: "\u90E8\u54C1(\u304B\u3001\u305D\u306E\u5834\u6240)\u304C\u62BC\u3055\u308C\u305F"
  },
  {
    event: "hold",
    label: "\u9577\u62BC\u3057",
    targets: "part",
    takes: "ms: 100\u301C5000 \u306E\u6574\u6570(\u7701\u3051\u3070 500)\u3002at: press \u3068\u540C\u3058",
    note: "\u52D5\u304B\u3055\u305A\u306B ms \u306E\u3042\u3044\u3060\u62BC\u3057\u7D9A\u3051\u305F\u3002\u9577\u62BC\u3057\u3092\u3057\u305F\u3089\u3001\u96E2\u3057\u3066\u3082\u300C\u62BC\u3059\u300D\u306F\u52D5\u304B\u306A\u3044"
  },
  {
    event: "swipe",
    label: "\u30B9\u30EF\u30A4\u30D7",
    targets: "part-or-screen",
    takes: "dir: up / down / left / right(\u5FC5\u9808\u3002\u6307\u306E\u52D5\u304F\u5411\u304D)\u3002at: press \u3068\u540C\u3058",
    note: "\u62BC\u3057\u305F\u307E\u307E dir \u306E\u5411\u304D\u306B\u52D5\u304B\u3057\u3066\u96E2\u3057\u305F\u3002Then \u306E\u5148\u982D\u306E State \u306E\u51E6\u7406\u306F\u6307\u306B\u4ED8\u3044\u3066\u304F\u308B\u3002slider \u306B\u306F\u66F8\u3051\u306A\u3044(\u30B9\u30E9\u30A4\u30C0\u30FC\u306E\u4E0A\u3067\u52D5\u304B\u3059\u3068\u5024\u304C\u5909\u308F\u308B)"
  },
  {
    event: "enter",
    label: "\u30DD\u30A4\u30F3\u30BF\u304C\u8F09\u3063\u305F",
    targets: "part",
    takes: "\u2013",
    note: "\u30DD\u30A4\u30F3\u30BF\u304C\u90E8\u54C1\u306B\u8F09\u3063\u305F"
  },
  {
    event: "leave",
    label: "\u30DD\u30A4\u30F3\u30BF\u304C\u5916\u308C\u305F",
    targets: "part",
    takes: "\u2013",
    note: "\u30DD\u30A4\u30F3\u30BF\u304C\u90E8\u54C1\u304B\u3089\u5916\u308C\u305F"
  },
  {
    event: "appear",
    label: "\u73FE\u308C\u305F\u76F4\u5F8C",
    targets: "part-or-screen",
    takes: "\u2013",
    note: "\u753B\u9762\u304C\u51FA\u305F\u3068\u304D\u3001\u90E8\u54C1\u304C\u898B\u3048\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3068\u304D"
  },
  {
    event: "after",
    label: "\u6642\u9593\u304C\u305F\u3063\u305F\u3089",
    targets: "part-or-screen",
    takes: "ms: 0\u301C60000 \u306E\u6574\u6570(\u5FC5\u9808)",
    note: "\u73FE\u308C\u3066\u304B\u3089 ms \u306E\u3042\u3068\u3002\u305D\u306E\u524D\u306B\u6D88\u3048\u305F\u3089\u53D6\u308A\u6D88\u3057"
  },
  {
    event: "key",
    label: "\u30AD\u30FC\u3092\u62BC\u3057\u305F",
    targets: "box-or-screen",
    takes: "key: enter / escape(\u5FC5\u9808)",
    note: "\u898B\u3048\u3066\u3044\u308B\u7BB1\u3068\u753B\u9762\u306E\u3046\u3061\u3001\u4E00\u756A\u5185\u5074\u306E\u3082\u306E\u304C\u53D7\u3051\u308B"
  },
  {
    event: "change",
    label: "\u5024\u304C\u5909\u308F\u3063\u305F",
    targets: "valued",
    takes: "\u2013",
    note: "checkbox / toggle / chip / tabbar / tabs / radio / sidenav / slider / input / \u884C(items)\u306E\u3042\u308B list \u306E\u5024\u304C\u5909\u308F\u3063\u305F(\u62BC\u3057\u3066\u30FB\u6253\u3063\u3066\u30FB\u51E6\u7406\u3067)"
  }
];
var VALUE_TYPES = {
  checkbox: "boolean",
  toggle: "boolean",
  chip: "boolean",
  tabbar: "number",
  tabs: "number",
  radio: "number",
  sidenav: "number",
  slider: "range",
  input: "string"
};
function valueKindOf(type, rows) {
  if (type === "list") return rows ? "row" : void 0;
  return VALUE_TYPES[type];
}
var PLACE_TYPES = [
  "tabbar",
  "tabs",
  "radio",
  "sidenav",
  "list",
  "table",
  "breadcrumb",
  "navbar"
];
function isValueCondition(c) {
  return "part" in c;
}
function canCarry(event, type, registry2, el) {
  const spec25 = EVENTS.find((e) => e.event === event);
  if (!spec25) return false;
  switch (spec25.targets) {
    case "part":
      return type !== void 0;
    case "part-or-screen":
      return !(event === "swipe" && type === "slider");
    case "box-or-screen":
      return type === void 0 || registry2.get(type)?.allowsChildren === true;
    case "valued":
      return type !== void 0 && valueKindOf(type, el !== void 0 && hasRows({
        props: el.props ?? {}
      })) !== void 0;
  }
}
function conditionsOf(block) {
  return block.if?.all ?? block.if?.any ?? [];
}
function eventLabel(event) {
  return `${EVENTS.find((e) => e.event === event).label}(${event})`;
}

// src/core/values.ts
var MIRROR_TYPES = [
  "text",
  "button",
  "navbar"
];
var isMirrorType = (type) => MIRROR_TYPES.includes(type);
function isRef(v) {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const o = v;
  if (typeof o.part !== "string") return false;
  if ("screen" in o && typeof o.screen !== "string") return false;
  return Object.keys(o).every((k) => k === "part" || k === "screen");
}
function refLabel(ref, here, kept, label) {
  if (ref.screen === void 0) return here(ref.part);
  const k = kept.find((x) => x.screen === ref.screen && x.part === ref.part);
  return k ? `${k.title} \u203A ${label(k.el)}` : `${ref.screen} \u203A ${ref.part}`;
}

// src/core/compare.ts
var compareKeysOf = (c) => COMPARE_KEYS.filter((k) => c[k] !== void 0);
function compareOf(c) {
  const keys = compareKeysOf(c);
  if (keys.length !== 1) return void 0;
  switch (keys[0]) {
    case "is": {
      const v = c.is;
      return typeof v === "object" ? {
        kind: "same",
        ref: v
      } : {
        kind: "is",
        value: v
      };
    }
    case "has":
      return {
        kind: "has",
        text: c.has
      };
    case "length":
      return {
        kind: "length",
        range: c.length
      };
    case "number":
      return {
        kind: "number",
        range: c.number
      };
  }
}

// src/core/group.ts
var GROUP_TYPE2 = "group";
function groupSize(children) {
  return {
    w: Math.max(1, ...children.map((c) => c.x + c.w)),
    h: Math.max(1, ...children.map((c) => c.y + c.h))
  };
}

// src/core/defaults-file.ts
var NO_DEFAULTS = {};
var emptyDefaults = () => ({
  version: 1,
  parts: {}
});
var PROBES = [
  {
    w: 1,
    h: 1
  },
  {
    w: 4096,
    h: 4096
  }
];
function plainAxes(spec25, device, el) {
  const bare = {
    id: el.id,
    type: el.type,
    x: 0,
    y: 0
  };
  const base = spec25.defaults(device, bare);
  const byDevice = PROBES.some((d) => {
    const s = spec25.defaults(d, bare);
    return s.w !== base.w || s.h !== base.h;
  });
  if (byDevice) return {
    w: false,
    h: false
  };
  const here = spec25.defaults(device, el);
  return {
    w: here.w === base.w,
    h: here.h === base.h
  };
}
function defaultSize(spec25, device, el, d) {
  const size = spec25.defaults(device, el);
  if (!d || d.w === void 0 && d.h === void 0) return size;
  const plain = plainAxes(spec25, device, el);
  return {
    w: plain.w && d.w !== void 0 ? d.w : size.w,
    h: plain.h && d.h !== void 0 ? d.h : size.h
  };
}
function stripBase(el) {
  const { base: _base, ...rest } = el;
  const out = rest;
  if (out.children) out.children = out.children.map((c) => stripBase(c));
  return out;
}

// src/core/defaults.ts
function fillElement(el, device, registry2, parent, defaults = NO_DEFAULTS) {
  const spec25 = registry2.get(el.type);
  const d = el.set === void 0 ? defaults[el.type] : void 0;
  const size = spec25 ? defaultSize(spec25, device, el, d) : UNKNOWN_SIZE;
  const props = {};
  if (spec25) {
    for (const [key, p] of Object.entries(spec25.props)) {
      props[key] = Array.isArray(p.default) ? [
        ...p.default
      ] : p.default;
    }
  }
  Object.assign(props, el.props ?? {});
  const own = layoutOf(el);
  const sizing = {
    own: {
      w: size.w,
      h: size.h
    }
  };
  for (const axis of [
    "w",
    "h"
  ]) {
    const written2 = el[axis];
    if (written2 === "fit" && el.type === "group" && !own) continue;
    if (written2 === "fit" || written2 === "fill") sizing[axis] = written2;
    else if (written2 === void 0) {
      if (parent && axis === crossAxis(parent.dir) && parent.align === "stretch") {
        sizing[axis] = "fill";
      } else if (own && (axis === mainAxis(own.dir) || el.type === "group")) sizing[axis] = "fit";
    }
  }
  const filled = {
    ...el,
    x: el.x ?? 0,
    y: el.y ?? 0,
    w: typeof el.w === "number" ? el.w : size.w,
    h: typeof el.h === "number" ? el.h : size.h,
    props,
    ...sizing.w || sizing.h ? {
      sizing
    } : {}
  };
  if (d?.style && Object.keys(d.style).length) filled.base = {
    ...d.style
  };
  else delete filled.base;
  if (el.children) {
    const bounds = spec25?.sizeFromChildren ? device : {
      w: filled.w,
      h: filled.h
    };
    const below = el.set === void 0 ? defaults : NO_DEFAULTS;
    filled.children = el.children.map((c) => fillElement(c, bounds, registry2, own, below));
    if (spec25?.sizeFromChildren && !own && filled.children.length > 0) {
      Object.assign(filled, groupSize(filled.children));
    }
  }
  return filled;
}
function fillScreen(screen, projectDevice, registry2, defaults = NO_DEFAULTS) {
  const device = screen.device ?? projectDevice;
  const size = deviceSize(device);
  return {
    ...screen,
    device,
    elements: placeElements(screen.elements.map((e) => fillElement(e, size, registry2, void 0, defaults)))
  };
}

// src/core/proposals.ts
var DEFAULT_PROPOSAL_ID = "a";

// src/core/references.ts
function slugify(text18, fallback) {
  const s = text18.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s === "" ? fallback : s;
}
function uniqueName(name, taken) {
  const set = new Set(taken);
  if (!set.has(name)) return name;
  for (let n = 2; ; n++) {
    if (!set.has(`${name}-${n}`)) return `${name}-${n}`;
  }
}
function fileStem(file) {
  const base = file.replace(/^.*[\\/]/, "");
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}
function isReferenceFile(file) {
  const parts = file.split("/");
  return parts.length === 3 && parts[0] === "library" && parts[1] === "references" && parts[2] !== "" && parts[2] !== "." && parts[2] !== ".." && !file.includes("\\");
}
var isRecord = (v) => typeof v === "object" && v !== null;
function completeReferences(refs) {
  const taken = new Set(refs.filter(isRecord).map((r) => r.id).filter((v) => typeof v === "string"));
  return refs.map((r) => {
    if (!isRecord(r)) return r;
    if (typeof r.id === "string" && typeof r.title === "string") return r;
    const name = typeof r.file === "string" ? fileStem(r.file) : "";
    let id = r.id;
    if (typeof id !== "string") {
      id = uniqueName(slugify(name, "ref"), taken);
      taken.add(id);
    }
    return {
      ...r,
      id,
      title: typeof r.title === "string" ? r.title : name || id
    };
  });
}

// src/core/effects.ts
var EFFECTS = [
  {
    name: "shake",
    label: "Shake",
    note: "\u6A2A\u306B\u5C0F\u3055\u304F\u63FA\u308C\u308B",
    motion: {
      steps: [
        {
          to: {
            dx: -8
          },
          ms: 60
        },
        {
          to: {
            dx: 8
          },
          ms: 60
        }
      ],
      repeat: 3,
      alternate: true
    }
  },
  {
    name: "pop",
    label: "Pop",
    note: "\u5C11\u3057\u5927\u304D\u304F\u306A\u3063\u3066\u623B\u308B",
    motion: {
      steps: [
        {
          to: {
            scale: 1.08
          },
          ms: 120,
          easing: "decelerate"
        },
        {
          to: {
            scale: 1
          },
          ms: 120,
          easing: "standard"
        }
      ]
    }
  },
  {
    name: "flash",
    label: "Flash",
    note: "\u4E00\u77AC\u8584\u304F\u306A\u3063\u3066\u623B\u308B",
    motion: {
      steps: [
        {
          to: {
            opacity: 0.4
          },
          ms: 100
        },
        {
          to: {
            opacity: 1
          },
          ms: 160
        }
      ]
    }
  }
];
function findEffect(name) {
  return EFFECTS.find((e) => e.name === name);
}
function effectLabel(m) {
  if (isStepMotion(m)) return m.label ?? CUSTOM_LABEL;
  return findEffect(m.name)?.label ?? m.name;
}

// src/core/validate.ts
var REF_SHAPE = "{ part } \u304B { screen, part } \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059(\u3069\u3061\u3089\u3082 ^[a-z0-9][a-z0-9-]*$)";
var wellFormedRef = (v) => isRef(v) && ID_PATTERN.test(v.part) && (v.screen === void 0 || ID_PATTERN.test(v.screen));
var KIND_NAMES = {
  boolean: "\u771F\u507D",
  number: "\u4F55\u756A\u76EE",
  string: "\u6587\u5B57\u5217",
  row: "\u884C",
  range: "\u7BC4\u56F2\u306E\u6570"
};
var notValued = (name, type) => `${name}(${type})\u306F\u5024\u3092\u6301\u3064\u90E8\u54C1\u3067\u306F\u3042\u308A\u307E\u305B\u3093(${Object.keys(VALUE_TYPES).join(" / ")})`;
var NO_ROWS = (name) => `${name} \u306F\u884C\u3092\u6301\u305F\u306A\u3044\u4E00\u89A7\u3067\u3059(items \u3092\u66F8\u304D\u307E\u3059)`;
var notValuedOrRows = (name, type) => type === "list" ? NO_ROWS(name) : notValued(name, type);
var isObj3 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function choiceCount(type, raw, registry2) {
  if (type === void 0 || !CHOICE_TYPES.includes(type)) return void 0;
  if (isObj3(raw?.props) && Array.isArray(raw.props.items)) return raw.props.items.length;
  const items = registry2.get(type)?.props.items;
  return items?.kind === "string[]" ? items.default.length : 0;
}
var pastItems = (n, count) => n < count ? void 0 : count === 0 ? "items \u304C\u7A7A\u3067\u3059" : `\u9805\u76EE\u306F ${count} \u500B\u3067\u3059(0\u301C${count - 1})`;
function checkProgress(props, p, out) {
  const max = props.max === void 0 ? 100 : props.max;
  const value = props.value === void 0 ? 40 : props.value;
  if (!isInt3(max) || !isInt3(value) || max < 1) return;
  if (value < 0 || value > max) {
    out.errors.push({
      path: `${p}.props.value`,
      message: `value \u306F 0\u301Cmax(0\u301C${max})\u306E\u4E2D\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
    });
  }
}
function checkSlider(props, p, out) {
  const written2 = [
    "min",
    "max",
    "step",
    "value"
  ].filter((k) => props[k] !== void 0);
  if (written2.some((k) => typeof props[k] !== "number" || !Number.isFinite(props[k]))) return;
  const nums = sliderNums({
    props
  });
  if (!(nums.max > nums.min)) {
    out.errors.push({
      path: `${p}.props.max`,
      message: `max \u306F min(${nums.min})\u3088\u308A\u5927\u304D\u3044\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
    });
  }
  if (!(nums.step > 0)) {
    out.errors.push({
      path: `${p}.props.step`,
      message: "step \u306F 0 \u3088\u308A\u5927\u304D\u3044\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  }
  if (!(nums.max > nums.min) || !(nums.step > 0)) return;
  if (nums.value < nums.min || nums.value > nums.max) {
    out.errors.push({
      path: `${p}.props.value`,
      message: `value \u306F min\u301Cmax(${nums.min}\u301C${nums.max})\u306E\u4E2D\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
    });
  } else if (!onStep({
    props
  }, nums.value)) {
    out.warnings.push({
      path: `${p}.props.value`,
      message: `\u523B\u307F ${nums.step} \u306B\u5408\u3063\u3066\u3044\u307E\u305B\u3093`
    });
  }
}
var rowsOfRaw = (raw) => raw !== void 0 && isObj3(raw.props) && isRowArray(raw.props.items) && raw.props.items.length > 0;
var isInt3 = (v) => typeof v === "number" && Number.isInteger(v);
var COLOR_REFS = new Set(COLOR_NAMES.map((n) => `$${n}`));
function isColorValue(v) {
  return typeof v === "string" && (v === "none" || COLOR_REFS.has(v) || HEX_COLOR.test(v));
}
function isSizeValue(v) {
  return typeof v === "string" && SIZE_TOKENS.includes(v) || isInt3(v) && v >= 0;
}
function layoutGiven(el, spec25) {
  if (!spec25?.allowsChildren || !isObj3(el.layout)) return void 0;
  const L = layoutOf(el);
  if (!L) return void 0;
  return LAYOUT_DIRS.includes(L.dir) ? L : {
    ...L,
    dir: "column"
  };
}
var isPad = (v) => isInt3(v) && v >= 0;
var sideName = (axis) => axis === "h" ? "\u9AD8\u3055" : "\u5E45";
function checkLayout(el, p, spec25, out) {
  if (el.layout === void 0 || !spec25) return;
  const lp = `${p}.layout`;
  if (!spec25.allowsChildren) {
    out.errors.push({
      path: lp,
      message: "layout \u306F rect \u3068 group \u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093"
    });
    return;
  }
  const l = el.layout;
  if (!isObj3(l)) {
    out.errors.push({
      path: lp,
      message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return;
  }
  for (const key of Object.keys(l)) {
    if (!LAYOUT_KEYS.includes(key)) {
      out.errors.push({
        path: `${lp}.${key}`,
        message: `layout \u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093`
      });
    }
  }
  if (!LAYOUT_DIRS.includes(l.dir)) {
    out.errors.push({
      path: `${lp}.dir`,
      message: "layout.dir \u306F column \u304B row \u3067\u3059"
    });
  }
  if (l.gap !== void 0 && !isPad(l.gap)) {
    out.errors.push({
      path: `${lp}.gap`,
      message: "0 \u4EE5\u4E0A\u306E\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  }
  if (l.pad !== void 0 && !isPad(l.pad) && !(Array.isArray(l.pad) && l.pad.length === 2 && l.pad.every(isPad))) {
    out.errors.push({
      path: `${lp}.pad`,
      message: "0 \u4EE5\u4E0A\u306E\u6574\u6570\u304B\u3001[\u7E26, \u6A2A] \u306E 2 \u3064\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  }
  if (l.align !== void 0 && !LAYOUT_ALIGNS.includes(l.align)) {
    out.errors.push({
      path: `${lp}.align`,
      message: `${LAYOUT_ALIGNS.join(" / ")} \u306E\u3069\u308C\u304B\u3067\u3059`
    });
  }
  if (l.justify !== void 0 && !LAYOUT_JUSTIFIES.includes(l.justify)) {
    out.errors.push({
      path: `${lp}.justify`,
      message: `${LAYOUT_JUSTIFIES.join(" / ")} \u306E\u3069\u308C\u304B\u3067\u3059`
    });
  }
  const scroll = spec25.name === "rect" && isObj3(el.props) ? el.props.scroll : void 0;
  const sent = scroll === "y" && l.dir === "column" ? "h" : scroll === "x" && l.dir === "row" ? "w" : void 0;
  if (sent !== void 0 && typeof el[sent] !== "number") {
    out.errors.push({
      path: `${p}.${sent}`,
      message: `${p} \u306F scroll: ${scroll} \u306A\u306E\u3067 ${sent} \u3092\u6570\u5B57\u3067\u66F8\u304D\u307E\u3059(\u9001\u308B\u7BB1\u306E${sideName(sent)}\u306F\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u3089\u308C\u307E\u305B\u3093)`
    });
  }
}
function checkDevice(v, path, errors) {
  if (isDeviceName(v)) return deviceSize(v);
  if (isObj3(v) && isInt3(v.w) && isInt3(v.h) && v.w > 0 && v.h > 0) return {
    w: v.w,
    h: v.h
  };
  errors.push({
    path,
    message: "\u7AEF\u672B\u67A0\u306F phone / phone-android / tablet / desktop \u304B { w, h } \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
  });
  return void 0;
}
function checkProp(value, spec25) {
  switch (spec25.kind) {
    case "string":
      if (typeof value !== "string") return "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
      if (spec25.oneOf && !spec25.oneOf.includes(value)) {
        return `\u8A31\u3055\u308C\u308B\u5024\u306F ${spec25.oneOf.join(" / ")} \u3067\u3059`;
      }
      return void 0;
    case "number":
      if (spec25.decimal) {
        if (typeof value !== "number" || !Number.isFinite(value)) return "\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
      } else if (!isInt3(value)) return "\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
      if (spec25.min !== void 0 && value < spec25.min) {
        return `${spec25.min} \u4EE5\u4E0A\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      return void 0;
    case "boolean":
      return typeof value === "boolean" ? void 0 : "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
    case "string[]":
      return Array.isArray(value) && value.every((x) => typeof x === "string") ? void 0 : "\u6587\u5B57\u5217\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
    case "rows":
      return isRowArray(value) ? void 0 : "\u884C\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
  }
}
function checkRows(rows, path, errors) {
  rows.forEach((row, n) => {
    for (const [k, v] of Object.entries(row)) {
      const p = `${path}.${n}.${k}`;
      const spec25 = ROW_FIELDS[k];
      if (!spec25) {
        errors.push({
          path: p,
          message: `\u884C\u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`
        });
      } else if (spec25.kind === "string") {
        if (typeof v !== "string") errors.push({
          path: p,
          message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
        });
      } else if (spec25.kind === "boolean") {
        if (typeof v !== "boolean") {
          errors.push({
            path: p,
            message: "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
      } else if (typeof v !== "string" || !spec25.values.includes(v)) {
        errors.push({
          path: p,
          message: `\u8A31\u3055\u308C\u308B\u5024\u306F ${spec25.values.join(" / ")} \u3067\u3059`
        });
      }
    }
  });
}
function checkStyle(style, path, errors) {
  for (const [key, value] of Object.entries(style)) {
    const p = `${path}.${key}`;
    if (!STYLE_KEYS.includes(key)) {
      errors.push({
        path: p,
        message: `style \u306B ${key} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`
      });
      continue;
    }
    const ok = key === "fill" || key === "color" || key === "border" ? isColorValue(value) : key === "radius" || key === "size" ? isSizeValue(value) : key === "weight" ? value === "normal" || value === "bold" : key === "align" ? value === "left" || value === "center" || value === "right" : typeof value === "number" && value >= 0 && value <= 1;
    if (!ok) {
      errors.push({
        path: p,
        message: `style.${key} \u306E\u5024 ${JSON.stringify(value)} \u306F\u4F7F\u3048\u307E\u305B\u3093`
      });
    }
  }
}
var CUSTOM = "custom";
var MOTION_PLACE = "motion \u306F State \u306E changes \u306E\u884C\u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093";
var isEasing = (v) => typeof v === "string" && MOTION_EASINGS.includes(v);
var EASING_TEXT = `\u7DE9\u6025\u306F ${MOTION_EASINGS.join(" / ")} \u306E\u3069\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
function checkMotion(value, path, errors) {
  if (isStepMotion(value)) {
    const rest = {};
    let mixed = false;
    for (const [key, v] of Object.entries(value)) {
      if (MOTION_KEYS.includes(key)) {
        errors.push({
          path: `${path}.${key}`,
          message: `\u6BB5\u306E\u52D5\u304D\u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093`
        });
        mixed = true;
      } else rest[key] = v;
    }
    const sound = checkStepMotion(rest, path, "row", errors);
    return sound && !mixed ? CUSTOM : void 0;
  }
  if (!isObj3(value)) {
    errors.push({
      path,
      message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return void 0;
  }
  let name;
  for (const [key, v] of Object.entries(value)) {
    const p = `${path}.${key}`;
    if (!MOTION_KEYS.includes(key)) {
      errors.push({
        path: p,
        message: `motion \u306B ${key} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`
      });
    } else if (key === "name") {
      if (typeof v === "string" && findMotion(v)) name = v;
      else {
        errors.push({
          path: p,
          message: `\u52D5\u304D ${JSON.stringify(v)} \u306F\u3042\u308A\u307E\u305B\u3093(wireframe motions \u3067\u4E00\u89A7\u3092\u51FA\u305B\u307E\u3059)`
        });
      }
    } else if (key === "speed") {
      const named = typeof v === "string" && MOTION_SPEEDS.includes(v);
      if (!named && !(isInt3(v) && v >= 0 && v <= MOTION_SPEED_MAX)) {
        errors.push({
          path: p,
          message: `\u901F\u3055\u306F ${MOTION_SPEEDS.join(" / ")} \u304B 0\u301C${MOTION_SPEED_MAX} \u306E\u6574\u6570(\u30DF\u30EA\u79D2)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
        });
      }
    } else if (!isEasing(v)) {
      errors.push({
        path: p,
        message: EASING_TEXT
      });
    }
  }
  return name;
}
function checkElements(list, path, bounds, seen, opts, out, clip = true, free, parent, parentId, underSet = false) {
  const boxes = [];
  if (!Array.isArray(list)) {
    out.errors.push({
      path,
      message: "\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return boxes;
  }
  list.forEach((el, i) => {
    let p = `${path}[${i}]`;
    if (!isObj3(el)) {
      out.errors.push({
        path: p,
        message: "\u8981\u7D20\u306F\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
      return;
    }
    if (typeof el.id === "string" && ID_PATTERN.test(el.id)) {
      p = el.id;
      if (seen.has(el.id)) out.errors.push({
        path: p,
        message: `id "${el.id}" \u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059`
      });
      seen.add(el.id);
    } else {
      out.errors.push({
        path: `${p}.id`,
        message: "id \u306F ^[a-z0-9][a-z0-9-]*$ \u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    }
    const spec25 = typeof el.type === "string" ? opts.registry.get(el.type) : void 0;
    if (!spec25) {
      out.errors.push({
        path: `${p}.type`,
        message: `\u672A\u77E5\u306E\u90E8\u54C1\u306E\u7A2E\u985E ${JSON.stringify(el.type)}`
      });
    }
    if (el.set !== void 0) {
      if (typeof el.set !== "string" || el.set.trim() === "" || el.set.length > ELEMENT_NAME_MAX) {
        out.errors.push({
          path: `${p}.set`,
          message: `set \u306F 1\u301C${ELEMENT_NAME_MAX} \u5B57\u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
        });
      } else if (opts.presets !== void 0 && !opts.presets.some((x) => x.type === el.type && x.name === el.set)) {
        out.warnings.push({
          path: `${p}.set`,
          message: `MySet\u300C${el.set}\u300D(${String(el.type)})\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u898B\u305F\u76EE\u306F\u3053\u306E\u307E\u307E\u3067\u3059`
        });
      }
    }
    if (parent === void 0) {
      for (const k of [
        "x",
        "y"
      ]) {
        if (!isInt3(el[k])) {
          out.errors.push({
            path: `${p}.${k}`,
            message: "\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
      }
    } else if (el.x !== void 0 || el.y !== void 0) {
      out.warnings.push({
        path: p,
        message: `${p} \u306F\u4E26\u3079\u308B\u7BB1 ${parentId} \u306E\u4E2D\u306A\u306E\u3067\u3001x y \u306F\u4F7F\u3044\u307E\u305B\u3093(\u66F8\u304D\u623B\u3059\u3068\u304D\u306B\u843D\u3068\u3057\u307E\u3059)`
      });
    }
    for (const k of [
      "w",
      "h"
    ]) {
      const v = el[k];
      if (v === void 0) continue;
      if (v === "fit") {
        if (!canFit(el)) {
          out.errors.push({
            path: `${p}.${k}`,
            message: `${p} \u306E ${k}: "fit" \u306F\u6587\u5B57\u30FB\u30DC\u30BF\u30F3\u30FB\u672D\u30FB\u30D0\u30C3\u30B8\u30FB\u6D6E\u3044\u305F\u30DC\u30BF\u30F3\u30FB\u9053\u3057\u308B\u3079\u30FB\u4E26\u3079\u308B\u7BB1\u30FBgroup \u306B\u3060\u3051\u66F8\u3051\u307E\u3059`
          });
        }
      } else if (v === "fill") {
        if (parent === void 0) {
          out.errors.push({
            path: `${p}.${k}`,
            message: `${p} \u306E ${k}: "fill" \u306F\u4E26\u3079\u308B\u7BB1\u306E\u4E2D\u3067\u3060\u3051\u66F8\u3051\u307E\u3059`
          });
        }
      } else if (!(isInt3(v) && v > 0)) {
        out.errors.push({
          path: `${p}.${k}`,
          message: '\u6B63\u306E\u6574\u6570\u304B "fit" "fill" \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059'
        });
        continue;
      }
      if (parent?.align === "stretch" && k === crossAxis(parent.dir) && v !== "fill") {
        out.warnings.push({
          path: `${p}.${k}`,
          message: `${p} \u306E ${k} \u306F ${parentId} \u306E\u63C3\u3048\u304C${sideName(k)}\u3044\u3063\u3071\u3044\u306A\u306E\u3067\u4F7F\u3044\u307E\u305B\u3093`
        });
      }
    }
    checkLayout(el, p, spec25, out);
    const own = layoutGiven(el, spec25);
    if (el.text !== void 0 && typeof el.text !== "string") {
      out.errors.push({
        path: `${p}.text`,
        message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    }
    if (el.name !== void 0 && (typeof el.name !== "string" || el.name.length === 0 || el.name.length > ELEMENT_NAME_MAX)) {
      out.errors.push({
        path: `${p}.name`,
        message: `name \u306F 1\u301C${ELEMENT_NAME_MAX} \u5B57\u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
      });
    }
    if (el.variant !== void 0) {
      if (!spec25?.variants) {
        out.errors.push({
          path: `${p}.variant`,
          message: `${String(el.type)} \u306B variant \u306F\u3042\u308A\u307E\u305B\u3093`
        });
      } else if (typeof el.variant !== "string" || !spec25.variants.includes(el.variant)) {
        out.errors.push({
          path: `${p}.variant`,
          message: `\u8A31\u3055\u308C\u308B\u5024\u306F ${spec25.variants.join(" / ")} \u3067\u3059`
        });
      }
    }
    if (el.props !== void 0) {
      if (!isObj3(el.props)) {
        out.errors.push({
          path: `${p}.props`,
          message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
        });
      } else if (spec25) {
        for (const [k, v] of Object.entries(el.props)) {
          const ps = spec25.props[k];
          if (!ps) {
            out.errors.push({
              path: `${p}.props.${k}`,
              message: `${spec25.name} \u306B props.${k} \u306F\u3042\u308A\u307E\u305B\u3093`
            });
          } else {
            const msg = checkProp(v, ps);
            if (msg) out.errors.push({
              path: `${p}.props.${k}`,
              message: msg
            });
            else if (ps.kind === "rows") {
              checkRows(v, `${p}.props.${k}`, out.errors);
            }
          }
        }
        const count = choiceCount(spec25.name, el, opts.registry);
        const active = el.props.active;
        if (count !== void 0 && isInt3(active) && active >= Math.max(count, 1)) {
          out.errors.push({
            path: `${p}.props.active`,
            message: `active \u306F items \u306E\u6570(${count})\u3088\u308A\u5C0F\u3055\u3044\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
          });
        }
        if (spec25.name === "slider") checkSlider(el.props, p, out);
        if (spec25.name === "progress") checkProgress(el.props, p, out);
        if (spec25.name === "list" && hasRows(el) && el.props.rows !== void 0) {
          out.warnings.push({
            path: `${p}.props.rows`,
            message: "items \u304C\u3042\u308B\u306E\u3067 rows \u306F\u4F7F\u308F\u308C\u307E\u305B\u3093"
          });
        }
      }
    }
    if (el.style !== void 0) {
      if (!isObj3(el.style)) {
        out.errors.push({
          path: `${p}.style`,
          message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
        });
      } else checkStyle(el.style, `${p}.style`, out.errors);
    }
    if (el.locked !== void 0 && typeof el.locked !== "boolean") {
      out.errors.push({
        path: `${p}.locked`,
        message: "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    }
    if (el.hidden !== void 0 && typeof el.hidden !== "boolean") {
      out.errors.push({
        path: `${p}.hidden`,
        message: "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    }
    if (el.keep !== void 0) {
      if (el.keep !== true) {
        out.errors.push({
          path: `${p}.keep`,
          message: "keep \u306F true \u3060\u3051\u66F8\u3051\u307E\u3059(\u6301\u3061\u8D8A\u3055\u306A\u3044\u90E8\u54C1\u306B\u306F\u66F8\u304D\u307E\u305B\u3093)"
        });
      } else if (typeof el.type !== "string" || valueKindOf(el.type, rowsOfRaw(el)) === void 0) {
        out.errors.push({
          path: `${p}.keep`,
          message: el.type === "list" ? NO_ROWS(p) : `${p}(${String(el.type)})\u306F\u5024\u3092\u6301\u305F\u306A\u3044\u306E\u3067 keep \u306F\u66F8\u3051\u307E\u305B\u3093`
        });
      }
    }
    if (el.from !== void 0) {
      if (!wellFormedRef(el.from)) {
        out.errors.push({
          path: `${p}.from`,
          message: REF_SHAPE
        });
      } else if (!(typeof el.type === "string" && isMirrorType(el.type))) {
        out.errors.push({
          path: `${p}.from`,
          message: `${String(el.type)} \u306B from \u306F\u66F8\u3051\u307E\u305B\u3093(\u6587\u5B57\u3092\u51FA\u3059\u90E8\u54C1 text / button / navbar \u3060\u3051)`
        });
      }
    }
    if (el.motion !== void 0) out.errors.push({
      path: `${p}.motion`,
      message: MOTION_PLACE
    });
    if (el.states !== void 0 && spec25 && !spec25.allowsChildren) {
      out.errors.push({
        path: `${p}.states`,
        message: "states \u306F rect \u3068 group \u3068\u753B\u9762\u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093"
      });
    }
    const isGroup = spec25?.sizeFromChildren === true;
    if (isGroup) {
      if (el.text !== void 0) {
        out.errors.push({
          path: `${p}.text`,
          message: "group \u306B text \u306F\u66F8\u3051\u307E\u305B\u3093"
        });
      }
      if (isObj3(el.style) && Object.keys(el.style).length > 0) {
        out.errors.push({
          path: `${p}.style`,
          message: "group \u306B style \u306F\u66F8\u3051\u307E\u305B\u3093"
        });
      }
      if (!Array.isArray(el.children) || el.children.length === 0) {
        out.errors.push({
          path: `${p}.children`,
          message: "group \u306B\u306F 1 \u3064\u4EE5\u4E0A\u306E children \u304C\u5FC5\u8981\u3067\u3059"
        });
      }
    }
    let inner = [];
    if (el.children !== void 0 && !spec25?.allowsChildren) {
      out.errors.push({
        path: `${p}.children`,
        message: "children \u306F rect \u3068 group \u306B\u3057\u304B\u7F6E\u3051\u307E\u305B\u3093"
      });
    } else if (isGroup && Array.isArray(el.children)) {
      inner = checkElements(el.children, `${p}.children`, bounds, seen, opts, out, false, void 0, own, p, underSet || el.set !== void 0);
    }
    const d = underSet || el.set !== void 0 ? void 0 : opts.defaults?.[el.type];
    const size = isGroup && inner.length > 0 ? groupSize(inner) : spec25 ? defaultSize(spec25, bounds, el, d) : UNKNOWN_SIZE;
    const w = !isGroup && isInt3(el.w) ? el.w : size.w;
    const h = !isGroup && isInt3(el.h) ? el.h : size.h;
    const placed = inner.some((b) => b.placed) || [
      "w",
      "h"
    ].some((k) => {
      const v = el[k];
      if (v === "fit" || v === "fill") return true;
      if (v !== void 0) return false;
      if (parent && k === crossAxis(parent.dir) && parent.align === "stretch") return true;
      return own !== void 0 && (k === mainAxis(own.dir) || isGroup);
    });
    if (isGroup) {
      if (inner.length > 0) {
        if (!placed && (el.w !== void 0 && el.w !== w || el.h !== void 0 && el.h !== h)) {
          out.warnings.push({
            path: p,
            message: "w h \u304C\u4E2D\u8EAB\u3068\u5408\u3044\u307E\u305B\u3093(\u4FDD\u5B58\u6642\u306B\u76F4\u3055\u308C\u307E\u3059)"
          });
        }
        if (Math.min(...inner.map((b) => b.x)) !== 0 || Math.min(...inner.map((b) => b.y)) !== 0) {
          out.warnings.push({
            path: p,
            message: "\u5B50\u306E x y \u306E\u6700\u5C0F\u304C 0 \u3067\u306F\u3042\u308A\u307E\u305B\u3093(\u4FDD\u5B58\u6642\u306B\u76F4\u3055\u308C\u307E\u3059)"
          });
        }
      }
    } else if (parent === void 0) {
      const supplied = (k) => spec25 !== void 0 && d?.[k] !== void 0 && plainAxes(spec25, bounds, el)[k];
      const omitted = (k) => el[k] === void 0 && !supplied(k);
      if (own ? omitted(crossAxis(own.dir)) : omitted("w") || omitted("h")) {
        out.warnings.push({
          path: p,
          message: "w h \u304C\u7701\u304B\u308C\u3066\u3044\u307E\u3059(\u65E2\u5B9A\u5024\u3067\u88DC\u5B8C\u3055\u308C\u307E\u3059)"
        });
      }
    }
    if (clip && !placed && isInt3(el.x) && isInt3(el.y) && (el.x < 0 || el.y < 0 || free !== "x" && el.x + w > bounds.w || free !== "y" && el.y + h > bounds.h)) {
      out.warnings.push({
        path: p,
        message: `\u67A0(${bounds.w}x${bounds.h})\u304B\u3089\u306F\u307F\u51FA\u3057\u3066\u3044\u307E\u3059`
      });
    }
    if (parent === void 0 && isInt3(el.x) && isInt3(el.y)) {
      boxes.push({
        x: el.x,
        y: el.y,
        w,
        h,
        hidden: el.hidden === true,
        placed
      });
    }
    if (spec25?.allowsChildren && !isGroup) {
      const scroll = spec25.name === "rect" && isObj3(el.props) ? el.props.scroll : void 0;
      const axis = scroll === "y" || scroll === "x" ? scroll : void 0;
      const kids = el.children === void 0 ? [] : own ? checkElements(el.children, `${p}.children`, {
        w,
        h
      }, seen, opts, out, false, void 0, own, p, underSet || el.set !== void 0) : checkElements(el.children, `${p}.children`, {
        w,
        h
      }, seen, opts, out, !placed, axis, void 0, void 0, underSet || el.set !== void 0);
      if (axis !== void 0 && !own && !placed && !kids.some((b) => b.placed)) {
        const reach = Math.max(0, ...kids.filter((b) => !b.hidden).map((b) => axis === "y" ? b.y + b.h : b.x + b.w));
        if (reach <= (axis === "y" ? h : w)) {
          out.warnings.push({
            path: p,
            message: `scroll: ${axis} \u3067\u3059\u304C\u3001\u4E2D\u8EAB\u304C\u53CE\u307E\u3063\u3066\u3044\u307E\u3059(\u30B9\u30AF\u30ED\u30FC\u30EB\u3057\u307E\u305B\u3093)`
          });
        }
      }
    }
  });
  return boxes;
}
function checkStates(states, path, reach, types, parents, layouts, opts, out) {
  if (!Array.isArray(states) || states.length === 0) {
    out.errors.push({
      path,
      message: "1 \u4EF6\u4EE5\u4E0A\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return;
  }
  const ids = /* @__PURE__ */ new Set();
  const names = /* @__PURE__ */ new Set();
  states.forEach((state, i) => {
    const p = `${path}[${i}]`;
    if (!isObj3(state)) {
      out.errors.push({
        path: p,
        message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
      return;
    }
    if (typeof state.id !== "string" || !ID_PATTERN.test(state.id)) {
      out.errors.push({
        path: `${p}.id`,
        message: "id \u306F ^[a-z0-9][a-z0-9-]*$ \u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    } else if (ids.has(state.id)) {
      out.errors.push({
        path: `${p}.id`,
        message: `id "${state.id}" \u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059`
      });
    } else ids.add(state.id);
    if (typeof state.name !== "string" || state.name.length === 0 || state.name.length > STATE_NAME_MAX) {
      out.errors.push({
        path: `${p}.name`,
        message: `name \u306F 1\u301C${STATE_NAME_MAX} \u5B57\u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
      });
    } else if (names.has(state.name)) {
      out.errors.push({
        path: `${p}.name`,
        message: `name "${state.name}" \u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059`
      });
    } else names.add(state.name);
    if (state.motion !== void 0) out.errors.push({
      path: `${p}.motion`,
      message: MOTION_PLACE
    });
    if (state.changes === void 0) return;
    if (i === 0) {
      out.errors.push({
        path: `${p}.changes`,
        message: "\u5148\u982D\u306E State \u306B changes \u306F\u66F8\u3051\u307E\u305B\u3093"
      });
      return;
    }
    if (!isObj3(state.changes)) {
      out.errors.push({
        path: `${p}.changes`,
        message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
      return;
    }
    const changes = state.changes;
    const insideAppearing = (id) => {
      for (let up = parents.get(id); up !== void 0 && reach.has(up); up = parents.get(up)) {
        const row = changes[up];
        if (isObj3(row) && typeof row.hidden === "boolean") return true;
      }
      return false;
    };
    for (const [id, row] of Object.entries(changes)) {
      const rp = `${p}.changes.${id}`;
      if (!reach.has(id)) {
        out.errors.push({
          path: rp,
          message: "\u6301\u3061\u4E3B\u306B\u3082\u3001\u305D\u306E\u4E2D\u8EAB\u306B\u3082\u306A\u3044\u90E8\u54C1\u3067\u3059"
        });
        continue;
      }
      if (!isObj3(row)) {
        out.errors.push({
          path: rp,
          message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
        });
        continue;
      }
      const spec25 = opts.registry.get(types.get(id) ?? "");
      const isGroup = spec25?.sizeFromChildren === true;
      for (const [key, value] of Object.entries(row)) {
        const kp = `${rp}.${key}`;
        const bad = (message) => out.errors.push({
          path: kp,
          message
        });
        if (!STATE_CHANGE_KEYS.includes(key)) {
          bad(`State \u3067 ${key} \u306F\u5909\u3048\u3089\u308C\u307E\u305B\u3093`);
        } else if (key === "x" || key === "y") {
          const box7 = parents.get(id);
          if (box7 !== void 0 && layouts.has(box7)) {
            bad(`${id} \u306F\u4E26\u3079\u308B\u7BB1 ${box7} \u306E\u4E2D\u306A\u306E\u3067\u3001State \u3067\u4F4D\u7F6E\u306F\u5909\u3048\u3089\u308C\u307E\u305B\u3093`);
          } else if (!isInt3(value)) bad("\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else if (key === "w" || key === "h") {
          if (isGroup) bad("group \u306E w h \u306F State \u3067\u5909\u3048\u3089\u308C\u307E\u305B\u3093");
          else if (typeof value === "string") bad(`State \u306E ${key} \u306F\u6570\u5B57\u3067\u66F8\u304D\u307E\u3059`);
          else if (!(isInt3(value) && value > 0)) bad("\u6B63\u306E\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else if (key === "hidden") {
          if (typeof value !== "boolean") bad("true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else if (key === "motion") {
        } else if (isGroup) {
          bad(`group \u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093`);
        } else if (key === "text") {
          if (typeof value !== "string") bad("\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else if (key === "variant") {
          if (!spec25?.variants) bad(`${types.get(id)} \u306B variant \u306F\u3042\u308A\u307E\u305B\u3093`);
          else if (typeof value !== "string" || !spec25.variants.includes(value)) {
            bad(`\u8A31\u3055\u308C\u308B\u5024\u306F ${spec25.variants.join(" / ")} \u3067\u3059`);
          }
        } else if (!isObj3(value)) {
          bad("\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else if (key === "props") {
          for (const [k, v] of Object.entries(value)) {
            const ps = spec25?.props[k];
            if (!ps) {
              out.errors.push({
                path: `${kp}.${k}`,
                message: `${types.get(id)} \u306B props.${k} \u306F\u3042\u308A\u307E\u305B\u3093`
              });
            } else if (v !== null) {
              const msg = checkProp(v, ps);
              if (msg) out.errors.push({
                path: `${kp}.${k}`,
                message: msg
              });
              else if (ps.kind === "rows") {
                checkRows(v, `${kp}.${k}`, out.errors);
              }
            }
          }
        } else {
          const written2 = Object.fromEntries(Object.entries(value).filter(([k, v]) => v !== null || !STYLE_KEYS.includes(k)));
          checkStyle(written2, kp, out.errors);
        }
      }
      if (row.motion === void 0) continue;
      const name = checkMotion(row.motion, `${rp}.motion`, out.errors);
      const alone = Object.keys(row).length === 1;
      const kind = alone || row.hidden !== void 0 ? "appear" : "value";
      if (name === CUSTOM) {
        const m = row.motion;
        if (kind === "value" && !itemsOf(m).includes("progress")) {
          out.errors.push({
            path: `${rp}.motion`,
            message: "\u5024\u304C\u5909\u308F\u308B\u884C\u306E\u6BB5\u306E\u52D5\u304D\u306F \u9032\u307F \u3092\u4F7F\u3044\u307E\u3059"
          });
        }
        const type = types.get(id);
        const blocked = type === void 0 ? [] : blockedBy(m, type);
        if (blocked.length > 0) {
          out.errors.push({
            path: `${rp}.motion`,
            message: `${type} \u306B\u306F ${blocked.map((k) => ITEM_LABEL[k]).join("\u30FB")} \u306F\u4ED8\u3051\u3089\u308C\u307E\u305B\u3093`
          });
        }
      } else if (name !== void 0 && !motionFits(name, kind)) {
        out.errors.push({
          path: `${rp}.motion.name`,
          message: `${alone ? "\u52D5\u304D\u3060\u3051\u306E\u884C" : ROWS_TEXT[kind] + "\u884C"}\u306B ${name} \u306F\u4F7F\u3048\u307E\u305B\u3093(${motionsFor(kind).map((m) => m.name).join(" / ")})`
        });
      }
      if (alone && !insideAppearing(id)) {
        out.errors.push({
          path: `${rp}.motion`,
          message: "\u52D5\u304D\u3060\u3051\u306E\u884C\u306F\u3001\u305D\u306E State \u3067\u73FE\u308C\u308B\u30FB\u6D88\u3048\u308B\u90E8\u54C1\u306E\u4E2D\u8EAB\u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093"
        });
      }
    }
  });
}
function checkAllStates(data, opts, out) {
  const types = /* @__PURE__ */ new Map();
  const parents = /* @__PURE__ */ new Map();
  const layouts = /* @__PURE__ */ new Set();
  const under = (el, into) => {
    if (typeof el.id === "string") into.push(el.id);
    if (Array.isArray(el.children)) {
      for (const c of el.children) if (isObj3(c)) under(c, into);
    }
    return into;
  };
  const owners = [];
  const walk = (list, parent) => {
    if (!Array.isArray(list)) return;
    for (const el of list) {
      if (!isObj3(el)) continue;
      if (typeof el.id === "string" && typeof el.type === "string") types.set(el.id, el.type);
      if (typeof el.id === "string" && parent !== void 0) parents.set(el.id, parent);
      if (typeof el.id === "string" && layoutGiven(el, opts.registry.get(String(el.type)))) {
        layouts.add(el.id);
      }
      if (el.states !== void 0 && opts.registry.get(String(el.type))?.allowsChildren) {
        owners.push(el);
      }
      walk(el.children, typeof el.id === "string" ? el.id : void 0);
    }
  };
  walk(data.elements);
  if (data.states !== void 0) {
    checkStates(data.states, "states", new Set(types.keys()), types, parents, layouts, opts, out);
  }
  for (const el of owners) {
    const at = typeof el.id === "string" ? el.id : "(id \u306A\u3057)";
    checkStates(el.states, `${at}.states`, new Set(under(el, [])), types, parents, layouts, opts, out);
  }
}
function checkPlaced(data, opts, out) {
  const screen = fillScreen(data, opts.projectDevice ?? "phone", opts.registry, opts.defaults);
  const visit = (el) => {
    const L = layoutOf(el);
    if (L && el.children) {
      const m = mainAxis(L.dir);
      const at = m === "h" ? "y" : "x";
      const scroll = el.type === "rect" ? el.props.scroll : void 0;
      if (el.sizing?.[m] === "fit") {
        for (const c of el.children) {
          if (c.sizing?.[m] !== "fill") continue;
          out.warnings.push({
            path: `${c.id}.${m}`,
            message: `${c.id} \u306E ${m}: "fill" \u3067\u3059\u304C\u3001${el.id} \u306E${sideName(m)}\u306F\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u308B\u306E\u3067\u65E2\u5B9A\u306E\u5927\u304D\u3055\u306B\u306A\u308A\u307E\u3059`
          });
        }
      } else if (el.sizing?.[m] === void 0 && scroll !== at) {
        const length = contentLength(el, at);
        if (length > el[m]) {
          out.warnings.push({
            path: el.id,
            message: `\u4E2D\u8EAB(${length})\u304C${sideName(m)}(${el[m]})\u306B\u53CE\u307E\u3063\u3066\u3044\u307E\u305B\u3093(scroll \u3092\u66F8\u304F\u304B\u3001${sideName(m)}\u3092\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u307E\u3059)`
          });
        }
      }
      if (scroll === "x" || scroll === "y") {
        if (contentLength(el, scroll) <= el[scroll === "y" ? "h" : "w"]) {
          out.warnings.push({
            path: el.id,
            message: `scroll: ${scroll} \u3067\u3059\u304C\u3001\u4E2D\u8EAB\u304C\u53CE\u307E\u3063\u3066\u3044\u307E\u3059(\u30B9\u30AF\u30ED\u30FC\u30EB\u3057\u307E\u305B\u3093)`
          });
        }
      }
    }
    for (const c of el.children ?? []) visit(c);
  };
  for (const el of screen.elements) visit(el);
  const isGroup = (el) => opts.registry.get(el.type)?.sizeFromChildren === true;
  const placedSize = (el) => el.sizing?.w !== void 0 || el.sizing?.h !== void 0 || isGroup(el) && !layoutOf(el) && (el.children ?? []).some(placedSize);
  const frame = (list, box7, clip, free, boxPlaced) => {
    for (const el of list) {
      const placed = placedSize(el);
      if (clip && (placed || boxPlaced) && (el.x < 0 || el.y < 0 || free !== "x" && el.x + el.w > box7.w || free !== "y" && el.y + el.h > box7.h)) {
        out.warnings.push({
          path: el.id,
          message: `\u67A0(${box7.w}x${box7.h})\u304B\u3089\u306F\u307F\u51FA\u3057\u3066\u3044\u307E\u3059`
        });
      }
      inside(el, placed);
    }
  };
  const inside = (el, placed) => {
    if (!el.children) return;
    if (layoutOf(el)) {
      for (const c of el.children) inside(c, placedSize(c));
      return;
    }
    if (isGroup(el)) return frame(el.children, el, false, void 0, false);
    const scroll = el.type === "rect" ? el.props.scroll : void 0;
    const axis = scroll === "x" || scroll === "y" ? scroll : void 0;
    frame(el.children, el, true, axis, placed);
    if (axis !== void 0 && (placed || el.children.some(placedSize)) && contentLength(el, axis) <= el[axis === "y" ? "h" : "w"]) {
      out.warnings.push({
        path: el.id,
        message: `scroll: ${axis} \u3067\u3059\u304C\u3001\u4E2D\u8EAB\u304C\u53CE\u307E\u3063\u3066\u3044\u307E\u3059(\u30B9\u30AF\u30ED\u30FC\u30EB\u3057\u307E\u305B\u3093)`
      });
    }
  };
  frame(screen.elements, deviceSize(screen.device), true, void 0, false);
}
function checkRef(ref, path, ctx, opts, out) {
  const bad = (p, message) => {
    out.errors.push({
      path: p,
      message
    });
    return {
      ok: false
    };
  };
  if (ref.screen === void 0) {
    const type = ctx.types.get(ref.part);
    if (type === void 0) {
      if (opts.looseRefs) return {
        ok: true
      };
      return bad(`${path}.part`, `\u90E8\u54C1 ${JSON.stringify(ref.part)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
    }
    const kind2 = valueKindOf(type, rowsOfRaw(ctx.raw.get(ref.part)));
    if (kind2 === void 0) return bad(`${path}.part`, notValuedOrRows(ref.part, type));
    return {
      ok: true,
      type,
      kind: kind2
    };
  }
  if (ref.screen === ctx.self) return bad(`${path}.screen`, "\u540C\u3058\u753B\u9762\u306E\u90E8\u54C1\u306F screen \u3092\u7701\u304D\u307E\u3059");
  if (opts.screenIds !== void 0 && !opts.screenIds.includes(ref.screen)) {
    return bad(`${path}.screen`, `\u753B\u9762 ${JSON.stringify(ref.screen)} \u306F\u3053\u306E\u6848\u306B\u3042\u308A\u307E\u305B\u3093`);
  }
  const there = opts.others?.[ref.screen];
  if (!there) return {
    ok: true
  };
  const part = there[ref.part];
  if (!part) {
    return bad(`${path}.part`, `${ref.screen} \u306E \u90E8\u54C1 ${JSON.stringify(ref.part)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
  }
  const kind = valueKindOf(part.type, part.rows === true);
  if (kind === void 0) {
    return bad(`${path}.part`, `${ref.screen} \u306E ${notValuedOrRows(ref.part, part.type)}`);
  }
  if (!part.keep) {
    return bad(`${path}.part`, `${ref.screen} \u306E ${ref.part} \u306F\u5024\u3092\u6301\u3061\u8D8A\u3059\u90E8\u54C1\u3067\u306F\u3042\u308A\u307E\u305B\u3093(keep: true \u304C\u8981\u308A\u307E\u3059)`);
  }
  return {
    ok: true,
    type: part.type,
    kind
  };
}
function checkAllRefs(ctx, opts, out) {
  for (const [id, el] of ctx.raw) {
    const type = ctx.types.get(id);
    if (!wellFormedRef(el.from) || type === void 0 || !isMirrorType(type)) continue;
    checkRef(el.from, `${id}.from`, ctx, opts, out);
  }
}
var isMs = (v) => isInt3(v) && v >= 0 && v <= BLOCK_MS_MAX;
var MS_TEXT = `0\u301C${BLOCK_MS_MAX} \u306E\u6574\u6570(\u30DF\u30EA\u79D2)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
function checkBlocks(blocks, path, type, ctx, opts, out) {
  if (!Array.isArray(blocks)) {
    out.errors.push({
      path,
      message: "\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return;
  }
  const bad = (p, message) => out.errors.push({
    path: p,
    message
  });
  const checkBox = (box7, p, state, sp) => {
    let owner = "";
    if (box7 !== void 0) {
      if (typeof box7 !== "string" || !ctx.types.has(box7) && !opts.looseRefs) {
        bad(p, `\u7BB1 ${JSON.stringify(box7)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
        return;
      }
      owner = box7;
    }
    const states = ctx.states.get(owner);
    if (opts.looseRefs && (box7 === void 0 || !ctx.types.has(box7))) {
      if (sp !== void 0 && typeof state !== "string") {
        bad(sp, "State \u306F\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
      }
      return;
    }
    if (!states) {
      bad(p, owner === "" ? "\u753B\u9762\u306F State \u3092\u6301\u3063\u3066\u3044\u307E\u305B\u3093" : `${box7} \u306F State \u3092\u6301\u3064\u7BB1\u3067\u306F\u3042\u308A\u307E\u305B\u3093`);
      return;
    }
    if (sp !== void 0 && (typeof state !== "string" || !states.has(state))) {
      bad(sp, `State ${JSON.stringify(state)} \u306F ${owner === "" ? "\u753B\u9762" : box7} \u306B\u3042\u308A\u307E\u305B\u3093`);
    }
  };
  const kindHere = (id, type2) => valueKindOf(type2, rowsOfRaw(ctx.raw.get(id)));
  const valuedPart = (part, p) => {
    if (opts.looseRefs && typeof part === "string" && !ctx.types.has(part)) return void 0;
    if (typeof part !== "string" || !ctx.types.has(part)) {
      bad(p, `\u90E8\u54C1 ${JSON.stringify(part)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
      return void 0;
    }
    const type2 = ctx.types.get(part);
    if (kindHere(part, type2) === void 0) {
      bad(p, notValuedOrRows(part, type2));
      return void 0;
    }
    return type2;
  };
  const checkIsValue = (kind, value, vp, items, slider) => {
    const typed = kind === "number" ? isInt3(value) && value >= 0 : kind === "row" ? isInt3(value) && value >= -1 : kind === "range" ? typeof value === "number" && Number.isFinite(value) : kind === "boolean" ? typeof value === "boolean" : typeof value === "string";
    if (!typed) {
      bad(vp, kind === "number" ? "0 \u4EE5\u4E0A\u306E\u6574\u6570(\u4F55\u756A\u76EE)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059" : kind === "row" ? "-1 \u4EE5\u4E0A\u306E\u6574\u6570(\u4F55\u884C\u76EE\u3002-1 \u306F\u306A\u3057)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059" : kind === "range" ? "\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059" : `${kind === "boolean" ? "true \u304B false " : "\u6587\u5B57\u5217"}\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`);
    } else if (items !== void 0 && typeof value === "number") {
      const why = pastItems(value, items);
      if (why) bad(vp, why);
    } else if (kind === "range" && typeof value === "number") {
      const props = {
        props: slider ?? {}
      };
      const { min, max, step } = sliderNums(props);
      if (!(max > min)) return;
      if (value < min || value > max) {
        bad(vp, `min\u301Cmax(${min}\u301C${max})\u306E\u4E2D\u306E\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`);
      } else if (step > 0 && !onStep(props, value)) {
        out.warnings.push({
          path: vp,
          message: `\u523B\u307F ${step} \u306B\u5408\u3063\u3066\u3044\u307E\u305B\u3093`
        });
      }
    }
  };
  const sliderProps = (id) => {
    const raw = ctx.raw.get(id);
    return isObj3(raw?.props) ? raw.props : void 0;
  };
  const checkPart = (part, p, value, vp) => {
    const type2 = valuedPart(part, p);
    if (type2 !== void 0) {
      const id = part;
      checkIsValue(kindHere(id, type2), value, vp, choiceCount(type2, ctx.raw.get(id), opts.registry), sliderProps(id));
    }
  };
  const checkRange = (key, v, p) => {
    const shape = "{ min?, max? } \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059(\u3069\u3061\u3089\u304B\u4E00\u65B9\u306F\u5FC5\u9808)";
    if (!isObj3(v)) return bad(p, shape);
    for (const k of Object.keys(v)) {
      if (!RANGE_KEYS.includes(k)) {
        bad(`${p}.${k}`, `${key} \u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`);
      }
    }
    if (v.min === void 0 && v.max === void 0) return bad(p, shape);
    const fine = (n) => key === "length" ? isInt3(n) && n >= 0 : typeof n === "number" && Number.isFinite(n);
    const text18 = key === "length" ? "0 \u4EE5\u4E0A\u306E\u6574\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059" : "\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059";
    let ok = true;
    for (const side of RANGE_KEYS) {
      if (v[side] !== void 0 && !fine(v[side])) {
        bad(`${p}.${side}`, text18);
        ok = false;
      }
    }
    const r = v;
    if (ok && r.min !== void 0 && r.max !== void 0 && r.min > r.max) {
      bad(p, "min \u306F max \u4EE5\u4E0B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    }
  };
  const checkValueCondition = (c, p) => {
    const keys = compareKeysOf(c);
    if (keys.length !== 1) bad(p, "\u6BD4\u3079\u65B9\u306F is / has / length / number \u306E\u3069\u308C\u304B 1 \u3064");
    const part = c.part;
    const type2 = valuedPart(c.part, `${p}.part`);
    const kind = type2 === void 0 ? void 0 : kindHere(part, type2);
    if (c.has !== void 0 && typeof c.has !== "string") {
      bad(`${p}.has`, "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    }
    if (c.length !== void 0) checkRange("length", c.length, `${p}.length`);
    if (c.number !== void 0) checkRange("number", c.number, `${p}.number`);
    const ref = isObj3(c.is);
    if (ref && !wellFormedRef(c.is)) bad(`${p}.is`, REF_SHAPE);
    if (type2 === void 0 || kind === void 0) return;
    for (const key of [
      "has",
      "length",
      "number"
    ]) {
      if (key === "number" && type2 === "slider") continue;
      if (c[key] !== void 0 && type2 !== "input") {
        bad(`${p}.${key}`, `${part}(${type2})\u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093(${key === "number" ? "input \u3068 slider" : "input"} \u3060\u3051)`);
      }
    }
    if (c.is === void 0 || keys.length !== 1) return;
    if (!ref) {
      checkIsValue(kind, c.is, `${p}.is`, choiceCount(type2, ctx.raw.get(part), opts.registry), sliderProps(part));
      return;
    }
    if (!wellFormedRef(c.is)) return;
    if (c.is.screen === void 0 && c.is.part === part) {
      bad(`${p}.is`, `${part} \u3092\u81EA\u5206\u3068\u6BD4\u3079\u3089\u308C\u307E\u305B\u3093`);
      return;
    }
    const src = checkRef(c.is, `${p}.is`, ctx, opts, out);
    const srcKind = src.kind;
    if (src.ok && srcKind && srcKind !== kind) {
      const name = c.is.screen === void 0 ? c.is.part : `${c.is.screen} \u203A ${c.is.part}`;
      bad(`${p}.is`, `${part}(${KIND_NAMES[kind]})\u3068 ${name}(${KIND_NAMES[srcKind]})\u306F\u6BD4\u3079\u3089\u308C\u307E\u305B\u3093`);
    }
  };
  const checkCondition = (c, p) => {
    if (!isObj3(c)) return bad(p, "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    for (const k of Object.keys(c)) {
      if (!CONDITION_KEYS.includes(k)) {
        bad(`${p}.${k}`, `\u6761\u4EF6\u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`);
      }
    }
    if (c.not !== void 0 && typeof c.not !== "boolean") {
      bad(`${p}.not`, "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    }
    if ("part" in c) {
      if (c.box !== void 0 || c.state !== void 0) {
        bad(p, "\u90E8\u54C1\u306E\u5024\u306E\u6761\u4EF6\u306B box / state \u306F\u66F8\u3051\u307E\u305B\u3093");
      }
      checkValueCondition(c, p);
    } else {
      for (const key of COMPARE_KEYS) {
        if (c[key] !== void 0) bad(`${p}.${key}`, `State \u306E\u6761\u4EF6\u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093`);
      }
      checkBox(c.box, c.box === void 0 ? p : `${p}.box`, c.state, `${p}.state`);
    }
  };
  const checkAction = (a, p, last) => {
    if (!isObj3(a)) return bad(p, "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    if (typeof a.act !== "string" || !ACT_NAMES.includes(a.act)) {
      bad(`${p}.act`, `\u51E6\u7406 ${JSON.stringify(a.act)} \u306F\u3042\u308A\u307E\u305B\u3093(${ACT_NAMES.join(" / ")}\u3002wireframe blocks \u3067\u4E00\u89A7\u3092\u51FA\u305B\u307E\u3059)`);
      return;
    }
    const allowed = {
      set: [
        "act",
        "box",
        "state"
      ],
      next: [
        "act",
        "box"
      ],
      prev: [
        "act",
        "box"
      ],
      reset: [
        "act",
        "box"
      ],
      go: [
        "act",
        "screen",
        "motion"
      ],
      back: [
        "act"
      ],
      wait: [
        "act",
        "ms"
      ],
      value: [
        "act",
        "part",
        "to",
        "from"
      ],
      add: [
        "act",
        "part",
        "from"
      ],
      remove: [
        "act",
        "part",
        "at"
      ],
      play: [
        "act",
        "part",
        "motion"
      ]
    };
    for (const k of Object.keys(a)) {
      if (!ACTION_KEYS.includes(k) || !allowed[a.act].includes(k)) {
        bad(`${p}.${k}`, `\u51E6\u7406 ${a.act} \u306B ${k} \u306F\u66F8\u3051\u307E\u305B\u3093`);
      }
    }
    switch (a.act) {
      case "set":
        checkBox(a.box, a.box === void 0 ? p : `${p}.box`, a.state, `${p}.state`);
        break;
      case "next":
      case "prev":
      case "reset":
        checkBox(a.box, a.box === void 0 ? p : `${p}.box`);
        break;
      case "go": {
        if (typeof a.screen !== "string" || !ID_PATTERN.test(a.screen)) {
          bad(`${p}.screen`, "screen \u306F ^[a-z0-9][a-z0-9-]*$ \u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else if (opts.screenIds !== void 0 && !opts.screenIds.includes(a.screen)) {
          bad(`${p}.screen`, `\u753B\u9762 ${JSON.stringify(a.screen)} \u306F\u3053\u306E\u6848\u306B\u3042\u308A\u307E\u305B\u3093`);
        }
        if (isStepMotion(a.motion)) {
          bad(`${p}.motion`, "\u753B\u9762\u3078\u79FB\u308B\u52D5\u304D\u306B\u6BB5\u306E\u52D5\u304D\u306F\u66F8\u3051\u307E\u305B\u3093");
        } else if (a.motion !== void 0) {
          const name = checkMotion(a.motion, `${p}.motion`, out.errors);
          if (name !== void 0 && !motionFits(name, "appear")) {
            bad(`${p}.motion.name`, `\u753B\u9762\u306E\u79FB\u52D5\u306B ${name} \u306F\u4F7F\u3048\u307E\u305B\u3093(${motionsFor("appear").map((m) => m.name).join(" / ")})`);
          }
        }
        if (!last) bad(p, "go \u306E\u5F8C\u308D\u306B\u51E6\u7406\u306F\u66F8\u3051\u307E\u305B\u3093");
        break;
      }
      case "back":
        if (!last) bad(p, "back \u306E\u5F8C\u308D\u306B\u51E6\u7406\u306F\u66F8\u3051\u307E\u305B\u3093");
        break;
      case "wait":
        if (!isMs(a.ms)) bad(`${p}.ms`, MS_TEXT);
        break;
      case "value": {
        if (a.to !== void 0 === (a.from !== void 0)) {
          bad(p, "to \u304B from \u306E\u3069\u3061\u3089\u304B 1 \u3064\u3092\u66F8\u304D\u307E\u3059");
          break;
        }
        const target = a.part;
        if (opts.looseRefs && typeof target === "string" && !ctx.types.has(target)) break;
        if (typeof target !== "string" || !ctx.types.has(target)) {
          bad(`${p}.part`, `\u90E8\u54C1 ${JSON.stringify(target)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
          break;
        }
        const type2 = ctx.types.get(target);
        const mirror = isMirrorType(type2);
        const kind = kindHere(target, type2);
        if (type2 === "list" && kind === void 0) {
          bad(`${p}.part`, NO_ROWS(target));
          break;
        }
        if (a.from === void 0) {
          if (mirror) {
            bad(`${p}.part`, `${notValued(target, type2)}\u3002\u6587\u5B57\u3092\u51FA\u3059\u90E8\u54C1\u306B\u306F from \u3067\u5199\u3057\u307E\u3059`);
          } else if (!kind) {
            bad(`${p}.part`, `${notValued(target, type2)}\u3002from \u306A\u3089 text / button / navbar \u306B\u3082\u5199\u305B\u307E\u3059`);
          } else checkPart(target, `${p}.part`, a.to, `${p}.to`);
          break;
        }
        if (!mirror && !kind) {
          bad(`${p}.part`, `${notValued(target, type2)}\u3002from \u306A\u3089 text / button / navbar \u306B\u3082\u5199\u305B\u307E\u3059`);
          break;
        }
        if (ctx.raw.get(target)?.from !== void 0) {
          bad(`${p}.part`, `${target} \u306F from \u3092\u6301\u3064\u306E\u3067\u5024\u3092\u5199\u305B\u307E\u305B\u3093(from \u304C\u5E38\u306B\u52DD\u3061\u307E\u3059)`);
          break;
        }
        if (!wellFormedRef(a.from)) {
          bad(`${p}.from`, REF_SHAPE);
          break;
        }
        if (a.from.screen === void 0 && a.from.part === target) {
          bad(`${p}.from`, `${target} \u3092\u81EA\u5206\u304B\u3089\u5199\u305B\u307E\u305B\u3093`);
          break;
        }
        const src = checkRef(a.from, `${p}.from`, ctx, opts, out);
        const srcKind = src.kind;
        if (src.ok && kind && srcKind && srcKind !== kind) {
          const name = a.from.screen === void 0 ? a.from.part : `${a.from.screen} \u203A ${a.from.part}`;
          bad(`${p}.from`, `${name} \u306E\u5024(${KIND_NAMES[srcKind]})\u306F ${target}(${KIND_NAMES[kind]})\u306B\u5199\u305B\u307E\u305B\u3093`);
        }
        break;
      }
      case "add":
      case "remove": {
        const target = a.part;
        const outside = opts.looseRefs && typeof target === "string" && !ctx.types.has(target);
        if (!outside) {
          if (typeof target !== "string" || !ctx.types.has(target)) {
            bad(`${p}.part`, `\u90E8\u54C1 ${JSON.stringify(target)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
            break;
          }
          const type2 = ctx.types.get(target);
          if (type2 !== "list") {
            bad(`${p}.part`, `${target}(${type2})\u306F\u4E00\u89A7\u3067\u306F\u3042\u308A\u307E\u305B\u3093`);
            break;
          }
          if (!rowsOfRaw(ctx.raw.get(target))) {
            bad(`${p}.part`, NO_ROWS(target));
            break;
          }
        }
        if (a.act === "remove") {
          if (a.at !== void 0 && !(isInt3(a.at) && a.at >= 0)) {
            bad(`${p}.at`, "0 \u4EE5\u4E0A\u306E\u6574\u6570(\u4F55\u884C\u76EE)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
          }
          break;
        }
        if (a.from === void 0) {
          bad(`${p}.from`, "from({ part } \u304B { screen, part })\u304C\u8981\u308A\u307E\u3059");
          break;
        }
        if (!wellFormedRef(a.from)) {
          bad(`${p}.from`, REF_SHAPE);
          break;
        }
        if (a.from.screen === void 0 && a.from.part === target) {
          bad(`${p}.from`, `${target} \u306B\u81EA\u5206\u304B\u3089\u884C\u3092\u8DB3\u305B\u307E\u305B\u3093`);
          break;
        }
        checkRef(a.from, `${p}.from`, ctx, opts, out);
        break;
      }
      case "play": {
        const target = a.part;
        const outside = opts.looseRefs && typeof target === "string" && !ctx.types.has(target);
        if (!outside && (typeof target !== "string" || !ctx.types.has(target))) {
          bad(`${p}.part`, `\u90E8\u54C1 ${JSON.stringify(target)} \u306F\u3053\u306E\u753B\u9762\u306B\u3042\u308A\u307E\u305B\u3093`);
        }
        const type2 = typeof target === "string" ? ctx.types.get(target) : void 0;
        const m = a.motion;
        if (m === void 0) {
          bad(`${p}.motion`, "motion({ name } \u304B\u6BB5\u306E\u52D5\u304D)\u304C\u8981\u308A\u307E\u3059");
          break;
        }
        if (isStepMotion(m)) {
          const rest = {};
          let mixed = false;
          for (const [key, v] of Object.entries(m)) {
            if (MOTION_KEYS.includes(key)) {
              bad(`${p}.motion.${key}`, `\u6BB5\u306E\u52D5\u304D\u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093`);
              mixed = true;
            } else rest[key] = v;
          }
          const sound = checkStepMotion(rest, `${p}.motion`, "effect", out.errors);
          const blocked = sound && !mixed && type2 !== void 0 ? blockedBy(sound, type2) : [];
          if (blocked.length > 0) {
            bad(`${p}.motion`, `${type2} \u306B\u306F ${blocked.map((k) => ITEM_LABEL[k]).join("\u30FB")} \u306F\u4ED8\u3051\u3089\u308C\u307E\u305B\u3093`);
          }
          break;
        }
        if (typeof m !== "object" || m === null || Array.isArray(m)) {
          bad(`${p}.motion`, "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
          break;
        }
        for (const key of Object.keys(m)) {
          if (key !== "name") bad(`${p}.motion.${key}`, `\u52D5\u304B\u3059\u52D5\u304D\u306B ${key} \u306F\u66F8\u3051\u307E\u305B\u3093`);
        }
        const name = m.name;
        if (typeof name !== "string" || !findEffect(name)) {
          bad(`${p}.motion.name`, `\u305D\u306E\u5834\u3067\u52D5\u304F\u52D5\u304D\u306F ${EFFECTS.map((e) => e.name).join(" / ")} \u304B\u6BB5\u306E\u52D5\u304D`);
        }
        break;
      }
    }
  };
  const checkActions = (list, p) => {
    if (!Array.isArray(list) || list.length === 0) {
      return bad(p, "1 \u3064\u4EE5\u4E0A\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    }
    list.forEach((a, i) => checkAction(a, `${p}[${i}]`, i === list.length - 1));
  };
  blocks.forEach((block, i) => {
    const p = `${path}[${i}]`;
    if (!isObj3(block)) return bad(p, "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
    for (const k of Object.keys(block)) {
      if (!BLOCK_KEYS.includes(k)) {
        bad(`${p}.${k}`, `\u30D6\u30ED\u30C3\u30AF\u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`);
      }
    }
    if (!isObj3(block.on)) bad(`${p}.on`, "on(Trigger)\u304C\u5FC5\u8981\u3067\u3059");
    else {
      const on = block.on;
      for (const k of Object.keys(on)) {
        if (!TRIGGER_KEYS.includes(k)) {
          bad(`${p}.on.${k}`, `on \u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`);
        }
      }
      const event = on.event;
      if (typeof event !== "string" || !BLOCK_EVENTS.includes(event)) {
        bad(`${p}.on.event`, `\u30A4\u30D9\u30F3\u30C8 ${JSON.stringify(event)} \u306F\u3042\u308A\u307E\u305B\u3093(${BLOCK_EVENTS.join(" / ")}\u3002wireframe blocks \u3067\u4E00\u89A7\u3092\u51FA\u305B\u307E\u3059)`);
      } else {
        const ev = event;
        const owner = [
          ...ctx.raw.values()
        ].find((r) => r.blocks === blocks);
        const ownerProps = owner && isObj3(owner.props) ? {
          props: owner.props
        } : void 0;
        if (!canCarry(ev, type, opts.registry, ownerProps)) {
          const who = type === void 0 ? "\u753B\u9762" : type;
          bad(`${p}.on.event`, `${who} \u306B ${eventLabel(ev)}\u306F\u4ED8\u3051\u3089\u308C\u307E\u305B\u3093`);
        }
        if (on.at !== void 0) {
          if (ev !== "press" && ev !== "hold" && ev !== "swipe") {
            bad(`${p}.on.at`, `at \u306F${eventLabel("press")}\u30FB${eventLabel("hold")}\u30FB${eventLabel("swipe")}\u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093`);
          } else if (type === void 0 || !PLACE_TYPES.includes(type)) {
            bad(`${p}.on.at`, `at \u3092\u66F8\u3051\u308B\u306E\u306F ${PLACE_TYPES.join(" / ")} \u3060\u3051\u3067\u3059`);
          } else if (type === "navbar") {
            if (on.at !== "left" && on.at !== "right") {
              bad(`${p}.on.at`, "navbar \u306E at \u306F left / right \u3067\u3059");
            }
          } else if (!isInt3(on.at) || on.at < 0) {
            bad(`${p}.on.at`, "0 \u4EE5\u4E0A\u306E\u6574\u6570(\u4F55\u756A\u76EE)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
          } else if (CHOICE_TYPES.includes(type)) {
            const why = pastItems(on.at, choiceCount(type, owner, opts.registry));
            if (why) bad(`${p}.on.at`, why);
          } else if (type === "tabbar") {
            const items = isObj3(owner?.props) && Array.isArray(owner.props.items) ? owner.props.items.length : 0;
            if (on.at >= items) bad(`${p}.on.at`, `\u30BF\u30D6\u306F ${items} \u500B\u3067\u3059(at \u306F 0\u301C${items - 1})`);
          } else if (type === "list") {
            const rows = isObj3(owner?.props) ? rowCount({
              props: owner.props
            }) : 3;
            if (on.at >= rows) bad(`${p}.on.at`, `\u884C\u306F ${rows} \u672C\u3067\u3059(at \u306F 0\u301C${rows - 1})`);
          } else if (type === "table") {
            const rows = isObj3(owner?.props) && Array.isArray(owner.props.rows) ? owner.props.rows.length : 3;
            if (on.at >= rows) {
              bad(`${p}.on.at`, rows === 0 ? "rows \u304C\u7A7A\u3067\u3059" : `\u884C\u306F ${rows} \u672C\u3067\u3059(at \u306F 0\u301C${rows - 1})`);
            }
          } else if (type === "breadcrumb") {
            const items = isObj3(owner?.props) && Array.isArray(owner.props.items) ? owner.props.items.length : 3;
            const why = pastItems(on.at, items);
            if (why) bad(`${p}.on.at`, why);
          }
        }
        if (ev === "after") {
          if (!isMs(on.ms)) {
            bad(`${p}.on.ms`, `${eventLabel("after")}\u306B\u306F ms \u304C\u8981\u308A\u307E\u3059(${MS_TEXT})`);
          }
        } else if (ev === "hold") {
          if (on.ms !== void 0 && !(isInt3(on.ms) && on.ms >= HOLD_MS_MIN && on.ms <= HOLD_MS_MAX)) {
            bad(`${p}.on.ms`, `\u9577\u62BC\u3057\u306E\u9577\u3055(ms)\u306F ${HOLD_MS_MIN}\u301C${HOLD_MS_MAX} \u306E\u6574\u6570\u3067\u3059`);
          }
        } else if (on.ms !== void 0) {
          bad(`${p}.on.ms`, `ms \u306F${eventLabel("after")}\u3068${eventLabel("hold")}\u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093`);
        }
        if (ev === "swipe") {
          if (typeof on.dir !== "string" || !SWIPE_DIRS.includes(on.dir)) {
            bad(`${p}.on.dir`, "dir \u306F up / down / left / right \u306E\u3069\u308C\u304B\u3067\u3059(swipe \u306B\u5FC5\u9808)");
          }
        } else if (on.dir !== void 0) {
          bad(`${p}.on.dir`, "dir \u3092\u66F8\u3051\u308B\u306E\u306F swipe \u3060\u3051\u3067\u3059");
        }
        if (ev === "key") {
          if (typeof on.key !== "string" || !BLOCK_KEY_NAMES.includes(on.key)) {
            bad(`${p}.on.key`, `${eventLabel("key")}\u306B\u306F key \u304C\u8981\u308A\u307E\u3059(${BLOCK_KEY_NAMES.join(" / ")})`);
          }
        } else if (on.key !== void 0) {
          bad(`${p}.on.key`, `key \u306F${eventLabel("key")}\u306B\u3057\u304B\u66F8\u3051\u307E\u305B\u3093`);
        }
      }
    }
    if (block.if !== void 0) {
      if (!isObj3(block.if)) bad(`${p}.if`, "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
      else {
        const cond = block.if;
        const has = [
          "all",
          "any"
        ].filter((w) => cond[w] !== void 0);
        for (const k of Object.keys(cond)) {
          if (k !== "all" && k !== "any") bad(`${p}.if.${k}`, `if \u306B ${k} \u3068\u3044\u3046\u9805\u76EE\u306F\u3042\u308A\u307E\u305B\u3093`);
        }
        if (has.length !== 1) {
          bad(`${p}.if`, "if \u306F all \u304B any \u306E\u3069\u3061\u3089\u304B 1 \u3064\u3092\u6301\u3064\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
        } else {
          const list = cond[has[0]];
          if (!Array.isArray(list) || list.length === 0) {
            bad(`${p}.if.${has[0]}`, "1 \u3064\u4EE5\u4E0A\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059");
          } else list.forEach((c, j) => checkCondition(c, `${p}.if.${has[0]}[${j}]`));
        }
      }
    }
    checkActions(block.do, `${p}.do`);
    if (block.else !== void 0) {
      if (block.if === void 0) bad(`${p}.else`, "else \u306F if \u304C\u3042\u308B\u3068\u304D\u3060\u3051\u66F8\u3051\u307E\u3059");
      checkActions(block.else, `${p}.else`);
    }
  });
}
function contextOf(data) {
  const ctx = {
    self: typeof data.id === "string" && ID_PATTERN.test(data.id) ? data.id : "",
    types: /* @__PURE__ */ new Map(),
    raw: /* @__PURE__ */ new Map(),
    states: /* @__PURE__ */ new Map()
  };
  const stateIds = (states) => new Set(Array.isArray(states) ? states.filter(isObj3).map((s) => s.id).filter((v) => typeof v === "string") : []);
  const walk = (list) => {
    if (!Array.isArray(list)) return;
    for (const el of list) {
      if (!isObj3(el) || typeof el.id !== "string") continue;
      if (typeof el.type === "string") ctx.types.set(el.id, el.type);
      ctx.raw.set(el.id, el);
      if (Array.isArray(el.states) && el.states.length > 1) {
        ctx.states.set(el.id, stateIds(el.states));
      }
      walk(el.children);
    }
  };
  walk(data.elements);
  if (Array.isArray(data.states) && data.states.length > 1) {
    ctx.states.set("", stateIds(data.states));
  }
  return ctx;
}
function checkAllBlocks(data, ctx, opts, out) {
  const carriers = [
    ...ctx.raw
  ].filter(([_id, el]) => el.blocks !== void 0).map(([id, el]) => ({
    el,
    id
  }));
  if (data.blocks !== void 0) checkBlocks(data.blocks, "blocks", void 0, ctx, opts, out);
  for (const { el, id } of carriers) {
    checkBlocks(el.blocks, `${id}.blocks`, typeof el.type === "string" ? el.type : "(\u4E0D\u660E)", ctx, opts, out);
  }
}
function validateScreen(data, opts) {
  const out = {
    errors: [],
    warnings: []
  };
  if (!isObj3(data)) {
    out.errors.push({
      path: "(root)",
      message: "\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u306F\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return out;
  }
  if (data.version !== 1) {
    out.errors.push({
      path: "version",
      message: `version \u306F 1 \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059(\u4ECA\u306F ${JSON.stringify(data.version)})`
    });
  }
  if (typeof data.id !== "string" || !ID_PATTERN.test(data.id)) {
    out.errors.push({
      path: "id",
      message: "id \u306F ^[a-z0-9][a-z0-9-]*$ \u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  } else if (opts.fileId !== void 0 && data.id !== opts.fileId) {
    out.errors.push({
      path: "id",
      message: `id "${data.id}" \u304C\u30D5\u30A1\u30A4\u30EB\u540D "${opts.fileId}" \u3068\u4E00\u81F4\u3057\u307E\u305B\u3093`
    });
  }
  if (typeof data.title !== "string") {
    out.errors.push({
      path: "title",
      message: "title \u306F\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  }
  let bounds;
  if (data.device !== void 0) bounds = checkDevice(data.device, "device", out.errors);
  else if (opts.projectDevice !== void 0) bounds = deviceSize(opts.projectDevice);
  if (data.motion !== void 0) out.errors.push({
    path: "motion",
    message: MOTION_PLACE
  });
  checkElements(data.elements, "elements", bounds ?? deviceSize("phone"), /* @__PURE__ */ new Set(), opts, out);
  checkAllStates(data, opts, out);
  const ctx = contextOf(data);
  checkAllRefs(ctx, opts, out);
  checkAllBlocks(data, ctx, opts, out);
  if (out.errors.length === 0) checkPlaced(data, opts, out);
  return out;
}
function validateProject(data, opts) {
  const out = {
    errors: [],
    warnings: []
  };
  if (!isObj3(data)) {
    out.errors.push({
      path: "(root)",
      message: "project.json \u306F\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
    return out;
  }
  if (data.version !== 1) {
    out.errors.push({
      path: "version",
      message: "version \u306F 1 \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  }
  if (typeof data.name !== "string" || data.name === "") {
    out.errors.push({
      path: "name",
      message: "name \u306F\u7A7A\u3067\u306A\u3044\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  }
  if (typeof data.theme !== "string") {
    out.errors.push({
      path: "theme",
      message: "theme \u306F\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
    });
  } else if (!opts.themeIds.includes(data.theme)) {
    out.errors.push({
      path: "theme",
      message: `\u30C6\u30FC\u30DE "${data.theme}" \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`
    });
  }
  checkDevice(data.device, "device", out.errors);
  const hasProposals = data.proposals !== void 0;
  if (hasProposals) {
    if (!Array.isArray(data.proposals) || data.proposals.length === 0) {
      out.errors.push({
        path: "proposals",
        message: "1 \u4EF6\u4EE5\u4E0A\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    } else {
      if (data.screens !== void 0) {
        out.errors.push({
          path: "screens",
          message: "proposals \u304C\u3042\u308B\u3068\u304D\u306F screens \u306F\u66F8\u3051\u307E\u305B\u3093"
        });
      }
      const ids = /* @__PURE__ */ new Set();
      const all = data.proposals.filter(isObj3).map((p) => p.id).filter((v) => typeof v === "string");
      data.proposals.forEach((pr, i) => {
        const p = `proposals[${i}]`;
        if (!isObj3(pr)) {
          out.errors.push({
            path: p,
            message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
          return;
        }
        if (typeof pr.id !== "string" || !PROPOSAL_ID_PATTERN.test(pr.id) || pr.id === "library") {
          out.errors.push({
            path: `${p}.id`,
            message: "id \u306F ^[a-z][a-z0-9]*$ \u306E\u6587\u5B57\u5217(library \u4EE5\u5916)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        } else if (ids.has(pr.id)) {
          out.errors.push({
            path: `${p}.id`,
            message: `id "${pr.id}" \u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059`
          });
        } else ids.add(pr.id);
        if (typeof pr.name !== "string" || pr.name === "") {
          out.errors.push({
            path: `${p}.name`,
            message: "name \u306F\u7A7A\u3067\u306A\u3044\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
        if (pr.note !== void 0 && typeof pr.note !== "string") {
          out.errors.push({
            path: `${p}.note`,
            message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
        if (pr.base !== void 0 && (typeof pr.base !== "string" || !all.includes(pr.base))) {
          out.errors.push({
            path: `${p}.base`,
            message: "base \u306F\u4ED6\u306E\u6848\u306E id \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
        if (pr.theme !== void 0) {
          if (typeof pr.theme !== "string" || !opts.themeIds.includes(pr.theme)) {
            out.errors.push({
              path: `${p}.theme`,
              message: `\u30C6\u30FC\u30DE "${String(pr.theme)}" \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`
            });
          }
        }
        if (pr.screens !== void 0) {
          if (!Array.isArray(pr.screens)) {
            out.errors.push({
              path: `${p}.screens`,
              message: "\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
            });
          } else {
            const known = typeof pr.id === "string" ? opts.proposalScreenIds?.[pr.id] : void 0;
            pr.screens.forEach((s, j) => {
              if (typeof s !== "string") {
                out.errors.push({
                  path: `${p}.screens[${j}]`,
                  message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
                });
              } else if (known !== void 0 && !known.includes(s)) {
                out.errors.push({
                  path: `${p}.screens[${j}]`,
                  message: `"${s}" \u306B\u5BFE\u5FDC\u3059\u308B\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308A\u307E\u305B\u3093`
                });
              }
            });
          }
        }
      });
    }
  }
  if (data.screens !== void 0 && !hasProposals) {
    if (!Array.isArray(data.screens)) {
      out.errors.push({
        path: "screens",
        message: "\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    } else {
      data.screens.forEach((s, i) => {
        if (typeof s !== "string") {
          out.errors.push({
            path: `screens[${i}]`,
            message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        } else if (!opts.screenIds.includes(s)) {
          out.errors.push({
            path: `screens[${i}]`,
            message: `"${s}" \u306B\u5BFE\u5FDC\u3059\u308B\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308A\u307E\u305B\u3093`
          });
        }
      });
    }
  }
  if (data.references !== void 0) {
    if (!Array.isArray(data.references)) {
      out.errors.push({
        path: "references",
        message: "\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
      });
    } else {
      const proposalIds = Array.isArray(data.proposals) ? data.proposals.filter(isObj3).map((x) => x.id).filter((v) => typeof v === "string") : [
        DEFAULT_PROPOSAL_ID
      ];
      const seen = /* @__PURE__ */ new Set();
      data.references.forEach((r, i) => {
        const p = `references[${i}]`;
        if (!isObj3(r)) {
          out.errors.push({
            path: p,
            message: "\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
          return;
        }
        if (typeof r.file !== "string") {
          out.errors.push({
            path: `${p}.file`,
            message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        } else if (!isReferenceFile(r.file)) {
          out.errors.push({
            path: `${p}.file`,
            message: "library/references/ \u306E\u4E2D\u306E\u30D5\u30A1\u30A4\u30EB\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        } else if (opts.referenceFiles !== void 0 && !opts.referenceFiles.includes(r.file)) {
          out.warnings.push({
            path: `${p}.file`,
            message: "\u753B\u50CF\u304C\u3042\u308A\u307E\u305B\u3093"
          });
        }
        if (typeof r.note !== "string") {
          out.errors.push({
            path: `${p}.note`,
            message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
        if (r.id === void 0) {
          if (typeof r.chosen !== "boolean") {
            out.errors.push({
              path: `${p}.chosen`,
              message: "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
            });
          }
        } else {
          if (typeof r.id !== "string" || !ID_PATTERN.test(r.id)) {
            out.errors.push({
              path: `${p}.id`,
              message: "id \u306F ^[a-z0-9][a-z0-9-]*$ \u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
            });
          } else if (seen.has(r.id)) {
            out.errors.push({
              path: `${p}.id`,
              message: `id "${r.id}" \u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059`
            });
          } else seen.add(r.id);
          if (r.chosen !== void 0 && typeof r.chosen !== "boolean") {
            out.errors.push({
              path: `${p}.chosen`,
              message: "true \u304B false \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
            });
          }
        }
        for (const k of [
          "title",
          "screenTitle",
          "addedAt"
        ]) {
          if (r[k] !== void 0 && typeof r[k] !== "string") {
            out.errors.push({
              path: `${p}.${k}`,
              message: "\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
            });
          }
        }
        if (r.screen !== void 0 && (typeof r.screen !== "string" || !ID_PATTERN.test(r.screen))) {
          out.errors.push({
            path: `${p}.screen`,
            message: "screen \u306F ^[a-z0-9][a-z0-9-]*$ \u306E\u6587\u5B57\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059"
          });
        }
        if (r.proposal !== void 0 && (typeof r.proposal !== "string" || !proposalIds.includes(r.proposal))) {
          out.errors.push({
            path: `${p}.proposal`,
            message: `\u6848 ${JSON.stringify(r.proposal)} \u304C\u3042\u308A\u307E\u305B\u3093`
          });
        }
      });
    }
  }
  return out;
}
function formatIssues(file, result) {
  return [
    ...result.errors.map((e) => `${file}:${e.path}: ${e.message}`),
    ...result.warnings.map((w) => `${file}:${w.path}: warning: ${w.message}`)
  ];
}

// src/core/states.ts
function statesOf(screen, owner) {
  return owner === void 0 ? screen.states : findById(screen.elements, owner)?.el.states;
}
function scopeIds(elements, owner) {
  if (owner === void 0) return new Set(flatten(elements).map((l) => l.el.id));
  const el = findById(elements, owner)?.el;
  return new Set(el ? [
    el.id,
    ...flatten(el.children ?? []).map((l) => l.el.id)
  ] : []);
}
function mapStates(screen, fn) {
  const walk = (list) => list.map((el) => {
    let next = el;
    if (el.states) next = {
      ...next,
      states: fn(el.states, el.id)
    };
    if (el.children) next = {
      ...next,
      children: walk(el.children)
    };
    return next;
  });
  const out = {
    ...screen,
    elements: walk(screen.elements)
  };
  if (screen.states) out.states = fn(screen.states, void 0);
  return out;
}
var mapRows = (states, fn) => states.map((state) => {
  if (!state.changes) return state;
  const changes = {};
  for (const [id, row] of Object.entries(state.changes)) {
    const next = fn(id, row);
    if (next && Object.keys(next).length > 0) changes[id] = next;
  }
  const { changes: _old, ...rest } = state;
  return Object.keys(changes).length > 0 ? {
    ...rest,
    changes
  } : rest;
});
var shiftRow = (row, dx, dy) => ({
  ...row,
  ...row.x !== void 0 ? {
    x: row.x + dx
  } : {},
  ...row.y !== void 0 ? {
    y: row.y + dy
  } : {}
});
function pruneStates(screen) {
  return mapStates(screen, (states, owner) => {
    const scope = scopeIds(screen.elements, owner);
    return mapRows(states, (id, row) => scope.has(id) ? row : void 0);
  });
}
function freezeStrays(elements) {
  const walk = (list, inside) => list.map((el) => {
    let next = el;
    if (!inside) next = dropFill(el);
    return next.children ? {
      ...next,
      children: walk(next.children, layoutOf(next) !== void 0)
    } : next;
  });
  return walk(elements, false);
}
function settleStated(screen) {
  const shifts = /* @__PURE__ */ new Map();
  const add = (id, dx, dy) => {
    const s = shifts.get(id) ?? {
      dx: 0,
      dy: 0
    };
    shifts.set(id, {
      dx: s.dx + dx,
      dy: s.dy + dy
    });
  };
  const settle = (list) => {
    const out = [];
    for (const el of list) {
      if (!el.children) {
        out.push(el);
        continue;
      }
      const children = settle(el.children);
      if (el.type !== GROUP_TYPE2 || layoutOf(el)) {
        out.push({
          ...el,
          children
        });
        continue;
      }
      if (children.length === 0) continue;
      const dx = Math.min(...children.map((c) => c.x));
      const dy = Math.min(...children.map((c) => c.y));
      if (dx !== 0 || dy !== 0) {
        add(el.id, dx, dy);
        for (const c of children) add(c.id, -dx, -dy);
      }
      const shifted = dx === 0 && dy === 0 ? children : children.map((c) => ({
        ...c,
        x: c.x - dx,
        y: c.y - dy
      }));
      out.push({
        ...el,
        x: el.x + dx,
        y: el.y + dy,
        ...groupSize(shifted),
        children: shifted
      });
    }
    return out;
  };
  const settled = {
    ...screen,
    elements: placeElements(freezeStrays(settle(screen.elements)))
  };
  if (shifts.size === 0) return pruneStates(settled);
  return pruneStates(mapStates(settled, (states) => mapRows(states, (id, row) => {
    const s = shifts.get(id);
    return s ? shiftRow(row, s.dx, s.dy) : row;
  })));
}

// src/core/normalize.ts
var SCREEN_KEYS = [
  "version",
  "id",
  "title",
  "device",
  "states",
  "blocks",
  "elements"
];
var STATE_KEYS = [
  "id",
  "name",
  "changes"
];
var ELEMENT_KEYS = [
  "id",
  "type",
  "set",
  "name",
  "locked",
  "hidden",
  "keep",
  "x",
  "y",
  "w",
  "h",
  "text",
  "from",
  "variant",
  "props",
  "style",
  "layout",
  "states",
  "blocks",
  "children"
];
var PROJECT_KEYS = [
  "version",
  "name",
  "theme",
  "device",
  "proposals",
  "screens",
  "references"
];
var PROPOSAL_KEYS = [
  "id",
  "name",
  "note",
  "base",
  "theme",
  "screens"
];
var REFERENCE_KEYS = [
  "id",
  "title",
  "file",
  "note",
  "proposal",
  "screen",
  "screenTitle",
  "addedAt",
  "chosen"
];
function pick(obj, keys) {
  const out = {};
  const src = obj;
  for (const k of keys) if (src[k] !== void 0) out[k] = src[k];
  return out;
}
function normalizeStates(states) {
  if (!Array.isArray(states) || states.length <= 1) return void 0;
  return states.map((state) => {
    const picked = pick(state, STATE_KEYS);
    if (picked.changes === void 0) return picked;
    const changes = {};
    for (const [id, row] of Object.entries(picked.changes)) {
      const r = pick(row, STATE_CHANGE_KEYS);
      if (r.props && Object.keys(r.props).length === 0) delete r.props;
      if (r.style && Object.keys(r.style).length === 0) delete r.style;
      if (isStepMotion(r.motion)) {
        if (Array.isArray(r.motion.steps)) r.motion = normalizeStepMotion(r.motion);
      } else if (typeof r.motion === "object" && r.motion !== null) {
        const motion = pick(r.motion, MOTION_KEYS);
        if (Object.keys(motion).length > 0) r.motion = motion;
        else delete r.motion;
      }
      if (Object.keys(r).length > 0) changes[id] = r;
    }
    if (Object.keys(changes).length > 0) picked.changes = changes;
    else delete picked.changes;
    return picked;
  });
}
var normalizeAction = (a) => {
  const picked = pick(a, ACTION_KEYS);
  if (picked.act === "go" && typeof picked.motion === "object" && picked.motion !== null) {
    const motion = pick(picked.motion, MOTION_KEYS);
    if (Object.keys(motion).length > 0) picked.motion = motion;
    else delete picked.motion;
  }
  if ((picked.act === "value" || picked.act === "add") && typeof picked.from === "object" && picked.from !== null) {
    picked.from = pick(picked.from, REF_KEYS);
  }
  if (picked.act === "play" && typeof picked.motion === "object" && picked.motion !== null) {
    if (isStepMotion(picked.motion)) {
      if (Array.isArray(picked.motion.steps)) picked.motion = normalizeStepMotion(picked.motion);
    } else picked.motion = pick(picked.motion, [
      "name"
    ]);
  }
  return picked;
};
var isPlainObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var normalizeCondition = (c) => {
  const picked = pick(c, CONDITION_KEYS);
  if (picked.not !== true) delete picked.not;
  if ("part" in picked) {
    if (isPlainObject(picked.is)) picked.is = pick(picked.is, REF_KEYS);
    if (isPlainObject(picked.length)) picked.length = pick(picked.length, RANGE_KEYS);
    if (isPlainObject(picked.number)) picked.number = pick(picked.number, RANGE_KEYS);
  }
  return picked;
};
function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return void 0;
  return blocks.map((block) => {
    const picked = pick(block, BLOCK_KEYS);
    if (typeof picked.on === "object" && picked.on !== null) {
      picked.on = pick(picked.on, TRIGGER_KEYS);
    }
    if (typeof picked.if === "object" && picked.if !== null) {
      const word = Array.isArray(picked.if.all) ? "all" : Array.isArray(picked.if.any) ? "any" : "";
      if (word) picked.if = {
        [word]: picked.if[word].map(normalizeCondition)
      };
    }
    if (Array.isArray(picked.do)) picked.do = picked.do.map(normalizeAction);
    if (Array.isArray(picked.else)) picked.else = picked.else.map(normalizeAction);
    return picked;
  });
}
function normalizeLayout(l) {
  const picked = pick(l, LAYOUT_KEYS);
  if (picked.gap === LAYOUT_DEFAULTS.gap) delete picked.gap;
  if (picked.pad === 0 || Array.isArray(picked.pad) && picked.pad[0] === 0 && picked.pad[1] === 0) delete picked.pad;
  if (Array.isArray(picked.pad) && picked.pad[0] === picked.pad[1]) picked.pad = picked.pad[0];
  if (picked.align === LAYOUT_DEFAULTS.align) delete picked.align;
  if (picked.justify === LAYOUT_DEFAULTS.justify) delete picked.justify;
  return picked;
}
function normalizeElement(el, parent) {
  const filled = el;
  const picked = pick(el, ELEMENT_KEYS);
  const own = layoutOf(el);
  for (const axis of [
    "w",
    "h"
  ]) {
    const mode = filled.sizing?.[axis];
    if (mode) picked[axis] = mode;
    const byDefault = mode === "fill" && parent && axis === crossAxis(parent.dir) && parent.align === "stretch" ? true : mode === "fit" && own && (axis === mainAxis(own.dir) || el.type === "group");
    if (byDefault) delete picked[axis];
  }
  if (parent) {
    const loose = picked;
    delete loose.x;
    delete loose.y;
    if (parent.align === "stretch") delete picked[crossAxis(parent.dir)];
  }
  if (own) picked.layout = normalizeLayout(el.layout);
  else delete picked.layout;
  if (picked.locked !== true) delete picked.locked;
  if (picked.hidden !== true) delete picked.hidden;
  if (picked.keep !== true) delete picked.keep;
  if (typeof picked.from === "object" && picked.from !== null) {
    picked.from = pick(picked.from, REF_KEYS);
  }
  const states = normalizeStates(picked.states);
  if (states) picked.states = states;
  else delete picked.states;
  const blocks = normalizeBlocks(picked.blocks);
  if (blocks) picked.blocks = blocks;
  else delete picked.blocks;
  if (picked.type === "list" && picked.props && isRowArray(picked.props.items) && picked.props.items.length > 0) {
    const { rows: _rows, ...rest } = picked.props;
    picked.props = rest;
  }
  if (picked.props && Object.keys(picked.props).length === 0) delete picked.props;
  if (picked.style && Object.keys(picked.style).length === 0) delete picked.style;
  if (picked.children && picked.children.length === 0) delete picked.children;
  if (picked.children) picked.children = picked.children.map((c) => normalizeElement(c, own));
  return picked;
}
function normalizeScreen(s) {
  const picked = pick(s, SCREEN_KEYS);
  const states = normalizeStates(picked.states);
  if (states) picked.states = states;
  else delete picked.states;
  const blocks = normalizeBlocks(picked.blocks);
  if (blocks) picked.blocks = blocks;
  else delete picked.blocks;
  picked.elements = (picked.elements ?? []).map((e) => normalizeElement(e));
  return picked;
}
function normalizeProject(p) {
  const picked = pick(p, PROJECT_KEYS);
  if (picked.proposals) picked.proposals = picked.proposals.map((x) => pick(x, PROPOSAL_KEYS));
  if (Array.isArray(picked.references)) {
    picked.references = completeReferences(picked.references).map((r) => typeof r === "object" && r !== null ? pick(r, REFERENCE_KEYS) : r);
  }
  return picked;
}
function serialize(v) {
  return JSON.stringify(v, null, 2) + "\n";
}
async function hashText(text18) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text18));
  return [
    ...new Uint8Array(buf)
  ].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}

// src/core/diff.ts
var same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function diffRecord(before, after) {
  const keys = /* @__PURE__ */ new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {})
  ]);
  const b = {};
  const a = {};
  for (const k of keys) {
    const bv = before?.[k];
    const av = after?.[k];
    if (!same(bv, av)) {
      b[k] = bv === void 0 ? null : bv;
      a[k] = av === void 0 ? null : av;
    }
  }
  return Object.keys(b).length ? {
    before: b,
    after: a
  } : void 0;
}
function withoutChildren(el) {
  const { children: _children, states: _states, ...rest } = el;
  return rest;
}
function place(elements) {
  const out = /* @__PURE__ */ new Map();
  const walk = (list, frame, ox, oy, ax, ay, groups) => {
    for (const el of list) {
      out.set(el.id, {
        frame,
        fx: ox + el.x,
        fy: oy + el.y,
        ax: ax + el.x,
        ay: ay + el.y,
        groups
      });
      if (!el.children) continue;
      if (el.type === GROUP_TYPE2) {
        walk(el.children, frame, ox + el.x, oy + el.y, ax + el.x, ay + el.y, [
          ...groups,
          el.id
        ]);
      } else {
        walk(el.children, el.id, 0, 0, ax + el.x, ay + el.y, []);
      }
    }
  };
  walk(elements, void 0, 0, 0, 0, 0, []);
  return out;
}
function shownIn(screen, id) {
  const lists = [
    screen.states ?? [],
    ...flatten(screen.elements).map((l) => l.el.states ?? [])
  ];
  return lists.flat().filter((s) => s.changes?.[id]?.hidden === false).map((s) => s.name);
}
function diffRow(id, rb, ra, b, a) {
  const out = [];
  const touched = (...keys) => keys.some((k) => !same(rb[k], ra[k]));
  if (touched("x", "y")) {
    const p = {
      x: rb.x ?? b.x,
      y: rb.y ?? b.y
    };
    const q3 = {
      x: ra.x ?? a.x,
      y: ra.y ?? a.y
    };
    if (!same(p, q3)) out.push({
      kind: "move",
      id,
      before: p,
      after: q3
    });
  }
  if (touched("w", "h")) {
    const p = {
      w: rb.w ?? b.w,
      h: rb.h ?? b.h
    };
    const q3 = {
      w: ra.w ?? a.w,
      h: ra.h ?? a.h
    };
    if (!same(p, q3)) out.push({
      kind: "resize",
      id,
      before: p,
      after: q3
    });
  }
  if (touched("text") && (rb.text ?? b.text) !== (ra.text ?? a.text)) {
    out.push({
      kind: "text",
      id,
      before: rb.text ?? b.text,
      after: ra.text ?? a.text
    });
  }
  if (touched("variant") && (rb.variant ?? b.variant) !== (ra.variant ?? a.variant)) {
    out.push({
      kind: "variant",
      id,
      before: rb.variant ?? b.variant,
      after: ra.variant ?? a.variant
    });
  }
  for (const kind of [
    "props",
    "style"
  ]) {
    const wb = rb[kind] ?? {};
    const wa = ra[kind] ?? {};
    const eb = b[kind] ?? {};
    const ea = a[kind] ?? {};
    const before = {};
    const after = {};
    for (const k of /* @__PURE__ */ new Set([
      ...Object.keys(wb),
      ...Object.keys(wa)
    ])) {
      if (same(wb[k], wa[k])) continue;
      const p = (k in wb ? wb[k] : eb[k]) ?? null;
      const q3 = (k in wa ? wa[k] : ea[k]) ?? null;
      if (same(p, q3)) continue;
      before[k] = p;
      after[k] = q3;
    }
    if (Object.keys(after).length > 0) {
      out.push({
        kind,
        id,
        before,
        after
      });
    }
  }
  if (touched("hidden")) {
    const p = rb.hidden ?? b.hidden === true;
    const q3 = ra.hidden ?? a.hidden === true;
    if (p !== q3) out.push({
      kind: "hidden",
      id,
      before: p,
      after: q3
    });
  }
  return out;
}
function diffMotion(before, after) {
  const said = (row) => {
    if (!row.motion || Object.keys(row.motion).length > 0) return row;
    const { motion: _empty, ...rest } = row;
    return rest;
  };
  const rb = said(before);
  const ra = said(after);
  if (sameMotion(rb.motion, ra.motion)) return void 0;
  const written2 = (row) => isStepped(row.motion) ? row.motion : {
    ...row.motion,
    name: motionName(row)
  };
  const gone = Object.keys(ra).length === 0;
  const fresh = Object.keys(rb).length === 0;
  if (gone) return isMotionOnly(rb) ? {
    before: written2(rb)
  } : void 0;
  if (isMotionOnly(ra) && fresh) return {
    after: written2(ra)
  };
  return {
    before: fresh ? {
      name: DEFAULT_MOTION[rowKind(ra)]
    } : written2(rb),
    after: written2(ra)
  };
}
function diffStates(before, after) {
  const changes = [];
  const bm = new Map(flatten(before.elements).map((l) => [
    l.el.id,
    l.el
  ]));
  const am = new Map(flatten(after.elements).map((l) => [
    l.el.id,
    l.el
  ]));
  const owners = [
    void 0,
    ...[
      ...am.values()
    ].filter((el) => el.states || bm.get(el.id)?.states).map((el) => el.id)
  ];
  for (const owner of owners) {
    const tag = owner === void 0 ? {} : {
      owner
    };
    const bs = (owner === void 0 ? before.states : bm.get(owner)?.states) ?? [];
    const as = (owner === void 0 ? after.states : am.get(owner)?.states) ?? [];
    for (const [i, s] of bs.entries()) {
      if (as.some((x) => x.id === s.id) || i === 0 && as.length === 0) continue;
      changes.push({
        kind: "state-remove",
        ...tag,
        state: s.id,
        name: s.name
      });
    }
    for (const [i, s] of as.entries()) {
      const was = bs.find((x) => x.id === s.id);
      if (!was) {
        if (i > 0 || bs.length > 0) {
          changes.push({
            kind: "state-add",
            ...tag,
            state: s.id,
            name: s.name
          });
        }
      } else if (was.name !== s.name) {
        changes.push({
          kind: "state-name",
          ...tag,
          state: s.id,
          before: was.name,
          after: s.name
        });
      }
      const rb = was?.changes ?? {};
      const ra = s.changes ?? {};
      for (const id of /* @__PURE__ */ new Set([
        ...Object.keys(rb),
        ...Object.keys(ra)
      ])) {
        const b = bm.get(id);
        const a = am.get(id);
        if (!b || !a) continue;
        for (const change of diffRow(id, rb[id] ?? {}, ra[id] ?? {}, b, a)) {
          changes.push({
            kind: "state-change",
            ...tag,
            state: s.id,
            name: s.name,
            id,
            change
          });
        }
        const motion = diffMotion(rb[id] ?? {}, ra[id] ?? {});
        if (motion) {
          changes.push({
            kind: "state-motion",
            ...tag,
            state: s.id,
            name: s.name,
            id,
            ...motion
          });
        }
      }
    }
  }
  return changes;
}
var normalBlock = (b) => normalizeBlocks([
  b
])[0];
function likeness(b, a) {
  const same2 = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const word = (c) => c ? c.any ? "any" : "all" : void 0;
  const list = (x) => Array.isArray(x) ? x : [];
  const items = (xs, ys) => list(xs).filter((x, n) => n < list(ys).length && same2(x, list(ys)[n])).length;
  let score = b.on.event === a.on.event ? 100 : 0;
  if (same2(b.on, a.on)) score++;
  if (word(b.if) !== void 0 && word(b.if) === word(a.if)) score++;
  score += items(b.if?.all ?? b.if?.any, a.if?.all ?? a.if?.any);
  score += items(b.do, a.do);
  score += items(b.else, a.else);
  return score;
}
function keptOrder(seq) {
  const tails = [];
  const prev = new Array(seq.length).fill(-1);
  seq.forEach((v, i) => {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (seq[tails[mid]] < v) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tails[lo - 1];
    tails[lo] = i;
  });
  const out = /* @__PURE__ */ new Set();
  for (let i = tails.length ? tails[tails.length - 1] : -1; i >= 0; i = prev[i]) out.add(i);
  return out;
}
function diffBlockList(owner, bs, as) {
  const tag = owner === void 0 ? {} : {
    id: owner
  };
  const nb = bs.map(normalBlock);
  const na = as.map(normalBlock);
  const kb = nb.map((b) => JSON.stringify(b));
  const ka = na.map((b) => JSON.stringify(b));
  const from = /* @__PURE__ */ new Map();
  const used = /* @__PURE__ */ new Set();
  const pair = (j, i, changed) => {
    from.set(j, {
      i,
      changed
    });
    used.add(i);
  };
  ka.forEach((k, j) => {
    if (j < kb.length && kb[j] === k) pair(j, j, false);
  });
  ka.forEach((k, j) => {
    if (from.has(j)) return;
    const i = kb.findIndex((x, i2) => !used.has(i2) && x === k);
    if (i >= 0) pair(j, i, false);
  });
  const pairs = [];
  nb.forEach((b, i) => {
    if (used.has(i)) return;
    na.forEach((a, j) => {
      if (from.has(j)) return;
      const score = likeness(b, a);
      if (score > 0 || i === j) pairs.push({
        i,
        j,
        score
      });
    });
  });
  const far = (p) => Math.abs(p.i - p.j);
  pairs.sort((p, q3) => q3.score - p.score || Number(q3.i === q3.j) - Number(p.i === p.j) || far(p) - far(q3) || p.i - q3.i || p.j - q3.j);
  for (const { i, j } of pairs) {
    if (!used.has(i) && !from.has(j)) pair(j, i, true);
  }
  const changes = [];
  bs.forEach((block, i) => {
    if (!used.has(i)) changes.push({
      kind: "block-remove",
      ...tag,
      index: i + 1,
      block
    });
  });
  const found = [
    ...from.keys()
  ].sort((a, b) => a - b);
  const kept = keptOrder(found.map((j) => from.get(j).i));
  const stayed = new Set(found.filter((_j, n) => kept.has(n)));
  as.forEach((block, j) => {
    const f = from.get(j);
    if (!f) {
      changes.push({
        kind: "block-add",
        ...tag,
        index: j + 1,
        block
      });
      return;
    }
    if (!stayed.has(j)) changes.push({
      kind: "block-move",
      ...tag,
      from: f.i + 1,
      to: j + 1
    });
    if (f.changed) {
      changes.push({
        kind: "block-change",
        ...tag,
        index: j + 1,
        before: bs[f.i],
        after: block
      });
    }
  });
  return changes;
}
function diffBlocks(before, after) {
  const bm = new Map(flatten(before.elements).map((l) => [
    l.el.id,
    l.el.blocks ?? []
  ]));
  const am = new Map(flatten(after.elements).map((l) => [
    l.el.id,
    l.el.blocks ?? []
  ]));
  const changes = diffBlockList(void 0, before.blocks ?? [], after.blocks ?? []);
  const ids = [
    ...flatten(before.elements),
    ...flatten(after.elements)
  ].map((l) => l.el.id);
  for (const id of new Set(ids)) {
    changes.push(...diffBlockList(id, bm.get(id) ?? [], am.get(id) ?? []));
  }
  return changes;
}
function diffScreens(before, after) {
  const changes = [];
  if (before.title !== after.title) {
    changes.push({
      kind: "title",
      before: before.title,
      after: after.title
    });
  }
  if (deviceLabel(before.device) !== deviceLabel(after.device)) {
    changes.push({
      kind: "device",
      before: before.device,
      after: after.device
    });
  }
  const b = flatten(before.elements);
  const a = flatten(after.elements);
  const bm = new Map(b.map((l) => [
    l.el.id,
    l
  ]));
  const am = new Map(a.map((l) => [
    l.el.id,
    l
  ]));
  const pb = place(before.elements);
  const pa = place(after.elements);
  const delta = (id) => {
    const p = pb.get(id);
    const q3 = pa.get(id);
    if (!p || !q3) return {
      dx: 0,
      dy: 0
    };
    return p.frame === q3.frame ? {
      dx: q3.fx - p.fx,
      dy: q3.fy - p.fy
    } : {
      dx: q3.ax - p.ax,
      dy: q3.ay - p.ay
    };
  };
  const movedGroups = /* @__PURE__ */ new Set();
  for (const { el: x } of b) {
    const z = am.get(x.id)?.el;
    if (!z || x.type !== GROUP_TYPE2 || z.type !== GROUP_TYPE2) continue;
    const bc = (x.children ?? []).map((c) => c.id);
    const ac = (z.children ?? []).map((c) => c.id);
    if (bc.length === 0 || bc.length !== ac.length || !bc.every((id) => ac.includes(id))) continue;
    const ds = bc.map(delta);
    if ((ds[0].dx !== 0 || ds[0].dy !== 0) && ds.every((d) => d.dx === ds[0].dx && d.dy === ds[0].dy)) movedGroups.add(x.id);
  }
  const covered = (id) => (pb.get(id)?.groups ?? []).some((g) => movedGroups.has(g)) || (pa.get(id)?.groups ?? []).some((g) => movedGroups.has(g));
  for (const { el: x, parent } of b) {
    const y = am.get(x.id);
    if (!y) {
      changes.push({
        kind: "remove",
        id: x.id,
        parent,
        before: stripBase(withoutChildren(x))
      });
      continue;
    }
    const z = y.el;
    if (parent !== y.parent) {
      changes.push({
        kind: "reparent",
        id: x.id,
        before: parent,
        after: y.parent
      });
    }
    const isGroup = x.type === GROUP_TYPE2 && z.type === GROUP_TYPE2;
    const d = delta(x.id);
    const moved = isGroup ? movedGroups.has(x.id) : d.dx !== 0 || d.dy !== 0;
    const laidBefore = inLayout(before.elements, x.id) !== void 0;
    const laidAfter = inLayout(after.elements, x.id) !== void 0;
    if (moved && !covered(x.id) && !laidBefore && !laidAfter) {
      const p = pb.get(x.id);
      const q3 = pa.get(x.id);
      changes.push({
        kind: "move",
        id: x.id,
        before: {
          x: p.fx,
          y: p.fy
        },
        after: {
          x: q3.fx,
          y: q3.fy
        }
      });
    }
    if (!isGroup) {
      const modeOf2 = (e, axis) => e.sizing?.[axis] ?? e[axis];
      const both = [
        "w",
        "h"
      ].every((axis) => typeof modeOf2(x, axis) === "number" && typeof modeOf2(z, axis) === "number");
      if (both) {
        if (x.w !== z.w || x.h !== z.h) {
          changes.push({
            kind: "resize",
            id: x.id,
            before: {
              w: x.w,
              h: x.h
            },
            after: {
              w: z.w,
              h: z.h
            }
          });
        }
      } else {
        for (const axis of [
          "w",
          "h"
        ]) {
          const p = modeOf2(x, axis);
          const q3 = modeOf2(z, axis);
          if (p !== q3) changes.push({
            kind: "sizing",
            id: x.id,
            axis,
            before: p,
            after: q3
          });
        }
      }
    }
    const lb = x.layout ? normalizeLayout(x.layout) : void 0;
    const la = z.layout ? normalizeLayout(z.layout) : void 0;
    if (!same(lb, la)) {
      changes.push({
        kind: "layout",
        id: x.id,
        ...lb ? {
          before: lb
        } : {},
        ...la ? {
          after: la
        } : {}
      });
    }
    if (x.text !== z.text) changes.push({
      kind: "text",
      id: x.id,
      before: x.text,
      after: z.text
    });
    if (x.name !== z.name) changes.push({
      kind: "name",
      id: x.id,
      before: x.name,
      after: z.name
    });
    if (x.locked === true !== (z.locked === true)) {
      changes.push({
        kind: "lock",
        id: x.id,
        before: x.locked === true,
        after: z.locked === true
      });
    }
    if (x.set !== z.set) {
      changes.push({
        kind: "set",
        id: x.id,
        ...x.set !== void 0 ? {
          before: x.set
        } : {},
        ...z.set !== void 0 ? {
          after: z.set
        } : {}
      });
    }
    if (!same(x.from, z.from)) {
      changes.push({
        kind: "text-from",
        id: x.id,
        ...x.from ? {
          before: x.from
        } : {},
        ...z.from ? {
          after: z.from
        } : {}
      });
    }
    if (x.keep === true !== (z.keep === true)) {
      changes.push({
        kind: "keep",
        id: x.id,
        before: x.keep === true,
        after: z.keep === true
      });
    }
    if (x.hidden === true !== (z.hidden === true)) {
      changes.push({
        kind: "hidden",
        id: x.id,
        before: x.hidden === true,
        after: z.hidden === true
      });
    }
    if (x.variant !== z.variant) {
      changes.push({
        kind: "variant",
        id: x.id,
        before: x.variant,
        after: z.variant
      });
    }
    const props = diffRecord(x.props, z.props);
    if (props) changes.push({
      kind: "props",
      id: x.id,
      ...props
    });
    const style = diffRecord(x.style, z.style);
    if (style) changes.push({
      kind: "style",
      id: x.id,
      ...style
    });
  }
  for (const { el: z, parent } of a) {
    if (bm.has(z.id)) continue;
    const only = z.hidden === true ? shownIn(after, z.id) : [];
    changes.push({
      kind: "add",
      id: z.id,
      parent,
      after: stripBase(withoutChildren(z)),
      ...only.length > 0 ? {
        only
      } : {}
    });
  }
  const parents = [
    void 0,
    ...b.filter((l) => l.el.children && am.get(l.el.id)?.el.children).map((l) => l.el.id)
  ];
  for (const parent of parents) {
    const bs = siblingIds(before.elements, parent);
    const as = siblingIds(after.elements, parent);
    const bsShared = bs.filter((id) => as.includes(id));
    const asShared = as.filter((id) => bs.includes(id));
    if (!same(bsShared, asShared)) changes.push({
      kind: "reorder",
      parent,
      before: bs,
      after: as
    });
  }
  changes.push(...diffStates(before, after));
  changes.push(...diffBlocks(before, after));
  return changes;
}
function diffTheme(before, after) {
  return before === after ? [] : [
    {
      kind: "theme",
      before,
      after
    }
  ];
}

// src/core/block-text.ts
var val = (names, id, v) => names.value?.(id, v) ?? valueText(v);
var partLabel = (el) => el.name ?? el.text ?? el.id;
function namesOf(screen, title, kept = []) {
  const parts = new Map(flatten(screen.elements).map((l) => [
    l.el.id,
    partLabel(l.el)
  ]));
  const part = (id) => parts.get(id) ?? id;
  const lists = new Set(flatten(screen.elements).filter((l) => l.el.type === "list").map((l) => l.el.id));
  const sliders = new Map(flatten(screen.elements).filter((l) => l.el.type === "slider").map((l) => [
    l.el.id,
    l.el
  ]));
  return {
    part,
    state: (owner, state) => statesOf(screen, owner)?.find((s) => s.id === state)?.name ?? state,
    screen: (id) => title?.(id) ?? id,
    ref: (r) => refLabel(r, part, kept, partLabel),
    // A list's row as 「N 行目」, a slider's number as its value text (¥5,000, PR-15 spec §5).
    value: (id, v) => {
      const slider = sliders.get(id);
      if (slider && typeof v === "number") return sliderText(slider, v);
      return lists.has(id) && typeof v === "number" ? v < 0 ? "\u306A\u3057" : `${v + 1} \u884C\u76EE` : valueText(v);
    }
  };
}
function circled(n) {
  return n >= 1 && n <= 20 ? String.fromCodePoint(9311 + n) : `(${n})`;
}
function valueText(v) {
  if (typeof v === "boolean") return v ? "\u30AA\u30F3" : "\u30AA\u30D5";
  if (typeof v === "number") return `${v + 1} \u756A\u76EE`;
  return v === "" ? "\u7A7A" : `\u300C${v}\u300D`;
}
var SWIPE_ARROWS = {
  up: "\u2191",
  down: "\u2193",
  left: "\u2190",
  right: "\u2192"
};
function placeWords(at) {
  if (at === void 0) return "";
  if (at === "left") return "\u5DE6\u3092";
  if (at === "right") return "\u53F3\u3092";
  return `${at + 1} \u756A\u76EE\u3092`;
}
function triggerText(on) {
  switch (on.event) {
    case "press":
      return `${placeWords(on.at)}\u62BC\u3057\u305F\u3068\u304D`;
    case "enter":
      return "\u8F09\u3063\u305F\u3068\u304D";
    case "leave":
      return "\u5916\u308C\u305F\u3068\u304D";
    case "appear":
      return "\u73FE\u308C\u305F\u76F4\u5F8C";
    case "after":
      return `${on.ms ?? 0} \u30DF\u30EA\u79D2\u305F\u3063\u305F\u3089`;
    case "key":
      return `${on.key === "escape" ? "Esc" : "Enter"} \u3092\u62BC\u3057\u305F\u3068\u304D`;
    case "change":
      return "\u5024\u304C\u5909\u308F\u3063\u305F\u3068\u304D";
    case "hold": {
      const where = placeWords(on.at);
      return `${where ? `${where} ` : ""}${on.ms ?? HOLD_MS_DEFAULT} \u30DF\u30EA\u79D2\u9577\u62BC\u3057\u3057\u305F\u3068\u304D`;
    }
    case "swipe": {
      const where = placeWords(on.at);
      return `${where ? `${where} ` : ""}${SWIPE_ARROWS[on.dir ?? "up"]} \u306B\u30B9\u30EF\u30A4\u30D7\u3057\u305F\u3068\u304D`;
    }
  }
}
function conditionText(c, names) {
  const is = c.not ? "\u3067\u306A\u3044" : "\u3067\u3042\u308B";
  if (isValueCondition(c)) {
    const part = names.part(c.part);
    const cmp = compareOf(c);
    if (!cmp) return `${part} \u304C ? ${is}`;
    switch (cmp.kind) {
      case "is":
        return `${part} \u304C ${val(names, c.part, cmp.value)} ${is}`;
      case "same":
        return `${part} \u304C ${names.ref(cmp.ref)} \u3068\u540C\u3058 ${is}`;
      case "has":
        return `${part} \u304C ${valueText(cmp.text)} ${c.not ? "\u3092\u542B\u307E\u306A\u3044" : "\u3092\u542B\u3080"}`;
      case "length":
        return `${part} \u306E\u6587\u5B57\u6570\u304C ${rangeText(cmp.range)} ${is}`;
      case "number":
        return `${part} \u304C\u6570\u3068\u3057\u3066 ${rangeText(cmp.range)} ${is}`;
    }
  }
  const who = c.box === void 0 ? "\u753B\u9762" : names.part(c.box);
  return `${who} \u304C ${names.state(c.box, c.state)} ${is}`;
}
function rangeText(r) {
  const parts = [];
  if (r.min !== void 0) parts.push(`${r.min} \u4EE5\u4E0A`);
  if (r.max !== void 0) parts.push(`${r.max} \u4EE5\u4E0B`);
  return parts.join(" ");
}
function actionText(a, names) {
  const who = (box7) => box7 === void 0 ? "\u753B\u9762" : names.part(box7);
  switch (a.act) {
    case "set":
      return `${who(a.box)} \u3092 ${names.state(a.box, a.state)} \u306B\u3059\u308B`;
    case "next":
      return `${who(a.box)} \u3092 \u6B21\u306E State \u3078`;
    case "prev":
      return `${who(a.box)} \u3092 \u524D\u306E State \u3078`;
    case "reset":
      return `${who(a.box)} \u3092 \u6700\u521D\u306E State \u3078`;
    case "go":
      return `${names.screen(a.screen)} \u3078\u79FB\u308B`;
    case "back":
      return "\u524D\u306E\u753B\u9762\u3078\u623B\u308B";
    case "wait":
      return `${a.ms} \u30DF\u30EA\u79D2\u5F85\u3064`;
    case "value":
      if (a.from) return `${names.part(a.part)} \u306E\u5024\u3092 ${names.ref(a.from)} \u304B\u3089\u5199\u3059`;
      return `${names.part(a.part)} \u306E\u5024\u3092 ${val(names, a.part, a.to)} \u306B\u3059\u308B`;
    case "add":
      return `${names.part(a.part)} \u306B ${names.ref(a.from)} \u304B\u3089\u884C\u3092\u8DB3\u3059`;
    case "remove":
      return `${names.part(a.part)} \u306E ${a.at === void 0 ? "\u62BC\u3057\u305F\u884C" : `${a.at + 1} \u884C\u76EE`}\u3092\u6D88\u3059`;
    case "play":
      return `${names.part(a.part)} \u3092 ${effectLabel(a.motion)} \u3067\u52D5\u304B\u3059`;
  }
}
function blockText(block, names) {
  const first = block.do[0];
  return `${triggerText(block.on)} \u2192 ${first ? actionText(first, names) : "\u306A\u3057"}`;
}

// src/core/summary.ts
function displayWidth(s) {
  let n = 0;
  for (const ch of s) n += (ch.codePointAt(0) ?? 0) > 255 ? 2 : 1;
  return n;
}
function padDisplay(s, n) {
  return s + " ".repeat(Math.max(0, n - displayWidth(s)));
}
var q2 = (s) => `\u300C${s ?? ""}\u300D`;
var fmt = (v) => v === null || v === void 0 ? "(\u306A\u3057)" : Array.isArray(v) ? `[${v.join(",")}]` : String(v);
var pos = (el) => `(${el.x},${el.y}) ${el.w}x${el.h}`;
var motionText = (m) => m === void 0 ? "(\u306A\u3057)" : isStepped(m) ? m.label ?? CUSTOM_LABEL : [
  m.name,
  m.speed,
  m.easing
].filter((v) => v !== void 0).join(" ");
var motionAfterText = (b, a) => isStepped(b) && isStepped(a) && motionText(b) === motionText(a) && !sameMotion(b, a) ? `${motionText(a)}(\u4E2D\u8EAB\u304C\u9055\u3046)` : motionText(a);
var MATCH = {
  all: "\u3059\u3079\u3066",
  any: "\u3069\u308C\u304B"
};
var DIR_WORD = {
  column: "\u7E26",
  row: "\u6A2A"
};
var ALIGN_WORD = {
  column: {
    start: "\u5DE6",
    center: "\u4E2D\u592E",
    end: "\u53F3",
    stretch: "\u5E45\u3044\u3063\u3071\u3044"
  },
  row: {
    start: "\u4E0A",
    center: "\u4E2D\u592E",
    end: "\u4E0B",
    stretch: "\u9AD8\u3055\u3044\u3063\u3071\u3044"
  }
};
var JUSTIFY_WORD = {
  start: "\u524D",
  center: "\u4E2D\u592E",
  end: "\u5F8C\u308D",
  between: "\u4E21\u7AEF"
};
var padWord = (pad) => pad === void 0 ? "0" : typeof pad === "number" ? String(pad) : `${pad[0]} ${pad[1]}`;
var modeWord = (v) => v === "fit" ? "\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u308B" : v === "fill" ? "\u3044\u3063\u3071\u3044" : String(v);
function layoutLines(c) {
  const b = c.before;
  const a = c.after;
  const out = [];
  if (b?.dir !== a?.dir) {
    out.push(`\u4E26\u3079\u65B9 ${b ? DIR_WORD[b.dir] : "\u306A\u3057"} -> ${a ? DIR_WORD[a.dir] : "\u306A\u3057"}`);
  }
  if (!b || !a) return out;
  if ((b.gap ?? 8) !== (a.gap ?? 8)) out.push(`\u9593\u9694 ${b.gap ?? 8} -> ${a.gap ?? 8}`);
  if (padWord(b.pad) !== padWord(a.pad)) out.push(`\u4F59\u767D ${padWord(b.pad)} -> ${padWord(a.pad)}`);
  if ((b.align ?? "start") !== (a.align ?? "start")) {
    out.push(`\u63C3\u3048 ${ALIGN_WORD[b.dir][b.align ?? "start"]} -> ${ALIGN_WORD[a.dir][a.align ?? "start"]}`);
  }
  if ((b.justify ?? "start") !== (a.justify ?? "start")) {
    out.push(`\u8A70\u3081\u65B9 ${JUSTIFY_WORD[b.justify ?? "start"]} -> ${JUSTIFY_WORD[a.justify ?? "start"]}`);
  }
  return out;
}
var BARE = {
  part: (id) => id,
  state: (_owner, state) => state,
  screen: (id) => id,
  ref: (r) => r.screen === void 0 ? r.part : `${r.screen} \u203A ${r.part}`
};
function blockChangeLines(index, before, after, names) {
  const head = `\u30D6\u30ED\u30C3\u30AF ${circled(index)}`;
  const out = [];
  const line = (slot, b, a) => out.push(`${head}  ${slot}  ${b ?? "\u306A\u3057"} \u2192 ${a ?? "\u306A\u3057"}`);
  if (triggerText(before.on) !== triggerText(after.on)) {
    line("Trigger", triggerText(before.on), triggerText(after.on));
  }
  const wb = before.if?.any ? "any" : before.if ? "all" : void 0;
  const wa = after.if?.any ? "any" : after.if ? "all" : void 0;
  if (wb && wa && wb !== wa) out.push(`${head}  If  ${MATCH[wb]} \u2192 ${MATCH[wa]}`);
  const items = (slot, b, a, text18) => {
    for (let i = 0; i < Math.max(b.length, a.length); i++) {
      const tb = b[i] === void 0 ? void 0 : text18(b[i]);
      const ta = a[i] === void 0 ? void 0 : text18(a[i]);
      if (tb !== ta) line(`${slot} ${i + 1}`, tb, ta);
    }
  };
  const cond = (c) => conditionText(c, names);
  const act = (x) => actionText(x, names);
  items("If", conditionsOf(before), conditionsOf(after), cond);
  items("Then", before.do, after.do, act);
  items("Else", before.else ?? [], after.else ?? [], act);
  if (out.length === 0) out.push(`${head}  \u5909\u66F4`);
  return out;
}
var hasRowObjects = (v) => isRowArray(v) && v.length > 0;
function propLines(c) {
  const out = [];
  const plain = [];
  for (const k of Object.keys(c.after)) {
    if (hasRowObjects(c.before[k]) || hasRowObjects(c.after[k])) {
      out.push(...rowLines(c.before[k], c.after[k]));
    } else plain.push(`${k}: ${fmt(c.before[k])} -> ${fmt(c.after[k])}`);
  }
  if (plain.length) out.unshift("\u8A2D\u5B9A " + plain.join(", "));
  return out;
}
function describeLines(c, label, names = BARE) {
  if (c.kind === "block-change") return blockChangeLines(c.index, c.before, c.after, names);
  if (c.kind === "props") return propLines(c);
  if (c.kind === "layout") return layoutLines(c);
  if (c.kind === "state-change") {
    return describeLines(c.change, label, names).map((l) => `[${c.name}] ${l}`);
  }
  return [
    describeChange(c, label, names)
  ];
}
function describeChange(c, _label, names = BARE) {
  switch (c.kind) {
    case "move":
      return `\u4F4D\u7F6E (${c.before.x},${c.before.y}) -> (${c.after.x},${c.after.y})`;
    case "resize": {
      const dw = c.before.w !== c.after.w;
      const dh = c.before.h !== c.after.h;
      if (dw && dh) return `\u5927\u304D\u3055 ${c.before.w}x${c.before.h} -> ${c.after.w}x${c.after.h}`;
      return dw ? `\u5E45 ${c.before.w} -> ${c.after.w}` : `\u9AD8\u3055 ${c.before.h} -> ${c.after.h}`;
    }
    case "text":
      return `\u6587\u5B57 ${q2(c.before)} -> ${q2(c.after)}`;
    case "variant":
      return `\u898B\u305F\u76EE ${fmt(c.before)} -> ${fmt(c.after)}`;
    case "props":
      return propLines(c).join(" / ");
    case "style":
      return "\u4E0A\u66F8\u304D " + Object.keys(c.after).map((k) => `${k}: ${fmt(c.before[k])} -> ${fmt(c.after[k])}`).join(", ");
    case "add":
      return `\u8FFD\u52A0 ${c.after.type} ${pos(c.after)}` + (c.parent ? ` (${c.parent} \u306E\u4E2D)` : "") + (c.only ? ` (${c.only.map(q2).join("")}\u3060\u3051)` : "") + (c.after.set ? ` (MySet ${c.after.set})` : "");
    case "remove":
      return `\u524A\u9664 ${c.before.type} ${pos(c.before)}` + (c.parent ? ` (${c.parent} \u306E\u4E2D)` : "");
    case "reorder":
      return `\u4E26\u3073\u66FF\u3048 [${c.before.join(",")}] -> [${c.after.join(",")}]`;
    case "theme":
      return `${c.before} -> ${c.after}  (project.json)`;
    case "device":
      return `\u7AEF\u672B\u67A0 ${deviceLabel(c.before)} -> ${deviceLabel(c.after)}`;
    case "title":
      return `\u898B\u51FA\u3057 ${q2(c.before)} -> ${q2(c.after)}`;
    case "reparent":
      return `\u89AA ${c.before ?? "(root)"} -> ${c.after ?? "(root)"}`;
    case "name":
      return `\u540D\u524D ${q2(c.before)} -> ${q2(c.after)}`;
    case "lock":
      return `\u30ED\u30C3\u30AF ${c.before ? "\u3042\u308A" : "\u306A\u3057"} -> ${c.after ? "\u3042\u308A" : "\u306A\u3057"}`;
    case "text-from":
      return `\u6587\u5B57\u306E\u5143 ${c.before ? names.ref(c.before) : "\u306A\u3057"} -> ${c.after ? names.ref(c.after) : "\u306A\u3057"}`;
    case "layout":
      return layoutLines(c).join(" / ");
    case "sizing":
      return `${c.axis === "w" ? "\u5E45" : "\u9AD8\u3055"} ${modeWord(c.before)} -> ${modeWord(c.after)}`;
    case "keep":
      return `\u6301\u3061\u8D8A\u3057 ${c.before ? "\u3042\u308A" : "\u306A\u3057"} -> ${c.after ? "\u3042\u308A" : "\u306A\u3057"}`;
    case "hidden":
      return c.after ? "\u975E\u8868\u793A" : "\u8868\u793A";
    case "state-add":
      return `State \u8FFD\u52A0${q2(c.name)}`;
    case "state-remove":
      return `State \u524A\u9664${q2(c.name)}`;
    case "state-name":
      return `State \u540D\u524D${q2(c.before)}\u2192${q2(c.after)}`;
    case "state-change":
      return `[${c.name}] ${describeChange(c.change, _label)}`;
    case "state-motion":
      return `[${c.name}] \u52D5\u304D  ${motionText(c.before)} -> ${motionAfterText(c.before, c.after)}`;
    case "block-add":
      return `\u30D6\u30ED\u30C3\u30AF  \u8FFD\u52A0 ${circled(c.index)} ${blockText(c.block, names)}`;
    case "block-remove":
      return `\u30D6\u30ED\u30C3\u30AF  \u524A\u9664 ${circled(c.index)}`;
    case "block-move":
      return `\u30D6\u30ED\u30C3\u30AF  \u4E26\u3073\u66FF\u3048 ${circled(c.from)} \u2192 ${circled(c.to)}`;
    case "block-change":
      return blockChangeLines(c.index, c.before, c.after, names).join(" / ");
    case "create": {
      if (c.from === "blank") return "\u767D\u7D19\u304B\u3089";
      const [source, id] = c.from.split(":", 2);
      const title = c.fromTitle ?? id;
      if (source === "ai") return `\u753B\u9762\u300C${title}\u300D(AI ${id}) \u304B\u3089`;
      return `\u3072\u306A\u5F62\u300C${title}\u300D(${source === "builtin" ? "\u5185\u8535" : "Custom"} ${id}) \u304B\u3089`;
    }
    case "delete":
      return "\u524A\u9664\u6E08\u307F";
    case "set":
      return `MySet ${c.before ?? "\u306A\u3057"} -> ${c.after ?? "\u306A\u3057"}`;
  }
}
function viaText(via) {
  switch (via.kind) {
    case "set":
      return `MySet\u300C${via.name}\u300D\u306E\u53CD\u6620`;
    case "set-rename":
      return `MySet\u300C${via.name}\u300D\u306E\u540D\u524D\u3092\u5909\u66F4`;
    case "set-delete":
      return `MySet\u300C${via.name}\u300D\u3092\u6D88\u3057\u305F`;
    case "default":
      return `${via.name} \u306E Default \u306E\u53CD\u6620`;
  }
}
function summarizeScreen(screen, records, registry2) {
  const head = `${screen.id} (${screen.title})`;
  if (records.length === 0) return `${head}  \u5909\u66F4\u306A\u3057`;
  const labels = /* @__PURE__ */ new Map();
  for (const { el } of flatten(screen.elements)) {
    labels.set(el.id, el.text ?? registry2.get(el.type)?.label ?? el.type);
  }
  for (const r of records) {
    for (const c of r.changes) {
      if (c.kind === "remove") {
        labels.set(c.id, c.before.text ?? registry2.get(c.before.type)?.label ?? c.before.type);
      }
    }
  }
  const label = (id) => labels.get(id) ?? "";
  const names = namesOf(screen);
  const count = records.reduce((n, r) => n + r.changes.length, 0);
  const at = records[records.length - 1].at;
  const lines = [
    `${head}  ${count}\u4EF6  ${at.slice(0, 10)} ${at.slice(11, 16)} \u4FDD\u5B58`
  ];
  for (const r of records) {
    if (r.via) lines.push(`  \u21B3 ${viaText(r.via)} ${r.at.slice(0, 10)} ${r.at.slice(11, 16)}`);
    for (const c of r.changes) {
      const block = c.kind.startsWith("block-");
      const id = "id" in c && c.id !== void 0 ? c.id : block ? "(\u753B\u9762)" : c.kind === "reorder" ? c.parent ?? "(root)" : c.kind === "create" ? "\u4F5C\u6210" : "state" in c ? c.owner ?? "(\u753B\u9762)" : c.kind;
      const lab = "id" in c && c.id !== void 0 ? label(c.id) : "state" in c && c.owner ? label(c.owner) : "";
      for (const text18 of describeLines(c, label, names)) {
        lines.push(`  ${padDisplay(id, 8)} ${padDisplay(lab, 10)} ${text18}`);
      }
    }
  }
  return lines.join("\n");
}

// src/templates/login.json
var login_default = {
  version: 1,
  id: "login",
  title: "\u30ED\u30B0\u30A4\u30F3",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u30ED\u30B0\u30A4\u30F3", props: { left: "none" } },
    { id: "heading", type: "text", x: 24, y: 136, w: 342, h: 32, text: "\u304A\u304B\u3048\u308A\u306A\u3055\u3044", style: { size: "lg", weight: "bold" } },
    { id: "email", type: "input", x: 24, y: 192, w: 342, h: 56, text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9", props: { placeholder: "you@example.com" } },
    { id: "password", type: "input", x: 24, y: 264, w: 342, h: 56, text: "\u30D1\u30B9\u30EF\u30FC\u30C9", props: { placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" } },
    { id: "login", type: "button", x: 24, y: 352, w: 342, h: 52, text: "\u30ED\u30B0\u30A4\u30F3", variant: "filled" },
    { id: "forgot", type: "button", x: 24, y: 416, w: 342, h: 44, text: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u65B9", variant: "ghost" },
    { id: "signup-hint", type: "text", x: 24, y: 760, w: 342, h: 24, text: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u306A\u3044\u65B9\u306F\u65B0\u898F\u767B\u9332", style: { color: "$muted", align: "center" } }
  ]
};

// src/templates/signup.json
var signup_default = {
  version: 1,
  id: "signup",
  title: "\u65B0\u898F\u767B\u9332",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u65B0\u898F\u767B\u9332", props: { left: "back" } },
    { id: "name", type: "input", x: 24, y: 120, w: 342, h: 56, text: "\u540D\u524D" },
    { id: "email", type: "input", x: 24, y: 192, w: 342, h: 56, text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" },
    { id: "password", type: "input", x: 24, y: 264, w: 342, h: 56, text: "\u30D1\u30B9\u30EF\u30FC\u30C9" },
    { id: "agree", type: "checkbox", x: 24, y: 344, w: 342, h: 32, text: "\u5229\u7528\u898F\u7D04\u306B\u540C\u610F\u3059\u308B" },
    { id: "submit", type: "button", x: 24, y: 400, w: 342, h: 52, text: "\u767B\u9332\u3059\u308B", variant: "filled" }
  ]
};

// src/templates/home.json
var home_default = {
  version: 1,
  id: "home",
  title: "\u30DB\u30FC\u30E0",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u30DB\u30FC\u30E0", props: { left: "menu" } },
    {
      id: "summary",
      type: "rect",
      name: "Summary Card",
      x: 24,
      y: 120,
      w: 342,
      h: 120,
      props: { elevated: true },
      children: [
        { id: "summary-label", type: "text", x: 16, y: 16, w: 200, h: 24, text: "\u4ECA\u6708", style: { color: "$muted" } },
        { id: "summary-value", type: "text", x: 16, y: 48, w: 310, h: 48, text: "\xA50", style: { size: "lg", weight: "bold" } }
      ]
    },
    { id: "recent-title", type: "text", x: 24, y: 264, w: 342, h: 24, text: "\u6700\u8FD1\u306E\u9805\u76EE", style: { weight: "bold" } },
    { id: "recent", type: "list", x: 24, y: 296, w: 342, h: 280, props: { rows: 5, rowHeight: 56, leading: "icon", trailing: "chevron" } },
    { id: "tabs", type: "tabbar", x: 0, y: 760, w: 390, h: 84, props: { items: ["\u30DB\u30FC\u30E0", "\u4E00\u89A7", "\u8A2D\u5B9A"], active: 0 } }
  ]
};

// src/templates/list.json
var list_default = {
  version: 1,
  id: "list",
  title: "\u4E00\u89A7(\u884C)",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u4E00\u89A7", props: { left: "back", right: "\u4E26\u3073\u66FF\u3048" } },
    { id: "search", type: "input", x: 24, y: 112, w: 342, h: 56, props: { kind: "search", placeholder: "\u691C\u7D22" } },
    { id: "items", type: "list", x: 24, y: 184, w: 342, h: 448, props: { rows: 14, rowHeight: 56, leading: "icon", trailing: "chevron" } },
    { id: "add", type: "button", x: 246, y: 744, w: 120, h: 52, text: "+ \u8FFD\u52A0", variant: "filled" }
  ]
};

// src/templates/cards.json
var cards_default = {
  version: 1,
  id: "cards",
  title: "\u4E00\u89A7(\u30AB\u30FC\u30C9)",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u4E00\u89A7", props: { left: "menu" } },
    {
      id: "card-1",
      type: "rect",
      name: "Card",
      x: 24,
      y: 120,
      w: 342,
      h: 176,
      props: { elevated: true },
      children: [
        { id: "card-1-image", type: "image", x: 16, y: 16, w: 96, h: 96, text: "\u753B\u50CF" },
        { id: "card-1-title", type: "text", x: 128, y: 16, w: 198, h: 24, text: "\u9805\u76EE\u540D", style: { weight: "bold" } },
        { id: "card-1-body", type: "text", x: 128, y: 48, w: 198, h: 48, text: "\u8AAC\u660E\u6587\u304C\u5165\u308A\u307E\u3059", style: { color: "$muted" } }
      ]
    },
    {
      id: "card-2",
      type: "rect",
      name: "Card",
      x: 24,
      y: 312,
      w: 342,
      h: 176,
      props: { elevated: true },
      children: [
        { id: "card-2-image", type: "image", x: 16, y: 16, w: 96, h: 96, text: "\u753B\u50CF" },
        { id: "card-2-title", type: "text", x: 128, y: 16, w: 198, h: 24, text: "\u9805\u76EE\u540D", style: { weight: "bold" } },
        { id: "card-2-body", type: "text", x: 128, y: 48, w: 198, h: 48, text: "\u8AAC\u660E\u6587\u304C\u5165\u308A\u307E\u3059", style: { color: "$muted" } }
      ]
    },
    {
      id: "card-3",
      type: "rect",
      name: "Card",
      x: 24,
      y: 504,
      w: 342,
      h: 176,
      props: { elevated: true },
      children: [
        { id: "card-3-image", type: "image", x: 16, y: 16, w: 96, h: 96, text: "\u753B\u50CF" },
        { id: "card-3-title", type: "text", x: 128, y: 16, w: 198, h: 24, text: "\u9805\u76EE\u540D", style: { weight: "bold" } },
        { id: "card-3-body", type: "text", x: 128, y: 48, w: 198, h: 48, text: "\u8AAC\u660E\u6587\u304C\u5165\u308A\u307E\u3059", style: { color: "$muted" } }
      ]
    },
    { id: "tabs", type: "tabbar", x: 0, y: 760, w: 390, h: 84, props: { items: ["\u30DB\u30FC\u30E0", "\u4E00\u89A7", "\u8A2D\u5B9A"], active: 1 } }
  ]
};

// src/templates/detail.json
var detail_default = {
  version: 1,
  id: "detail",
  title: "\u8A73\u7D30",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u8A73\u7D30", props: { left: "back", right: "\u7DE8\u96C6" } },
    { id: "hero", type: "image", x: 24, y: 112, w: 342, h: 200, text: "\u753B\u50CF" },
    { id: "title", type: "text", x: 24, y: 328, w: 342, h: 32, text: "\u9805\u76EE\u540D", style: { size: "lg", weight: "bold" } },
    { id: "body", type: "text", x: 24, y: 368, w: 342, h: 48, text: "\u672C\u6587\u304C 2 \u884C\u307B\u3069\u5165\u308A\u307E\u3059\u3002\u9805\u76EE\u306E\u8AAC\u660E\u3002" },
    { id: "rule", type: "divider", x: 24, y: 432, w: 342, h: 1 },
    { id: "date", type: "text", x: 24, y: 448, w: 342, h: 24, text: "2026-09-29", style: { color: "$muted" } },
    { id: "edit", type: "button", x: 24, y: 712, w: 342, h: 52, text: "\u7DE8\u96C6", variant: "filled" },
    { id: "delete", type: "button", x: 24, y: 776, w: 342, h: 44, text: "\u524A\u9664", variant: "outline" }
  ]
};

// src/templates/form.json
var form_default = {
  version: 1,
  id: "form",
  title: "\u5165\u529B\u30D5\u30A9\u30FC\u30E0",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u5165\u529B", props: { left: "close", right: "\u4FDD\u5B58" } },
    { id: "name", type: "input", x: 24, y: 112, w: 342, h: 56, text: "\u540D\u524D" },
    { id: "category", type: "input", x: 24, y: 184, w: 342, h: 56, text: "\u30AB\u30C6\u30B4\u30EA", props: { kind: "select", placeholder: "\u9078\u629E" } },
    { id: "amount", type: "input", x: 24, y: 256, w: 342, h: 56, text: "\u91D1\u984D", props: { placeholder: "0" } },
    { id: "memo", type: "input", x: 24, y: 328, w: 342, h: 96, text: "\u30E1\u30E2", props: { multiline: true } },
    { id: "notify", type: "toggle", x: 24, y: 440, w: 342, h: 32, text: "\u901A\u77E5\u3059\u308B" },
    { id: "save", type: "button", x: 24, y: 744, w: 342, h: 52, text: "\u4FDD\u5B58", variant: "filled" }
  ]
};

// src/templates/settings.json
var settings_default = {
  version: 1,
  id: "settings",
  title: "\u8A2D\u5B9A",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u8A2D\u5B9A", props: { left: "back" } },
    { id: "items", type: "list", x: 24, y: 112, w: 342, h: 336, props: { rowHeight: 56, leading: "none", trailing: "chevron", items: [{ text: "\u30A2\u30AB\u30A6\u30F3\u30C8" }, { text: "\u901A\u77E5" }, { text: "\u8868\u793A" }, { text: "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC" }, { text: "\u30D8\u30EB\u30D7" }, { text: "\u3053\u306E\u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066" }] } },
    { id: "dark", type: "toggle", x: 24, y: 464, w: 342, h: 32, text: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9" },
    { id: "rule", type: "divider", x: 24, y: 512, w: 342, h: 1 },
    { id: "logout", type: "button", x: 24, y: 744, w: 342, h: 44, text: "\u30ED\u30B0\u30A2\u30A6\u30C8", variant: "ghost" }
  ]
};

// src/templates/search.json
var search_default = {
  version: 1,
  id: "search",
  title: "\u691C\u7D22",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u691C\u7D22", props: { left: "back" } },
    { id: "query", type: "input", x: 24, y: 112, w: 342, h: 56, props: { kind: "search", placeholder: "\u30AD\u30FC\u30EF\u30FC\u30C9" } },
    { id: "recent-title", type: "text", x: 24, y: 184, w: 342, h: 24, text: "\u6700\u8FD1\u306E\u691C\u7D22", style: { color: "$muted" } },
    { id: "recent", type: "list", x: 24, y: 216, w: 342, h: 224, props: { rows: 4, rowHeight: 56, leading: "icon", trailing: "none" } }
  ]
};

// src/templates/empty.json
var empty_default = {
  version: 1,
  id: "empty",
  title: "\u7A7A\u72B6\u614B",
  device: "phone",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 390, h: 96, text: "\u4E00\u89A7", props: { left: "menu" } },
    {
      id: "illustration",
      type: "rect",
      name: "Illustration",
      x: 119,
      y: 280,
      w: 152,
      h: 152,
      style: { fill: "$surface", radius: "lg" },
      children: [{ id: "illustration-icon", type: "icon", x: 64, y: 64, w: 24, h: 24, text: "inbox" }]
    },
    { id: "title", type: "text", x: 24, y: 456, w: 342, h: 32, text: "\u307E\u3060\u4F55\u3082\u3042\u308A\u307E\u305B\u3093", style: { size: "lg", weight: "bold", align: "center" } },
    { id: "hint", type: "text", x: 24, y: 496, w: 342, h: 24, text: "\u53F3\u4E0B\u306E + \u304B\u3089\u8FFD\u52A0\u3067\u304D\u307E\u3059", style: { color: "$muted", align: "center" } },
    { id: "add", type: "button", x: 24, y: 744, w: 342, h: 52, text: "\u6700\u521D\u306E\u9805\u76EE\u3092\u8FFD\u52A0", variant: "filled" }
  ]
};

// src/templates/desktop-login.json
var desktop_login_default = {
  version: 1,
  id: "desktop-login",
  title: "\u30ED\u30B0\u30A4\u30F3(desktop)",
  device: "desktop",
  elements: [
    {
      id: "card",
      type: "rect",
      name: "Login Card",
      x: 480,
      y: 240,
      w: 480,
      h: 420,
      props: { elevated: true },
      children: [
        { id: "heading", type: "text", x: 40, y: 40, w: 400, h: 32, text: "\u30ED\u30B0\u30A4\u30F3", style: { size: "lg", weight: "bold" } },
        { id: "email", type: "input", x: 40, y: 104, w: 400, h: 56, text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" },
        { id: "password", type: "input", x: 40, y: 176, w: 400, h: 56, text: "\u30D1\u30B9\u30EF\u30FC\u30C9" },
        { id: "login", type: "button", x: 40, y: 264, w: 400, h: 52, text: "\u30ED\u30B0\u30A4\u30F3", variant: "filled" },
        { id: "forgot", type: "button", x: 40, y: 328, w: 400, h: 44, text: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u65B9", variant: "ghost" }
      ]
    }
  ]
};

// src/templates/desktop-table.json
var desktop_table_default = {
  version: 1,
  id: "desktop-table",
  title: "\u4E00\u89A7(\u8868)(desktop)",
  device: "desktop",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 1440, h: 64, text: "\u4E00\u89A7", props: { left: "menu" } },
    {
      id: "sidebar",
      type: "rect",
      name: "Sidebar",
      x: 0,
      y: 64,
      w: 240,
      h: 836,
      style: { fill: "$surface", radius: 0 },
      children: [{ id: "sidebar-items", type: "list", x: 0, y: 16, w: 240, h: 336, props: { rowHeight: 56, leading: "icon", trailing: "none", items: [{ text: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }, { text: "\u4E00\u89A7", selected: true }, { text: "\u8A73\u7D30" }, { text: "\u30EC\u30DD\u30FC\u30C8" }, { text: "\u8A2D\u5B9A" }, { text: "\u30D8\u30EB\u30D7" }] } }]
    },
    { id: "title", type: "text", x: 280, y: 96, w: 600, h: 32, text: "\u9805\u76EE", style: { size: "lg", weight: "bold" } },
    { id: "search", type: "input", x: 280, y: 144, w: 400, h: 56, props: { kind: "search", placeholder: "\u691C\u7D22" } },
    { id: "add", type: "button", x: 1240, y: 144, w: 160, h: 52, text: "+ \u8FFD\u52A0", variant: "filled" },
    { id: "table", type: "list", x: 280, y: 224, w: 1120, h: 560, props: { rows: 10, rowHeight: 56, leading: "none", trailing: "none" } }
  ]
};

// src/templates/desktop-detail.json
var desktop_detail_default = {
  version: 1,
  id: "desktop-detail",
  title: "\u8A73\u7D30(desktop)",
  device: "desktop",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 1440, h: 64, text: "\u8A73\u7D30", props: { left: "menu" } },
    {
      id: "sidebar",
      type: "rect",
      name: "Sidebar",
      x: 0,
      y: 64,
      w: 240,
      h: 836,
      style: { fill: "$surface", radius: 0 },
      children: [{ id: "sidebar-items", type: "list", x: 0, y: 16, w: 240, h: 336, props: { rowHeight: 56, leading: "icon", trailing: "none", items: [{ text: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }, { text: "\u4E00\u89A7" }, { text: "\u8A73\u7D30", selected: true }, { text: "\u30EC\u30DD\u30FC\u30C8" }, { text: "\u8A2D\u5B9A" }, { text: "\u30D8\u30EB\u30D7" }] } }]
    },
    { id: "title", type: "text", x: 280, y: 96, w: 800, h: 32, text: "\u9805\u76EE\u540D", style: { size: "lg", weight: "bold" } },
    { id: "hero", type: "image", x: 280, y: 144, w: 480, h: 280, text: "\u753B\u50CF" },
    { id: "body", type: "text", x: 784, y: 144, w: 616, h: 96, text: "\u672C\u6587\u304C\u5165\u308A\u307E\u3059\u3002\u9805\u76EE\u306E\u8AAC\u660E\u3002" },
    { id: "edit", type: "button", x: 280, y: 448, w: 160, h: 52, text: "\u7DE8\u96C6", variant: "filled" },
    { id: "delete", type: "button", x: 456, y: 448, w: 160, h: 52, text: "\u524A\u9664", variant: "outline" }
  ]
};

// src/templates/desktop-settings.json
var desktop_settings_default = {
  version: 1,
  id: "desktop-settings",
  title: "\u8A2D\u5B9A(desktop)",
  device: "desktop",
  elements: [
    { id: "nav", type: "navbar", x: 0, y: 0, w: 1440, h: 64, text: "\u8A2D\u5B9A", props: { left: "menu" } },
    {
      id: "sidebar",
      type: "rect",
      name: "Sidebar",
      x: 0,
      y: 64,
      w: 240,
      h: 836,
      style: { fill: "$surface", radius: 0 },
      children: [{ id: "sidebar-items", type: "list", x: 0, y: 16, w: 240, h: 336, props: { rowHeight: 56, leading: "icon", trailing: "none", items: [{ text: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }, { text: "\u4E00\u89A7" }, { text: "\u8A73\u7D30" }, { text: "\u30EC\u30DD\u30FC\u30C8" }, { text: "\u8A2D\u5B9A", selected: true }, { text: "\u30D8\u30EB\u30D7" }] } }]
    },
    { id: "title", type: "text", x: 280, y: 96, w: 600, h: 32, text: "\u8A2D\u5B9A", style: { size: "lg", weight: "bold" } },
    { id: "display-name", type: "input", x: 280, y: 152, w: 480, h: 56, text: "\u8868\u793A\u540D" },
    { id: "dark", type: "toggle", x: 280, y: 232, w: 480, h: 32, text: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9" },
    { id: "notify", type: "toggle", x: 280, y: 280, w: 480, h: 32, text: "\u901A\u77E5" },
    { id: "save", type: "button", x: 280, y: 336, w: 160, h: 52, text: "\u4FDD\u5B58", variant: "filled" }
  ]
};

// src/core/templates.ts
var BUILTIN_TEMPLATES = [
  login_default,
  signup_default,
  home_default,
  list_default,
  cards_default,
  detail_default,
  form_default,
  settings_default,
  search_default,
  empty_default,
  desktop_login_default,
  desktop_table_default,
  desktop_detail_default,
  desktop_settings_default
];
function findBuiltin(id) {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}
function parseTemplateRef(from) {
  if (from === "blank") return {
    source: "blank"
  };
  const m = /^(builtin|project|ai):(.+)$/.exec(from);
  if (!m || !ID_PATTERN.test(m[2])) return void 0;
  return {
    source: m[1],
    id: m[2]
  };
}

// src/themes/clean.json
var clean_default = {
  id: "clean",
  name: "\u767D",
  colors: {
    bg: "#F7F7F8",
    surface: "#FFFFFF",
    primary: "#2563EB",
    onPrimary: "#FFFFFF",
    text: "#111827",
    muted: "#6B7280",
    border: "#E5E7EB"
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 20
  },
  spacing: 8,
  font: {
    family: "system-ui, sans-serif",
    size: {
      sm: 13,
      md: 16,
      lg: 22
    }
  },
  motion: {
    speed: {
      fast: 120,
      normal: 200,
      slow: 320
    },
    easing: "standard",
    screen: {
      name: "slide-left"
    }
  },
  reaction: {
    hover: 0.92,
    press: 0.84
  }
};

// src/themes/navy.json
var navy_default = {
  id: "navy",
  name: "\u7D3A",
  colors: {
    bg: "#F5F6FA",
    surface: "#FFFFFF",
    primary: "#1F3A93",
    onPrimary: "#FFFFFF",
    text: "#1B1F2A",
    muted: "#6B7280",
    border: "#D9DDE7"
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 20
  },
  spacing: 8,
  font: {
    family: "system-ui, sans-serif",
    size: {
      sm: 13,
      md: 16,
      lg: 22
    }
  },
  motion: {
    speed: {
      fast: 160,
      normal: 260,
      slow: 400
    },
    easing: "standard",
    screen: {
      name: "slide-left"
    }
  },
  reaction: {
    hover: 0.9,
    press: 0.8
  }
};

// src/themes/ink.json
var ink_default = {
  id: "ink",
  name: "\u58A8",
  colors: {
    bg: "#111318",
    surface: "#1B1E26",
    primary: "#8AB4F8",
    onPrimary: "#0B1020",
    text: "#E6E8EE",
    muted: "#9AA0AE",
    border: "#2A2E3A"
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 20
  },
  spacing: 8,
  font: {
    family: "system-ui, sans-serif",
    size: {
      sm: 13,
      md: 16,
      lg: 22
    }
  },
  motion: {
    speed: {
      fast: 90,
      normal: 150,
      slow: 240
    },
    easing: "standard",
    screen: {
      name: "fade"
    }
  },
  reaction: {
    hover: 0.94,
    press: 0.86
  }
};

// src/core/theme.ts
var BUILTIN_THEMES = [
  clean_default,
  navy_default,
  ink_default
];
var DEFAULT_THEME_ID = "clean";
function findTheme(themes, id) {
  return themes.find((t) => t.id === id);
}
function themeOrDefault(themes, id) {
  return findTheme(themes, id) ?? BUILTIN_THEMES[0];
}
export {
  BUILTIN_TEMPLATES,
  BUILTIN_THEMES,
  DEFAULT_THEME_ID,
  DEVICES,
  ID_PATTERN,
  NO_DEFAULTS,
  describeLines,
  deviceSize,
  diffScreens,
  diffTheme,
  emptyDefaults,
  fillScreen,
  findBuiltin,
  flatten,
  formatIssues,
  hashText,
  normalizeProject,
  normalizeScreen,
  parseTemplateRef,
  registry,
  serialize,
  settleStated,
  summarizeScreen,
  themeOrDefault,
  validateProject,
  validateScreen
};

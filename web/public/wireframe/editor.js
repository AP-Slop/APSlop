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
function mergeStyle(defaults, el2) {
  return {
    ...defaults,
    ...el2.base ?? {},
    ...el2.style ?? {}
  };
}
function hasBorder(el2, defaults) {
  const border = mergeStyle(defaults, el2).border;
  return border !== void 0 && border !== "none";
}
function paintCss(s) {
  let css = `background:${cssColor(s.fill, "none")};`;
  css += s.border === void 0 || s.border === "none" ? "border:none;" : `border:1px solid ${cssColor(s.border, "$border")};`;
  css += `border-radius:${cssRadius(s.radius, 0)};`;
  return css;
}
var placeCss = (el2) => `left:${el2.x}px;top:${el2.y}px;width:${el2.w}px;height:${el2.h}px;`;
var opacityCss = (s) => s.opacity === void 0 ? "" : `opacity:${s.opacity};`;
function boxStyle(el2, defaults) {
  const s = mergeStyle(defaults, el2);
  return placeCss(el2) + paintCss(s) + opacityCss(s);
}
function frameStyle(el2, defaults) {
  const s = mergeStyle(defaults, el2);
  return placeCss(el2) + "background:none;border:none;border-radius:0;" + opacityCss(s);
}
function fieldStyle(el2, defaults) {
  return paintCss(mergeStyle(defaults, el2));
}
function presentationStyle(el2, defaults, p) {
  const own = mergeStyle(defaults, el2).opacity ?? 1;
  const opacity = Math.round(own * p.opacity * 1e3) / 1e3;
  const filter = p.brightness === void 0 ? "" : `filter:brightness(${p.brightness});`;
  return `opacity:${opacity};transform:translate(${p.dx}px,${p.dy}px) scale(${p.scale});${filter}`;
}
function textStyle(el2, defaults) {
  const s = mergeStyle(defaults, el2);
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-text",
      style: textStyle(el2, text())
    }, el2.text ?? "")
  ]
};

// src/core/types/button.ts
var VARIANTS = [
  "filled",
  "outline",
  "ghost"
];
var text2 = (el2) => ({
  color: !el2.variant || el2.variant === "filled" ? "$onPrimary" : "$primary",
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
  box: (el2) => {
    if (el2.variant === "outline") return {
      fill: "none",
      border: "$primary",
      radius: "md"
    };
    if (el2.variant === "ghost") return {
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-button",
      style: textStyle(el2, text2(el2))
    }, el2.text ?? "")
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
  defaults: (_device, el2) => ({
    w: 280,
    h: el2.props?.multiline === true ? 96 : 56
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
  render: (el2, h2) => {
    const kind = String(el2.props.kind ?? "text");
    const typed = typeof el2.props.value === "string" ? el2.props.value : "";
    const multi = el2.props.multiline === true;
    const adorn = kind === "select" ? "\u25BE" : kind === "search" ? "\u2315" : "";
    const nodes = [];
    if (el2.text) {
      nodes.push(h2("div", {
        class: "wf-label",
        style: textStyle(el2, text3())
      }, el2.text));
    }
    nodes.push(h2("div", {
      class: "wf-field" + (multi ? " wf-field-multi" : ""),
      style: fieldStyle(el2, box())
    }, typed !== "" ? h2("span", {
      class: "wf-value"
    }, typed) : h2("span", {
      class: "wf-placeholder"
    }, String(el2.props.placeholder ?? "")), h2("span", {
      class: "wf-adorn"
    }, adorn)));
    return [
      h2("div", {
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-check"
    }, h2("span", {
      class: "wf-checkbox" + (el2.props.checked === true ? " is-on" : "")
    }), h2("span", {
      class: "wf-check-label",
      style: textStyle(el2, text4())
    }, el2.text ?? ""))
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-check"
    }, h2("span", {
      class: "wf-switch" + (el2.props.checked === true ? " is-on" : "")
    }, h2("span", {
      class: "wf-knob"
    })), h2("span", {
      class: "wf-check-label",
      style: textStyle(el2, text5())
    }, el2.text ?? ""))
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-image"
    }, h2("span", {
      class: "wf-caption",
      style: textStyle(el2, text6())
    }, el2.text ?? "\u753B\u50CF"))
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-icon",
      title: el2.text ?? ""
    }, el2.text ?? "")
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
  className: (el2) => el2.props.elevated === true ? "wf-elevated" : "",
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
function deviceSize(d) {
  return typeof d === "string" ? {
    ...DEVICES[d]
  } : {
    w: d.w,
    h: d.h
  };
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
var isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function isRowArray(v) {
  return Array.isArray(v) && v.every(isObj);
}
function rowsOf(el2) {
  const v = el2.props.items;
  return isRowArray(v) ? v : [];
}
var emptiedInPlay = (el2) => el2.props.rows === 0;
function hasRows(el2) {
  return rowsOf(el2).length > 0 || emptiedInPlay(el2);
}
function rowCount(el2) {
  const n = rowsOf(el2).length;
  if (n > 0) return n;
  return emptiedInPlay(el2) ? 0 : Math.max(1, Number(el2.props.rows ?? 3));
}
function rowHeightOf(el2) {
  return Math.max(8, Number(el2.props.rowHeight ?? 56));
}
var asLeading = (v, fallback) => LIST_LEADINGS.includes(v) ? v : fallback;
var asTrailing = (v, fallback) => LIST_TRAILINGS.includes(v) ? v : fallback;
function filledRows(el2) {
  const leading = asLeading(el2.props.leading, "none");
  const trailing = asTrailing(el2.props.trailing, "none");
  const written3 = rowsOf(el2);
  const rows2 = written3.length > 0 ? written3 : placeholderRows(el2);
  return rows2.map((r) => {
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
function rowText(el2, i) {
  const t = rowsOf(el2)[i]?.text;
  return typeof t === "string" && t !== "" ? t : void 0;
}
function rowValueText(el2, v) {
  if (v < 0) return "\u306A\u3057";
  const text18 = rowText(el2, v);
  return `${v + 1} \u884C\u76EE` + (text18 === void 0 ? "" : `\u300C${text18}\u300D`);
}
var TOGGLE_ZONE = 56;
function placeholderRows(el2) {
  return Array.from({
    length: rowCount(el2)
  }, () => ({}));
}
function addRow(rows2, row = {}) {
  return [
    ...rows2,
    row
  ];
}
function removeRow(rows2, i) {
  return rows2.filter((_r, n) => n !== i);
}
function moveRow(rows2, i, by) {
  const to = i + by;
  if (i < 0 || i >= rows2.length || to < 0 || to >= rows2.length) return [
    ...rows2
  ];
  const out = [
    ...rows2
  ];
  const [row] = out.splice(i, 1);
  out.splice(to, 0, row);
  return out;
}
function patchRow(rows2, i, patch) {
  return rows2.map((r, n) => {
    if (n !== i) return r;
    const out = {
      ...r
    };
    for (const [k, v] of Object.entries(patch)) {
      if (v === void 0 || v === "" || v === false) delete out[k];
      else out[k] = v;
    }
    return out;
  });
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
  render: (el2, h2) => {
    const rowHeight = rowHeightOf(el2);
    const items = filledRows(el2).map((row) => {
      const body = row.text === "" && row.sub === void 0 ? h2("span", {
        class: "wf-line"
      }) : h2("div", {
        class: "wf-row-body"
      }, row.text === "" ? h2("span", {
        class: "wf-line"
      }) : h2("span", {
        class: "wf-row-text"
      }, row.text), ...row.sub === void 0 ? [] : [
        h2("span", {
          class: "wf-row-sub"
        }, row.sub)
      ]);
      return h2("div", {
        class: "wf-row" + (row.selected ? " is-selected" : ""),
        style: `height:${rowHeight}px;`
      }, row.leading === "none" ? "" : h2("span", {
        class: `wf-lead wf-lead-${row.leading}`
      }), body, ...row.meta === void 0 ? [] : [
        h2("span", {
          class: "wf-row-meta"
        }, row.meta)
      ], row.trailing === "none" ? "" : h2("span", {
        class: `wf-trail wf-trail-${row.trailing}` + (row.checked ? " is-on" : "")
      }, row.trailing === "chevron" ? "\u203A" : ""));
    });
    return [
      h2("div", {
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
  render: (el2, h2) => {
    const right = String(el2.props.right ?? "none");
    return [
      h2("div", {
        class: "wf-navbar"
      }, h2("span", {
        class: "wf-nav-side"
      }, GLYPH[String(el2.props.left ?? "none")] ?? ""), h2("span", {
        class: "wf-nav-title",
        style: textStyle(el2, text7())
      }, el2.text ?? ""), h2("span", {
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
  render: (el2, h2) => {
    const items = Array.isArray(el2.props.items) ? el2.props.items : [];
    const active = Number(el2.props.active ?? 0);
    return [
      h2("div", {
        class: "wf-tabbar"
      }, ...items.map((label, i) => h2("div", {
        class: "wf-tab" + (i === active ? " is-active" : "")
      }, h2("span", {
        class: "wf-tab-dot"
      }), h2("span", {
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
function choiceItems(el2) {
  const v = el2.props.items;
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}
function choiceLabel(el2, i) {
  const text18 = CHOICE_TYPES.includes(el2.type) ? choiceItems(el2)[i] : void 0;
  return `${i + 1} \u756A\u76EE` + (text18 === void 0 ? "" : `\u300C${text18}\u300D`);
}
var radioHeight = (items, rowHeight) => Math.max(1, items) * rowHeight;
function radioHeightAfter(el2, key, value) {
  if (el2.type !== "radio" || key !== "items" && key !== "rowHeight") return void 0;
  const rowHeight = Number(el2.props.rowHeight ?? 48);
  if (el2.h !== radioHeight(choiceItems(el2).length, rowHeight)) return void 0;
  const items = key === "items" && Array.isArray(value) ? value.length : choiceItems(el2).length;
  const rh = key === "rowHeight" && typeof value === "number" ? value : rowHeight;
  return radioHeight(items, rh);
}

// src/core/types/tabs.ts
var text8 = () => ({
  color: "$muted",
  size: "sm"
});
function labelStyle(el2, selected) {
  const s = mergeStyle(text8(), el2);
  const own = mergeStyle({}, el2);
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
  render: (el2, h2) => {
    const items = choiceItems(el2);
    const active = Number(el2.props.active ?? 0);
    return [
      h2("div", {
        class: "wf-seg"
      }, ...items.map((label, i) => h2("div", {
        class: "wf-seg-item" + (i === active ? " is-active" : "")
      }, h2("span", {
        style: labelStyle(el2, i === active)
      }, label))))
    ];
  }
};

// src/core/types/radio.ts
var text9 = () => ({
  color: "$text",
  size: "md"
});
function labelStyle2(el2) {
  const s = mergeStyle(text9(), el2);
  return `color:${cssColor(s.color, "$text")};font-size:${cssFontSize(s.size, "md")};font-weight:${s.weight ?? "normal"};`;
}
var spec14 = {
  name: "radio",
  label: "\u30E9\u30B8\u30AA",
  // The height follows the rows (spec §3.2); the unfilled element is what the author wrote.
  defaults: (_device, el2) => ({
    w: 342,
    h: radioHeight(Array.isArray(el2.props?.items) ? el2.props.items.length : 3, typeof el2.props?.rowHeight === "number" ? el2.props.rowHeight : 48)
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
  render: (el2, h2) => {
    const items = choiceItems(el2);
    const active = Number(el2.props.active ?? 0);
    const rowHeight = Number(el2.props.rowHeight ?? 48);
    return [
      h2("div", {
        class: "wf-radio"
      }, ...items.map((label, i) => h2("div", {
        class: "wf-radio-row" + (i === active ? " is-active" : ""),
        style: `height:${rowHeight}px;`
      }, h2("span", {
        class: "wf-radio-text",
        style: labelStyle2(el2)
      }, label), ...i === active ? [
        h2("span", {
          class: "wf-radio-mark"
        }, "\u2713")
      ] : [])))
    ];
  }
};

// src/core/slider.ts
function sliderNums(el2) {
  const n = (k, d) => typeof el2.props[k] === "number" && Number.isFinite(el2.props[k]) ? el2.props[k] : d;
  return {
    min: n("min", 0),
    max: n("max", 100),
    step: n("step", 1),
    value: n("value", 50)
  };
}
function stepDecimals(step2) {
  const [m, e] = String(step2).split("e-");
  const d = (m.split(".")[1]?.length ?? 0) + (e ? Number(e) : 0);
  return Math.min(10, d);
}
function snapSlider(el2, n) {
  const { min, max, step: step2 } = sliderNums(el2);
  if (!(max > min) || !(step2 > 0)) return min;
  const k = Math.round((Math.min(max, Math.max(min, n)) - min) / step2);
  const d = Math.max(stepDecimals(step2), stepDecimals(min));
  const v = Number((min + k * step2).toFixed(d));
  return Math.min(max, Math.max(min, v));
}
function sliderText(el2, n) {
  const d = stepDecimals(sliderNums(el2).step);
  const num = n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  });
  return `${String(el2.props.prefix ?? "")}${num}${String(el2.props.suffix ?? "")}`;
}
var KNOB_R = 14;
function sliderValueAt(el2, x) {
  const { min, max } = sliderNums(el2);
  const span = el2.w - 2 * KNOB_R;
  const t = span > 0 ? (x - KNOB_R) / span : 0;
  return snapSlider(el2, min + Math.min(1, Math.max(0, t)) * (max - min));
}
function sliderRatio(el2, n) {
  const { min, max } = sliderNums(el2);
  return max > min ? Math.min(1, Math.max(0, (n - min) / (max - min))) : 0;
}

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
  render: (el2, h2) => {
    const { min, max, value } = sliderNums(el2);
    const ends = el2.props.ends !== false;
    const paint = mergeStyle(box2(), el2);
    const words = mergeStyle(text10(), el2);
    const span = Math.max(0, el2.w - 2 * KNOB_R);
    const along = sliderRatio(el2, value) * span;
    const cy = ends ? BAND / 2 : el2.h / 2;
    const lineTop = `top:${cy - LINE / 2}px;`;
    const border = paint.border === void 0 || paint.border === "none" ? "border:none;" : `border:1px solid ${cssColor(paint.border, "$border")};`;
    const endStyle = `top:${BAND}px;color:${cssColor(words.color, "$muted")};font-size:${cssFontSize(words.size, "sm")};font-weight:${words.weight ?? "normal"};`;
    return [
      h2("div", {
        class: "wf-slider"
      }, h2("div", {
        class: "wf-slider-track",
        style: `left:${KNOB_R}px;right:${KNOB_R}px;${lineTop}`
      }), h2("div", {
        class: "wf-slider-fill",
        style: `left:${KNOB_R}px;width:${along}px;${lineTop}background:${cssColor(paint.fill, "$primary")};`
      }), h2("div", {
        class: "wf-slider-knob",
        style: `left:${along}px;top:${cy - KNOB_R}px;${border}`
      }), ...ends ? [
        h2("span", {
          class: "wf-slider-end",
          style: `left:0;${endStyle}`
        }, sliderText(el2, min)),
        h2("span", {
          class: "wf-slider-end is-max",
          style: `right:0;${endStyle}`
        }, sliderText(el2, max))
      ] : [])
    ];
  }
};

// src/core/elements.ts
function flatten(elements, parent) {
  const out = [];
  elements.forEach((el2, index) => {
    out.push({
      el: el2,
      parent,
      index
    });
    if (el2.children) out.push(...flatten(el2.children, el2.id));
  });
  return out;
}
function allIds(elements) {
  return flatten(elements).map((l) => l.el.id);
}
function findById(elements, id) {
  return flatten(elements).find((l) => l.el.id === id);
}
function mapElement(elements, id, fn) {
  return elements.map((el2) => {
    if (el2.id === id) return fn(el2);
    if (el2.children) return {
      ...el2,
      children: mapElement(el2.children, id, fn)
    };
    return el2;
  });
}
function removeById(elements, id) {
  return elements.filter((el2) => el2.id !== id).map((el2) => el2.children ? {
    ...el2,
    children: removeById(el2.children, id)
  } : el2);
}
function insertAt(elements, parent, index, el2) {
  if (parent === void 0) {
    const copy = elements.slice();
    copy.splice(index, 0, el2);
    return copy;
  }
  return mapElement(elements, parent, (p) => {
    const children = (p.children ?? []).slice();
    children.splice(index, 0, el2);
    return {
      ...p,
      children
    };
  });
}
function siblingIds(elements, parent) {
  if (parent === void 0) return elements.map((e) => e.id);
  return (findById(elements, parent)?.el.children ?? []).map((e) => e.id);
}
function absoluteOffset(elements, id, scrolls) {
  const path = pathTo(elements, id);
  let x = 0;
  let y = 0;
  path.forEach((el2, i) => {
    x += el2.x;
    y += el2.y;
    const sent = i < path.length - 1 ? scrolls?.[el2.id] : void 0;
    if (sent) {
      x -= sent.x;
      y -= sent.y;
    }
  });
  return {
    x,
    y
  };
}
function pathTo(elements, id) {
  for (const el2 of elements) {
    if (el2.id === id) return [
      el2
    ];
    if (el2.children) {
      const sub = pathTo(el2.children, id);
      if (sub.length) return [
        el2,
        ...sub
      ];
    }
  }
  return [];
}
function moveInSiblings(elements, id, delta) {
  const located = findById(elements, id);
  if (!located) return elements;
  const reorder2 = (list) => {
    const from = list.findIndex((e) => e.id === id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return list;
    const copy = list.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };
  if (located.parent === void 0) return reorder2(elements);
  return mapElement(elements, located.parent, (p) => ({
    ...p,
    children: reorder2(p.children ?? [])
  }));
}
function isLocked(elements, id) {
  return findById(elements, id)?.el.locked === true;
}
function isHidden(elements, id) {
  return pathTo(elements, id).some((el2) => el2.hidden === true);
}
function canDrop(elements, ids, parent, allowsChildren) {
  if (ids.length === 0 || ids.some((id) => isLocked(elements, id))) return false;
  if (parent === void 0) return true;
  const path = pathTo(elements, parent);
  if (path.length === 0 || !allowsChildren(path[path.length - 1].type)) return false;
  return !path.some((el2) => ids.includes(el2.id));
}
function relocate(elements, ids, parent, index) {
  const moved = [];
  for (const id of ids) {
    const located = findById(elements, id);
    if (located) moved.push({
      el: located.el,
      abs: absoluteOffset(elements, id)
    });
  }
  const before = siblingIds(elements, parent).slice(0, index);
  const at = before.length - before.filter((id) => ids.includes(id)).length;
  let out = moved.reduce((els, m) => removeById(els, m.el.id), elements);
  const origin = parent === void 0 ? {
    x: 0,
    y: 0
  } : absoluteOffset(out, parent);
  moved.forEach((m, i) => {
    out = insertAt(out, parent, at + i, {
      ...m.el,
      x: m.abs.x - origin.x,
      y: m.abs.y - origin.y
    });
  });
  return out;
}
function rootBarTop(elements, device) {
  const bars = elements.filter((e) => e.type === "tabbar" && e.hidden !== true);
  return bars.length > 0 ? Math.min(...bars.map((b) => b.y)) : device.h;
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
function layoutOf(el2) {
  const l = el2.layout;
  if (!l || el2.type !== "rect" && el2.type !== GROUP_TYPE) return void 0;
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
function canFit(el2) {
  if (el2.type === "rect") return layoutOf(el2) !== void 0;
  return FIT_TYPES.includes(el2.type);
}
var styleOf = (el2) => ({
  ...el2.base ?? {},
  ...el2.style ?? {}
});
var FONT_SIZES = {
  sm: 13,
  md: 16,
  lg: 22
};
function fontSizeOf(el2) {
  const s = styleOf(el2).size;
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
function textSize(text18, size, bold2, maxWidth) {
  const factor = bold2 ? 1.05 : 1;
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
function crumbsOf(el2) {
  const raw = el2.props?.items;
  const items = Array.isArray(raw) ? raw.filter((t) => typeof t === "string") : [];
  const s = styleOf(el2).size;
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
var isBold = (el2) => el2.type === "button" || styleOf(el2).weight === "bold";
var modeOf = (el2, axis) => el2.sizing?.[axis];
var shown = (list) => list.filter((c) => c.hidden !== true);
var isFreeGroup = (el2) => el2.type === GROUP_TYPE && !layoutOf(el2) && el2.children !== void 0;
var prePlaced = (el2) => isFreeGroup(el2) ? placeBox(el2, {}) : el2;
var fixedWidth = (el2) => modeOf(el2, "w") === void 0 ? el2.w : void 0;
function natural(el2, axis, width) {
  if (isFreeGroup(el2)) return placeBox(el2, {})[axis];
  const mode = modeOf(el2, axis);
  if (mode === void 0) return el2[axis];
  if (mode === "fill") return el2.sizing.own[axis];
  if (el2.type === "text") {
    const t = textSize(el2.text ?? "", fontSizeOf(el2), isBold(el2), axis === "h" ? width : void 0);
    return t[axis];
  }
  if (el2.type === "button") {
    return axis === "w" ? textSize(el2.text ?? "", 16, true).w - 4 + 32 : el2.sizing.own.h;
  }
  if (el2.type === "chip") {
    return axis === "w" ? textSize(el2.text ?? "\u672D", 13, false).w - 4 + 24 : el2.sizing.own.h;
  }
  if (el2.type === "badge") {
    if (axis === "h") return el2.sizing.own.h;
    return el2.text ? 14 + textSize(el2.text, 13, false).w - 4 : 10;
  }
  if (el2.type === "fab") {
    return axis === "w" ? textSize(el2.text ?? "+ \u8FFD\u52A0", 16, true).w - 4 + 40 : el2.sizing.own.h;
  }
  if (el2.type === "breadcrumb") {
    return axis === "w" ? crumbsOf(el2).w : el2.sizing.own.h;
  }
  const L = layoutOf(el2);
  if (!L) return el2[axis];
  const kids = shown(el2.children ?? []).map(prePlaced);
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
function placeBox(el2, given) {
  const measured = (axis) => modeOf(el2, axis) === "fit" && !isFreeGroup(el2);
  const w = given.w ?? (measured("w") ? natural(el2, "w") : el2.w);
  const h2 = given.h ?? (measured("h") ? natural(el2, "h", w) : el2.h);
  const L = layoutOf(el2);
  if (!L || !el2.children) {
    const kids2 = el2.children ? el2.children.map((c) => placeBox(c, {})) : void 0;
    const size2 = el2.type === GROUP_TYPE && kids2 && kids2.length > 0 ? {
      w: Math.max(1, ...kids2.map((c) => c.x + c.w)),
      h: Math.max(1, ...kids2.map((c) => c.y + c.h))
    } : {
      w,
      h: h2
    };
    return {
      ...el2,
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
    h: h2
  };
  const innerMain = Math.max(0, size[main] - 2 * padAlong(L.pad, main));
  const innerCross = Math.max(0, size[cross] - 2 * padAlong(L.pad, cross));
  const kids = el2.children.map(prePlaced);
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
  const fitBox = modeOf(el2, main) === "fit";
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
    ...el2,
    w,
    h: h2,
    children
  };
}
function placeElements(elements) {
  return elements.map((el2) => el2.children || el2.sizing ? placeBox(el2, {}) : el2);
}
function contentLength(el2, axis) {
  const L = layoutOf(el2);
  const size = axis === "y" ? "h" : "w";
  let far = 0;
  for (const c of el2.children ?? []) {
    if (c.hidden === true) continue;
    far = Math.max(far, c[axis] + c[size]);
  }
  if (!L || !el2.children) return far;
  if (mainAxis(L.dir) !== size) return far + padAlong(L.pad, size);
  return shown(el2.children).length === 0 ? 2 * padAlong(L.pad, size) : far + padAlong(L.pad, size);
}
function slotIndex(box7, along, moving) {
  const kids = (box7.children ?? []).filter((c) => !moving.includes(c.id));
  const L = layoutOf(box7);
  if (!L) return kids.length;
  const size = mainAxis(L.dir);
  const pos = posOf(size);
  const i = kids.findIndex((c) => c.hidden !== true && c[pos] + c[size] / 2 > along);
  return i === -1 ? kids.length : i;
}
function freeze(el2) {
  const { sizing: _s, ...rest } = el2;
  return rest;
}
function dropFill(el2) {
  if (!el2.sizing || el2.sizing.w !== "fill" && el2.sizing.h !== "fill") return el2;
  const { w, h: h2, own } = el2.sizing;
  const kept = {
    own,
    ...w === "fit" ? {
      w
    } : {},
    ...h2 === "fit" ? {
      h: h2
    } : {}
  };
  const { sizing: _s, ...rest } = el2;
  return {
    ...rest,
    ...kept.w || kept.h ? {
      sizing: kept
    } : {}
  };
}
var median = (list) => {
  if (list.length === 0) return LAYOUT_DEFAULTS.gap;
  const sorted = [
    ...list
  ].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
var toEight = (v) => Math.max(0, Math.round(v / 8) * 8);
function toLayout(elements, id, dir) {
  return mapElement(elements, id, (box7) => {
    if (box7.type !== "rect" && box7.type !== GROUP_TYPE) return box7;
    const main = mainAxis(dir);
    const pos = posOf(main);
    const cross = crossAxis(dir);
    const other = posOf(cross);
    const kids = [
      ...box7.children ?? []
    ].sort((a, b) => a[pos] - b[pos] || a[other] - b[other]);
    const spaces = [];
    for (let i = 1; i < kids.length; i++) {
      const [p, k] = [
        kids[i - 1],
        kids[i]
      ];
      const space = k[pos] - (p[pos] + p[main]);
      const across = k[other] >= p[other] + p[cross] || p[other] >= k[other] + k[cross];
      if (space >= 0 || !across) spaces.push(space);
    }
    const gap = toEight(median(spaces));
    const top = Math.max(0, kids.length ? Math.min(...kids.map((k) => k.y)) : 0);
    const left = Math.max(0, kids.length ? Math.min(...kids.map((k) => k.x)) : 0);
    const layout = {
      dir
    };
    if (gap !== LAYOUT_DEFAULTS.gap) layout.gap = gap;
    const isGroup = box7.type === GROUP_TYPE;
    if (!isGroup && kids.length > 0 && (top > 0 || left > 0)) {
      layout.pad = top === left ? top : [
        top,
        left
      ];
    }
    const origin = isGroup ? {
      x: box7.x + left,
      y: box7.y + top
    } : {};
    const own = box7.sizing?.own ?? {
      w: box7.w,
      h: box7.h
    };
    const sizing = {
      ...box7.sizing,
      own
    };
    const scrolls = box7.type === "rect" && box7.props.scroll === (dir === "column" ? "y" : "x");
    if (scrolls && sizing[main] === "fit") delete sizing[main];
    if (isGroup) {
      sizing.w ??= "fit";
      sizing.h ??= "fit";
    }
    const { sizing: _old, ...rest } = box7;
    return {
      ...rest,
      ...origin,
      layout,
      ...sizing.w || sizing.h ? {
        sizing
      } : {},
      children: kids.map((k) => freeze(k))
    };
  });
}
function unLayout(elements, id) {
  return mapElement(elements, id, (box7) => {
    const { layout: _l, sizing: _s, ...rest } = box7;
    const children = (box7.children ?? []).map((c) => freeze(c));
    const kept = box7.type === GROUP_TYPE || !box7.sizing ? void 0 : {
      own: box7.sizing.own,
      ...box7.sizing.w === "fill" ? {
        w: "fill"
      } : {},
      ...box7.sizing.h === "fill" ? {
        h: "fill"
      } : {}
    };
    return {
      ...rest,
      ...kept && (kept.w || kept.h) ? {
        sizing: kept
      } : {},
      children
    };
  });
}
function guidesOf(el2) {
  const L = layoutOf(el2);
  const out = {
    bands: [],
    lines: [],
    labels: []
  };
  if (!L) return out;
  const [pv, ph] = L.pad;
  const kids = shown(el2.children ?? []);
  for (let i = 1; i < kids.length; i++) {
    const a = kids[i - 1];
    const b = kids[i];
    out.bands.push(L.dir === "column" ? {
      x: ph,
      y: a.y + a.h,
      w: Math.max(0, el2.w - 2 * ph),
      h: Math.max(0, b.y - a.y - a.h)
    } : {
      x: a.x + a.w,
      y: pv,
      w: Math.max(0, b.x - a.x - a.w),
      h: Math.max(0, el2.h - 2 * pv)
    });
  }
  out.lines.push({
    x: 0,
    y: Math.max(0, pv - 1),
    w: el2.w,
    h: 1
  }, {
    x: 0,
    y: Math.max(0, el2.h - pv),
    w: el2.w,
    h: 1
  }, {
    x: Math.max(0, ph - 1),
    y: 0,
    w: 1,
    h: el2.h
  }, {
    x: Math.max(0, el2.w - ph),
    y: 0,
    w: 1,
    h: el2.h
  });
  if (out.bands.length > 0) {
    const b = out.bands[0];
    out.labels.push({
      x: b.x + b.w - 40,
      y: b.y + 2,
      text: String(L.gap)
    });
  }
  out.labels.push({
    x: el2.w - 40,
    y: 0,
    text: String(pv)
  }, {
    x: ph < 44 ? 2 : ph - 42,
    y: Math.floor(el2.h / 2) - 8,
    text: String(ph)
  });
  out.labels = out.labels.map((l) => ({
    ...l,
    x: Math.max(0, Math.min(l.x, el2.w - 40)),
    y: Math.max(0, Math.min(l.y, el2.h - 16))
  }));
  return out;
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
function progressNums(el2) {
  const max = isInt(el2.props.max) && el2.props.max >= 1 ? el2.props.max : 100;
  const raw = isInt(el2.props.value) ? el2.props.value : 40;
  return {
    max,
    value: Math.min(max, Math.max(0, raw))
  };
}
function progressPct(el2) {
  const { max, value } = progressNums(el2);
  return Math.round(value / max * 100);
}
function barNodes(el2, h2) {
  const paint = mergeStyle(box3(), el2);
  const own = mergeStyle({}, el2);
  const words = mergeStyle(text11(), el2);
  const { max, value } = progressNums(el2);
  const fw = Math.round(el2.w * value / max);
  const radius = `border-radius:${cssRadius(paint.radius, el2.h / 2)};`;
  const nodes = [
    h2("div", {
      class: "wf-progress-track",
      style: radius
    }),
    h2("div", {
      class: "wf-progress-fill",
      style: `width:${fw}px;${radius}background:${cssColor(paint.fill, "$primary")};`
    })
  ];
  if (el2.props.label !== false && el2.h >= 12) {
    const label = `${progressPct(el2)}%`;
    const size = typeof words.size === "number" ? words.size : SIZES[words.size ?? "sm"] ?? 13;
    const tw = textSize(label, size, words.weight !== "normal").w - 4;
    const inside = fw >= tw + 16;
    const color = own.color ?? (inside ? "$onPrimary" : "$text");
    const at = inside ? `right:${el2.w - fw + 8}px;` : `left:${fw + 6}px;`;
    nodes.push(h2("span", {
      class: "wf-progress-label",
      style: at + `color:${cssColor(color, "$text")};font-size:${cssFontSize(words.size, "sm")};font-weight:${words.weight ?? "bold"};`
    }, label));
  }
  return [
    h2("div", {
      class: "wf-progress"
    }, ...nodes)
  ];
}
function spinNodes(el2, h2) {
  const paint = mergeStyle(box3(), el2);
  const d = el2.h;
  const gap = d / 2;
  const left = (el2.w - (3 * d + 2 * gap)) / 2;
  const dots = [
    1,
    0.6,
    0.3
  ].map((opacity, i) => h2("div", {
    class: "wf-spin-dot",
    style: `left:${left + i * (d + gap)}px;top:0px;width:${d}px;height:${d}px;background:${cssColor(paint.fill, "$primary")};opacity:${opacity};--wf-spin-i:${i * (SPIN_MS / 3) - SPIN_MS}ms;`
  }));
  return [
    h2("div", {
      class: "wf-spin"
    }, ...dots)
  ];
}
var spec16 = {
  name: "progress",
  label: "\u9032\u307F\u5177\u5408",
  defaults: (_device, el2) => el2.props?.kind === "spinner" ? {
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
  render: (el2, h2) => el2.props.kind === "spinner" ? spinNodes(el2, h2) : barNodes(el2, h2)
};

// src/core/types/chip.ts
var box4 = () => ({
  fill: "$primary",
  border: "none",
  radius: 999
});
var text12 = (el2) => ({
  color: el2.props.checked === true ? "$onPrimary" : "$text",
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
  render: (el2, h2) => {
    const paint = mergeStyle(box4(), el2);
    const fill = el2.props.checked === true ? paint.fill : "$border";
    const border = paint.border === void 0 || paint.border === "none" ? "border:none;" : `border:1px solid ${cssColor(paint.border, "$border")};`;
    return [
      h2("div", {
        class: "wf-chip",
        style: `background:${cssColor(fill, "$border")};${border}border-radius:${cssRadius(paint.radius, 999)};`
      }, h2("span", {
        class: "wf-chip-text",
        style: textStyle(el2, text12(el2))
      }, el2.text ?? CHIP_TEXT))
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
  defaults: (_device, el2) => el2.text ? {
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
  render: (el2, h2) => {
    const paint = mergeStyle(box5(), el2);
    const fill = `background:${cssColor(paint.fill, "#E5484D")};`;
    if (!el2.text) {
      const d = Math.min(el2.w, el2.h);
      return [
        h2("div", {
          class: "wf-badge"
        }, h2("div", {
          class: "wf-badge-dot",
          style: `left:${(el2.w - d) / 2}px;top:${(el2.h - d) / 2}px;width:${d}px;height:${d}px;` + fill + ring(paint.border)
        }))
      ];
    }
    return [
      h2("div", {
        class: "wf-badge"
      }, h2("div", {
        class: "wf-badge-dot",
        style: `left:0px;top:${(el2.h - 8) / 2}px;width:8px;height:8px;` + fill + ring(paint.border)
      }), h2("span", {
        class: "wf-badge-text",
        style: `left:14px;` + textStyle(el2, text13())
      }, el2.text))
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
  render: (el2, h2) => {
    const d = Math.min(el2.w, el2.h);
    const left = (el2.w - d) / 2;
    const top = (el2.h - d) / 2;
    const photo = h2("div", {
      class: "wf-avatar-photo",
      style: `left:${left}px;top:${top}px;width:${d}px;height:${d}px;` + fieldStyle(el2, box6())
    }, h2("div", {
      class: "wf-avatar-head"
    }), h2("div", {
      class: "wf-avatar-body"
    }));
    if (el2.props.online !== true) return [
      h2("div", {
        class: "wf-avatar"
      }, photo)
    ];
    const dd = Math.round(d * 0.28);
    return [
      h2("div", {
        class: "wf-avatar"
      }, photo, h2("div", {
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
  defaults: (_device, el2) => el2.text !== void 0 && [
    ...el2.text
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
  render: (el2, h2) => [
    h2("div", {
      class: "wf-button wf-fab",
      style: textStyle(el2, text14())
    }, el2.text ?? FAB_TEXT)
  ]
};

// src/core/desktop.ts
var strings = (v) => Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
var TABLE_HEAD_H = 40;
var TABLE_ROW_H = 48;
var tableCells = (row) => row.split("|").map((c) => c.trim());
var tableColumns = (el2) => strings(el2.props.columns);
var tableRows = (el2) => strings(el2.props.rows).map(tableCells);
function tableColumnCount(el2) {
  const n = tableColumns(el2).length;
  return n > 0 ? n : Math.max(1, ...tableRows(el2).map((r) => r.length));
}
var tableHeadH = (el2) => tableColumns(el2).length > 0 ? TABLE_HEAD_H : 0;
var tableHeight = (columns, rows2) => (columns > 0 ? TABLE_HEAD_H : 0) + TABLE_ROW_H * Math.max(1, rows2);
var written = (v) => Array.isArray(v) ? v.length : 3;
var tableHeightOf = (props) => tableHeight(written(props?.columns), written(props?.rows));
function tableHeightAfter(el2, key, value) {
  if (el2.type !== "table" || key !== "columns" && key !== "rows") return void 0;
  if (typeof el2.h !== "number" || el2.h !== tableHeightOf(el2.props)) return void 0;
  return tableHeightOf({
    ...el2.props,
    [key]: Array.isArray(value) ? value : []
  });
}
var NUMBER_CELL = /^[-+]?[¥￥$€]?[-+]?[0-9][0-9,]*(\.[0-9]+)?(%|円)?$/;
var isNumberCell = (cell) => NUMBER_CELL.test(cell.trim());
function numberColumns(el2) {
  const rows2 = tableRows(el2);
  return Array.from({
    length: tableColumnCount(el2)
  }, (_v, j) => {
    const cells = rows2.map((r) => r[j] ?? "").filter((c) => c !== "");
    return cells.length > 0 && cells.every(isNumberCell);
  });
}
function tableRowTops(el2) {
  const head = tableHeadH(el2);
  return tableRows(el2).map((_r, i) => head + i * TABLE_ROW_H).filter((y) => y < el2.h);
}
function tableRowAt(el2, x, y) {
  if (x < 0 || x >= el2.w || y < 0 || y >= el2.h) return void 0;
  const head = tableHeadH(el2);
  if (y < head) return void 0;
  const row = Math.floor((y - head) / TABLE_ROW_H);
  return row < tableRows(el2).length ? row : void 0;
}
var NAV_TITLE_AT = 20;
var NAV_ITEMS_TOP = 72;
var NAV_ITEM_H = 40;
var NAV_ITEM_STEP = 44;
var NAV_INSET = 12;
var navTitle = (el2) => typeof el2.props.title === "string" ? el2.props.title : "";
var navItems = (el2) => choiceItems(el2);
function navItemTops(el2) {
  const top = navTitle(el2) === "" ? NAV_TITLE_AT : NAV_ITEMS_TOP;
  return navItems(el2).map((_t, i) => top + i * NAV_ITEM_STEP).filter((y) => y + NAV_ITEM_H <= el2.h);
}
function navItemAt(el2, x, y) {
  if (x < NAV_INSET || x >= el2.w - NAV_INSET) return void 0;
  const i = navItemTops(el2).findIndex((top) => y >= top && y < top + NAV_ITEM_H);
  return i < 0 ? void 0 : i;
}
var CRUMB_HIT = 4;
function crumbAt(el2, x, y) {
  if (x < 0 || x >= el2.w || y < 0 || y >= el2.h) return void 0;
  const i = crumbsOf(el2).steps.findIndex((c) => x >= c.x - CRUMB_HIT && x < c.x + c.w + CRUMB_HIT);
  return i < 0 ? void 0 : i;
}

// src/core/types/table.ts
var text15 = () => ({
  color: "$text",
  size: "sm"
});
var HEAD_LOOK = "color:var(--wf-muted);font-size:var(--wf-size-sm);font-weight:bold;";
function cellLook(el2) {
  const s = mergeStyle(text15(), el2);
  return `color:${cssColor(s.color, "$text")};font-size:${cssFontSize(s.size, "sm")};font-weight:${s.weight ?? "normal"};`;
}
var spec21 = {
  name: "table",
  label: "\u8868",
  // The height follows the band and the rows written (spec §3.1); the unfilled element is what the
  // author wrote, so a table whose h is written keeps it.
  defaults: (device, el2) => ({
    w: Math.min(device.w - 48, 600),
    h: tableHeightOf(el2.props)
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
  render: (el2, h2) => {
    const n = tableColumnCount(el2);
    const cw = el2.w / n;
    const right = numberColumns(el2);
    const cell = (t, j, look2) => h2("span", {
      class: "wf-table-cell",
      style: `left:${j * cw}px;width:${cw}px;` + (right[j] ? "text-align:right;" : "") + look2
    }, t);
    const columns = tableColumns(el2);
    const rows2 = tableRows(el2);
    const look = cellLook(el2);
    const nodes = [];
    if (columns.length > 0) {
      nodes.push(h2("div", {
        class: "wf-table-head",
        style: `height:${TABLE_HEAD_H}px;`
      }, ...columns.map((t, j) => cell(t, j, HEAD_LOOK))));
    }
    tableRowTops(el2).forEach((top, i) => {
      nodes.push(h2("div", {
        class: "wf-table-row",
        style: `top:${top}px;height:${TABLE_ROW_H}px;`
      }, ...Array.from({
        length: n
      }, (_v, j) => cell(rows2[i][j] ?? "", j, look))));
      const line = top + TABLE_ROW_H - 1;
      if (i < rows2.length - 1 && line < el2.h) {
        nodes.push(h2("div", {
          class: "wf-table-line",
          style: `top:${line}px;`
        }));
      }
    });
    return [
      h2("div", {
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
function itemLook(el2, current) {
  const s = mergeStyle(text16(), el2);
  const own = mergeStyle({}, el2);
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
  render: (el2, h2) => {
    const title = navTitle(el2);
    const items = navItems(el2);
    const active = Number(el2.props.active ?? 0);
    return [
      h2("div", {
        class: "wf-sidenav"
      }, ...title === "" ? [] : [
        h2("div", {
          class: "wf-sidenav-head"
        }, title)
      ], ...navItemTops(el2).map((top, i) => h2("div", {
        class: "wf-sidenav-item" + (i === active ? " is-active" : ""),
        style: `top:${top}px;left:${NAV_INSET}px;width:${Math.max(0, el2.w - 2 * NAV_INSET)}px;`
      }, h2("span", {
        class: "wf-sidenav-icon"
      }), h2("span", {
        class: "wf-sidenav-text",
        style: itemLook(el2, i === active)
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
  render: (el2, h2) => {
    const s = mergeStyle(text17(), el2);
    const size = `font-size:${cssFontSize(s.size, "sm")};`;
    const before = `color:${cssColor(s.color, "$muted")};` + size + "font-weight:normal;";
    const last = "color:var(--wf-text);" + size + `font-weight:${s.weight ?? "bold"};`;
    const items = choiceItems(el2);
    const { steps, seps } = crumbsOf(el2);
    const at = (c) => `left:${c.x}px;width:${c.w}px;`;
    const nodes = [];
    steps.forEach((c, i) => {
      const sep = seps[i - 1];
      if (sep && sep.x < el2.w) {
        nodes.push(h2("span", {
          class: "wf-crumb-sep",
          style: at(sep) + before
        }, "/"));
      }
      if (c.x >= el2.w) return;
      const current = i === steps.length - 1;
      nodes.push(h2("span", {
        class: "wf-crumb" + (current ? " is-current" : ""),
        style: at(c) + (current ? last : before)
      }, items[i]));
    });
    return [
      h2("div", {
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

// src/core/group.ts
var GROUP_TYPE2 = "group";
function groupSize(children) {
  return {
    w: Math.max(1, ...children.map((c) => c.x + c.w)),
    h: Math.max(1, ...children.map((c) => c.y + c.h))
  };
}
function settleGroups(elements) {
  const out = [];
  for (const el2 of elements) {
    if (!el2.children) {
      out.push(el2);
      continue;
    }
    const children = settleGroups(el2.children);
    if (el2.type !== GROUP_TYPE2 || layoutOf(el2)) {
      out.push({
        ...el2,
        children
      });
      continue;
    }
    if (children.length === 0) continue;
    const dx = Math.min(...children.map((c) => c.x));
    const dy = Math.min(...children.map((c) => c.y));
    const shifted = dx === 0 && dy === 0 ? children : children.map((c) => ({
      ...c,
      x: c.x - dx,
      y: c.y - dy
    }));
    out.push({
      ...el2,
      x: el2.x + dx,
      y: el2.y + dy,
      ...groupSize(shifted),
      children: shifted
    });
  }
  return out;
}
function canGroup(elements, ids) {
  return ids.length >= 2 && canWrap(elements, ids);
}
var LAYOUT_GROUP_NAME = "\u4E26\u3073";
function canWrap(elements, ids) {
  if (ids.length === 0 || new Set(ids).size !== ids.length) return false;
  const located = ids.map((id) => findById(elements, id));
  if (located.some((l) => l === void 0 || l.parent !== located[0]?.parent)) return false;
  return !ids.some((id) => isLocked(elements, id));
}
function groupElements(elements, ids, groupId) {
  if (!canGroup(elements, ids)) return elements;
  const parent = findById(elements, ids[0]).parent;
  const siblings = parent === void 0 ? elements : findById(elements, parent).el.children ?? [];
  const members = siblings.filter((e) => ids.includes(e.id));
  const front = siblings.findIndex((e) => e.id === members[members.length - 1].id);
  const x = Math.min(...members.map((m) => m.x));
  const y = Math.min(...members.map((m) => m.y));
  const children = members.map((m) => ({
    ...m,
    x: m.x - x,
    y: m.y - y
  }));
  const group = {
    id: groupId,
    type: GROUP_TYPE2,
    x,
    y,
    ...groupSize(children),
    props: {},
    children
  };
  const rest = members.reduce((els, m) => removeById(els, m.id), elements);
  return insertAt(rest, parent, front - (members.length - 1), group);
}
function wrapInLayout(elements, ids, groupId, dir) {
  if (!canWrap(elements, ids)) return elements;
  const parent = findById(elements, ids[0]).parent;
  const owner = parent === void 0 ? void 0 : findById(elements, parent).el;
  const siblings = owner === void 0 ? elements : owner.children ?? [];
  const members = siblings.filter((e) => ids.includes(e.id));
  const L = owner === void 0 ? void 0 : layoutOf(owner);
  const at = L ? siblings.findIndex((e) => e.id === members[0].id) : siblings.findIndex((e) => e.id === members[members.length - 1].id) - (members.length - 1);
  const x = Math.min(...members.map((m) => m.x));
  const y = Math.min(...members.map((m) => m.y));
  const children = members.map((m) => ({
    ...m,
    x: m.x - x,
    y: m.y - y
  }));
  const group = {
    id: groupId,
    type: GROUP_TYPE2,
    name: LAYOUT_GROUP_NAME,
    x,
    y,
    ...groupSize(children),
    props: {},
    children
  };
  const rest = members.reduce((els, m) => removeById(els, m.id), elements);
  const laid = toLayout(insertAt(rest, parent, at, group), groupId, dir);
  return L ? mapElement(laid, groupId, (g) => keepSizing(g, members, L, dir)) : laid;
}
function keepSizing(group, members, L, dir) {
  const across = L.align === "stretch" ? crossAxis(L.dir) : void 0;
  const fills = new Set(across ? [
    across
  ] : []);
  const children = (group.children ?? []).map((k) => {
    const m = members.find((e) => e.id === k.id);
    const sizing2 = {
      ...m.sizing,
      own: m.sizing?.own ?? {
        w: m.w,
        h: m.h
      }
    };
    if (across === mainAxis(dir)) sizing2[across] = "fill";
    for (const axis of [
      "w",
      "h"
    ]) if (sizing2[axis] === "fill") fills.add(axis);
    return sizing2.w || sizing2.h ? {
      ...k,
      sizing: sizing2
    } : k;
  });
  const sizing = {
    ...group.sizing
  };
  for (const axis of fills) sizing[axis] = "fill";
  const layout = across === crossAxis(dir) ? {
    ...group.layout,
    align: "stretch"
  } : group.layout;
  return {
    ...group,
    layout,
    sizing,
    children
  };
}
function canUngroup(elements, ids) {
  return ids.length > 0 && ids.every((id) => findById(elements, id)?.el.type === GROUP_TYPE2 && !isLocked(elements, id));
}
function ungroupElements(elements, ids) {
  if (!canUngroup(elements, ids)) return {
    elements,
    released: []
  };
  let out = elements;
  const released = [];
  for (const id of ids) {
    const located = findById(out, id);
    if (!located) continue;
    const g = located.el;
    out = removeById(out, id);
    (g.children ?? []).forEach((c, i) => {
      out = insertAt(out, located.parent, located.index + i, {
        ...c,
        x: c.x + g.x,
        y: c.y + g.y
      });
      released.push(c.id);
    });
  }
  return {
    elements: out,
    released: [
      ...new Set(released)
    ].filter((r) => !ids.includes(r))
  };
}

// src/core/defaults-file.ts
var NO_DEFAULTS = {};
var emptyDefaults = () => ({
  version: 1,
  parts: {}
});
function normalizeDefaultPart(p) {
  const out = {};
  if (p.w !== void 0) out.w = p.w;
  if (p.h !== void 0) out.h = p.h;
  if (p.style) {
    const style = {};
    for (const k of STYLE_KEYS) if (p.style[k] !== void 0) style[k] = p.style[k];
    if (Object.keys(style).length) out.style = style;
  }
  return out;
}
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
function plainAxes(spec25, device, el2) {
  const bare = {
    id: el2.id,
    type: el2.type,
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
  const here = spec25.defaults(device, el2);
  return {
    w: here.w === base.w,
    h: here.h === base.h
  };
}
function defaultSize(spec25, device, el2, d) {
  const size = spec25.defaults(device, el2);
  if (!d || d.w === void 0 && d.h === void 0) return size;
  const plain = plainAxes(spec25, device, el2);
  return {
    w: plain.w && d.w !== void 0 ? d.w : size.w,
    h: plain.h && d.h !== void 0 ? d.h : size.h
  };
}
function builtinStyle(spec25, el2) {
  return {
    ...spec25.box?.(el2) ?? {},
    ...spec25.text?.(el2) ?? {}
  };
}
function effectiveDefault(el2, frame, registry2, defaults) {
  const spec25 = registry2.get(el2.type);
  if (!spec25) return {
    ...UNKNOWN_SIZE,
    style: {}
  };
  const d = defaults[el2.type];
  const size = defaultSize(spec25, frame, el2, d);
  return {
    w: size.w,
    h: size.h,
    style: {
      ...builtinStyle(spec25, el2),
      ...d?.style ?? {}
    }
  };
}
var sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function followDefault(part, oldEff, newEff) {
  const el2 = structuredClone(part);
  for (const axis of [
    "w",
    "h"
  ]) {
    if (part.sizing?.[axis] !== void 0) continue;
    if (part[axis] === oldEff[axis]) el2[axis] = newEff[axis];
  }
  const style = {
    ...part.style ?? {}
  };
  const os = oldEff.style;
  const ns = newEff.style;
  for (const k of Object.keys(style)) {
    if (!sameJson(style[k], os[k])) continue;
    if (ns[k] === void 0) delete style[k];
    else style[k] = ns[k];
  }
  if (Object.keys(style).length) el2.style = style;
  else delete el2.style;
  return el2;
}
function defaultTargets(elements, type) {
  const out = [];
  const walk = (els) => {
    for (const el2 of els) {
      if (el2.set !== void 0) continue;
      if (el2.type === type) out.push(el2);
      if (el2.children) walk(el2.children);
    }
  };
  walk(elements);
  return out;
}
function layerDefaults(elements, defaults, underSet = false) {
  return elements.map((el2) => {
    const inSet = underSet || el2.set !== void 0;
    const style = inSet ? void 0 : defaults[el2.type]?.style;
    const out = {
      ...el2
    };
    if (style && Object.keys(style).length) out.base = {
      ...style
    };
    else delete out.base;
    if (el2.children) out.children = layerDefaults(el2.children, defaults, inSet);
    return out;
  });
}
function writeUnwritten(el2, style) {
  const own = {
    ...el2.style ?? {}
  };
  let changed = false;
  for (const [k, v] of Object.entries(style)) {
    if (own[k] === void 0 && v !== void 0) {
      own[k] = v;
      changed = true;
    }
  }
  return changed ? {
    ...el2,
    style: own
  } : el2;
}
function bakeDetached(el2, defaults, registry2) {
  const spec25 = registry2.get(el2.type);
  const keys = Object.keys(defaults[el2.type]?.style ?? {});
  let out = el2;
  if (spec25 && keys.length) {
    const builtin = builtinStyle(spec25, el2);
    const picked = {};
    for (const k of keys) if (builtin[k] !== void 0) picked[k] = builtin[k];
    out = writeUnwritten(el2, picked);
  }
  if (out.children) {
    out = {
      ...out,
      children: out.children.map((c) => c.set !== void 0 ? c : bakeDetached(c, defaults, registry2))
    };
  }
  return out;
}
function bakeLinked(el2, defaults) {
  if (el2.set !== void 0) return el2;
  let out = writeUnwritten(el2, defaults[el2.type]?.style ?? {});
  if (out.children) out = {
    ...out,
    children: out.children.map((c) => bakeLinked(c, defaults))
  };
  return out;
}

// src/core/defaults.ts
function fillElement(el2, device, registry2, parent, defaults = NO_DEFAULTS) {
  const spec25 = registry2.get(el2.type);
  const d = el2.set === void 0 ? defaults[el2.type] : void 0;
  const size = spec25 ? defaultSize(spec25, device, el2, d) : UNKNOWN_SIZE;
  const props = {};
  if (spec25) {
    for (const [key, p] of Object.entries(spec25.props)) {
      props[key] = Array.isArray(p.default) ? [
        ...p.default
      ] : p.default;
    }
  }
  Object.assign(props, el2.props ?? {});
  const own = layoutOf(el2);
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
    const written3 = el2[axis];
    if (written3 === "fit" && el2.type === "group" && !own) continue;
    if (written3 === "fit" || written3 === "fill") sizing[axis] = written3;
    else if (written3 === void 0) {
      if (parent && axis === crossAxis(parent.dir) && parent.align === "stretch") {
        sizing[axis] = "fill";
      } else if (own && (axis === mainAxis(own.dir) || el2.type === "group")) sizing[axis] = "fit";
    }
  }
  const filled = {
    ...el2,
    x: el2.x ?? 0,
    y: el2.y ?? 0,
    w: typeof el2.w === "number" ? el2.w : size.w,
    h: typeof el2.h === "number" ? el2.h : size.h,
    props,
    ...sizing.w || sizing.h ? {
      sizing
    } : {}
  };
  if (d?.style && Object.keys(d.style).length) filled.base = {
    ...d.style
  };
  else delete filled.base;
  if (el2.children) {
    const bounds = spec25?.sizeFromChildren ? device : {
      w: filled.w,
      h: filled.h
    };
    const below = el2.set === void 0 ? defaults : NO_DEFAULTS;
    filled.children = el2.children.map((c) => fillElement(c, bounds, registry2, own, below));
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
function fitsType(m, type) {
  return blockedBy(m, type).length === 0;
}
function fitTypes(m) {
  const order = [
    ...ITEM_TYPES.fill,
    ...ALL_TYPES.filter((t) => !ITEM_TYPES.fill.includes(t))
  ];
  return order.filter((t) => fitsType(m, t));
}
function stepMs(step2, tone) {
  const ms = step2.ms ?? "normal";
  return typeof ms === "number" ? ms : tone.speed[ms];
}
var roundLength = (m, tone) => m.steps.reduce((sum, s) => sum + stepMs(s, tone), 0);
function stepTotal(m, tone) {
  return (m.delay ?? 0) + roundLength(m, tone) * (m.alternate ? 2 : 1) * (m.repeat ?? 1);
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
function numberAt(s) {
  const a = s.from;
  const b = s.to;
  return Math.round((a + (b - a) * s.e) * 1e4) / 1e4;
}
function sampleSteps(m, ms, tone, easings) {
  const lengths = m.steps.map((s) => stepMs(s, tone));
  const round2 = lengths.reduce((a, b) => a + b, 0);
  const span = round2 * (m.alternate ? 2 : 1);
  const rounds = m.repeat ?? 1;
  const t = ms - (m.delay ?? 0);
  let i;
  let p;
  if (t < 0) {
    i = 0;
    p = 0;
  } else if (span <= 0 || t >= span * rounds) {
    i = m.alternate ? 0 : m.steps.length - 1;
    p = m.alternate ? 0 : 1;
  } else if (t === 0) {
    i = 0;
    p = 0;
  } else {
    let within = t % span;
    if (m.alternate && within > round2) within = 2 * round2 - within;
    i = 0;
    while (i < lengths.length - 1 && within > lengths[i]) within -= lengths[i++];
    p = lengths[i] <= 0 ? 1 : Math.min(1, Math.max(0, within / lengths[i]));
  }
  const easing = m.steps[i].easing ?? tone.easing;
  const e = easings[easing](p);
  const out = {};
  for (const item of itemsOf(m)) {
    const w = waypoints(m, item);
    out[item] = {
      from: w[i],
      to: w[i + 1],
      e,
      p
    };
  }
  return out;
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
    const step2 = {
      to: orderValues(s.to)
    };
    if (s.ms !== void 0 && s.ms !== "normal") step2.ms = s.ms;
    if (s.easing !== void 0) step2.easing = s.easing;
    return step2;
  });
  if (m.delay) out.delay = m.delay;
  if (m.repeat !== void 0 && m.repeat !== 1) out.repeat = m.repeat;
  if (m.alternate) out.alternate = true;
  return out;
}
var pct = (v) => `${Math.round(v * 100)}%`;
function valueText(item, v) {
  if (v === null) return "\u305D\u306E\u307E\u307E";
  if (item === "progress" || item === "scale" || item === "opacity") return pct(v);
  return String(v);
}
function chipText(item, from, to) {
  const unit = item === "dx" || item === "dy" ? " px" : "";
  return `${ITEM_LABEL[item]} ${valueText(item, from)} \u2192 ${valueText(item, to)}${unit}`;
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
function motionLabel(m, kind) {
  if (isStepped(m)) return m.label ?? CUSTOM_LABEL;
  return findMotion(m?.name ?? DEFAULT_MOTION[kind]).label;
}
var CUSTOM_LABEL = "\u81EA\u5206\u3067\u7D44\u3093\u3060\u52D5\u304D";
var DEFAULT_TONE = {
  speed: {
    fast: 120,
    normal: 200,
    slow: 320
  },
  easing: "standard"
};
function themeTone(theme) {
  return {
    speed: {
      ...DEFAULT_TONE.speed,
      ...theme?.motion?.speed ?? {}
    },
    easing: theme?.motion?.easing ?? DEFAULT_TONE.easing
  };
}
function motionDuration(row, tone) {
  const m = row.motion;
  if (isStepped(m)) return stepTotal(m, tone);
  if (motionName(row) === "instant") return 0;
  const speed = m?.speed ?? "normal";
  return typeof speed === "number" ? speed : tone.speed[speed];
}
function motionEasing(motion, tone) {
  return motion && !isStepped(motion) ? motion.easing ?? tone.easing : tone.easing;
}
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
function valueKindOf(type, rows2) {
  if (type === "list") return rows2 ? "row" : void 0;
  return VALUE_TYPES[type];
}
function valueKind(el2) {
  return valueKindOf(el2.type, hasRows({
    props: el2.props ?? {}
  }));
}
function initialValue(el2) {
  switch (valueKind(el2)) {
    case "boolean":
      return el2.props.checked === true;
    case "number":
      return Number(el2.props.active ?? 0);
    case "string":
      return "";
    case "row":
      return rowsOf(el2).findIndex((r) => r.selected === true);
    case "range":
      return sliderNums(el2).value;
  }
  return void 0;
}
function isValueCondition(c) {
  return "part" in c;
}
function canCarry(event, type, registry2, el2) {
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
      return type !== void 0 && valueKindOf(type, el2 !== void 0 && hasRows({
        props: el2.props ?? {}
      })) !== void 0;
  }
}
function conditionsOf(block) {
  return block.if?.all ?? block.if?.any ?? [];
}
function leavesScreen(action) {
  return action.act === "go" || action.act === "back";
}
var DEFAULT_SCREEN_MOTION = {
  name: "slide-left"
};
var DEFAULT_REACTION = {
  hover: 0.92,
  press: 0.84
};
function screenMotion(theme) {
  const m = theme?.motion?.screen;
  return m && Object.keys(m).length > 0 ? m : DEFAULT_SCREEN_MOTION;
}
function reactionOf(theme) {
  return {
    hover: theme?.reaction?.hover ?? DEFAULT_REACTION.hover,
    press: theme?.reaction?.press ?? DEFAULT_REACTION.press
  };
}
function goMotionName(motion) {
  const name = motion?.name;
  return name !== void 0 && findMotion(name) && motionFits(name, "appear") ? name : DEFAULT_MOTION.appear;
}
function remapBlockIds(el2, map) {
  const out = {
    ...el2
  };
  if (el2.blocks) out.blocks = el2.blocks.map((b) => remapBlock(b, map));
  if (el2.children) out.children = el2.children.map((c) => remapBlockIds(c, map));
  return out;
}
var sameRefOf = (c) => isValueCondition(c) && typeof c.is === "object" && c.is !== null ? c.is : void 0;
function remapBlock(block, map) {
  const cond = (c) => {
    if (isValueCondition(c)) {
      const part = map.get(c.part) ?? c.part;
      const ref = sameRefOf(c);
      const is = ref && ref.screen === void 0 ? {
        part: map.get(ref.part) ?? ref.part
      } : c.is;
      return is === void 0 ? {
        ...c,
        part
      } : {
        ...c,
        part,
        is
      };
    }
    return c.box === void 0 ? c : {
      ...c,
      box: map.get(c.box) ?? c.box
    };
  };
  const act = (a) => {
    if ((a.act === "set" || a.act === "next" || a.act === "prev" || a.act === "reset") && a.box !== void 0) {
      return {
        ...a,
        box: map.get(a.box) ?? a.box
      };
    }
    if (a.act === "value") {
      const part = map.get(a.part) ?? a.part;
      if (a.from && a.from.screen === void 0) {
        return {
          ...a,
          part,
          from: {
            part: map.get(a.from.part) ?? a.from.part
          }
        };
      }
      return {
        ...a,
        part
      };
    }
    if (a.act === "add") {
      const part = map.get(a.part) ?? a.part;
      const from = a.from.screen === void 0 ? {
        part: map.get(a.from.part) ?? a.from.part
      } : a.from;
      return {
        ...a,
        part,
        from
      };
    }
    if (a.act === "remove" || a.act === "play") return {
      ...a,
      part: map.get(a.part) ?? a.part
    };
    return a;
  };
  const out = {
    ...block,
    do: block.do.map(act)
  };
  if (block.if) {
    out.if = block.if.all ? {
      all: block.if.all.map(cond)
    } : {
      any: (block.if.any ?? []).map(cond)
    };
  }
  if (block.else) out.else = block.else.map(act);
  return out;
}
function blockPruner(elements, screenIds, screenStates) {
  const ids = /* @__PURE__ */ new Set();
  const states = /* @__PURE__ */ new Map();
  for (const { el: el2 } of flatten(elements)) {
    ids.add(el2.id);
    if ((el2.states?.length ?? 0) > 1) states.set(el2.id, new Set(el2.states.map((s) => s.id)));
  }
  const own = (screenStates?.length ?? 0) > 1 ? new Set(screenStates.map((s) => s.id)) : void 0;
  const hasState = (box7, state) => {
    if (box7 === void 0 && screenStates === void 0) return true;
    const list = box7 === void 0 ? own : states.get(box7);
    return list !== void 0 && (state === void 0 || list.has(state));
  };
  const keepCond = (c) => {
    if (!isValueCondition(c)) return hasState(c.box, c.state);
    if (!ids.has(c.part)) return false;
    const ref = sameRefOf(c);
    if (!ref) return true;
    if (ref.screen === void 0) return ids.has(ref.part);
    return screenIds === void 0 || screenIds.includes(ref.screen);
  };
  const keepAct = (a) => {
    if (a.act === "set") return hasState(a.box, a.state);
    if (a.act === "next" || a.act === "prev" || a.act === "reset") return hasState(a.box);
    if (a.act === "go") return screenIds === void 0 || screenIds.includes(a.screen);
    if (a.act === "value") {
      if (!ids.has(a.part)) return false;
      if (!a.from) return true;
      if (a.from.screen === void 0) return ids.has(a.from.part);
      return screenIds === void 0 || screenIds.includes(a.from.screen);
    }
    if (a.act === "add") {
      if (!ids.has(a.part)) return false;
      if (a.from.screen === void 0) return ids.has(a.from.part);
      return screenIds === void 0 || screenIds.includes(a.from.screen);
    }
    if (a.act === "remove" || a.act === "play") return ids.has(a.part);
    return true;
  };
  const prune = (block) => {
    let lost = false;
    const out = {
      ...block,
      do: block.do.filter(keepAct)
    };
    lost ||= out.do.length !== block.do.length;
    if (block.if) {
      const word2 = block.if.all ? "all" : "any";
      const kept = (block.if[word2] ?? []).filter(keepCond);
      lost ||= kept.length !== (block.if[word2] ?? []).length;
      if (kept.length === 0) return {
        lost: true
      };
      out.if = {
        [word2]: kept
      };
    }
    if (out.else) {
      out.else = out.else.filter(keepAct);
      lost ||= out.else.length !== (block.else ?? []).length;
      if (out.else.length === 0) delete out.else;
    }
    return out.do.length > 0 ? {
      block: out,
      lost
    } : {
      lost: true
    };
  };
  return (blocks) => {
    const results = blocks.map(prune);
    return {
      blocks: results.flatMap((r) => r.block ? [
        r.block
      ] : []),
      lost: results.some((r) => r.lost)
    };
  };
}
function pruneBlocks(elements, screenIds, only, screenStates) {
  const prune = blockPruner(elements, screenIds, screenStates);
  const dropped = [];
  const walk = (list) => list.map((el2) => {
    let next = el2;
    if (el2.blocks) {
      const { blocks, lost } = prune(el2.blocks);
      if (lost) dropped.push(el2.id);
      next = {
        ...next,
        blocks
      };
      if (blocks.length === 0) delete next.blocks;
    }
    if (el2.children) next = {
      ...next,
      children: walk(el2.children)
    };
    return next;
  });
  const visit = (list) => list.map((el2) => {
    if (only.includes(el2.id)) return walk([
      el2
    ])[0];
    return el2.children ? {
      ...el2,
      children: visit(el2.children)
    } : el2;
  });
  return {
    elements: only === void 0 ? walk(elements) : visit(elements),
    dropped
  };
}
function pruneScreenBlocks(blocks, elements, screenIds, screenStates) {
  if (!blocks) return {
    lost: false
  };
  const out = blockPruner(elements, screenIds, screenStates)(blocks);
  return out.blocks.length > 0 ? out : {
    lost: out.lost
  };
}

// src/core/values.ts
var MIRROR_TYPES = [
  "text",
  "button",
  "navbar"
];
var isMirrorType = (type) => MIRROR_TYPES.includes(type);
var refKey = (r) => r.screen === void 0 ? r.part : `${r.screen}/${r.part}`;
function parseRefKey(key) {
  const at = key.indexOf("/");
  return at < 0 ? {
    part: key
  } : {
    screen: key.slice(0, at),
    part: key.slice(at + 1)
  };
}
function valueAsText(el2, value) {
  if (el2.type === "list") {
    return typeof value === "number" && value >= 0 ? rowText(el2, value) ?? "" : "";
  }
  if (typeof value === "boolean") return value ? "\u30AA\u30F3" : "\u30AA\u30D5";
  if (el2.type === "slider" && typeof value === "number") return sliderText(el2, value);
  if (typeof value === "number") {
    const items = Array.isArray(el2.props.items) ? el2.props.items : [];
    const label = items[value];
    return typeof label === "string" ? label : `${value + 1} \u756A\u76EE`;
  }
  return value;
}
function keepable(el2) {
  return valueKind(el2) !== void 0 || el2.keep === true;
}
function keptParts(screens) {
  const out = [];
  for (const { id, title, screen } of screens) {
    for (const { el: el2 } of flatten(screen.elements)) {
      if (el2.keep === true && valueKind(el2) !== void 0) {
        out.push({
          screen: id,
          title,
          part: el2.id,
          type: el2.type,
          el: el2
        });
      }
    }
  }
  return out;
}
function refLabel(ref, here, kept, label) {
  if (ref.screen === void 0) return here(ref.part);
  const k = kept.find((x) => x.screen === ref.screen && x.part === ref.part);
  return k ? `${k.title} \u203A ${label(k.el)}` : `${ref.screen} \u203A ${ref.part}`;
}
function applyMirrors(elements, values, read) {
  let changed = false;
  const walk = (list) => {
    const out2 = list.map((el2) => {
      let next = el2;
      if (isMirrorType(el2.type)) {
        const text18 = el2.from ? read(el2.from) : values?.[el2.id];
        if (typeof text18 === "string" && text18 !== "" && text18 !== el2.text) {
          next = {
            ...next,
            text: text18
          };
          changed = true;
        }
      }
      if (el2.children) {
        const children = walk(el2.children);
        if (children !== el2.children) next = {
          ...next,
          children
        };
      }
      return next;
    });
    return out2.some((el2, i) => el2 !== list[i]) ? out2 : list;
  };
  const out = walk(elements);
  return changed ? out : elements;
}
function remapMirrorIds(el2, map) {
  const out = {
    ...el2
  };
  if (el2.from && el2.from.screen === void 0) {
    out.from = {
      part: map.get(el2.from.part) ?? el2.from.part
    };
  }
  if (el2.children) out.children = el2.children.map((c) => remapMirrorIds(c, map));
  return out;
}
function pruneMirrors(elements, screenIds, only) {
  const ids = new Set(flatten(elements).map((l) => l.el.id));
  const lost = (ref) => ref.screen === void 0 ? !ids.has(ref.part) : screenIds !== void 0 && !screenIds.includes(ref.screen);
  const dropped = [];
  const walk = (list) => {
    const out = list.map((el2) => {
      let next = el2;
      if (el2.from && lost(el2.from)) {
        const { from: _from, ...rest } = next;
        next = rest;
        dropped.push(el2.id);
      }
      if (el2.children) {
        const children = walk(el2.children);
        if (children !== el2.children) next = {
          ...next,
          children
        };
      }
      return next;
    });
    return out.some((el2, i) => el2 !== list[i]) ? out : list;
  };
  const visit = (list) => {
    const out = list.map((el2) => {
      if (only.includes(el2.id)) return walk([
        el2
      ])[0];
      if (!el2.children) return el2;
      const children = visit(el2.children);
      return children === el2.children ? el2 : {
        ...el2,
        children
      };
    });
    return out.some((el2, i) => el2 !== list[i]) ? out : list;
  };
  return {
    elements: only === void 0 ? walk(elements) : visit(elements),
    dropped
  };
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
var DEFAULT_EFFECT = "shake";
function findEffect(name) {
  return EFFECTS.find((e) => e.name === name);
}
function effectSteps(m) {
  if (isStepMotion(m)) return m;
  return findEffect(m.name)?.motion;
}
function effectLabel(m) {
  if (isStepMotion(m)) return m.label ?? CUSTOM_LABEL;
  return findEffect(m.name)?.label ?? m.name;
}
function soundEffect(m, type) {
  const steps = effectSteps(m);
  if (!steps || !checkStepMotion(steps, "", "effect", [])) return void 0;
  return fitsType(steps, type) ? steps : void 0;
}

// src/core/states.ts
var DEFAULT_STATE = {
  id: "default",
  name: "Default"
};
var same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function statesOf(screen, owner) {
  return owner === void 0 ? screen.states : findById(screen.elements, owner)?.el.states;
}
function stateIndex(screen, editing) {
  if (!editing) return -1;
  return (statesOf(screen, editing.owner) ?? []).findIndex((s) => s.id === editing.state);
}
function scopeIds(elements, owner) {
  if (owner === void 0) return new Set(flatten(elements).map((l) => l.el.id));
  const el2 = findById(elements, owner)?.el;
  return new Set(el2 ? [
    el2.id,
    ...flatten(el2.children ?? []).map((l) => l.el.id)
  ] : []);
}
function applyChange(el2, row, registry2) {
  const out = {
    ...el2
  };
  if (row.x !== void 0) out.x = row.x;
  if (row.y !== void 0) out.y = row.y;
  if (el2.type !== GROUP_TYPE2) {
    if (row.w !== void 0) out.w = row.w;
    if (row.h !== void 0) out.h = row.h;
  }
  if (row.text !== void 0) out.text = row.text;
  if (row.variant !== void 0) out.variant = row.variant;
  if (row.props) {
    const props = {
      ...el2.props
    };
    for (const [k, v] of Object.entries(row.props)) {
      if (v !== null) {
        props[k] = v;
        continue;
      }
      const d = registry2.get(el2.type)?.props[k]?.default;
      if (d === void 0) delete props[k];
      else props[k] = Array.isArray(d) ? [
        ...d
      ] : d;
    }
    out.props = props;
  }
  if (row.style) {
    const style = {
      ...el2.style ?? {}
    };
    for (const [k, v] of Object.entries(row.style)) {
      if (v === null) delete style[k];
      else style[k] = v;
    }
    if (Object.keys(style).length > 0) out.style = style;
    else delete out.style;
  }
  if (row.hidden === true) out.hidden = true;
  else if (row.hidden === false) delete out.hidden;
  return out;
}
function applyChanges(screen, owner, changes, registry2, place3 = true) {
  const scope = scopeIds(screen.elements, owner);
  const walk = (list) => list.map((el2) => {
    const row = scope.has(el2.id) ? changes[el2.id] : void 0;
    const next = row ? applyChange(el2, row, registry2) : el2;
    return el2.children ? {
      ...next,
      children: walk(el2.children)
    } : next;
  });
  const settled = settleGroups(walk(screen.elements));
  return {
    ...screen,
    elements: place3 ? placeElements(settled) : settled
  };
}
function applyState(screen, editing, registry2) {
  const index = stateIndex(screen, editing);
  if (!editing || index <= 0) return screen;
  const changes = statesOf(screen, editing.owner)[index].changes ?? {};
  return applyChanges(screen, editing.owner, changes, registry2);
}
function diffKeys(before, after) {
  const out = {};
  for (const k of /* @__PURE__ */ new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {})
  ])) {
    if (!same(before?.[k], after?.[k])) out[k] = after?.[k] === void 0 ? null : after[k];
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function extractChanges(base, look, scope, asState = true) {
  const seen = new Map(flatten(look).map((l) => [
    l.el.id,
    l.el
  ]));
  const out = {};
  for (const { el: b } of flatten(base)) {
    const l = seen.get(b.id);
    if (!l || !scope.has(b.id)) continue;
    const row = {};
    const laid = asState && inLayout(base, b.id) !== void 0;
    if (!laid && l.x !== b.x) row.x = l.x;
    if (!laid && l.y !== b.y) row.y = l.y;
    if (b.type !== GROUP_TYPE2) {
      const sized = (axis) => asState && (b.sizing?.[axis] !== void 0 || l.sizing?.[axis] !== void 0);
      if (!sized("w") && l.w !== b.w) row.w = l.w;
      if (!sized("h") && l.h !== b.h) row.h = l.h;
    }
    if (l.text !== void 0 && l.text !== b.text) row.text = l.text;
    if (l.variant !== void 0 && l.variant !== b.variant) row.variant = l.variant;
    const props = diffKeys(b.props, l.props);
    if (props) row.props = props;
    const style = diffKeys(b.style, l.style);
    if (style) row.style = style;
    if (l.hidden === true !== (b.hidden === true)) row.hidden = l.hidden === true;
    if (Object.keys(row).length > 0) out[b.id] = row;
  }
  return out;
}
function mapStates(screen, fn) {
  const walk = (list) => list.map((el2) => {
    let next = el2;
    if (el2.states) next = {
      ...next,
      states: fn(el2.states, el2.id)
    };
    if (el2.children) next = {
      ...next,
      children: walk(el2.children)
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
function dropPositionRows(screen, ids, across) {
  return mapStates(screen, (states) => mapRows(states, (id, row) => {
    if (!ids.has(id)) return row;
    const { x: _x, y: _y, ...rest } = row;
    if (across) delete rest[across];
    return rest;
  }));
}
function pruneStates(screen) {
  return mapStates(screen, (states, owner) => {
    const scope = scopeIds(screen.elements, owner);
    return mapRows(states, (id, row) => scope.has(id) ? row : void 0);
  });
}
function freezeStrays(elements) {
  const walk = (list, inside) => list.map((el2) => {
    let next = el2;
    if (!inside) next = dropFill(el2);
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
    for (const el2 of list) {
      if (!el2.children) {
        out.push(el2);
        continue;
      }
      const children = settle(el2.children);
      if (el2.type !== GROUP_TYPE2 || layoutOf(el2)) {
        out.push({
          ...el2,
          children
        });
        continue;
      }
      if (children.length === 0) continue;
      const dx = Math.min(...children.map((c) => c.x));
      const dy = Math.min(...children.map((c) => c.y));
      if (dx !== 0 || dy !== 0) {
        add(el2.id, dx, dy);
        for (const c of children) add(c.id, -dx, -dy);
      }
      const shifted = dx === 0 && dy === 0 ? children : children.map((c) => ({
        ...c,
        x: c.x - dx,
        y: c.y - dy
      }));
      out.push({
        ...el2,
        x: el2.x + dx,
        y: el2.y + dy,
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
function remapStateIds(el2, map) {
  const out = {
    ...el2
  };
  if (el2.states) {
    out.states = el2.states.map((state) => {
      if (!state.changes) return state;
      const changes = {};
      for (const [id, row] of Object.entries(state.changes)) changes[map.get(id) ?? id] = row;
      return {
        ...state,
        changes
      };
    });
  }
  if (el2.children) out.children = el2.children.map((c) => remapStateIds(c, map));
  return out;
}
function withStates(screen, owner, states) {
  const put2 = (holder) => {
    const { states: _old, ...rest } = holder;
    return states ? {
      ...rest,
      states
    } : rest;
  };
  if (owner === void 0) return put2(screen);
  const walk = (list) => list.map((el2) => {
    if (el2.id === owner) return put2(el2);
    return el2.children ? {
      ...el2,
      children: walk(el2.children)
    } : el2;
  });
  return {
    ...screen,
    elements: walk(screen.elements)
  };
}
function canOwnStates(screen, owner) {
  if (owner === void 0) return true;
  const type = findById(screen.elements, owner)?.el.type;
  return type === "rect" || type === GROUP_TYPE2;
}
function addState(screen, owner) {
  if (!canOwnStates(screen, owner)) return void 0;
  const states = statesOf(screen, owner) ?? [
    DEFAULT_STATE
  ];
  for (let n = 2; ; n++) {
    const id = `state-${n}`;
    const name = `State ${n}`;
    if (states.some((s) => s.id === id || s.name === name)) continue;
    return {
      screen: withStates(screen, owner, [
        ...states,
        {
          id,
          name
        }
      ]),
      state: id
    };
  }
}
function removeState(screen, owner, state) {
  const states = statesOf(screen, owner);
  const index = states?.findIndex((s) => s.id === state) ?? -1;
  if (!states || index <= 0) return screen;
  const rest = states.filter((s) => s.id !== state);
  return withStates(screen, owner, rest.length > 1 ? rest : void 0);
}
function canNameState(screen, owner, state, name) {
  const states = statesOf(screen, owner);
  if (!states?.some((s) => s.id === state)) return false;
  return name.length >= 1 && name.length <= STATE_NAME_MAX && !states.some((s) => s.id !== state && s.name === name);
}
function renameState(screen, owner, state, name) {
  if (!canNameState(screen, owner, state, name)) return screen;
  return withStates(screen, owner, statesOf(screen, owner).map((s) => s.id === state ? {
    ...s,
    name
  } : s));
}
function revertChange(screen, editing, id, keys) {
  const states = statesOf(screen, editing.owner);
  if (!states || stateIndex(screen, editing) <= 0) return screen;
  const next = states.map((s) => s.id !== editing.state ? s : mapRows([
    s
  ], (rowId, row) => {
    if (rowId !== id) return row;
    const copy = {
      ...row
    };
    for (const k of keys) delete copy[k];
    return !isMotionOnly(row) && isMotionOnly(copy) ? void 0 : copy;
  })[0]);
  return tidyMotions(withStates(screen, editing.owner, next));
}
function insideAppearing(elements, scope, changes, id) {
  return pathTo(elements, id).slice(0, -1).some((el2) => scope.has(el2.id) && changes[el2.id]?.hidden !== void 0);
}
function tidyMotions(screen) {
  return mapStates(screen, (states, owner) => {
    const scope = scopeIds(screen.elements, owner);
    return states.map((state) => {
      const changes = state.changes ?? {};
      return mapRows([
        state
      ], (id, row) => {
        if (!row.motion) return row;
        if (isStepped(row.motion)) {
          if (isMotionOnly(row)) {
            return insideAppearing(screen.elements, scope, changes, id) ? row : void 0;
          }
          if (rowKind(row) === "value" && !itemsOf(row.motion).includes("progress")) {
            const { motion: _motion2, ...rest2 } = row;
            return rest2;
          }
          return row;
        }
        const name = row.motion.name;
        if (isMotionOnly(row)) {
          const fits = name === void 0 || motionFits(name, "appear");
          return fits && insideAppearing(screen.elements, scope, changes, id) ? row : void 0;
        }
        if (name === void 0 || motionFits(name, rowKind(row))) return row;
        const { name: _name, ...motion } = row.motion;
        const { motion: _motion, ...rest } = row;
        return Object.keys(motion).length > 0 ? {
          ...rest,
          motion
        } : rest;
      })[0];
    });
  });
}
function canMoveAlong(screen, editing, id) {
  const index = stateIndex(screen, editing);
  if (index <= 0) return false;
  const changes = statesOf(screen, editing.owner)[index].changes ?? {};
  const row = changes[id];
  const scope = scopeIds(screen.elements, editing.owner);
  return scope.has(id) && (row === void 0 || isMotionOnly(row)) && insideAppearing(screen.elements, scope, changes, id);
}
function innerParts(screen, editing, id) {
  const index = stateIndex(screen, editing);
  const box7 = findById(screen.elements, id)?.el;
  if (index <= 0 || !box7) return [];
  const changes = statesOf(screen, editing.owner)[index].changes ?? {};
  if (changes[id]?.hidden === void 0) return [];
  const out = [];
  const walk = (list, depth) => {
    for (const el2 of list) {
      if (canMoveAlong(screen, editing, el2.id)) {
        out.push({
          id: el2.id,
          depth,
          added: changes[el2.id] !== void 0
        });
      }
      if (el2.children) walk(el2.children, depth + 1);
    }
  };
  walk(box7.children ?? [], 0);
  return out;
}
function setMotion(screen, editing, id, motion) {
  const states = statesOf(screen, editing.owner);
  const index = stateIndex(screen, editing);
  if (!states || index <= 0) return screen;
  const row = states[index].changes?.[id];
  if (row === void 0 && !canMoveAlong(screen, editing, id)) return screen;
  const { motion: _old, ...rest } = row ?? {};
  const alone = Object.keys(rest).length === 0;
  const kind = alone ? "appear" : rowKind(rest);
  if (isStepped(motion)) {
    const fits = kind === "appear" || itemsOf(motion).includes("progress");
    const next2 = fits ? {
      ...rest,
      motion: normalizeStepMotion(motion)
    } : rest;
    const changes2 = {
      ...states[index].changes ?? {},
      [id]: next2
    };
    return withStates(screen, editing.owner, states.map((s, i) => i === index ? {
      ...s,
      changes: changes2
    } : s));
  }
  const name = motion.name !== void 0 && motionFits(motion.name, kind) ? motion.name : DEFAULT_MOTION[kind];
  const written3 = {};
  if (alone || name !== DEFAULT_MOTION[kind]) written3.name = name;
  if (name !== "instant") {
    const speed = typeof motion.speed === "number" ? Math.min(MOTION_SPEED_MAX, Math.max(0, Math.round(motion.speed))) : motion.speed;
    const named = MOTION_SPEEDS.includes(speed);
    if (typeof speed === "number" && Number.isFinite(speed) || named && speed !== "normal") {
      written3.speed = speed;
    }
    const easing = motion.easing;
    if (name !== "spring" && MOTION_EASINGS.includes(easing)) {
      written3.easing = easing;
    }
  }
  const next = Object.keys(written3).length > 0 ? {
    ...rest,
    motion: written3
  } : rest;
  const changes = {
    ...states[index].changes ?? {},
    [id]: next
  };
  return withStates(screen, editing.owner, states.map((s, i) => i === index ? {
    ...s,
    changes
  } : s));
}
function reconcile(base, shown2, editing) {
  const look = settleGroups(shown2);
  const active = stateIndex(base, editing) > 0 ? editing : void 0;
  const old = new Map(flatten(base.elements).map((l) => [
    l.el.id,
    l
  ]));
  const scope = active ? scopeIds(look, active.owner) : /* @__PURE__ */ new Set();
  const shifts = /* @__PURE__ */ new Map();
  const hasOld = (el2) => old.has(el2.id) || (el2.children ?? []).some(hasOld);
  const unsettle = /* @__PURE__ */ new Map();
  if (active) {
    const before = applyState(base, active, registry).elements;
    const inside = scopeIds(base.elements, active.owner);
    for (const { el: el2 } of flatten(before)) {
      if (el2.type !== GROUP_TYPE2 || inside.has(el2.id)) continue;
      const at = absoluteOffset(base.elements, el2.id);
      const was = absoluteOffset(before, el2.id);
      unsettle.set(el2.id, {
        x: at.x - was.x,
        y: at.y - was.y
      });
    }
  }
  const build = (list, parent2, origin, seen, inFresh) => list.map((l) => {
    const was = old.get(l.id);
    let el2 = {
      ...l
    };
    let fresh2 = inFresh;
    if (was && was.parent !== parent2) {
      const at = absoluteOffset(base.elements, l.id);
      shifts.set(l.id, {
        dx: at.x - was.el.x - origin.x,
        dy: at.y - was.el.y - origin.y
      });
    }
    if (was && scope.has(l.id)) {
      const b = was.el;
      const s = shifts.get(l.id) ?? {
        dx: 0,
        dy: 0
      };
      el2 = {
        ...l,
        x: b.x + s.dx,
        y: b.y + s.dy,
        w: b.w,
        h: b.h,
        props: b.props
      };
      for (const k of [
        "text",
        "variant",
        "style",
        "hidden"
      ]) {
        if (b[k] === void 0) delete el2[k];
        else el2[k] = b[k];
      }
    } else if (!was && active && !inFresh && scope.has(l.id) && l.id !== active.owner && !hasOld(l)) {
      el2 = {
        ...l,
        hidden: true
      };
      fresh2 = true;
    } else if (active && !scope.has(l.id)) {
      const d = unsettle.get(l.id) ?? {
        x: 0,
        y: 0
      };
      el2 = {
        ...l,
        x: l.x + (seen.x - origin.x) + d.x,
        y: l.y + (seen.y - origin.y) + d.y
      };
    }
    if (l.children) {
      el2.children = build(l.children, l.id, {
        x: origin.x + el2.x,
        y: origin.y + el2.y
      }, {
        x: seen.x + l.x,
        y: seen.y + l.y
      }, fresh2);
    }
    return el2;
  });
  let next = {
    ...base,
    elements: build(shown2, void 0, {
      x: 0,
      y: 0
    }, {
      x: 0,
      y: 0
    }, false)
  };
  if (shifts.size > 0) {
    next = mapStates(next, (states2) => mapRows(states2, (id, row) => {
      const s = shifts.get(id);
      return s ? shiftRow(row, s.dx, s.dy) : row;
    }));
  }
  next = settleStated(next);
  if (!active || stateIndex(next, active) <= 0) return tidyMotions(next);
  const owner = active.owner;
  const parent = owner === void 0 ? void 0 : findById(next.elements, owner)?.parent;
  let measured = look;
  if (owner !== void 0 && parent !== void 0) {
    const written3 = absoluteOffset(next.elements, parent);
    const seen = absoluteOffset(look, parent);
    measured = mapElement(look, owner, (el2) => ({
      ...el2,
      x: el2.x + (seen.x - written3.x),
      y: el2.y + (seen.y - written3.y)
    }));
  }
  const changes = extractChanges(next.elements, measured, scopeIds(next.elements, active.owner));
  const states = statesOf(next, active.owner).map((s) => {
    if (s.id !== active.state) return s;
    for (const [id, row] of Object.entries(s.changes ?? {})) {
      if (!row.motion) continue;
      if (changes[id]) changes[id] = {
        ...changes[id],
        motion: row.motion
      };
      else if (isMotionOnly(row)) changes[id] = {
        motion: row.motion
      };
    }
    const { changes: _old, ...rest } = s;
    return Object.keys(changes).length > 0 ? {
      ...rest,
      changes
    } : rest;
  });
  return tidyMotions(withStates(next, active.owner, states));
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
var charCount = (text18) => [
  ...text18
].length;
function parseNumber(text18) {
  const bare = text18.trim().replaceAll(",", "");
  if (bare === "") return void 0;
  const n = Number(bare);
  return Number.isFinite(n) ? n : void 0;
}
var inRange = (n, range) => (range.min === void 0 || n >= range.min) && (range.max === void 0 || n <= range.max);
function compareHolds(cmp, value, other) {
  if (value === void 0) return false;
  switch (cmp.kind) {
    case "is":
      return value === cmp.value;
    case "same":
      return other !== void 0 && value === other;
    case "has":
      return typeof value === "string" && value.includes(cmp.text);
    case "length":
      return typeof value === "string" && inRange(charCount(value), cmp.range);
    case "number": {
      if (typeof value === "number") return inRange(value, cmp.range);
      if (typeof value !== "string") return false;
      const n = parseNumber(value);
      return n !== void 0 && inRange(n, cmp.range);
    }
  }
}

// src/core/block-text.ts
var val = (names, id, v) => names.value?.(id, v) ?? valueText2(v);
var partLabel = (el2) => el2.name ?? el2.text ?? el2.id;
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
      return lists.has(id) && typeof v === "number" ? v < 0 ? "\u306A\u3057" : `${v + 1} \u884C\u76EE` : valueText2(v);
    }
  };
}
function circled(n) {
  return n >= 1 && n <= 20 ? String.fromCodePoint(9311 + n) : `(${n})`;
}
function valueText2(v) {
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
      const where2 = placeWords(on.at);
      return `${where2 ? `${where2} ` : ""}${on.ms ?? HOLD_MS_DEFAULT} \u30DF\u30EA\u79D2\u9577\u62BC\u3057\u3057\u305F\u3068\u304D`;
    }
    case "swipe": {
      const where2 = placeWords(on.at);
      return `${where2 ? `${where2} ` : ""}${SWIPE_ARROWS[on.dir ?? "up"]} \u306B\u30B9\u30EF\u30A4\u30D7\u3057\u305F\u3068\u304D`;
    }
  }
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
function findTheme(themes, id) {
  return themes.find((t) => t.id === id);
}
function themeOrDefault(themes, id) {
  return findTheme(themes, id) ?? BUILTIN_THEMES[0];
}
function themeCssVars(theme) {
  const vars = {};
  for (const c of COLOR_NAMES) vars[`--wf-${c}`] = theme.colors[c];
  for (const t of SIZE_TOKENS) {
    vars[`--wf-radius-${t}`] = `${theme.radius[t]}px`;
    vars[`--wf-size-${t}`] = `${theme.font.size[t]}px`;
  }
  vars["--wf-font"] = theme.font.family;
  vars["--wf-spacing"] = `${theme.spacing}px`;
  return vars;
}
function resolveColor(value, theme) {
  if (value === "none") return "transparent";
  if (value.startsWith("$")) {
    const name = value.slice(1);
    return theme.colors[name] ?? value;
  }
  return value;
}

// src/core/references.ts
function fileStem(file) {
  const base = file.replace(/^.*[\\/]/, "");
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
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
      const word2 = Array.isArray(picked.if.all) ? "all" : Array.isArray(picked.if.any) ? "any" : "";
      if (word2) picked.if = {
        [word2]: picked.if[word2].map(normalizeCondition)
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
function normalizeElement(el2, parent) {
  const filled = el2;
  const picked = pick(el2, ELEMENT_KEYS);
  const own = layoutOf(el2);
  for (const axis of [
    "w",
    "h"
  ]) {
    const mode = filled.sizing?.[axis];
    if (mode) picked[axis] = mode;
    const byDefault = mode === "fill" && parent && axis === crossAxis(parent.dir) && parent.align === "stretch" ? true : mode === "fit" && own && (axis === mainAxis(own.dir) || el2.type === "group");
    if (byDefault) delete picked[axis];
  }
  if (parent) {
    const loose = picked;
    delete loose.x;
    delete loose.y;
    if (parent.align === "stretch") delete picked[crossAxis(parent.dir)];
  }
  if (own) picked.layout = normalizeLayout(el2.layout);
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
function serialize(v) {
  return JSON.stringify(v, null, 2) + "\n";
}

// src/core/validate.ts
var COLOR_REFS = new Set(COLOR_NAMES.map((n) => `$${n}`));
var EASING_TEXT = `\u7DE9\u6025\u306F ${MOTION_EASINGS.join(" / ")} \u306E\u3069\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
var MS_TEXT = `0\u301C${BLOCK_MS_MAX} \u306E\u6574\u6570(\u30DF\u30EA\u79D2)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;

// src/core/components.ts
var PRESET_SELF = "element";
function topmostIds(elements, ids) {
  const wanted = new Set(ids);
  const out = [];
  const walk = (list) => {
    for (const el2 of list) {
      if (wanted.has(el2.id)) {
        const ancestors = pathTo(elements, el2.id).slice(0, -1);
        if (!ancestors.some((a) => wanted.has(a.id))) out.push(el2.id);
      }
      if (el2.children) walk(el2.children);
    }
  };
  walk(elements);
  return out;
}
function presetFromSelection(given) {
  const items = given.map((i) => ({
    ...i,
    el: dropFill(i.el)
  }));
  if (items.length === 1) {
    const asSelf = /* @__PURE__ */ new Map([
      [
        items[0].el.id,
        PRESET_SELF
      ]
    ]);
    const self = remapMirrorIds(remapBlockIds(remapStateIds(items[0].el, asSelf), asSelf), asSelf);
    const { id: _id, x: _x, y: _y, locked: _locked, set: _set, ...rest } = self;
    return {
      type: items[0].el.type,
      element: structuredClone(rest)
    };
  }
  const left = Math.min(...items.map((i) => i.abs.x));
  const top = Math.min(...items.map((i) => i.abs.y));
  const right = Math.max(...items.map((i) => i.abs.x + (typeof i.el.w === "number" ? i.el.w : 0)));
  const bottom = Math.max(...items.map((i) => i.abs.y + (typeof i.el.h === "number" ? i.el.h : 0)));
  return {
    type: GROUP_TYPE2,
    element: {
      type: GROUP_TYPE2,
      w: right - left,
      h: bottom - top,
      children: items.map(({ el: el2, abs }) => {
        const { locked: _locked, ...rest } = el2;
        const x = abs.x - left;
        const y = abs.y - top;
        const states = rest.states?.map((st) => {
          const own = st.changes?.[el2.id];
          if (!own || own.x === void 0 && own.y === void 0) return st;
          const moved = {
            ...own
          };
          if (own.x !== void 0) moved.x = own.x + x - el2.x;
          if (own.y !== void 0) moved.y = own.y + y - el2.y;
          return {
            ...st,
            changes: {
              ...st.changes,
              [el2.id]: moved
            }
          };
        });
        return {
          ...structuredClone(rest),
          ...states && {
            states
          },
          x,
          y
        };
      })
    }
  };
}
function instantiatePreset(preset, taken, at, link = true) {
  const used = new Set(taken);
  const fresh2 = (stem) => {
    for (let n = 1; ; n++) {
      const id = `${stem}-${n}`;
      if (!used.has(id)) {
        used.add(id);
        return id;
      }
    }
  };
  const renamed = /* @__PURE__ */ new Map();
  const rename = (el2, id) => {
    renamed.set(el2.id, id);
    const copy = {
      ...structuredClone(el2),
      id
    };
    if (el2.children) copy.children = el2.children.map((c) => rename(c, fresh2(id)));
    return copy;
  };
  const root = {
    ...preset.element,
    id: PRESET_SELF,
    x: at.x,
    y: at.y,
    ...link ? {
      set: preset.name
    } : {}
  };
  const placed = remapBlockIds(remapStateIds(rename(root, fresh2(preset.type)), renamed), renamed);
  return remapMirrorIds(placed, renamed);
}
var sameJson2 = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function filledPreset(preset, frame, registry2, parent) {
  const el2 = {
    ...structuredClone(preset.element),
    id: PRESET_SELF,
    x: 0,
    y: 0
  };
  return fillElement(el2, frame, registry2, parent);
}
function frameOf(screen, id) {
  const above = pathTo(screen.elements, id).slice(0, -1);
  for (let i = above.length - 1; i >= 0; i--) {
    if (above[i].type !== GROUP_TYPE2) return {
      w: above[i].w,
      h: above[i].h
    };
  }
  return deviceSize(screen.device);
}
function followsAxis(part, axis) {
  if (part.sizing?.[axis] !== void 0) return false;
  if (part.type === GROUP_TYPE2 && !layoutOf(part)) return false;
  return true;
}
function shapeOf(el2) {
  const kids = el2.children ?? [];
  return kids.length ? `${el2.type}(${kids.map(shapeOf).join(",")})` : el2.type;
}
var keysOf = (...objs) => [
  ...new Set(objs.flatMap((o) => Object.keys(o ?? {})))
];
function rootOwn(part, preset) {
  const own = [];
  for (const axis of [
    "w",
    "h"
  ]) {
    if (!followsAxis(part, axis)) continue;
    if (part[axis] !== preset[axis] || preset.sizing?.[axis] !== void 0) own.push(axis);
  }
  if (!sameJson2(part.text, preset.text)) own.push("text");
  if (!sameJson2(part.variant, preset.variant)) own.push("variant");
  for (const k of keysOf(part.props, preset.props)) {
    if (!sameJson2(part.props[k], preset.props[k])) own.push(`props.${k}`);
  }
  for (const k of keysOf(part.style, preset.style)) {
    const ps = part.style;
    const qs = preset.style;
    if (!sameJson2(ps?.[k], qs?.[k])) own.push(`style.${k}`);
  }
  const lp = part.layout ? normalizeLayout(part.layout) : void 0;
  const lq = preset.layout ? normalizeLayout(preset.layout) : void 0;
  if (!sameJson2(lp, lq)) own.push("layout");
  return own;
}
function setDiff(part, preset) {
  const own = rootOwn(part, preset);
  if (!preset.children?.length) return {
    own,
    shape: true
  };
  const shape = shapeOf(part) === shapeOf(preset);
  if (shape) {
    (part.children ?? []).forEach((c, i) => {
      for (const item of setDiff(c, preset.children[i]).own) own.push(`[${i}].${item}`);
    });
  }
  return {
    own,
    shape
  };
}
function put(target, key, value) {
  if (value === void 0) delete target[key];
  else target[key] = value;
}
function followPreset(part, old, next, laidOut = false) {
  const el2 = structuredClone(part);
  for (const axis of [
    "w",
    "h"
  ]) {
    if (!followsAxis(part, axis) || part[axis] !== old[axis]) continue;
    if (old.sizing?.[axis] !== void 0) continue;
    el2[axis] = next[axis];
    const mode = next.sizing?.[axis];
    if (mode !== void 0 && laidOut) {
      el2.sizing = {
        ...el2.sizing ?? {
          own: {
            ...next.sizing.own
          }
        },
        [axis]: mode
      };
    }
  }
  if (sameJson2(part.text, old.text)) put(el2, "text", next.text);
  if (sameJson2(part.variant, old.variant)) put(el2, "variant", next.variant);
  for (const k of keysOf(part.props, old.props, next.props)) {
    if (sameJson2(part.props[k], old.props[k])) put(el2.props, k, next.props[k]);
  }
  const style = {
    ...part.style ?? {}
  };
  const os = old.style ?? {};
  const ns = next.style ?? {};
  for (const k of keysOf(part.style, old.style, next.style)) {
    if (sameJson2(style[k], os[k])) put(style, k, ns[k]);
  }
  if (Object.keys(style).length) el2.style = style;
  else delete el2.style;
  const lp = part.layout ? normalizeLayout(part.layout) : void 0;
  const lo = old.layout ? normalizeLayout(old.layout) : void 0;
  if (sameJson2(lp, lo)) put(el2, "layout", next.layout ? normalizeLayout(next.layout) : void 0);
  let mismatched = false;
  if (old.children?.length || next.children?.length) {
    const agree = shapeOf(part) === shapeOf(old) && shapeOf(old) === shapeOf(next);
    if (agree) {
      const inside = !!layoutOf(el2);
      el2.children = part.children.map((c, i) => followPreset(c, old.children[i], next.children[i], inside).el);
    } else mismatched = true;
  }
  return {
    el: el2,
    mismatched
  };
}
function pushToPreset(part, raw, oldFilled) {
  const out = structuredClone(raw);
  const apply = (target, src, items) => {
    for (const item of items) {
      const child = /^\[(\d+)\]\.(.+)$/.exec(item);
      if (child) {
        const i = Number(child[1]);
        if (target.children?.[i] && src.children?.[i]) {
          apply(target.children[i], src.children[i], [
            child[2]
          ]);
        }
        continue;
      }
      if (item === "w" || item === "h") put(target, item, src[item]);
      else if (item === "text" || item === "variant") put(target, item, src[item]);
      else if (item === "layout") {
        put(target, "layout", src.layout ? normalizeLayout(src.layout) : void 0);
      } else if (item.startsWith("props.")) {
        const k = item.slice(6);
        target.props = {
          ...target.props ?? {}
        };
        put(target.props, k, src.props[k]);
        if (Object.keys(target.props).length === 0) delete target.props;
      } else if (item.startsWith("style.")) {
        const k = item.slice(6);
        const style = {
          ...target.style ?? {}
        };
        put(style, k, src.style?.[k]);
        if (Object.keys(style).length) target.style = style;
        else delete target.style;
      }
    }
  };
  apply(out, part, setDiff(part, oldFilled).own);
  const { id: _id, x: _x, y: _y, set: _set, ...rest } = out;
  return rest;
}

// src/core/scroll.ts
var NO_SCROLL = Object.freeze({
  x: 0,
  y: 0
});
var DRAG_SLOP = 8;
var WHEEL_LINE = 16;
var SCROLLBAR_HOLD = 400;
function listExtent(el2) {
  return rowCount(el2) * rowHeightOf(el2);
}
function scrollAxis(el2) {
  if (el2.type === "rect") {
    const s = el2.props.scroll;
    return s === "y" || s === "x" ? s : void 0;
  }
  if (el2.type === "list") return listExtent(el2) > el2.h ? "y" : void 0;
  return void 0;
}
function contentExtent(el2, axis) {
  if (el2.type === "rect" && layoutOf(el2)) return contentLength(el2, axis);
  if (el2.type === "list") return axis === "y" ? listExtent(el2) : el2.w;
  let far = 0;
  for (const c of el2.children ?? []) {
    if (c.hidden === true) continue;
    far = Math.max(far, axis === "y" ? c.y + c.h : c.x + c.w);
  }
  return far;
}
function scrollRange(el2) {
  const axis = scrollAxis(el2);
  if (axis === void 0) return {
    x: 0,
    y: 0
  };
  const room = Math.max(0, contentExtent(el2, axis) - (axis === "y" ? el2.h : el2.w));
  return axis === "y" ? {
    x: 0,
    y: room
  } : {
    x: room,
    y: 0
  };
}
function clampScroll(el2, pos) {
  const range = scrollRange(el2);
  const out = {
    x: Math.min(range.x, Math.max(0, pos.x)),
    y: Math.min(range.y, Math.max(0, pos.y))
  };
  if (pos.at !== void 0) out.at = pos.at;
  return out;
}
function scrollOf(scrolls, id) {
  return scrolls?.[id] ?? NO_SCROLL;
}
function clampScrolls(elements, scrolls) {
  let out;
  for (const [id, pos] of Object.entries(scrolls)) {
    const el2 = findById(elements, id)?.el;
    const range = el2 ? scrollRange(el2) : void 0;
    const kept = el2 && range && (range.x > 0 || range.y > 0) ? clampScroll(el2, pos) : void 0;
    const same3 = kept && kept.x === pos.x && kept.y === pos.y && kept.at === pos.at;
    if (same3) continue;
    out ??= {
      ...scrolls
    };
    if (kept) out[id] = kept;
    else delete out[id];
  }
  return out ?? scrolls;
}
function wheelStep(w, zoom, page) {
  const unit = (v, span) => (w.deltaMode === 1 ? v * WHEEL_LINE : w.deltaMode === 2 ? v * span : v) / (zoom || 1);
  let dx = unit(w.deltaX, page.w);
  let dy = unit(w.deltaY, page.h);
  if (w.shiftKey && dx === 0) {
    dx = dy;
    dy = 0;
  }
  return {
    dx,
    dy
  };
}
function scrollBy(elements, scrolls, id, by, now) {
  const el2 = findById(elements, id)?.el;
  if (!el2) return scrolls;
  const cur = scrollOf(scrolls, id);
  return {
    ...scrolls,
    [id]: clampScroll(el2, {
      x: cur.x + by.dx,
      y: cur.y + by.dy,
      at: now
    })
  };
}
function scrollTo(elements, scrolls, id, axis, to, now) {
  const el2 = findById(elements, id)?.el;
  if (!el2) return scrolls;
  const cur = scrollOf(scrolls, id);
  return {
    ...scrolls,
    [id]: clampScroll(el2, {
      ...cur,
      [axis]: to,
      at: now
    })
  };
}
function scrollBoxesAround(elements, id) {
  return pathTo(elements, id).reverse().filter((e) => scrollAxis(e) !== void 0);
}
function pickScrollTarget(elements, scrolls, fromId, dx, dy) {
  for (const box7 of scrollBoxesAround(elements, fromId)) {
    const axis = scrollAxis(box7);
    const delta = axis === "y" ? dy : dx;
    if (delta === 0) continue;
    const at = scrollOf(scrolls, box7.id)[axis];
    const room = scrollRange(box7)[axis];
    if (delta < 0 && at > 0 || delta > 0 && at < room) return {
      id: box7.id,
      axis
    };
  }
  return void 0;
}
function revealRow(elements, scrolls, listId, index, now) {
  const list = findById(elements, listId)?.el;
  if (!list) return scrolls;
  let out = scrolls;
  if (scrollAxis(list) === "y") {
    const rowHeight = rowHeightOf(list);
    const top = index * rowHeight;
    const cur = scrollOf(out, listId);
    let want = cur.y;
    if (top < want) want = top;
    else if (top + rowHeight > want + list.h) want = top + rowHeight - list.h;
    want = Math.min(scrollRange(list).y, Math.max(0, want));
    if (want !== cur.y) {
      const pos = {
        ...cur,
        y: want
      };
      if (now !== void 0) pos.at = now;
      out = {
        ...out,
        [listId]: pos
      };
    }
  }
  return revealIn(elements, out, listId, now);
}
function revealIn(elements, scrolls, id, now) {
  const part = findById(elements, id)?.el;
  if (!part) return scrolls;
  let out = scrolls;
  for (const box7 of scrollBoxesAround(elements, id)) {
    if (box7.id === id) continue;
    const axis = scrollAxis(box7);
    const room = scrollRange(box7)[axis];
    if (room === 0) continue;
    const cur = scrollOf(out, box7.id);
    const rel = absoluteOffset(elements, id, out)[axis] - absoluteOffset(elements, box7.id, out)[axis] + cur[axis];
    const size = axis === "y" ? part.h : part.w;
    const view = axis === "y" ? box7.h : box7.w;
    let want = cur[axis];
    if (size >= view || rel < want) want = rel;
    else if (rel + size > want + view) want = rel + size - view;
    want = Math.min(room, Math.max(0, want));
    if (want === cur[axis]) continue;
    const pos = {
      ...cur,
      [axis]: want
    };
    if (now !== void 0) pos.at = now;
    out = {
      ...out,
      [box7.id]: pos
    };
  }
  return out;
}

// src/core/run.ts
var SCREEN = "";
function owners(screen) {
  const out = [];
  if ((screen.states?.length ?? 0) > 1) out.push(SCREEN);
  const boxes = flatten(screen.elements).filter((l) => (l.el.states?.length ?? 0) > 1).map((l) => ({
    id: l.el.id,
    depth: pathTo(screen.elements, l.el.id).length
  })).sort((a, b) => a.depth - b.depth);
  return [
    ...out,
    ...boxes.map((b) => b.id)
  ];
}
function lookOf(screen, states, registry2, values = {}, read, rows2) {
  let out = {
    elements: screen.elements,
    states: screen.states
  };
  for (const owner of owners(screen)) {
    const id = states[owner];
    if (id === void 0) continue;
    const list = statesOf(screen, owner === SCREEN ? void 0 : owner);
    const state = list?.find((s) => s.id === id);
    if (!state || list.indexOf(state) <= 0) continue;
    out = applyChanges(out, owner === SCREEN ? void 0 : owner, state.changes ?? {}, registry2);
  }
  const shown2 = showValues(out.elements, values, rows2);
  return placeElements(read ? applyMirrors(shown2, values, read) : shown2);
}
var withRows = (el2, rows2) => ({
  ...el2,
  props: {
    ...el2.props,
    items: rows2,
    ...rows2.length === 0 ? {
      rows: 0
    } : {}
  }
});
function showValues(elements, values, rows2 = {}) {
  let out = elements;
  for (const [id, list] of Object.entries(rows2)) {
    out = mapElement(out, id, (el2) => el2.type === "list" ? withRows(el2, list) : el2);
  }
  for (const [id, value] of Object.entries(values)) {
    out = mapElement(out, id, (el2) => {
      const kind = valueKind(el2);
      if (kind === "row") return typeof value === "number" ? tinted(el2, elements, value) : el2;
      const key = kind === "boolean" ? "checked" : kind === "number" ? "active" : kind === "string" || kind === "range" ? "value" : void 0;
      return key === void 0 ? el2 : {
        ...el2,
        props: {
          ...el2.props,
          [key]: value
        }
      };
    });
  }
  return out;
}
function tinted(el2, written3, at) {
  const was = findById(written3, el2.id)?.el;
  if (!was || !rowsOf(was).some((r) => r.selected === true)) return el2;
  const items = rowsOf(el2).map((r, i) => {
    const { selected: _old, ...rest } = r;
    return i === at ? {
      ...rest,
      selected: true
    } : rest;
  });
  return {
    ...el2,
    props: {
      ...el2.props,
      items
    }
  };
}
function currentLook(run, registry2) {
  return lookOfScreen(run, registry2, run.current);
}
function lookOfScreen(run, registry2, screen) {
  const s = run.screens[screen];
  const standing2 = run.runs[screen];
  return lookOf(s, standing2?.states ?? {}, registry2, standing2?.values, (ref) => textOfRef(run, registry2, ref, screen), standing2?.rows);
}
function readRef(run, registry2, ref, screen) {
  const id = ref.screen ?? screen;
  const s = run.screens[id];
  if (!s) return void 0;
  if (ref.screen === void 0 || ref.screen === screen) {
    const standing2 = run.runs[id];
    const look = lookOf(s, standing2?.states ?? {}, registry2, {}, void 0, standing2?.rows);
    const el3 = findById(look, ref.part)?.el;
    const value = el3 ? valueIn(look, standing2?.values, ref.part) : void 0;
    return el3 && value !== void 0 ? {
      el: el3,
      value
    } : void 0;
  }
  const written3 = findById(s.elements, ref.part)?.el;
  if (!written3) return void 0;
  const held = run.keptRows?.[id]?.[ref.part];
  const el2 = held ? withRows(written3, held) : written3;
  const first = initialValue(el2);
  if (first === void 0) return void 0;
  return {
    el: el2,
    value: run.kept?.[id]?.[ref.part] ?? first
  };
}
function textOfRef(run, registry2, ref, screen = run.current) {
  const r = readRef(run, registry2, ref, screen);
  return r ? valueAsText(r.el, r.value) : void 0;
}
function keptNow(run, registry2, order) {
  const out = [];
  for (const id of order ?? Object.keys(run.screens)) {
    const s = run.screens[id];
    if (!s || id === run.current) continue;
    for (const { el: el2 } of flatten(s.elements)) {
      if (el2.keep !== true) continue;
      const r = readRef(run, registry2, {
        screen: id,
        part: el2.id
      }, run.current);
      if (r) out.push({
        screen: id,
        id: el2.id,
        value: r.value
      });
    }
  }
  return out;
}
function valueIn(look, values, id) {
  const el2 = findById(look, id)?.el;
  if (!el2 || initialValue(el2) === void 0) return void 0;
  return values?.[id] ?? initialValue(el2);
}
function valuesNow(run, registry2) {
  const look = currentLook(run, registry2);
  return flatten(look).flatMap(({ el: el2 }) => {
    const value = valueIn(look, run.runs[run.current].values, el2.id);
    return value === void 0 ? [] : [
      {
        id: el2.id,
        value
      }
    ];
  });
}
var blocksOf = (screen, owner) => (owner === SCREEN ? screen.blocks : findById(screen.elements, owner)?.el.blocks) ?? [];
var hasEvent = (screen, owner, event) => blocksOf(screen, owner).some((b) => b.on.event === event);
function pointerReceiver(screen, hit, event) {
  return pathTo(screen.elements, hit).map((el2) => el2.id).reverse().find((id) => hasEvent(screen, id, event));
}
function swipeFits(b, owner, dir, hit, place3) {
  if (b.on.event !== "swipe" || b.on.dir !== dir) return false;
  return b.on.at === void 0 || owner === hit && b.on.at === place3;
}
function swipeTakes(screen, owner, dir, hit, place3) {
  return blocksOf(screen, owner).some((b) => swipeFits(b, owner, dir, hit, place3));
}
function holdTimes(screen, hit) {
  const owner = pointerReceiver(screen, hit, "hold");
  if (owner === void 0) return void 0;
  const times = blocksOf(screen, owner).filter((b) => b.on.event === "hold").map((b) => b.on.ms ?? HOLD_MS_DEFAULT);
  return {
    owner,
    times: [
      ...new Set(times)
    ].sort((a, b) => a - b)
  };
}
var isStateAct = (a) => a.act === "set" || a.act === "next" || a.act === "prev" || a.act === "reset";
function followPart(list) {
  const out = [];
  for (const a of list) {
    if (a.act === "play") continue;
    if (!isStateAct(a)) break;
    out.push(a);
  }
  return out;
}
function keyReceiver(screen, look, key) {
  const takes = (owner) => blocksOf(screen, owner).some((b) => b.on.event === "key" && b.on.key === key);
  let best;
  flatten(look).forEach((l, order) => {
    const el2 = l.el;
    if (isHidden(look, el2.id) || !takes(el2.id)) return;
    const depth = pathTo(look, el2.id).length;
    if (!best || depth > best.depth || depth === best.depth && order > best.order) {
      best = {
        id: el2.id,
        depth,
        order
      };
    }
  });
  if (best) return best.id;
  return takes(SCREEN) ? SCREEN : void 0;
}
function placeIn(el2, x, y, scroll) {
  if (el2.type === "tabbar" || el2.type === "tabs") {
    const items = Array.isArray(el2.props.items) ? el2.props.items.length : 0;
    if (items === 0 || x < 0 || x >= el2.w) return void 0;
    return Math.min(items - 1, Math.floor(x / (el2.w / items)));
  }
  if (el2.type === "radio") {
    const rowHeight = Number(el2.props.rowHeight ?? 48);
    const row = Math.floor(y / rowHeight);
    return x >= 0 && x < el2.w && y >= 0 && row < choiceItems(el2).length ? row : void 0;
  }
  if (el2.type === "list") {
    const rows2 = rowCount(el2);
    const rowHeight = rowHeightOf(el2);
    const sent = y + (scroll?.y ?? 0);
    const row = Math.floor(sent / rowHeight);
    return sent >= 0 && row < rows2 ? row : void 0;
  }
  if (el2.type === "table") return tableRowAt(el2, x, y);
  if (el2.type === "sidenav") return navItemAt(el2, x, y);
  if (el2.type === "breadcrumb") return crumbAt(el2, x, y);
  if (el2.type === "navbar") {
    const zone = Math.min(96, el2.w / 4);
    if (x >= 0 && x < zone) return "left";
    if (x >= el2.w - zone && x < el2.w) return "right";
  }
  return void 0;
}
function checkIn(el2, x, y, scroll) {
  if (valueKind(el2) !== "row" || x < el2.w - TOGGLE_ZONE || x >= el2.w) return void 0;
  const row = placeIn(el2, x, y, scroll);
  if (typeof row !== "number") return void 0;
  return filledRows(el2)[row]?.trailing === "toggle" ? row : void 0;
}
function holds(screen, states, c, value, read, fit) {
  if (isValueCondition(c)) {
    const cmp0 = compareOf(c);
    const v0 = value?.(c.part);
    if (!cmp0 || v0 === void 0) return false;
    const v = fit ? fit(c.part, v0) : v0;
    const cmp = cmp0.kind === "is" && fit ? {
      ...cmp0,
      value: fit(c.part, cmp0.value)
    } : cmp0;
    const other = cmp.kind === "same" ? read?.(cmp.ref) : void 0;
    const ok = compareHolds(cmp, v, other);
    return c.not === true ? !ok : ok;
  }
  const owner = c.box ?? SCREEN;
  const list = statesOf(screen, c.box);
  const first = list?.[0]?.id;
  const inState = (states[owner] ?? first) === c.state;
  return c.not === true ? !inState : inState;
}
function ifHolds(screen, states, block, value, read, fit) {
  if (!block.if) return true;
  const list = conditionsOf(block);
  const each = list.map((c) => holds(screen, states, c, value, read, fit));
  return block.if.all ? each.every(Boolean) : each.some(Boolean);
}
var freshRun = (cameBy) => ({
  states: {},
  timers: [],
  ...cameBy ? {
    cameBy
  } : {}
});
function shownCarriers(screen, look, event) {
  const out = [];
  if (hasEvent(screen, SCREEN, event)) out.push(SCREEN);
  for (const { el: el2 } of flatten(look)) {
    if (!isHidden(look, el2.id) && hasEvent(screen, el2.id, event)) out.push(el2.id);
  }
  return out;
}
var runKey = (owner, block) => `${owner}#${block}`;
var STEP_LIMIT = 1e3;
var NEST_LIMIT = 100;
var RunLimitError = class extends Error {
  owner;
  block;
  constructor(owner, block) {
    super(`\u30D6\u30ED\u30C3\u30AF\u304C\u5F85\u305F\u305A\u306B\u547C\u3073\u5408\u3044\u3001\u6B62\u307E\u308A\u307E\u305B\u3093(${owner === SCREEN ? "\u753B\u9762" : owner} \u306E ${block + 1} \u672C\u76EE\u306E\u30D6\u30ED\u30C3\u30AF)\u3002\u300C\u73FE\u308C\u305F\u76F4\u5F8C\u300D\u300C\u6642\u9593\u304C\u305F\u3063\u305F\u3089\u300D\u306E\u9023\u306A\u308A\u306B\u5F85\u3064\u6642\u9593\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044`), this.owner = owner, this.block = block;
    this.name = "RunLimitError";
  }
};
var Stepper = class {
  registry;
  run;
  effects;
  /** The rows added in this step (values spec §11). */
  added;
  /** Blocks whose rest waits on a timer: they take no second event meanwhile (spec §4.3). */
  running;
  /** What is left of the step's STEP_LIMIT. */
  budget;
  /** How many blocks are running one inside another now (NEST_LIMIT). */
  depth;
  /** Parts whose `change` blocks are running now: a value they set themselves fires no second round. */
  changing;
  constructor(run, registry2, now, limit = STEP_LIMIT) {
    this.registry = registry2;
    this.effects = [];
    this.added = [];
    this.running = /* @__PURE__ */ new Set();
    this.depth = 0;
    this.changing = /* @__PURE__ */ new Set();
    this.budget = limit;
    const copy = (r) => ({
      ...r,
      states: {
        ...r.states
      },
      timers: [
        ...r.timers
      ],
      ...r.values ? {
        values: {
          ...r.values
        }
      } : {},
      ...r.rows ? {
        rows: {
          ...r.rows
        }
      } : {}
    });
    this.run = {
      ...run,
      path: [
        ...run.path
      ],
      left: run.left.map(copy),
      runs: Object.fromEntries(Object.entries(run.runs).map(([id, r]) => [
        id,
        copy(r)
      ])),
      now: Math.max(run.now, now),
      ...run.kept ? {
        kept: Object.fromEntries(Object.entries(run.kept).map(([id, held]) => [
          id,
          {
            ...held
          }
        ]))
      } : {},
      ...run.keptRows ? {
        keptRows: Object.fromEntries(Object.entries(run.keptRows).map(([id, held]) => [
          id,
          {
            ...held
          }
        ]))
      } : {}
    };
    const here = this.here();
    for (const t of here.timers) if (t.kind === "wait") this.running.add(runKey(t.owner, t.block));
  }
  screen() {
    return this.run.screens[this.run.current];
  }
  here() {
    return this.run.runs[this.run.current];
  }
  look() {
    return lookOfScreen(this.run, this.registry, this.run.current);
  }
  /** The screen as it stands when an event comes: what every If is judged on (spec §4.3). */
  judge() {
    const screen = this.screen();
    const states = {
      ...this.here().states
    };
    const look = this.look();
    const values = {
      ...this.here().values
    };
    const value = (part) => valueIn(look, values, part);
    const read = (ref) => ref.screen === void 0 || ref.screen === this.run.current ? value(ref.part) : readRef(this.run, this.registry, ref, this.run.current)?.value;
    const fit = (part, v) => this.fitted(part, v);
    return (b) => ifHolds(screen, states, b, value, read, fit);
  }
  /** Every block of `owner` for `event` that `fits` fires, in order, judged on the state as it is now. */
  fire(owner, event, fits = () => true) {
    const screen = this.screen();
    const started = this.run.current;
    const holds2 = this.judge();
    const chosen2 = [];
    blocksOf(screen, owner).forEach((b, index) => {
      if (b.on.event !== event || !fits(b, index) || this.running.has(runKey(owner, index))) return;
      if (holds2(b)) chosen2.push({
        index,
        branch: "do"
      });
      else if (b.else) chosen2.push({
        index,
        branch: "else"
      });
    });
    for (const c of chosen2) {
      if (this.run.current !== started) return;
      this.continueBlock(owner, c.index, c.branch, 0);
    }
  }
  /**
   * Gesture spec §4.4: the follow part of every swipe block that fits `sw` (its If judged now, running
   * blocks left out), put on the states. Meant for a quiet copy: nothing appears, nothing waits.
   * The row is pressed first as the release presses it (the list's own swipe only), so an If that
   * reads the list's value judges the same in the follow as at the release.
   */
  preview(sw) {
    if (sw.hit !== void 0 && sw.hit === sw.owner) this.rowPress(sw.hit, sw.place);
    const holds2 = this.judge();
    const lists = [];
    blocksOf(this.screen(), sw.owner).forEach((b, index) => {
      if (!swipeFits(b, sw.owner, sw.dir, sw.hit, sw.place)) return;
      if (this.running.has(runKey(sw.owner, index))) return;
      const list = holds2(b) ? b.do : b.else;
      if (list) lists.push(followPart(list));
    });
    for (const list of lists) for (const a of list) this.act(a);
  }
  /** Gesture spec §4.1: a hold on a row, or the list's own swipe, makes it the list's pressed row first; no other value changes. */
  rowPress(id, place3) {
    const el2 = findById(this.look(), id)?.el;
    if (el2 && valueKind(el2) === "row" && typeof place3 === "number") this.setValue(id, place3);
  }
  /** One more action or timer of the block `block` of `owner`; past the limit the step gives up. */
  spend(owner, block) {
    if (--this.budget < 0) throw new RunLimitError(owner, block);
  }
  /** Runs the actions of a block from `from` on; a `wait` leaves a timer for the rest. */
  continueBlock(owner, block, branch, from) {
    if (this.depth >= NEST_LIMIT) throw new RunLimitError(owner, block);
    this.depth++;
    try {
      this.runActions(owner, block, branch, from);
    } finally {
      this.depth--;
    }
  }
  runActions(owner, block, branch, from) {
    const screen = this.screen();
    const started = this.run.current;
    const b = blocksOf(screen, owner)[block];
    const list = (branch === "do" ? b?.do : b?.else) ?? [];
    for (let i = from; i < list.length; i++) {
      const a = list[i];
      this.spend(owner, block);
      if (a.act === "wait") {
        this.here().timers.push({
          id: ++this.run.seq,
          at: this.run.now + a.ms,
          owner,
          block,
          kind: "wait",
          branch,
          next: i + 1
        });
        this.running.add(runKey(owner, block));
        return;
      }
      if (this.act(a) || this.run.current !== started) return;
    }
  }
  /** One action. Returns true when it left the screen itself (nothing after it runs). */
  act(a) {
    switch (a.act) {
      case "set":
        this.setState(a.box ?? SCREEN, a.state);
        return false;
      case "next": {
        const owner = a.box ?? SCREEN;
        const list = statesOf(this.screen(), a.box) ?? [];
        if (list.length === 0) return false;
        const at = list.findIndex((s) => s.id === (this.here().states[owner] ?? list[0].id));
        const next = list[(at + 1) % list.length];
        this.setState(owner, next.id);
        return false;
      }
      case "prev": {
        const owner = a.box ?? SCREEN;
        const list = statesOf(this.screen(), a.box) ?? [];
        if (list.length === 0) return false;
        const at = list.findIndex((s) => s.id === (this.here().states[owner] ?? list[0].id));
        this.setState(owner, list[(at - 1 + list.length) % list.length].id);
        return false;
      }
      case "reset": {
        const owner = a.box ?? SCREEN;
        const first = statesOf(this.screen(), a.box)?.[0];
        if (first) this.setState(owner, first.id);
        return false;
      }
      case "go":
        this.go(a.screen, a.motion ?? screenMotion(this.run.theme));
        return true;
      case "back":
        return this.back();
      case "value": {
        if (a.from === void 0) {
          this.setValue(a.part, this.fitted(a.part, a.to));
          return false;
        }
        const src = readRef(this.run, this.registry, a.from, this.run.current);
        const target = src && findById(this.look(), a.part)?.el;
        if (!src || !target) return false;
        if (isMirrorType(target.type)) this.setText(a.part, valueAsText(src.el, src.value));
        else this.setValue(a.part, this.fitted(a.part, src.value));
        return false;
      }
      case "wait":
        return false;
      case "add": {
        const src = readRef(this.run, this.registry, a.from, this.run.current);
        const rows2 = this.rowsNow(a.part);
        if (!src || !rows2) return false;
        const text18 = valueAsText(src.el, src.value);
        if (text18 === "") return false;
        this.setRows(a.part, [
          ...rows2,
          {
            text: text18
          }
        ]);
        this.added.push({
          screen: this.run.current,
          part: a.part,
          at: rows2.length
        });
        return false;
      }
      case "remove": {
        const rows2 = this.rowsNow(a.part);
        if (!rows2) return false;
        const pressed = valueIn(this.look(), this.here().values, a.part);
        const at = a.at ?? (typeof pressed === "number" ? pressed : -1);
        if (at < 0 || at >= rows2.length) return false;
        if (typeof pressed === "number" && this.here().values?.[a.part] === void 0) {
          this.hold(a.part, pressed);
        }
        this.setRows(a.part, rows2.filter((_r, i) => i !== at));
        if (typeof pressed === "number") {
          if (pressed === at) this.setValue(a.part, -1);
          else if (pressed > at) this.hold(a.part, pressed - 1);
        }
        return false;
      }
      case "play": {
        const look = this.look();
        const el2 = findById(look, a.part)?.el;
        if (!el2 || isHidden(look, a.part)) return false;
        const motion = soundEffect(a.motion, el2.type) ?? findEffect(DEFAULT_EFFECT).motion;
        this.effects.push({
          kind: "play",
          screen: this.run.current,
          part: a.part,
          motion
        });
        return false;
      }
    }
  }
  /** `value` as the part `id` can hold it: a slider puts a number in its min..max, on its step (PR-15 spec §3.4). */
  fitted(id, value) {
    const el2 = findById(this.look(), id)?.el;
    return el2?.type === "slider" && typeof value === "number" ? snapSlider(el2, value) : value;
  }
  /**
   * The part `id` holds `value` (spec §4.7): its look shows it, then its `change` blocks fire —
   * while it is shown, and not again from inside its own change blocks (they run once and stop).
   * Nothing happens for a part that holds no value, or a value of another type.
   */
  setValue(id, value) {
    const look = this.look();
    const before = valueIn(look, this.here().values, id);
    if (before === void 0 || before === value || typeof before !== typeof value) return;
    this.hold(id, value);
    this.fireChange(id);
  }
  /** The `change` blocks of `id` fire: while it is shown, and not again from inside its own change blocks. */
  fireChange(id) {
    if (this.run.quiet || isHidden(this.look(), id) || this.changing.has(id)) return;
    this.changing.add(id);
    try {
      this.fire(id, "change");
    } finally {
      this.changing.delete(id);
    }
  }
  /**
   * The slider `id` is dragged to `value` (spec §4): it holds it, snapped, and nothing fires. A
   * slider whose `max` is not above its `min` (spec §7) keeps what it holds.
   */
  slide(id, value) {
    const el2 = findById(this.look(), id)?.el;
    if (el2?.type !== "slider") return;
    const { min, max } = sliderNums(el2);
    if (!(max > min)) return;
    this.hold(id, snapSlider(el2, value));
  }
  /**
   * The finger left the slider `id` (spec §4): when it holds something else than `before` its change
   * blocks fire once; then, for a tap (`press`) and still on the same screen, the press blocks.
   */
  slideEnd(id, before, press) {
    const started = this.run.current;
    const now = valueIn(this.look(), this.here().values, id);
    if (typeof now === "number" && now !== before) this.fireChange(id);
    if (this.run.current !== started || !press) return;
    const to = pointerReceiver(this.screen(), id, "press");
    if (to !== void 0) this.fire(to, "press", (b) => b.on.at === void 0);
  }
  /** The part `id` holds `value` from now on, nothing fired: a kept part's value is the play's (values spec §4.4). */
  hold(id, value) {
    const here = this.here();
    here.values = {
      ...here.values,
      [id]: value
    };
    if (findById(this.screen().elements, id)?.el.keep === true) {
      const kept = this.run.kept ?? {};
      this.run.kept = {
        ...kept,
        [this.run.current]: {
          ...kept[this.run.current],
          [id]: value
        }
      };
    }
  }
  /**
   * The rows the list `id` holds now: as play has them, else as the screen's look (its states, not
   * its values) says. Undefined when `id` is no list with rows.
   */
  rowsNow(id) {
    const held = this.here().rows?.[id];
    if (held) return held;
    const el2 = findById(lookOf(this.screen(), this.here().states, this.registry), id)?.el;
    return el2 && valueKind(el2) === "row" ? rowsOf(el2) : void 0;
  }
  /** The list `id` holds `rows` from now on (values spec §11); a kept list's rows are the play's. Nothing fires. */
  setRows(id, rows2) {
    const here = this.here();
    here.rows = {
      ...here.rows,
      [id]: rows2
    };
    if (findById(this.screen().elements, id)?.el.keep === true) {
      const kept = this.run.keptRows ?? {};
      this.run.keptRows = {
        ...kept,
        [this.run.current]: {
          ...kept[this.run.current],
          [id]: rows2
        }
      };
    }
  }
  /** The on/off mark of row `row` of the list `id` turns over (values spec §11): that row's `checked` alone; the row is not pressed. */
  checkRow(id, row) {
    const rows2 = this.rowsNow(id);
    if (!rows2 || row < 0 || row >= rows2.length) return;
    this.setRows(id, rows2.map((r, i) => {
      if (i !== row) return r;
      const { checked: _old, ...rest } = r;
      return r.checked === true ? rest : {
        ...rest,
        checked: true
      };
    }));
  }
  /**
   * The text part `id` shows `text` from now on (values spec §4.3): a copy onto a text, button or
   * navbar. Kept with the screen's values under its id, though it is no part that holds a value:
   * nothing fires. An empty text takes the written text back. A mirrored part is left alone.
   */
  setText(id, text18) {
    const el2 = findById(this.look(), id)?.el;
    if (!el2 || !isMirrorType(el2.type) || el2.from) return;
    const here = this.here();
    here.values = {
      ...here.values,
      [id]: text18
    };
  }
  /** A press on a part that holds a value changes it (spec §4.7): a checkbox or toggle turns over, a tab is chosen. */
  pressValue(id, place3) {
    const look = this.look();
    const el2 = findById(look, id)?.el;
    if (!el2) return;
    const kind = valueKind(el2);
    if (kind === "boolean") this.setValue(id, valueIn(look, this.here().values, id) !== true);
    else if ((kind === "number" || kind === "row") && typeof place3 === "number") {
      this.setValue(id, place3);
    }
  }
  /** Puts `owner` into `state`; what comes into sight appears, what goes out of it stops waiting. */
  setState(owner, state) {
    const screen = this.screen();
    const list = statesOf(screen, owner === SCREEN ? void 0 : owner);
    if (!list?.some((s) => s.id === state)) return;
    const here = this.here();
    const before = here.states[owner] ?? list[0].id;
    if (before === state) return;
    const was = this.look();
    if (state === list[0].id) delete here.states[owner];
    else here.states[owner] = state;
    const now = this.look();
    this.effects.push({
      kind: "state",
      screen: this.run.current,
      owner,
      from: before === list[0].id ? void 0 : before,
      to: state === list[0].id ? void 0 : state
    });
    this.visibilityChanged(was, now);
  }
  /** Parts that came into sight appear (and start their `after`s); parts gone out of sight stop waiting. */
  visibilityChanged(was, now) {
    if (this.run.quiet) return;
    const screen = this.screen();
    const shownBefore = new Set(flatten(was).filter((l) => !isHidden(was, l.el.id)).map((l) => l.el.id));
    const shownNow = new Set(flatten(now).filter((l) => !isHidden(now, l.el.id)).map((l) => l.el.id));
    const here = this.here();
    for (const id of shownBefore) {
      if (!shownNow.has(id)) {
        here.timers = here.timers.filter((t) => !(t.kind === "after" && t.owner === id));
      }
    }
    const appeared = [
      ...shownNow
    ].filter((id) => !shownBefore.has(id));
    for (const id of appeared) this.scheduleAfter(id);
    const started = this.run.current;
    for (const id of appeared) {
      if (this.run.current !== started) return;
      if (hasEvent(screen, id, "appear")) this.fire(id, "appear");
    }
  }
  /** Leaves `after` timers for every such block of `owner`. */
  scheduleAfter(owner) {
    blocksOf(this.screen(), owner).forEach((b, block) => {
      if (b.on.event !== "after") return;
      this.here().timers.push({
        id: ++this.run.seq,
        at: this.run.now + (b.on.ms ?? 0),
        owner,
        block,
        kind: "after"
      });
    });
  }
  /** The screen `id` comes in fresh (spec §4.4); the screen left keeps nothing that waits. */
  go(id, motion) {
    if (!this.run.screens[id]) return;
    const from = this.run.current;
    this.leave();
    this.run.path.push(from);
    this.run.left.push(this.here());
    this.run.current = id;
    this.run.runs[id] = freshRun(motion);
    const seed = this.run.kept?.[id];
    if (seed && Object.keys(seed).length > 0) this.run.runs[id].values = {
      ...seed
    };
    const seedRows = this.run.keptRows?.[id];
    if (seedRows && Object.keys(seedRows).length > 0) this.run.runs[id].rows = {
      ...seedRows
    };
    this.effects.push({
      kind: "go",
      from,
      to: id,
      motion
    });
    this.arrive();
  }
  /** Back to the screen left last, as it was left; the one left now is forgotten. */
  back() {
    const to = this.run.path.pop();
    if (to === void 0) return false;
    const from = this.run.current;
    const motion = this.here().cameBy ?? screenMotion(this.run.theme);
    this.leave();
    const saved2 = this.run.left.pop();
    const seed = this.run.kept?.[to];
    if (seed && Object.keys(seed).length > 0) saved2.values = {
      ...saved2.values,
      ...seed
    };
    const seedRows = this.run.keptRows?.[to];
    if (seedRows && Object.keys(seedRows).length > 0) {
      saved2.rows = {
        ...saved2.rows,
        ...seedRows
      };
    }
    this.run.current = to;
    this.run.runs = {
      [to]: saved2
    };
    this.run.path.forEach((id, i) => this.run.runs[id] = this.run.left[i]);
    this.run.runs[to] = saved2;
    this.effects.push({
      kind: "back",
      from,
      to,
      motion
    });
    return true;
  }
  /** Whatever waits on the current screen is dropped (spec §4.4). */
  leave() {
    this.here().timers = [];
    this.running.clear();
  }
  /** The current screen was just shown fresh: appear fires and `after`s are set, for the screen and every shown part. */
  arrive() {
    if (this.run.quiet) return;
    const screen = this.screen();
    const look = this.look();
    const carriersAfter = shownCarriers(screen, look, "after");
    for (const id of carriersAfter) this.scheduleAfter(id);
    const started = this.run.current;
    for (const id of shownCarriers(screen, look, "appear")) {
      if (this.run.current !== started) return;
      this.fire(id, "appear");
    }
  }
  /**
   * Every owner of the current screen into the state `states` says (absent = its first state), and
   * every part back to what its look says.
   */
  restore(states) {
    const screen = this.screen();
    for (const owner of owners(screen)) {
      const list = statesOf(screen, owner === SCREEN ? void 0 : owner) ?? [];
      this.setState(owner, states[owner] ?? list[0]?.id ?? "");
    }
    delete this.here().values;
    delete this.here().rows;
    delete this.run.kept;
    delete this.run.keptRows;
  }
  /** Fires every timer of the current screen that is due, earliest first. */
  tick() {
    const started = this.run.current;
    for (; ; ) {
      const here = this.here();
      const due = here.timers.filter((t) => t.at <= this.run.now).sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!due) {
        return;
      }
      here.timers = here.timers.filter((t) => t.id !== due.id);
      this.spend(due.owner, due.block);
      if (due.kind === "after") this.fire(due.owner, "after", (_b, index) => index === due.block);
      else {
        this.running.delete(runKey(due.owner, due.block));
        this.continueBlock(due.owner, due.block, due.branch ?? "do", due.next ?? 0);
      }
      if (this.run.current !== started) return;
    }
  }
};
var stepped = (s) => ({
  run: s.run,
  effects: s.effects,
  ...s.added.length ? {
    rows: s.added
  } : {}
});
function startRun(screens, start, theme, registry2, now = 0, limit = STEP_LIMIT) {
  const run = {
    screens,
    current: start,
    path: [],
    left: [],
    runs: {
      [start]: freshRun()
    },
    theme,
    now,
    seq: 0
  };
  const s = new Stepper(run, registry2, now, limit);
  s.arrive();
  return stepped(s);
}
function step(run, event, now, registry2, limit = STEP_LIMIT) {
  const s = new Stepper(run, registry2, now, limit);
  s.tick();
  if (run.quiet) return stepped(s);
  const screen = s.run.screens[s.run.current];
  switch (event.kind) {
    case "tick":
      break;
    case "press": {
      const started = s.run.current;
      s.pressValue(event.id, event.place);
      if (s.run.current !== started) break;
      const to = pointerReceiver(screen, event.id, "press");
      if (to !== void 0) {
        s.fire(to, "press", (b) => {
          if (b.on.at === void 0) return true;
          return to === event.id && b.on.at === event.place;
        });
      }
      break;
    }
    case "enter":
    case "leave": {
      const to = pointerReceiver(screen, event.id, event.kind);
      if (to !== void 0) s.fire(to, event.kind);
      break;
    }
    case "key": {
      const to = keyReceiver(screen, currentLook(s.run, registry2), event.key);
      if (to !== void 0) s.fire(to, "key", (b) => b.on.key === event.key);
      break;
    }
    case "input":
      s.setValue(event.id, event.text);
      break;
    case "check":
      s.checkRow(event.id, event.row);
      break;
    case "slide":
      s.slide(event.id, event.value);
      break;
    case "slideEnd":
      s.slideEnd(event.id, event.before, event.press);
      break;
    case "hold": {
      const started = s.run.current;
      s.rowPress(event.id, event.place);
      if (s.run.current !== started) break;
      const to = pointerReceiver(screen, event.id, "hold");
      if (to !== void 0) {
        s.fire(to, "hold", (b) => (b.on.ms ?? HOLD_MS_DEFAULT) === event.ms && (b.on.at === void 0 || to === event.id && b.on.at === event.place));
      }
      break;
    }
    case "swipe": {
      const started = s.run.current;
      if (event.hit !== void 0 && event.hit === event.owner) s.rowPress(event.hit, event.place);
      if (s.run.current !== started) break;
      s.fire(event.owner, "swipe", (b) => swipeFits(b, event.owner, event.dir, event.hit, event.place));
      break;
    }
  }
  return stepped(s);
}
function tryBlock(screens, start, states, owner, block, theme, registry2, now = 0, limit = STEP_LIMIT) {
  const run = {
    screens,
    current: start,
    path: [],
    left: [],
    runs: {
      [start]: {
        states: {
          ...states
        },
        timers: []
      }
    },
    theme,
    now,
    seq: 0,
    quiet: true
  };
  const s = new Stepper(run, registry2, now, limit);
  s.continueBlock(owner, block, "do", 0);
  return stepped(s);
}
function restoreStates(run, states, now, registry2) {
  const s = new Stepper(run, registry2, now);
  s.restore(states);
  return stepped(s);
}
function nextDue(run) {
  const timers = run.runs[run.current]?.timers ?? [];
  return timers.length ? Math.min(...timers.map((t) => t.at)) : void 0;
}
function pending(run, now = run.now) {
  return [
    ...run.runs[run.current]?.timers ?? []
  ].sort((a, b) => a.at - b.at || a.id - b.id).map((t) => ({
    owner: t.owner,
    kind: t.kind,
    left: Math.max(0, t.at - now)
  }));
}
function standing(run) {
  const screen = run.screens[run.current];
  const states = run.runs[run.current]?.states ?? {};
  return owners(screen).map((owner) => {
    const list = statesOf(screen, owner === SCREEN ? void 0 : owner) ?? [];
    return {
      owner,
      state: states[owner] ?? list[0]?.id ?? ""
    };
  });
}
function swipePreview(run, swipe, registry2) {
  const s = new Stepper({
    ...run,
    quiet: true
  }, registry2, run.now);
  s.preview(swipe);
  return {
    ...s.run.runs[s.run.current].states
  };
}
function pressable(screen, el2) {
  if ([
    "button",
    "fab",
    "list",
    "tabbar",
    "tabs",
    "radio",
    "sidenav",
    "slider",
    "navbar",
    "checkbox",
    "toggle",
    "chip",
    "input"
  ].includes(el2.type)) {
    return true;
  }
  return el2.type !== GROUP_TYPE2 && (hasEvent(screen, el2.id, "press") || hasEvent(screen, el2.id, "hold"));
}

// src/editor/play-gesture.ts
var SWIPE_HALF = 0.5;
var SWIPE_FLICK = 0.5;
var SWIPE_WINDOW = 100;
function beginPress(hit, start, now = 0, holds2 = []) {
  return {
    mode: "pending",
    start,
    since: now,
    holds: hit ? holds2 : [],
    fired: [],
    ...hit ? {
      id: hit.id
    } : {},
    ...hit?.place !== void 0 ? {
      place: hit.place
    } : {},
    ...hit?.check !== void 0 ? {
      check: hit.check
    } : {}
  };
}
function holdsDue(g, now) {
  if (g.mode !== "pending" && g.mode !== "held" || g.id === void 0) {
    return {
      gesture: g,
      fire: []
    };
  }
  const fire = g.holds.filter((ms) => !g.fired.includes(ms) && now - g.since >= ms);
  if (fire.length === 0) return {
    gesture: g,
    fire
  };
  const place3 = g.mode === "pending" && g.check !== void 0 ? void 0 : g.place;
  return {
    gesture: {
      mode: "held",
      id: g.id,
      ...place3 !== void 0 ? {
        place: place3
      } : {},
      since: g.since,
      holds: g.holds,
      fired: [
        ...g.fired,
        ...fire
      ]
    },
    fire
  };
}
function alongOf(dir, start, point) {
  switch (dir) {
    case "up":
      return start.y - point.y;
    case "down":
      return point.y - start.y;
    case "left":
      return start.x - point.x;
    case "right":
      return point.x - start.x;
  }
}
function swipeProgress(along, distance) {
  return distance <= 0 ? 1 : Math.min(1, Math.max(0, along / distance));
}
function canSend(el2, scrolls, dir) {
  const axis = dir === "up" || dir === "down" ? "y" : "x";
  const at = scrollOf(scrolls, el2.id)[axis];
  return dir === "down" || dir === "right" ? at > 0 : at < scrollRange(el2)[axis];
}
function dragTarget(elements, scrolls, fromId, dir, takes) {
  const axis = dir === "up" || dir === "down" ? "y" : "x";
  const path = fromId === void 0 ? [] : pathTo(elements, fromId).reverse();
  for (const el2 of path) {
    if (scrollAxis(el2) === axis && canSend(el2, scrolls, dir)) {
      return {
        scroll: {
          box: el2.id,
          axis
        }
      };
    }
    if (takes(el2.id)) return {
      swipe: el2.id
    };
  }
  return takes(SCREEN) ? {
    swipe: SCREEN
  } : void 0;
}
function movePress(g, point, elements, scrolls, now = 0, takes) {
  if (g.mode === "moved" || g.mode === "held") return {
    gesture: g
  };
  if (g.mode === "scroll") {
    return {
      gesture: g,
      scroll: {
        box: g.box,
        axis: g.axis,
        to: sentTo(g, point)
      }
    };
  }
  if (g.mode === "swipe") {
    const along = alongOf(g.dir, g.start, point);
    const samples = [
      ...g.samples.filter((s) => now - s.t <= SWIPE_WINDOW),
      {
        t: now,
        along
      }
    ];
    return {
      gesture: {
        ...g,
        samples
      },
      swipe: {
        along
      }
    };
  }
  const dx = point.x - g.start.x;
  const dy = point.y - g.start.y;
  if (Math.hypot(dx, dy) < DRAG_SLOP) return {
    gesture: g
  };
  const dir = Math.abs(dx) >= Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down";
  const pick2 = dragTarget(elements, scrolls, g.id, dir, (owner) => takes?.(owner, dir) ?? false);
  if (pick2 && "scroll" in pick2 && g.id !== void 0) {
    const { box: box7, axis } = pick2.scroll;
    const next = {
      mode: "scroll",
      id: g.id,
      box: box7,
      axis,
      start: g.start,
      from: scrollOf(scrolls, box7)[axis]
    };
    return {
      gesture: next,
      scroll: {
        box: box7,
        axis,
        to: sentTo(next, point)
      }
    };
  }
  if (pick2 && "swipe" in pick2) {
    const along = alongOf(dir, g.start, point);
    return {
      gesture: {
        mode: "swipe",
        owner: pick2.swipe,
        ...g.id !== void 0 ? {
          hit: g.id
        } : {},
        ...g.place !== void 0 ? {
          place: g.place
        } : {},
        dir,
        start: g.start,
        samples: [
          {
            t: now,
            along
          }
        ]
      },
      swipe: {
        along
      }
    };
  }
  return {
    gesture: g.id === void 0 ? {
      mode: "moved"
    } : {
      mode: "moved",
      id: g.id
    }
  };
}
function sentTo(g, point) {
  return g.from + (g.start[g.axis] - point[g.axis]);
}
function swipeEnds(g, now, distance) {
  const last = g.samples[g.samples.length - 1];
  const recent = g.samples.filter((s) => now - s.t <= SWIPE_WINDOW);
  const a = recent[0];
  const b = recent[recent.length - 1];
  const speed = a && b && b.t > a.t ? (b.along - a.along) / (b.t - a.t) : 0;
  if (speed <= -SWIPE_FLICK) return "back";
  if (speed >= SWIPE_FLICK) return "complete";
  return swipeProgress(last?.along ?? 0, distance) >= SWIPE_HALF ? "complete" : "back";
}
function endPress(g) {
  if (g.mode !== "pending" || g.id === void 0) return void 0;
  return {
    id: g.id,
    ...g.place !== void 0 ? {
      place: g.place
    } : {},
    ...g.check !== void 0 ? {
      check: g.check
    } : {}
  };
}
var leaveClearsHover = (pointerType) => pointerType !== "touch";

// src/core/presets.ts
var snap = (v) => Math.round(v / 8) * 8;
var NONE = {
  fill: "none",
  border: "none",
  radius: 0
};
var two = (first, second, changes) => [
  {
    id: "closed",
    name: first
  },
  {
    id: "open",
    name: second,
    changes
  }
];
var backdrop = (d) => ({
  id: "backdrop",
  type: "rect",
  name: "Backdrop",
  x: 0,
  y: 0,
  w: d.w,
  h: d.h,
  style: {
    fill: "$text",
    border: "none",
    radius: 0,
    opacity: 0.3
  }
});
var rows = (w, top, texts) => texts.map((text18, i) => ({
  id: `row-${i + 1}`,
  type: "button",
  x: 8,
  y: top + i * 44,
  w: w - 16,
  h: 40,
  text: text18,
  variant: "ghost"
}));
var closes = [
  {
    on: {
      event: "press"
    },
    do: [
      {
        act: "reset",
        box: PRESET_SELF
      }
    ]
  }
];
var swipeCloses = [
  {
    on: {
      event: "swipe",
      dir: "down"
    },
    do: [
      {
        act: "reset",
        box: PRESET_SELF
      }
    ]
  }
];
var picks = (text18) => [
  {
    on: {
      event: "press"
    },
    do: [
      {
        act: "value",
        part: "field",
        to: text18
      },
      {
        act: "reset",
        box: PRESET_SELF
      }
    ]
  }
];
var toggles = [
  {
    on: {
      event: "press"
    },
    do: [
      {
        act: "next",
        box: PRESET_SELF
      }
    ]
  }
];
var rect = (name, element) => ({
  version: 1,
  type: "rect",
  name,
  element: {
    type: "rect",
    name,
    ...element
  }
});
function dialog(d) {
  const w = Math.min(d.w - 48, 400);
  return {
    id: "dialog",
    label: "Dialog",
    note: "\u6697\u5E55\u3068\u4E2D\u592E\u306E\u677F(\u984C\u3001\u672C\u6587\u3001\u30DC\u30BF\u30F3 2 \u3064)\u3002\u9589\u3058\u305F\u59FF / \u958B\u3044\u305F\u59FF",
    at: {
      x: 0,
      y: 0
    },
    preset: rect("Dialog", {
      hidden: true,
      w: d.w,
      h: d.h,
      style: NONE,
      // The whole box fades in; the panel grows a little as it comes.
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        [PRESET_SELF]: {
          hidden: false
        },
        panel: {
          motion: {
            name: "scale"
          }
        }
      }),
      children: [
        {
          ...backdrop(d),
          blocks: closes
        },
        {
          id: "panel",
          type: "rect",
          name: "Panel",
          x: snap((d.w - w) / 2),
          y: snap((d.h - 200) / 2),
          w,
          h: 200,
          props: {
            elevated: true
          },
          style: {
            radius: "lg"
          },
          children: [
            {
              id: "title",
              type: "text",
              x: 24,
              y: 24,
              w: w - 48,
              h: 24,
              text: "\u984C",
              style: {
                weight: "bold"
              }
            },
            {
              id: "body",
              type: "text",
              x: 24,
              y: 64,
              w: w - 48,
              h: 48,
              text: "\u672C\u6587"
            },
            {
              id: "cancel",
              type: "button",
              x: w - 224,
              y: 136,
              w: 96,
              h: 40,
              text: "\u30AD\u30E3\u30F3\u30BB\u30EB",
              variant: "ghost",
              blocks: closes
            },
            {
              id: "ok",
              type: "button",
              x: w - 120,
              y: 136,
              w: 96,
              h: 40,
              text: "OK",
              variant: "filled",
              blocks: closes
            }
          ]
        }
      ]
    })
  };
}
function sheet(d) {
  const w = Math.min(d.w, 480);
  const h2 = 208;
  return {
    id: "sheet",
    label: "Sheet",
    note: "\u6697\u5E55\u3068\u4E0B\u306E\u677F(\u984C\u3001\u884C 3 \u3064)\u3002\u9589\u3058\u305F\u59FF(\u677F\u306F\u4E0B\u306E\u5916)/ \u958B\u3044\u305F\u59FF\u3002\u677F\u3092 \u2193 \u306B\u30B9\u30EF\u30A4\u30D7\u3067\u9589\u3058\u308B",
    at: {
      x: 0,
      y: 0
    },
    preset: rect("Sheet", {
      hidden: true,
      w: d.w,
      h: d.h,
      style: NONE,
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        [PRESET_SELF]: {
          hidden: false
        },
        panel: {
          y: d.h - h2
        }
      }),
      children: [
        {
          ...backdrop(d),
          blocks: closes
        },
        {
          id: "panel",
          type: "rect",
          name: "Panel",
          x: snap((d.w - w) / 2),
          y: d.h,
          w,
          h: h2,
          style: {
            radius: "lg"
          },
          blocks: swipeCloses,
          children: [
            {
              id: "title",
              type: "text",
              x: 24,
              y: 20,
              w: w - 48,
              h: 24,
              text: "\u984C",
              style: {
                weight: "bold"
              }
            },
            ...rows(w, 60, [
              "\u9805\u76EE 1",
              "\u9805\u76EE 2",
              "\u9805\u76EE 3"
            ])
          ]
        }
      ]
    })
  };
}
function menu(d) {
  const w = 200;
  const h2 = 144;
  return {
    id: "menu",
    label: "Menu",
    note: "\u5C0F\u3055\u306A\u677F(\u884C 3 \u3064)\u3002\u9589\u3058\u305F\u59FF / \u958B\u3044\u305F\u59FF",
    at: {
      x: snap((d.w - w) / 2),
      y: snap((d.h - h2) / 2)
    },
    preset: rect("Menu", {
      hidden: true,
      w,
      h: h2,
      props: {
        elevated: true
      },
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        [PRESET_SELF]: {
          hidden: false,
          motion: {
            name: "slide-down",
            speed: "fast"
          }
        }
      }),
      children: rows(w, 8, [
        "\u9805\u76EE 1",
        "\u9805\u76EE 2",
        "\u9805\u76EE 3"
      ])
    })
  };
}
function notification(d) {
  const w = Math.min(d.w - 32, 400);
  const h2 = 72;
  return {
    id: "notification",
    label: "Notification",
    note: "\u4E0A\u306E\u5E2F(\u984C\u3001\u672C\u6587)\u3002\u96A0\u308C\u305F\u59FF(\u4E0A\u306E\u5916)/ \u51FA\u305F\u59FF",
    at: {
      x: snap((d.w - w) / 2),
      y: -h2
    },
    preset: rect("Notification", {
      w,
      h: h2,
      props: {
        elevated: true
      },
      states: [
        {
          id: "away",
          name: "\u96A0\u308C\u305F\u59FF"
        },
        {
          id: "shown",
          name: "\u51FA\u305F\u59FF",
          changes: {
            [PRESET_SELF]: {
              y: 16
            }
          }
        }
      ],
      // A press puts it away; the block that shows it writes the wait and the reset (SKILL.md).
      blocks: closes,
      children: [
        {
          id: "title",
          type: "text",
          x: 16,
          y: 12,
          w: w - 32,
          h: 24,
          text: "\u984C",
          style: {
            weight: "bold"
          }
        },
        {
          id: "body",
          type: "text",
          x: 16,
          y: 36,
          w: w - 32,
          h: 24,
          text: "\u672C\u6587",
          style: {
            color: "$muted"
          }
        }
      ]
    })
  };
}
function selectOpen(d) {
  const w = Math.min(d.w - 48, 280);
  const field2 = 56;
  const options = 144;
  return {
    id: "select-open",
    label: "Select (open)",
    note: "\u9078\u629E\u6B04\u3068\u9078\u629E\u80A2\u306E\u677F(\u884C 3 \u3064)\u3002\u9589\u3058\u305F\u59FF / \u958B\u3044\u305F\u59FF",
    at: {
      x: snap((d.w - w) / 2),
      y: snap((d.h - field2) / 2)
    },
    preset: rect("Select", {
      w,
      h: field2,
      style: NONE,
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        [PRESET_SELF]: {
          h: field2 + 4 + options
        },
        options: {
          hidden: false,
          motion: {
            name: "slide-down",
            speed: "fast"
          }
        }
      }),
      children: [
        {
          id: "field",
          type: "input",
          x: 0,
          y: 0,
          w,
          h: field2,
          text: "\u9078\u629E",
          props: {
            kind: "select"
          },
          blocks: toggles
        },
        {
          id: "options",
          type: "rect",
          name: "Options",
          hidden: true,
          x: 0,
          y: field2 + 4,
          w,
          h: options,
          props: {
            elevated: true
          },
          // An option writes its text into the field (a select field is not typed into in play).
          children: rows(w, 8, [
            "\u9078\u629E\u80A2 1",
            "\u9078\u629E\u80A2 2",
            "\u9078\u629E\u80A2 3"
          ]).map((r) => ({
            ...r,
            blocks: picks(r.text)
          }))
        }
      ]
    })
  };
}
function pager(d) {
  const w = Math.min(d.w, 480);
  const photo = 200;
  const h2 = photo + 40;
  const page = (n) => ({
    id: `page-${n}`,
    type: "image",
    x: (n - 1) * w,
    y: 0,
    w,
    h: photo,
    text: `\u5199\u771F ${n}`
  });
  const showing = (n) => ({
    "page-1": {
      x: (1 - n) * w
    },
    "page-2": {
      x: (2 - n) * w
    },
    "page-3": {
      x: (3 - n) * w
    },
    dots: {
      text: [
        "\u25CF \u25CB \u25CB",
        "\u25CB \u25CF \u25CB",
        "\u25CB \u25CB \u25CF"
      ][n - 1]
    }
  });
  const not = (state) => ({
    all: [
      {
        box: PRESET_SELF,
        state,
        not: true
      }
    ]
  });
  return {
    id: "pager",
    label: "Pager",
    content: true,
    note: "\u6A2A\u306B\u3081\u304F\u308B\u5199\u771F 3 \u679A\u3068\u70B9\u3002\u2190 \u3067\u6B21\u3001\u2192 \u3067\u524D(\u7AEF\u3067\u306F\u56DE\u3089\u306A\u3044)\u30021 \u679A\u76EE / 2 \u679A\u76EE / 3 \u679A\u76EE",
    at: {
      x: snap((d.w - w) / 2),
      y: 448
    },
    preset: rect("Pager", {
      w,
      h: h2,
      style: {
        fill: "$surface",
        border: "none"
      },
      states: [
        {
          id: "p1",
          name: "1 \u679A\u76EE"
        },
        {
          id: "p2",
          name: "2 \u679A\u76EE",
          changes: showing(2)
        },
        {
          id: "p3",
          name: "3 \u679A\u76EE",
          changes: showing(3)
        }
      ],
      blocks: [
        {
          on: {
            event: "swipe",
            dir: "left"
          },
          if: not("p3"),
          do: [
            {
              act: "next",
              box: PRESET_SELF
            }
          ]
        },
        {
          on: {
            event: "swipe",
            dir: "right"
          },
          if: not("p1"),
          do: [
            {
              act: "prev",
              box: PRESET_SELF
            }
          ]
        }
      ],
      children: [
        page(1),
        page(2),
        page(3),
        {
          id: "dots",
          type: "text",
          x: snap((w - 100) / 2),
          y: photo + 8,
          w: 100,
          h: 24,
          text: "\u25CF \u25CB \u25CB",
          style: {
            align: "center"
          }
        }
      ]
    })
  };
}
function refresh(d) {
  const w = Math.min(d.w, 480);
  const h2 = 320;
  const count = 8;
  return {
    id: "refresh",
    label: "Refresh",
    content: true,
    note: "\u9001\u308C\u308B\u4E00\u89A7\u3068\u66F4\u65B0\u306E\u5370\u3002\u4E00\u756A\u4E0A\u3067 \u2193 \u306B\u5F15\u3063\u3071\u308B\u3068 1 \u79D2\u66F4\u65B0\u3002\u5F85\u3061 / \u66F4\u65B0\u4E2D",
    at: {
      x: snap((d.w - w) / 2),
      y: 96
    },
    preset: rect("Refresh", {
      w,
      h: h2,
      style: {
        fill: "$bg",
        border: "none"
      },
      props: {
        scroll: "y"
      },
      states: [
        {
          id: "idle",
          name: "\u5F85\u3061"
        },
        {
          id: "refreshing",
          name: "\u66F4\u65B0\u4E2D",
          changes: {
            spinner: {
              hidden: false
            }
          }
        }
      ],
      // A downward swipe is the box's only while it is at the top (gesture spec §4.3).
      blocks: [
        {
          on: {
            event: "swipe",
            dir: "down"
          },
          do: [
            {
              act: "set",
              box: PRESET_SELF,
              state: "refreshing"
            },
            {
              act: "wait",
              ms: 1e3
            },
            {
              act: "reset",
              box: PRESET_SELF
            }
          ]
        }
      ],
      children: [
        {
          id: "spinner",
          type: "text",
          hidden: true,
          x: snap((w - 100) / 2),
          y: 8,
          w: 100,
          h: 24,
          text: "\u66F4\u65B0\u4E2D\u2026",
          style: {
            align: "center",
            color: "$muted"
          }
        },
        {
          id: "items",
          type: "list",
          x: 0,
          y: 40,
          w,
          h: count * 56,
          props: {
            items: Array.from({
              length: count
            }, (_, i) => ({
              text: `\u9805\u76EE ${i + 1}`
            }))
          }
        }
      ]
    })
  };
}
var TOAST_H = 48;
var TOAST_GAP = 16;
var floor8 = (v) => Math.floor(v / 8) * 8;
function toast(d) {
  const w = Math.min(d.w - 32, 400);
  return {
    id: "toast",
    label: "Toast",
    note: "\u4E0B\u306E\u9ED2\u3044\u5E2F(\u6587\u3068\u300C\u5143\u306B\u623B\u3059\u300D)\u3002\u96A0\u308C\u305F\u59FF / \u51FA\u305F\u59FF\u3002\u51FA\u3066\u304B\u3089 3 \u79D2\u3067\u6D88\u3048\u308B",
    at: {
      x: snap((d.w - w) / 2),
      y: floor8(d.h - TOAST_GAP - TOAST_H)
    },
    preset: rect("Toast", {
      hidden: true,
      w,
      h: TOAST_H,
      style: {
        fill: "$text",
        border: "none",
        radius: "md"
      },
      states: [
        {
          id: "away",
          name: "\u96A0\u308C\u305F\u59FF"
        },
        {
          id: "shown",
          name: "\u51FA\u305F\u59FF",
          changes: {
            [PRESET_SELF]: {
              hidden: false,
              motion: {
                name: "slide-up",
                speed: "fast"
              }
            }
          }
        }
      ],
      // It hides itself: the wait counts from when a state shows it (the box starts hidden).
      blocks: [
        {
          on: {
            event: "after",
            ms: 3e3
          },
          do: [
            {
              act: "reset",
              box: PRESET_SELF
            }
          ]
        }
      ],
      children: [
        {
          id: "text",
          type: "text",
          x: 16,
          y: 12,
          w: w - 136,
          h: 24,
          text: "\u4FDD\u5B58\u3057\u307E\u3057\u305F",
          style: {
            color: "$bg"
          }
        },
        {
          id: "undo",
          type: "button",
          x: w - 112,
          y: 6,
          w: 104,
          h: 36,
          text: "\u5143\u306B\u623B\u3059",
          variant: "ghost",
          style: {
            color: "#8AB4F8",
            weight: "bold"
          },
          blocks: closes
        }
      ]
    })
  };
}
function drawer(d) {
  const pw = Math.min(300, d.w - 64);
  const row = (n) => {
    const current = n === 1;
    return {
      id: `row-${n}`,
      type: "rect",
      name: `\u884C \u9805\u76EE ${n}`,
      x: 12,
      y: 208 + (n - 1) * 52,
      w: pw - 24,
      h: 48,
      style: NONE,
      blocks: closes,
      children: [
        ...current ? [
          {
            id: `row-${n}-mark`,
            type: "rect",
            name: "\u4ECA\u306E\u753B\u9762",
            x: 0,
            y: 0,
            w: pw - 24,
            h: 48,
            style: {
              fill: "$primary",
              border: "none",
              radius: "md",
              opacity: 0.12
            }
          }
        ] : [],
        {
          id: `row-${n}-icon`,
          type: "icon",
          x: 16,
          y: 12,
          w: 24,
          h: 24
        },
        {
          id: `row-${n}-text`,
          type: "text",
          x: 56,
          y: 12,
          w: pw - 24 - 72,
          h: 24,
          text: `\u9805\u76EE ${n}`,
          ...current ? {
            style: {
              weight: "bold",
              color: "$primary"
            }
          } : {}
        }
      ]
    };
  };
  return {
    id: "drawer",
    label: "Drawer",
    note: "\u6697\u5E55\u3068\u5DE6\u306E\u677F(\u9854\u5199\u771F\u3001\u540D\u524D\u3001\u884C 4 \u3064)\u3002\u9589\u3058\u305F\u59FF(\u677F\u306F\u5DE6\u306E\u5916)/ \u958B\u3044\u305F\u59FF",
    at: {
      x: 0,
      y: 0
    },
    preset: rect("Drawer", {
      hidden: true,
      w: d.w,
      h: d.h,
      style: NONE,
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        [PRESET_SELF]: {
          hidden: false
        },
        panel: {
          x: 0
        }
      }),
      children: [
        {
          ...backdrop(d),
          blocks: closes
        },
        {
          id: "panel",
          type: "rect",
          name: "Panel",
          x: -pw,
          y: 0,
          w: pw,
          h: d.h,
          props: {
            elevated: true
          },
          style: {
            fill: "$surface",
            border: "none",
            radius: 0
          },
          children: [
            {
              id: "avatar",
              type: "avatar",
              x: 24,
              y: 64,
              w: 56,
              h: 56,
              props: {
                online: true
              }
            },
            {
              id: "name",
              type: "text",
              x: 24,
              y: 132,
              w: pw - 48,
              h: 24,
              text: "\u540D\u524D",
              style: {
                weight: "bold"
              }
            },
            {
              id: "sub",
              type: "text",
              x: 24,
              y: 158,
              w: pw - 48,
              h: 20,
              text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
              style: {
                size: "sm",
                color: "$muted"
              }
            },
            {
              id: "divider",
              type: "divider",
              x: 0,
              y: 196,
              w: pw,
              h: 1
            },
            row(1),
            row(2),
            row(3),
            row(4)
          ]
        }
      ]
    })
  };
}
function accordion(d) {
  const w = Math.min(d.w, 480);
  const flat = {
    fill: "$bg",
    border: "none",
    radius: 0
  };
  const section = (n) => {
    const id = `section-${n}`;
    return {
      id,
      type: "rect",
      name: `\u898B\u51FA\u3057 ${n}`,
      h: "fit",
      style: flat,
      layout: {
        dir: "column",
        gap: 0,
        align: "stretch"
      },
      // Each section opens on its own (Design O: as many open as you like).
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        [`${id}-body`]: {
          hidden: false
        },
        [`${id}-mark`]: {
          text: "\u25B4"
        }
      }),
      children: [
        {
          id: `${id}-head`,
          type: "rect",
          name: `\u898B\u51FA\u3057 ${n} \u306E\u884C`,
          h: 56,
          style: flat,
          layout: {
            dir: "row",
            gap: 8,
            pad: [
              16,
              24
            ],
            align: "center"
          },
          blocks: [
            {
              on: {
                event: "press"
              },
              do: [
                {
                  act: "next",
                  box: id
                }
              ]
            }
          ],
          children: [
            {
              id: `${id}-title`,
              type: "text",
              w: "fill",
              h: 24,
              text: `\u898B\u51FA\u3057 ${n}`,
              style: {
                weight: "bold"
              }
            },
            {
              id: `${id}-mark`,
              type: "text",
              w: 24,
              h: 24,
              text: "\u25BE",
              style: {
                align: "right",
                color: "$muted"
              }
            }
          ]
        },
        {
          id: `${id}-body`,
          type: "rect",
          name: `\u898B\u51FA\u3057 ${n} \u306E\u4E2D\u8EAB`,
          hidden: true,
          h: 64,
          style: {
            fill: "$surface",
            border: "none",
            radius: 0
          },
          children: [
            {
              id: `${id}-text`,
              type: "text",
              x: 24,
              y: 8,
              w: w - 48,
              h: 48,
              text: "\u4E2D\u8EAB",
              style: {
                size: "sm",
                color: "$muted"
              }
            }
          ]
        },
        {
          id: `${id}-divider`,
          type: "divider",
          h: 1
        }
      ]
    };
  };
  return {
    id: "accordion",
    label: "Accordion",
    content: true,
    note: "\u898B\u51FA\u3057\u306E\u884C 3 \u3064\u3002\u884C\u3092\u62BC\u3059\u3068\u305D\u306E\u4E2D\u8EAB\u304C\u958B\u304F\u30FB\u9589\u3058\u308B(\u884C\u3054\u3068\u306B\u5225\u306B)\u3002\u958B\u304F\u3068\u4E0B\u304C\u4E0B\u304C\u308B",
    at: {
      x: snap((d.w - w) / 2),
      y: 96
    },
    // The box itself has no states: its sections carry them (the hover sample opens the first).
    preset: rect("Accordion", {
      w,
      h: "fit",
      style: flat,
      layout: {
        dir: "column",
        gap: 0,
        align: "stretch"
      },
      children: [
        section(1),
        section(2),
        section(3)
      ]
    })
  };
}
var ERROR_RED = "#E5484D";
var fieldW = (d) => Math.min(d.w - 48, 400);
function loading(d) {
  const w = Math.min(d.w, 480);
  const h2 = 192;
  const items = {
    id: "items",
    type: "list",
    hidden: true,
    h: h2,
    props: {
      leading: "avatar",
      rowHeight: 64,
      items: [
        1,
        2,
        3
      ].map((n) => ({
        text: `\u9805\u76EE ${n}`,
        sub: "\u8AAC\u660E"
      }))
    }
  };
  return {
    id: "loading",
    label: "Loading",
    content: true,
    note: "\u304F\u308B\u304F\u308B\u3068\u300C\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026\u300D\u30021.5 \u79D2\u3067\u4E00\u89A7\u306B\u5909\u308F\u308B\u3002\u8AAD\u307F\u8FBC\u307F\u4E2D / \u8868\u793A",
    at: {
      x: snap((d.w - w) / 2),
      y: 96
    },
    // Laid out, so the spinner, the line and the list follow the box's width in a column too.
    preset: rect("Loading", {
      w,
      h: h2,
      style: NONE,
      layout: {
        dir: "column",
        gap: 0,
        align: "stretch"
      },
      states: [
        {
          id: "loading",
          name: "\u8AAD\u307F\u8FBC\u307F\u4E2D"
        },
        {
          id: "loaded",
          name: "\u8868\u793A",
          changes: {
            wait: {
              hidden: true,
              motion: {
                name: "instant"
              }
            },
            items: {
              hidden: false,
              motion: {
                name: "fade"
              }
            }
          }
        }
      ],
      // Seen from the start, so the wait counts from when the screen shows.
      blocks: [
        {
          on: {
            event: "after",
            ms: 1500
          },
          do: [
            {
              act: "set",
              box: PRESET_SELF,
              state: "loaded"
            }
          ]
        }
      ],
      children: [
        // The list first: a hidden part sits where it would come in, so it shows at the box's top
        // in place (after the spinner box it would slide up as it fades in).
        items,
        {
          id: "wait",
          type: "rect",
          name: "\u304F\u308B\u304F\u308B",
          h: h2,
          style: NONE,
          layout: {
            dir: "column",
            gap: 12,
            align: "center",
            justify: "center"
          },
          children: [
            {
              id: "spinner",
              type: "progress",
              w: 32,
              h: 8,
              props: {
                kind: "spinner"
              }
            },
            {
              id: "wait-text",
              type: "text",
              w: "fill",
              h: 20,
              text: "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026",
              style: {
                align: "center",
                size: "sm",
                color: "$muted"
              }
            }
          ]
        }
      ]
    })
  };
}
function fieldError(d) {
  const w = fieldW(d);
  return {
    id: "field-error",
    label: "Field error",
    content: true,
    note: "\u5165\u529B\u6B04\u3068\u30DC\u30BF\u30F3\u3002@ \u304C\u7121\u3044\u307E\u307E\u62BC\u3059\u3068\u8D64\u3044\u67A0\u3068\u4E00\u6587\u3002\u6253\u3064\u3068\u6D88\u3048\u308B\u3002\u3075\u3064\u3046 / \u8AA4\u308A",
    at: {
      x: snap((d.w - w) / 2),
      y: 120
    },
    preset: rect("Field error", {
      w,
      h: "fit",
      style: NONE,
      layout: {
        dir: "column",
        gap: 16,
        align: "stretch"
      },
      states: [
        {
          id: "ok",
          name: "\u3075\u3064\u3046"
        },
        {
          id: "error",
          name: "\u8AA4\u308A",
          changes: {
            field: {
              style: {
                border: ERROR_RED
              }
            },
            "error-text": {
              hidden: false
            }
          }
        }
      ],
      children: [
        {
          id: "field-group",
          type: "group",
          name: "\u6B04\u3068\u4E00\u6587",
          // fit: a laid-out group otherwise keeps its first height, and the line would not push 次へ
          h: "fit",
          layout: {
            dir: "column",
            gap: 4,
            align: "stretch"
          },
          children: [
            {
              id: "field",
              type: "input",
              h: 56,
              text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
              props: {
                placeholder: "name@example.com"
              },
              blocks: [
                {
                  on: {
                    event: "change"
                  },
                  do: [
                    {
                      act: "reset",
                      box: PRESET_SELF
                    }
                  ]
                }
              ]
            },
            {
              id: "error-text",
              type: "text",
              hidden: true,
              h: 20,
              text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306E\u5F62\u304C\u9055\u3044\u307E\u3059(@ \u304C\u3042\u308A\u307E\u305B\u3093)",
              style: {
                size: "sm",
                color: ERROR_RED
              }
            }
          ]
        },
        {
          id: "next",
          type: "button",
          h: 52,
          text: "\u6B21\u3078",
          variant: "filled",
          blocks: [
            {
              on: {
                event: "press"
              },
              if: {
                all: [
                  {
                    part: "field",
                    has: "@"
                  }
                ]
              },
              do: [
                {
                  act: "reset",
                  box: PRESET_SELF
                }
              ],
              else: [
                {
                  act: "set",
                  box: PRESET_SELF,
                  state: "error"
                }
              ]
            }
          ]
        }
      ]
    })
  };
}
var WEEKDAYS = [
  "\u65E5",
  "\u6708",
  "\u706B",
  "\u6C34",
  "\u6728",
  "\u91D1",
  "\u571F"
];
function picker(d, o) {
  const w = fieldW(d);
  const field2 = {
    id: "field",
    type: "input",
    h: 56,
    text: o.field,
    props: {
      kind: "select",
      placeholder: o.placeholder
    },
    blocks: toggles
  };
  return {
    id: o.id,
    label: o.label,
    content: true,
    note: o.note,
    at: {
      x: snap((d.w - w) / 2),
      y: 120
    },
    preset: rect(o.label, {
      w,
      h: "fit",
      style: NONE,
      layout: {
        dir: "column",
        gap: 8,
        align: "stretch"
      },
      states: two("\u9589\u3058\u305F\u59FF", "\u958B\u3044\u305F\u59FF", {
        panel: {
          hidden: false,
          motion: {
            name: "fade"
          }
        }
      }),
      children: [
        field2,
        {
          id: "panel",
          type: "rect",
          name: o.panel,
          hidden: true,
          h: o.h,
          style: {
            fill: "$surface",
            border: "$border",
            radius: "md"
          },
          layout: {
            dir: "column",
            pad: 12,
            align: "stretch"
          },
          children: [
            o.inner
          ]
        }
      ]
    })
  };
}
var lane = (id, name, layout, children, h2) => ({
  id,
  type: "group",
  ...name ? {
    name
  } : {},
  ...h2 ? {
    h: h2
  } : {},
  layout,
  children
});
var ROW = {
  dir: "row",
  gap: 0
};
var COLUMN = (gap) => ({
  dir: "column",
  gap,
  align: "stretch"
});
function datePicker(d) {
  const cell = (week, col) => {
    const n = (week - 1) * 7 + col - 3;
    const id = `cell-${week}-${col}`;
    if (n < 1 || n > 31) return {
      id,
      type: "text",
      w: "fill",
      h: 36,
      text: ""
    };
    const today = n === 22;
    const day = {
      id: `day-${n}`,
      type: "button",
      w: 40,
      h: 36,
      text: String(n),
      variant: today ? "outline" : "ghost",
      ...today ? {
        style: {
          radius: 18
        }
      } : {},
      blocks: picks(`10\u6708${n}\u65E5(${WEEKDAYS[col]})`)
    };
    return {
      ...lane(id, void 0, {
        dir: "row",
        justify: "center"
      }, [
        day
      ], 36),
      w: "fill"
    };
  };
  const weeks = [
    1,
    2,
    3,
    4,
    5
  ].map((week) => lane(`week-${week}`, `${week} \u9031\u76EE`, ROW, WEEKDAYS.map((_, col) => cell(week, col)), 36));
  return picker(d, {
    id: "date-picker",
    label: "Date picker",
    note: "\u9078\u3076\u6B04\u3068\u3001\u305D\u306E\u4E0B\u306B\u958B\u304F\u6708\u306E\u65E5\u306E\u677F\u3002\u65E5\u3092\u62BC\u3059\u3068\u6B04\u306B\u5165\u3063\u3066\u9589\u3058\u308B\u3002\u9589\u3058\u305F\u59FF / \u958B\u3044\u305F\u59FF",
    field: "\u65E5\u4ED8",
    placeholder: "\u65E5\u4ED8\u3092\u9078\u3076",
    panel: "\u6708\u306E\u677F",
    h: 292,
    // Laid out by the panel's width: seven cells to a row, each day centred in its cell.
    inner: lane("cal", "\u6708", COLUMN(8), [
      lane("month-row", "\u6708\u3068\u9001\u308A", {
        dir: "row",
        justify: "between",
        align: "center"
      }, [
        {
          id: "month",
          type: "text",
          w: "fit",
          h: 28,
          text: "2026\u5E7410\u6708",
          style: {
            weight: "bold"
          }
        },
        {
          id: "month-nav",
          type: "text",
          w: 80,
          h: 28,
          text: "\u2039    \u203A",
          style: {
            align: "right",
            color: "$muted"
          }
        }
      ], 28),
      lane("weekdays", "\u66DC\u65E5", ROW, WEEKDAYS.map((text18, i) => ({
        id: `wd-${i}`,
        type: "text",
        w: "fill",
        h: 24,
        text: text18,
        style: {
          align: "center",
          size: "sm",
          color: "$muted"
        }
      })), 24),
      lane("weeks", "\u9031", COLUMN(4), weeks)
    ])
  });
}
function timePicker(d) {
  const time = (i) => {
    const text18 = `${11 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`;
    return {
      id: `time-${i + 1}`,
      type: "button",
      w: "fill",
      h: 40,
      text: text18,
      variant: "outline",
      blocks: picks(text18)
    };
  };
  const lines = [
    0,
    1,
    2,
    3,
    4
  ].map((r) => lane(`times-${r + 1}`, `${r + 1} \u6BB5\u76EE`, {
    dir: "row",
    gap: 8
  }, [
    0,
    1,
    2,
    3
  ].map((c) => time(r * 4 + c)), 40));
  return picker(d, {
    id: "time-picker",
    label: "Time picker",
    note: "\u9078\u3076\u6B04\u3068\u3001\u305D\u306E\u4E0B\u306B\u958B\u304F\u6642\u523B\u306E\u677F(11:00\u301C20:30)\u3002\u6642\u523B\u3092\u62BC\u3059\u3068\u6B04\u306B\u5165\u3063\u3066\u9589\u3058\u308B\u3002\u9589\u3058\u305F\u59FF / \u958B\u3044\u305F\u59FF",
    field: "\u6642\u523B",
    placeholder: "\u6642\u523B\u3092\u9078\u3076",
    panel: "\u6642\u523B\u306E\u677F",
    h: 256,
    // Laid out by the panel's width: four to a row, 8 apart.
    inner: lane("times", "\u6642\u523B", COLUMN(8), lines)
  });
}
var TIP_W = 220;
var TIP_H = 72;
function tooltip(d) {
  const shows = {
    hidden: false,
    motion: {
      name: "fade",
      speed: "fast"
    }
  };
  return {
    id: "tooltip",
    label: "Tooltip",
    // Content: the ⓘ is seen from the start (spec §3.5).
    content: true,
    note: "\u24D8 \u306B\u30DE\u30A6\u30B9\u3092\u4E57\u305B\u308B\u3068\u4E0A\u306B\u9ED2\u3044\u5439\u304D\u51FA\u3057\u3002\u5916\u3059\u3068\u6D88\u3048\u308B\u3002\u96A0\u308C\u305F\u59FF / \u51FA\u305F\u59FF",
    at: {
      x: snap((d.w - TIP_W) / 2),
      y: 120
    },
    preset: rect("Tooltip", {
      w: TIP_W,
      h: TIP_H,
      style: NONE,
      states: [
        {
          id: "away",
          name: "\u96A0\u308C\u305F\u59FF"
        },
        {
          id: "shown",
          name: "\u51FA\u305F\u59FF",
          changes: {
            bubble: {
              ...shows
            },
            arrow: {
              ...shows
            }
          }
        }
      ],
      children: [
        {
          id: "bubble",
          type: "rect",
          name: "\u5439\u304D\u51FA\u3057",
          hidden: true,
          x: 0,
          y: 0,
          w: TIP_W,
          h: 36,
          style: {
            fill: "$text",
            border: "none",
            radius: "sm"
          },
          children: [
            {
              id: "bubble-text",
              type: "text",
              x: 12,
              y: 8,
              w: 196,
              h: 20,
              text: "\u8AAC\u660E\u306E\u6587",
              style: {
                size: "sm",
                color: "$bg",
                align: "center"
              }
            }
          ]
        },
        {
          id: "arrow",
          type: "text",
          hidden: true,
          x: 102,
          y: 30,
          w: 16,
          h: 14,
          text: "\u25BC",
          style: {
            size: "sm",
            color: "$text",
            align: "center"
          }
        },
        {
          id: "trigger",
          type: "text",
          name: "\u24D8",
          x: 98,
          y: 48,
          w: 24,
          h: 24,
          text: "\u24D8",
          style: {
            color: "$muted",
            align: "center"
          },
          // The pointer on the ⓘ shows the bubble; off it, the box goes back to its first State.
          blocks: [
            {
              on: {
                event: "enter"
              },
              do: [
                {
                  act: "set",
                  box: PRESET_SELF,
                  state: "shown"
                }
              ]
            },
            {
              on: {
                event: "leave"
              },
              do: [
                {
                  act: "reset",
                  box: PRESET_SELF
                }
              ]
            }
          ]
        }
      ]
    })
  };
}
function builtinPresets(device) {
  return [
    dialog(device),
    sheet(device),
    menu(device),
    notification(device),
    selectOpen(device),
    pager(device),
    refresh(device),
    toast(device),
    drawer(device),
    accordion(device),
    loading(device),
    fieldError(device),
    datePicker(device),
    timePicker(device),
    tooltip(device)
  ];
}
function findBuiltinPreset(id, device) {
  return builtinPresets(device).find((p) => p.id === id);
}
function builtinAt(found, elements, device) {
  if (found.id !== "toast") return found.at;
  return {
    x: found.at.x,
    y: Math.max(0, floor8(rootBarTop(elements, device) - TOAST_GAP - TOAST_H))
  };
}

// src/core/image.ts
var IMAGE_MAX_BYTES = 5 * 1024 * 1024;
var IMAGE_LIMIT_TEXT = "png / jpg / webp\u30015 MB \u307E\u3067";
function startsWith(bytes, signature, at = 0) {
  return bytes.length >= at + signature.length && signature.every((b, i) => bytes[at + i] === b);
}
function detectImage(bytes) {
  if (startsWith(bytes, [
    137,
    80,
    78,
    71
  ])) return "png";
  if (startsWith(bytes, [
    255,
    216,
    255
  ])) return "jpeg";
  if (startsWith(bytes, [
    82,
    73,
    70,
    70
  ]) && startsWith(bytes, [
    87,
    69,
    66,
    80
  ], 8)) {
    return "webp";
  }
  return void 0;
}

// src/editor/net.ts
var host = globalThis;
var API_BASE = typeof host.WIREFRAME_API_BASE === "string" ? host.WIREFRAME_API_BASE : "";
var q = (pid) => pid ? `?proposal=${encodeURIComponent(pid)}` : "";
async function request(path, init = {}) {
  return await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers ?? {}
    }
  });
}
async function errorMessage(res) {
  try {
    const body = await res.json();
    return typeof body.error === "string" ? body.error : `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}
async function result(res, pick2) {
  const json = await res.json().catch(() => ({}));
  if (res.ok) return {
    ok: true,
    ...pick2(json)
  };
  return {
    ok: false,
    status: res.status,
    body: json
  };
}
var HttpError = class extends Error {
  status;
  constructor(message, status) {
    super(message), this.status = status;
  }
};
async function getProject(pid) {
  const res = await request(`${API_BASE}/api/project${q(pid)}`);
  if (!res.ok) throw new HttpError(await errorMessage(res), res.status);
  return await res.json();
}
async function getScreen(id, pid) {
  const res = await request(`${API_BASE}/api/screens/${encodeURIComponent(id)}${q(pid)}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return await res.json();
}
async function saveScreen(id, body, pid) {
  const res = await request(`${API_BASE}/api/screens/${encodeURIComponent(id)}${q(pid)}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  if (res.ok) {
    return {
      ok: true,
      hash: json.hash,
      projectHash: json.projectHash,
      changes: json.changes ?? []
    };
  }
  return {
    ok: false,
    status: res.status,
    body: json
  };
}
function createScreen(pid, body) {
  return request(`${API_BASE}/api/screens${q(pid)}`, {
    method: "POST",
    body: JSON.stringify(body)
  }).then((res) => result(res, (j) => ({
    id: String(j.id),
    hash: String(j.hash)
  })));
}
function deleteScreen(id, pid) {
  return request(`${API_BASE}/api/screens/${encodeURIComponent(id)}${q(pid)}`, {
    method: "DELETE"
  }).then((res) => result(res, () => ({})));
}
function addProposal(body) {
  return request(`${API_BASE}/api/proposals`, {
    method: "POST",
    body: JSON.stringify(body)
  }).then((res) => result(res, (j) => ({
    proposal: j.proposal
  })));
}
function removeProposal(id) {
  return request(`${API_BASE}/api/proposals/${encodeURIComponent(id)}`, {
    method: "DELETE"
  }).then((res) => result(res, () => ({})));
}
async function getTemplates() {
  const res = await request(`${API_BASE}/api/templates`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()).templates;
}
function saveTemplate(id, screen, overwrite) {
  return request(`${API_BASE}/api/templates/project/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      screen,
      overwrite
    })
  }).then((res) => result(res, (j) => ({
    id: String(j.id)
  })));
}
function deleteTemplate(id) {
  return request(`${API_BASE}/api/templates/project/${encodeURIComponent(id)}`, {
    method: "DELETE"
  }).then((res) => result(res, () => ({})));
}
function importReference(input) {
  const form = new FormData();
  form.set("file", input.file, input.fileName);
  form.set("title", input.title);
  form.set("note", input.note);
  if (input.screen) {
    form.set("screen", input.screen);
    if (input.proposal) form.set("proposal", input.proposal);
    if (input.screenTitle) form.set("screenTitle", input.screenTitle);
  }
  return fetch(`${API_BASE}/api/references`, {
    method: "POST",
    body: form
  }).then((res) => result(res, (j) => ({
    reference: j.reference
  })));
}
function deleteReference(id) {
  return request(`${API_BASE}/api/references/${encodeURIComponent(id)}`, {
    method: "DELETE"
  }).then((res) => result(res, () => ({})));
}
var componentPath = (type, name) => `${API_BASE}/api/components/${encodeURIComponent(type)}/${encodeURIComponent(name)}`;
async function getComponents() {
  const res = await request(`${API_BASE}/api/components`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()).components;
}
function saveComponent(type, name, element, overwrite) {
  return request(componentPath(type, name), {
    method: "PUT",
    body: JSON.stringify({
      element,
      overwrite
    })
  }).then((res) => result(res, (j) => ({
    file: String(j.file)
  })));
}
function componentUses(type, name) {
  return request(`${componentPath(type, name)}/uses`).then((res) => result(res, (j) => j));
}
function applyComponent(type, name, element) {
  return request(`${componentPath(type, name)}/apply`, {
    method: "POST",
    body: JSON.stringify({
      element
    })
  }).then((res) => result(res, (j) => j));
}
function renameComponent(type, from, to) {
  return request(`${componentPath(type, from)}/rename`, {
    method: "POST",
    body: JSON.stringify({
      to
    })
  }).then((res) => result(res, (j) => j));
}
function deleteComponent(type, name) {
  return request(componentPath(type, name), {
    method: "DELETE"
  }).then((res) => result(res, (j) => j));
}
var defaultPath = (type) => `${API_BASE}/api/defaults/${encodeURIComponent(type)}`;
async function getDefaults() {
  const res = await request(`${API_BASE}/api/defaults`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return await res.json();
}
async function getGuide() {
  const res = await request(`${API_BASE}/api/guide`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return await res.json();
}
function defaultUses(type) {
  return request(`${defaultPath(type)}/uses`).then((res) => result(res, (j) => ({
    ...j,
    mismatched: 0
  })));
}
function putDefault(type, part) {
  return request(defaultPath(type), {
    method: "PUT",
    body: JSON.stringify(part)
  }).then((res) => result(res, (j) => ({
    ...j,
    mismatched: 0
  })));
}
function deleteDefault(type) {
  return request(defaultPath(type), {
    method: "DELETE"
  }).then((res) => result(res, (j) => ({
    ...j,
    mismatched: 0
  })));
}
var motionPath = (name) => `${API_BASE}/api/motions/${encodeURIComponent(name)}`;
async function getMotions() {
  const res = await request(`${API_BASE}/api/motions`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()).motions;
}
function saveMotion(name, use, motion, overwrite) {
  return request(motionPath(name), {
    method: "PUT",
    body: JSON.stringify({
      use,
      motion,
      overwrite
    })
  }).then((res) => result(res, (j) => ({
    file: String(j.file)
  })));
}
function renameMotion(from, to) {
  return request(motionPath(from), {
    method: "PATCH",
    body: JSON.stringify({
      name: to
    })
  }).then((res) => result(res, () => ({})));
}
function deleteMotion(name) {
  return request(motionPath(name), {
    method: "DELETE"
  }).then((res) => result(res, () => ({})));
}
function connectWs(onMessage, onStatus) {
  if (host.WIREFRAME_NO_WS) {
    onStatus(true);
    return () => {
    };
  }
  const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;
  let ws;
  let closed = false;
  let retry;
  const open = () => {
    ws = new WebSocket(url);
    ws.onopen = () => onStatus(true);
    ws.onmessage = (e) => {
      let msg;
      try {
        msg = JSON.parse(String(e.data));
      } catch {
        return;
      }
      onMessage(msg);
    };
    ws.onclose = () => {
      onStatus(false);
      if (!closed) retry = setTimeout(open, 2e3);
    };
    ws.onerror = () => ws?.close();
  };
  open();
  const ping = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({
      type: "ping"
    }));
  }, 6e4);
  return () => {
    closed = true;
    clearTimeout(retry);
    clearInterval(ping);
    ws?.close();
  };
}

// src/core/saved-motions.ts
var USE_TEXT = {
  appear: "\u73FE\u308C\u308B\u30FB\u6D88\u3048\u308B",
  value: "\u5024\u304C\u5909\u308F\u308B",
  effect: "\u305D\u306E\u5834\u3067\u52D5\u304F"
};
function withLabel(m) {
  return {
    label: m.name,
    ...m.motion
  };
}

// src/core/block-edit.ts
var KINDS = [
  {
    value: "set",
    label: "\u306B\u3059\u308B"
  },
  {
    value: "next",
    label: "\u6B21\u306E State \u3078"
  },
  {
    value: "prev",
    label: "\u524D\u306E State \u3078"
  },
  {
    value: "reset",
    label: "\u6700\u521D\u306E State \u3078"
  },
  {
    value: "go",
    label: "\u3078\u79FB\u308B"
  },
  {
    value: "back",
    label: "\u524D\u306E\u753B\u9762\u3078\u623B\u308B"
  },
  {
    value: "wait",
    label: "\u5F85\u3064"
  },
  {
    value: "copy",
    label: "\u304B\u3089\u5199\u3059"
  },
  {
    value: "add",
    label: "\u304B\u3089\u884C\u3092\u8DB3\u3059"
  },
  {
    value: "remove",
    label: "\u3092\u6D88\u3059"
  },
  {
    value: "play",
    label: "\u3067\u52D5\u304B\u3059"
  }
];
var KEYS = [
  {
    value: "enter",
    label: "Enter"
  },
  {
    value: "escape",
    label: "Esc"
  }
];
var COMPARES = [
  {
    value: "is",
    label: "\u7B49\u3057\u3044"
  },
  {
    value: "same",
    label: "\u5225\u306E\u90E8\u54C1\u3068\u540C\u3058"
  },
  {
    value: "has",
    label: "\u542B\u3080"
  },
  {
    value: "length",
    label: "\u6587\u5B57\u6570"
  },
  {
    value: "number",
    label: "\u6570\u3068\u3057\u3066"
  }
];
var MATCHES = [
  {
    value: "all",
    label: "\u3059\u3079\u3066"
  },
  {
    value: "any",
    label: "\u3069\u308C\u304B"
  }
];
var DEFAULT_MS = 1e3;
function blocksAt(screen, owner) {
  if (owner === void 0) return screen.blocks ?? [];
  return findById(screen.elements, owner)?.el.blocks ?? [];
}
function withBlocks(screen, owner, blocks) {
  const put2 = (x) => {
    const { blocks: _old, ...rest } = x;
    return blocks.length > 0 ? {
      ...rest,
      blocks
    } : rest;
  };
  if (owner === void 0) return put2(screen);
  return {
    ...screen,
    elements: mapElement(screen.elements, owner, put2)
  };
}
function stateOwners(screen, label) {
  const boxes = flatten(screen.elements).filter((l) => (l.el.states?.length ?? 0) > 1).map((l) => ({
    value: l.el.id,
    label: label(l.el)
  }));
  const own = (screen.states?.length ?? 0) > 1 ? [
    {
      value: void 0,
      label: "\u753B\u9762"
    }
  ] : [];
  return [
    ...boxes,
    ...own
  ];
}
function valuedParts(screen, label) {
  return flatten(screen.elements).filter((l) => valueKind(l.el) !== void 0).map((l) => ({
    value: l.el.id,
    label: label(l.el)
  }));
}
function targetChoices(screen, label) {
  return [
    ...stateOwners(screen, label),
    ...valuedParts(screen, label)
  ];
}
function valued(screen, id) {
  const el2 = id === void 0 ? void 0 : findById(screen.elements, id)?.el;
  return el2 && valueKind(el2) !== void 0 ? el2 : void 0;
}
function rowLists(screen) {
  return flatten(screen.elements).filter((l) => valueKind(l.el) === "row").map((l) => l.el);
}
var rowList = (screen, id) => id === void 0 ? void 0 : rowLists(screen).find((el2) => el2.id === id);
function mirror(screen, id) {
  const el2 = id === void 0 ? void 0 : findById(screen.elements, id)?.el;
  return el2 && isMirrorType(el2.type) && !el2.from ? el2 : void 0;
}
function sourcesFor(screen, kept, target, anyKind = false) {
  const el2 = target === void 0 ? void 0 : findById(screen.elements, target)?.el;
  const kind = el2 && !anyKind ? valueKind(el2) : void 0;
  const fits = (type, rows2) => {
    const k = valueKindOf(type, rows2);
    return k !== void 0 && (kind === void 0 || k === kind);
  };
  const here = flatten(screen.elements).filter((l) => l.el.id !== target && fits(l.el.type, hasRows(l.el))).map((l) => ({
    ref: {
      part: l.el.id
    },
    el: l.el
  }));
  const there = kept.filter((k) => fits(k.type, hasRows(k.el))).map((k) => ({
    ref: {
      screen: k.screen,
      part: k.part
    },
    el: k.el,
    title: k.title
  }));
  return [
    ...here,
    ...there
  ];
}
function sourceChoices(place3, target, label, anyKind = false) {
  return sourcesFor(place3.screen, place3.kept ?? [], target, anyKind).map((s) => ({
    value: refKey(s.ref),
    label: s.title === void 0 ? label(s.el) : `${s.title} \u203A ${label(s.el)}`
  }));
}
function mirrorParts(place3, label) {
  const any = sourcesFor(place3.screen, place3.kept ?? [], void 0).length > 0;
  if (!any) return [];
  return flatten(place3.screen.elements).filter((l) => isMirrorType(l.el.type) && !l.el.from).map((l) => ({
    value: l.el.id,
    label: label(l.el)
  }));
}
function copyTargets(place3, label) {
  const mirrors = new Set(mirrorParts(place3, label).map((c) => c.value));
  return flatten(place3.screen.elements).filter((l) => mirrors.has(l.el.id) || valueKind(l.el) !== void 0 && sourcesFor(place3.screen, place3.kept ?? [], l.el.id).length > 0).map((l) => ({
    value: l.el.id,
    label: label(l.el)
  }));
}
function actionTargets(place3, label) {
  return [
    ...targetChoices(place3.screen, label),
    ...mirrorParts(place3, label)
  ];
}
function withSource(a, ref) {
  return a.act === "value" ? {
    act: "value",
    part: a.part,
    from: ref
  } : a;
}
function valueChoices(screen, id) {
  const el2 = valued(screen, id);
  if (!el2) return void 0;
  const kind = valueKind(el2);
  if (kind === "boolean") {
    return [
      true,
      false
    ].map((v) => ({
      value: v,
      label: valueText2(v)
    }));
  }
  if (kind === "number") {
    const items = Array.isArray(el2.props.items) ? el2.props.items.length : 0;
    return Array.from({
      length: items
    }, (_v, i) => ({
      value: i,
      label: CHOICE_TYPES.includes(el2.type) ? choiceLabel(el2, i) : valueText2(i)
    }));
  }
  if (kind === "row") {
    return [
      {
        value: -1,
        label: "\u306A\u3057"
      },
      ...rowsOf(el2).map((_r, i) => ({
        value: i,
        label: rowValueText(el2, i)
      }))
    ];
  }
  return void 0;
}
function removeAtChoices(el2) {
  return [
    {
      value: void 0,
      label: "\u62BC\u3057\u305F\u884C"
    },
    ...Array.from({
      length: rowCount(el2)
    }, (_v, i) => ({
      value: i,
      label: rowValueText(el2, i)
    }))
  ];
}
function startValue(el2) {
  const kind = valueKind(el2);
  if (kind === "boolean") return true;
  if (kind === "row") return -1;
  if (kind === "range") return sliderNums(el2).value;
  if (kind === "number") {
    const items = Array.isArray(el2.props.items) ? el2.props.items.length : 0;
    return items > 1 ? 1 : 0;
  }
  return "";
}
function keptValue(el2, v, from) {
  if (!from || valueKind(from) !== valueKind(el2)) return startValue(el2);
  if (el2.type === "slider") {
    const { min, max } = sliderNums(el2);
    return typeof v === "number" && v >= min && v <= max ? v : startValue(el2);
  }
  if (CHOICE_TYPES.includes(el2.type)) {
    const items = Array.isArray(el2.props.items) ? el2.props.items.length : 0;
    return typeof v === "number" && v >= 0 && v < items ? v : startValue(el2);
  }
  return typeof v === typeof initialValue(el2) ? v : startValue(el2);
}
function compareChoices(place3, part) {
  const el2 = valued(place3.screen, part);
  const input = el2?.type === "input";
  const any = sourcesFor(place3.screen, place3.kept ?? [], part).length > 0;
  return COMPARES.filter((c) => input || c.value === "is" || c.value === "same" || el2?.type === "slider" && c.value === "number").map((c) => ({
    ...c,
    enabled: c.value !== "same" || any
  }));
}
var START_RANGE = {
  min: 1
};
function withCompare(c, kind, place3) {
  if (compareOf(c)?.kind === kind) return c;
  const el2 = valued(place3.screen, c.part);
  if (!el2) return c;
  const not = c.not ? {
    not: true
  } : {};
  switch (kind) {
    case "is":
      return {
        part: c.part,
        is: startValue(el2),
        ...not
      };
    case "same": {
      const first = sourcesFor(place3.screen, place3.kept ?? [], c.part)[0];
      return first ? {
        part: c.part,
        is: first.ref,
        ...not
      } : c;
    }
    case "has":
      return {
        part: c.part,
        has: "",
        ...not
      };
    case "length":
      return {
        part: c.part,
        length: {
          ...START_RANGE
        },
        ...not
      };
    case "number":
      return {
        part: c.part,
        number: el2.type === "slider" ? {
          min: sliderNums(el2).value
        } : {
          ...START_RANGE
        },
        ...not
      };
  }
}
function rangeFrom(minText, maxText, kind) {
  const side = (text18) => {
    if (text18.trim() === "") return void 0;
    const v = Number(text18);
    const fine = kind === "length" ? Number.isInteger(v) && v >= 0 : Number.isFinite(v);
    return fine ? v : null;
  };
  const lo = side(minText);
  const hi = side(maxText);
  if (lo === null || hi === null) return void 0;
  if (lo === void 0 && hi === void 0) return void 0;
  if (lo !== void 0 && hi !== void 0 && lo > hi) return void 0;
  return {
    ...lo === void 0 ? {} : {
      min: lo
    },
    ...hi === void 0 ? {} : {
      max: hi
    }
  };
}
function stateChoices(screen, owner) {
  return (statesOf(screen, owner) ?? []).map((s) => ({
    value: s.id,
    label: s.name
  }));
}
function eventChoices(type, registry2, el2) {
  return EVENTS.filter((e) => canCarry(e.event, type, registry2, el2)).map((e) => ({
    value: e.event,
    label: e.label
  }));
}
function placeChoices(el2) {
  const anywhere = {
    value: void 0,
    label: "\u3069\u3053\u3067\u3082"
  };
  const count = (n) => Array.from({
    length: typeof n === "number" ? n : 0
  }, (_v, i) => ({
    value: i,
    label: placeLabel(el2, i)
  }));
  if (el2.type === "tabbar" || CHOICE_TYPES.includes(el2.type)) {
    const items = Array.isArray(el2.props.items) ? el2.props.items.length : 0;
    return [
      anywhere,
      ...count(items)
    ];
  }
  if (el2.type === "list") return [
    anywhere,
    ...count(rowCount(el2))
  ];
  if (el2.type === "table") return [
    anywhere,
    ...count(tableRows(el2).length)
  ];
  if (el2.type === "breadcrumb") return [
    anywhere,
    ...count(choiceItems(el2).length)
  ];
  if (el2.type === "navbar") {
    const side = (at) => ({
      value: at,
      label: placeLabel(el2, at)
    });
    return [
      anywhere,
      side("left"),
      side("right")
    ];
  }
  return void 0;
}
function placeLabel(el2, at) {
  if (typeof at === "number") {
    if (CHOICE_TYPES.includes(el2.type)) return choiceLabel(el2, at);
    if (el2.type === "table") {
      const first = tableRows(el2)[at]?.[0];
      return `${at + 1} \u884C\u76EE` + (first ? `\u300C${first}\u300D` : "");
    }
    if (el2.type === "breadcrumb") {
      const text19 = choiceItems(el2)[at];
      return `${at + 1} \u756A\u76EE` + (text19 === void 0 ? "" : `\u300C${text19}\u300D`);
    }
    if (el2.type !== "list") return `${at + 1} \u756A\u76EE`;
    const text18 = rowText(el2, at);
    return `${at + 1} \u884C\u76EE` + (text18 === void 0 ? "" : `\u300C${text18}\u300D`);
  }
  return at === "left" ? "\u5DE6" : at === "right" ? "\u53F3" : String(at);
}
function defaultTarget(screen, owner) {
  const stated = (el2) => (el2.states?.length ?? 0) > 1;
  if (owner !== void 0) {
    const self = findById(screen.elements, owner)?.el;
    const around = [
      ...pathTo(screen.elements, owner)
    ].reverse();
    const box7 = [
      ...self ? [
        self
      ] : [],
      ...around
    ].find(stated);
    if (box7) return {
      box: box7.id
    };
  }
  if (stated(screen)) return {};
  const first = flatten(screen.elements).find((l) => stated(l.el));
  return first ? {
    box: first.el.id
  } : void 0;
}
function laterState(screen, box7) {
  const list = statesOf(screen, box7) ?? [];
  return (list[1] ?? list[0])?.id ?? "";
}
function otherScreen(place3) {
  return place3.screens.find((id) => id !== place3.screen.id) ?? place3.screen.id;
}
function defaultAction(place3) {
  const target = defaultTarget(place3.screen, place3.owner);
  if (target) return {
    act: "next",
    ...target
  };
  if (place3.screens.some((id) => id !== place3.screen.id)) {
    return {
      act: "go",
      screen: otherScreen(place3)
    };
  }
  return {
    act: "back"
  };
}
function defaultCondition(place3) {
  const target = defaultTarget(place3.screen, place3.owner);
  if (target) return {
    ...target,
    state: laterState(place3.screen, target.box)
  };
  const part = valued(place3.screen, place3.owner) ?? valued(place3.screen, valuedParts(place3.screen, (el2) => el2.id)[0]?.value);
  return part ? {
    part: part.id,
    is: startValue(part)
  } : void 0;
}
function newBlock(place3) {
  return {
    on: {
      event: place3.owner === void 0 ? "appear" : "press"
    },
    do: [
      defaultAction(place3)
    ]
  };
}
var DIRS = SWIPE_DIRS.map((d) => ({
  value: d,
  label: SWIPE_ARROWS[d]
}));
var FOLLOW_HINT = "\u6307\u306B\u4ED8\u3044\u3066\u304F\u308B: \u52D5\u304B\u3057\u305F\u5206\u3060\u3051\u52D5\u304D\u3001\u534A\u5206\u3092\u8D8A\u3048\u3066\u96E2\u3059\u3068\u6700\u5F8C\u307E\u3067";
function withEvent(block, event) {
  const on = event === "after" ? {
    event,
    ms: DEFAULT_MS
  } : event === "hold" ? {
    event,
    ms: HOLD_MS_DEFAULT
  } : event === "swipe" ? {
    event,
    dir: "up"
  } : event === "key" ? {
    event,
    key: "enter"
  } : {
    event
  };
  return {
    ...block,
    on
  };
}
function withDir(block, dir) {
  return {
    ...block,
    on: {
      ...block.on,
      dir
    }
  };
}
function triggerParts(b, owner) {
  const ev = b.on.event;
  const out = {};
  if (ev === "swipe") out.dir = b.on.dir ?? "up";
  const places = owner && (ev === "press" || ev === "hold" || ev === "swipe") ? placeChoices(owner) : void 0;
  if (places) out.places = places;
  if (ev === "after") out.ms = {
    value: b.on.ms ?? 0,
    min: 0,
    max: BLOCK_MS_MAX
  };
  if (ev === "hold") {
    out.ms = {
      value: b.on.ms ?? HOLD_MS_DEFAULT,
      min: HOLD_MS_MIN,
      max: HOLD_MS_MAX
    };
  }
  if (ev === "key") out.key = b.on.key ?? "enter";
  if (ev === "swipe") out.hint = FOLLOW_HINT;
  return out;
}
function withPlace(block, at) {
  const { at: _old, ...on } = block.on;
  return {
    ...block,
    on: at === void 0 ? on : {
      ...on,
      at
    }
  };
}
function withTriggerMs(block, ms) {
  return {
    ...block,
    on: {
      ...block.on,
      ms
    }
  };
}
function withKey(block, key) {
  return {
    ...block,
    on: {
      ...block.on,
      key
    }
  };
}
function withMatch(block, word2) {
  if (!block.if) return block;
  return {
    ...block,
    if: {
      [word2]: conditionsOf(block)
    }
  };
}
var conditionsIn = (block, list) => ({
  ...block,
  if: block.if?.any ? {
    any: list
  } : {
    all: list
  }
});
function addCondition(block, place3) {
  const c = defaultCondition(place3);
  return c ? conditionsIn(block, [
    ...conditionsOf(block),
    c
  ]) : block;
}
function withCondition(block, i, c) {
  return conditionsIn(block, conditionsOf(block).map((x, n) => n === i ? c : x));
}
function removeCondition(block, i) {
  const rest = conditionsOf(block).filter((_c, n) => n !== i);
  if (rest.length > 0) return conditionsIn(block, rest);
  const { if: _if, else: _else, ...plain } = block;
  return plain;
}
function conditionOn(screen, c, who) {
  const not = c.not ? {
    not: true
  } : {};
  const part = valued(screen, who);
  if (part) {
    const cmp = isValueCondition(c) ? compareOf(c) : void 0;
    if (cmp && cmp.kind !== "is" && cmp.kind !== "same" && (part.type === "input" || part.type === "slider" && cmp.kind === "number")) {
      const { part: _old, ...rest } = c;
      return {
        part: part.id,
        ...rest
      };
    }
    const was = cmp?.kind === "is" ? cmp.value : void 0;
    const old = isValueCondition(c) ? valued(screen, c.part) : void 0;
    return {
      part: part.id,
      is: keptValue(part, was, old),
      ...not
    };
  }
  const state = isValueCondition(c) ? void 0 : c.state;
  const has2 = (statesOf(screen, who) ?? []).some((s) => s.id === state);
  return {
    ...who === void 0 ? {} : {
      box: who
    },
    state: has2 ? state : laterState(screen, who),
    ...not
  };
}
var actionsOf = (block, branch) => (branch === "do" ? block.do : block.else) ?? [];
function withActions(block, branch, list) {
  if (branch === "do") return {
    ...block,
    do: list
  };
  const { else: _old, ...rest } = block;
  return list.length > 0 ? {
    ...rest,
    else: list
  } : rest;
}
function addAction(block, branch, place3) {
  if (branch === "else" && !block.if) return block;
  const list = actionsOf(block, branch);
  const last = list[list.length - 1];
  const before = last !== void 0 && leavesScreen(last);
  const at = before ? list.length - 1 : list.length;
  let a = defaultAction(place3);
  if (before && leavesScreen(a)) a = {
    act: "wait",
    ms: DEFAULT_MS
  };
  return withActions(block, branch, [
    ...list.slice(0, at),
    a,
    ...list.slice(at)
  ]);
}
function withAction(block, branch, i, a) {
  return withActions(block, branch, actionsOf(block, branch).map((x, n) => n === i ? a : x));
}
function removeAction(block, branch, i) {
  const list = actionsOf(block, branch);
  if (branch === "do" && list.length <= 1) return block;
  return withActions(block, branch, list.filter((_a, n) => n !== i));
}
function playParts(screen, label) {
  return flatten(screen.elements).map((l) => ({
    value: l.el.id,
    label: label(l.el)
  }));
}
function effectChoices(type, saved2) {
  const bundled = EFFECTS.map((e) => ({
    key: e.name,
    label: e.label,
    note: e.note,
    motion: {
      name: e.name
    },
    mine: false
  }));
  const mine = saved2.filter((e) => e.saved?.use === "effect" && fitsType(withLabel(e.saved), type)).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0).map((e) => ({
    key: `mine:${e.name}`,
    label: e.name,
    motion: withLabel(e.saved),
    mine: true
  }));
  return [
    ...bundled,
    ...mine
  ];
}
function effectKey(m, choices) {
  return choices.find((c) => {
    if (!isStepMotion(c.motion)) return !isStepMotion(m) && m.name === c.key;
    return isStepMotion(m) && m.label === c.motion.label && sameMotion(m, c.motion);
  })?.key;
}
function kindOf(a) {
  return a.act === "value" ? a.from ? "copy" : "set" : a.act;
}
function kindChoices(place3, last, a) {
  const stated = defaultTarget(place3.screen, place3.owner) !== void 0;
  const values = valuedParts(place3.screen, (el2) => el2.id).length > 0;
  const copies = a?.act === "value" && copyTargets(place3, (el2) => el2.id).some((c) => c.value === a.part);
  const ontoText = a !== void 0 && kindOf(a) === "copy" && a.act === "value" && mirror(place3.screen, a.part) !== void 0;
  const lists = rowLists(place3.screen);
  const addable = lists.some((l) => sourcesFor(place3.screen, place3.kept ?? [], l.id, true).length > 0);
  return KINDS.map((k) => ({
    ...k,
    enabled: k.value === "go" || k.value === "back" ? last : k.value === "set" ? (stated || values) && !ontoText : k.value === "next" || k.value === "prev" || k.value === "reset" ? stated : k.value === "copy" ? copies : k.value === "add" ? addable : k.value === "remove" ? lists.length > 0 : k.value === "play" ? playParts(place3.screen, (el2) => el2.id).length > 0 : true
  }));
}
function asKind(a, kind, place3) {
  if (kindOf(a) === kind) return a;
  const named = a.act === "set" || a.act === "next" || a.act === "prev" || a.act === "reset";
  const playBox = a.act === "play" && (findById(place3.screen.elements, a.part)?.el.states?.length ?? 0) > 1 ? a.part : void 0;
  const fallback = defaultTarget(place3.screen, place3.owner);
  const target = named ? a.box === void 0 ? {} : {
    box: a.box
  } : playBox !== void 0 ? {
    box: playBox
  } : fallback ?? {};
  switch (kind) {
    case "copy": {
      const targets = copyTargets(place3, (el2) => el2.id).map((c) => c.value);
      const part = (a.act === "value" || a.act === "add" || a.act === "remove" || a.act === "play") && targets.includes(a.part) ? a.part : targets[0];
      const source = part === void 0 ? void 0 : sourcesFor(place3.screen, place3.kept ?? [], part)[0];
      return part === void 0 || source === void 0 ? a : {
        act: "value",
        part,
        from: source.ref
      };
    }
    case "set": {
      if (a.act === "value" && a.from || a.act === "play") {
        const part = valued(place3.screen, a.part);
        if (part) return {
          act: "value",
          part: part.id,
          to: startValue(part)
        };
      }
      if (!named && !fallback) {
        const part = valued(place3.screen, place3.owner) ?? valued(place3.screen, valuedParts(place3.screen, (el2) => el2.id)[0]?.value);
        if (part) return {
          act: "value",
          part: part.id,
          to: startValue(part)
        };
      }
      return {
        act: "set",
        ...target,
        state: laterState(place3.screen, target.box)
      };
    }
    case "next":
    case "prev":
    case "reset":
      return {
        act: kind,
        ...target
      };
    case "go":
      return {
        act: "go",
        screen: otherScreen(place3)
      };
    case "back":
      return {
        act: "back"
      };
    case "wait":
      return {
        act: "wait",
        ms: DEFAULT_MS
      };
    case "add":
    case "remove": {
      const lists = rowLists(place3.screen);
      const own = (a.act === "add" || a.act === "remove" || a.act === "value" || a.act === "play") && lists.some((l) => l.id === a.part);
      const part = own ? a.part : lists[0]?.id;
      if (part === void 0) return a;
      if (kind === "remove") return {
        act: "remove",
        part
      };
      const source = sourcesFor(place3.screen, place3.kept ?? [], part, true)[0];
      return source === void 0 ? a : {
        act: "add",
        part,
        from: source.ref
      };
    }
    case "play": {
      const parts = playParts(place3.screen, (el2) => el2.id).map((c) => c.value);
      const named2 = "part" in a ? a.part : "box" in a ? a.box : void 0;
      const part = [
        place3.owner,
        named2
      ].find((id) => id !== void 0 && parts.includes(id)) ?? parts[0];
      return part === void 0 ? a : {
        act: "play",
        part,
        motion: {
          name: DEFAULT_EFFECT
        }
      };
    }
  }
}
function sourceOf(screen, kept, ref) {
  if (!ref) return void 0;
  if (ref.screen === void 0) {
    const el2 = valued(screen, ref.part);
    return el2 ? {
      ref,
      el: el2
    } : void 0;
  }
  const k = kept.find((x) => x.screen === ref.screen && x.part === ref.part);
  return k ? {
    ref,
    el: k.el,
    title: k.title
  } : void 0;
}
function actionOn(screen, a, box7, kept = []) {
  if (a.act === "play") {
    const el2 = box7 === void 0 ? void 0 : findById(screen.elements, box7)?.el;
    if (!el2) return a;
    const motion = soundEffect(a.motion, el2.type) ? a.motion : {
      name: DEFAULT_EFFECT
    };
    return {
      act: "play",
      part: el2.id,
      motion
    };
  }
  const at = box7 === void 0 ? {} : {
    box: box7
  };
  const text18 = mirror(screen, box7);
  if (text18) {
    const source = sourcesFor(screen, kept, text18.id)[0];
    return source ? {
      act: "value",
      part: text18.id,
      from: source.ref
    } : a;
  }
  if (a.act === "add" || a.act === "remove") {
    const list = rowList(screen, box7);
    if (list) {
      if (a.act === "remove") return {
        act: "remove",
        part: list.id
      };
      const had = sourceOf(screen, kept, a.from);
      const keep = had && had.ref.part !== list.id;
      const source = keep ? had : sourcesFor(screen, kept, list.id, true)[0];
      return source ? {
        act: "add",
        part: list.id,
        from: source.ref
      } : {
        act: "remove",
        part: list.id
      };
    }
    return actionOn(screen, {
      act: "set",
      state: ""
    }, box7, kept);
  }
  if (a.act === "value" && a.from) {
    const part = valued(screen, box7);
    if (part) {
      const kind = valueKind(part);
      const had = sourceOf(screen, kept, a.from);
      const keep = had && had.ref.part !== part.id && valueKind(had.el) === kind;
      const source = keep ? had : sourcesFor(screen, kept, part.id)[0];
      return source ? {
        act: "value",
        part: part.id,
        from: source.ref
      } : {
        act: "value",
        part: part.id,
        to: startValue(part)
      };
    }
  }
  if (a.act === "set" || a.act === "value") {
    const part = valued(screen, box7);
    if (part) {
      return {
        act: "value",
        part: part.id,
        to: a.act === "value" ? keptValue(part, a.to, valued(screen, a.part)) : startValue(part)
      };
    }
    const state = a.act === "set" ? a.state : void 0;
    const has2 = (statesOf(screen, box7) ?? []).some((s) => s.id === state);
    return {
      act: "set",
      ...at,
      state: has2 ? state : laterState(screen, box7)
    };
  }
  if (a.act === "next" || a.act === "prev" || a.act === "reset") return {
    act: a.act,
    ...at
  };
  return a;
}
function moveAt(list, index, delta) {
  const to = index + delta;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return list;
  const out = [
    ...list
  ];
  [out[index], out[to]] = [
    out[to],
    out[index]
  ];
  return out;
}
function duplicateAt(list, index) {
  if (index < 0 || index >= list.length) return list;
  return [
    ...list.slice(0, index + 1),
    structuredClone(list[index]),
    ...list.slice(index + 1)
  ];
}
function removeAt(list, index) {
  return list.filter((_x, n) => n !== index);
}

// src/editor/geometry.ts
var GRID = 8;
var MIN_SIZE = 8;
var HANDLES = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w"
];
function sameRect(a, b) {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
function snap2(v, grid = GRID) {
  return grid > 0 ? Math.round(v / grid) * grid : v;
}
function moveRect(start, dx, dy, grid = GRID) {
  return {
    ...start,
    x: snap2(start.x + dx, grid),
    y: snap2(start.y + dy, grid)
  };
}
function resizeRect(start, handle, dx, dy, opts) {
  const grid = opts.grid ?? GRID;
  const min = opts.min ?? MIN_SIZE;
  let left = start.x;
  let top = start.y;
  let right = start.x + start.w;
  let bottom = start.y + start.h;
  if (handle.includes("w")) left = snap2(left + dx, grid);
  if (handle.includes("e")) right = snap2(right + dx, grid);
  if (handle.includes("n")) top = snap2(top + dy, grid);
  if (handle.includes("s")) bottom = snap2(bottom + dy, grid);
  if (right - left < min) {
    if (handle.includes("w")) left = right - min;
    else right = left + min;
  }
  if (bottom - top < min) {
    if (handle.includes("n")) top = bottom - min;
    else bottom = top + min;
  }
  return {
    x: left,
    y: top,
    w: right - left,
    h: bottom - top
  };
}
function handleCenters(r) {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return {
    nw: {
      x: r.x,
      y: r.y
    },
    n: {
      x: cx,
      y: r.y
    },
    ne: {
      x: r.x + r.w,
      y: r.y
    },
    e: {
      x: r.x + r.w,
      y: cy
    },
    se: {
      x: r.x + r.w,
      y: r.y + r.h
    },
    s: {
      x: cx,
      y: r.y + r.h
    },
    sw: {
      x: r.x,
      y: r.y + r.h
    },
    w: {
      x: r.x,
      y: cy
    }
  };
}
function shiftInto(r, area, free) {
  const axis = (pos, size, room, open) => (open ? Math.max(pos, 0) : size >= room ? 0 : Math.min(Math.max(pos, 0), room - size)) - pos;
  return {
    dx: axis(r.x, r.w, area.w, free === "x"),
    dy: axis(r.y, r.h, area.h, free === "y")
  };
}

// src/editor/state.ts
var HISTORY_LIMIT = 100;
var DUPLICATE_OFFSET = 16;
var same2 = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function createState(doc, baseHash, projectBaseHash) {
  return {
    doc,
    selection: [],
    history: [],
    future: [],
    baseHash,
    projectBaseHash,
    savedDoc: doc
  };
}
function written2(doc) {
  return doc.base ?? doc.screen;
}
function statedAt(s, found) {
  const screen = written2(s.doc);
  return builtinAt(found, screen.elements, deviceSize(screen.device));
}
function sameWritten(a, b) {
  return serialize(normalizeScreen(written2(a))) === serialize(normalizeScreen(written2(b)));
}
var saved = (doc) => ({
  screen: written2(doc),
  deviceExplicit: doc.deviceExplicit,
  project: doc.project
});
var canonical = (v) => JSON.stringify(v, (_key, value) => value !== null && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : value);
function isDirty(s) {
  return canonical(saved(s.doc)) !== canonical(saved(s.savedDoc));
}
function present(s, screen, editing) {
  const live = stateIndex(screen, editing) > 0 ? editing : void 0;
  const { base: _base, ...rest } = s.doc;
  const doc = live ? {
    ...rest,
    base: screen,
    screen: applyState(screen, live, registry)
  } : {
    ...rest,
    screen
  };
  const { editing: _editing, ...state } = s;
  return {
    ...state,
    doc,
    ...live ? {
      editing: live
    } : {},
    selection: keepExisting(doc, s.selection)
  };
}
function setEditing(s, editing) {
  return present(s, written2(s.doc), editing);
}
function keptEditing(open, read, editing) {
  return open.proposal === read.proposal && open.screen === read.screen ? editing : void 0;
}
function markSaved(s, baseHash, projectBaseHash, savedDoc = s.doc) {
  return {
    ...s,
    baseHash,
    projectBaseHash,
    savedDoc
  };
}
function beginEdit(s) {
  const history2 = [
    ...s.history,
    s.doc
  ].slice(-HISTORY_LIMIT);
  return {
    ...s,
    history: history2,
    future: []
  };
}
function undo(s) {
  if (s.history.length === 0) return s;
  const prev = s.history[s.history.length - 1];
  return present({
    ...s,
    doc: prev,
    history: s.history.slice(0, -1),
    future: [
      s.doc,
      ...s.future
    ]
  }, written2(prev), s.editing);
}
function redo(s) {
  if (s.future.length === 0) return s;
  const [next, ...rest] = s.future;
  return present({
    ...s,
    doc: next,
    history: [
      ...s.history,
      s.doc
    ],
    future: rest
  }, written2(next), s.editing);
}
function rollBack(s, before) {
  const { doc, selection, history: history2, future } = before;
  const { editing: _editing, ...rest } = s;
  return {
    ...rest,
    doc,
    selection,
    history: history2,
    future,
    ...before.editing ? {
      editing: before.editing
    } : {}
  };
}
function keepExisting(doc, selection) {
  const ids = new Set(allIds(doc.screen.elements));
  return selection.filter((id) => ids.has(id));
}
function select(s, ids) {
  return {
    ...s,
    selection: ids
  };
}
function toggleSelect(s, id) {
  return {
    ...s,
    selection: s.selection.includes(id) ? s.selection.filter((x) => x !== id) : [
      ...s.selection,
      id
    ]
  };
}
function selectedElements(s) {
  return s.selection.map((id) => findById(s.doc.screen.elements, id)?.el).filter((e) => e !== void 0);
}
function absoluteRect(s, id, scrolls) {
  const located = findById(s.doc.screen.elements, id);
  if (!located) return void 0;
  const { x, y } = absoluteOffset(s.doc.screen.elements, id, scrolls);
  return {
    x,
    y,
    w: located.el.w,
    h: located.el.h
  };
}
function withScreen(s, fn) {
  const shown2 = fn(s.doc.screen);
  const { elements: _elements, states: _states, ...own } = shown2;
  const base = reconcile({
    ...written2(s.doc),
    ...own
  }, shown2.elements, s.editing);
  return present(s, base, s.editing);
}
function withWritten(s, editing, fn) {
  return present(s, fn(written2(s.doc)), editing);
}
function addStateTo(s, owner) {
  const added = addState(written2(s.doc), owner);
  return added ? present(s, added.screen, {
    owner,
    state: added.state
  }) : s;
}
function removeStateFrom(s, owner, state) {
  return withWritten(s, s.editing, (screen) => removeState(screen, owner, state));
}
function renameStateOf(s, owner, state, name) {
  return withWritten(s, s.editing, (screen) => renameState(screen, owner, state, name));
}
function revertInState(s, id, keys) {
  const editing = s.editing;
  if (!editing) return s;
  return withWritten(s, editing, (screen) => revertChange(screen, editing, id, keys));
}
function setMotionIn(s, id, motion) {
  const editing = s.editing;
  if (!editing) return s;
  return withWritten(s, editing, (screen) => setMotion(screen, editing, id, motion));
}
function setMotionAt(s, at, id, motion) {
  return withWritten(s, s.editing, (screen) => setMotion(screen, at, id, motion));
}
function setBlocks(s, owner, fn) {
  return withWritten(s, s.editing, (screen) => withBlocks(screen, owner, fn(blocksAt(screen, owner))));
}
function setHidden(s, ids, hidden) {
  return ids.reduce((acc, id) => updateElement(acc, id, (el2) => {
    const { hidden: _old, ...rest } = el2;
    return hidden ? {
      ...rest,
      hidden: true
    } : rest;
  }), s);
}
function sourceOf2(s, id) {
  return sourceWithOffset(s, id)?.el;
}
function sourceWithOffset(s, id) {
  const owner = s.editing?.owner;
  const whole = s.doc.base !== void 0 && owner !== void 0 && pathTo(s.doc.base.elements, owner).some((e) => e.id === id);
  const elements = (whole ? s.doc.base : s.doc.screen).elements;
  const el2 = findById(elements, id)?.el;
  return el2 && {
    el: el2,
    abs: absoluteOffset(elements, id)
  };
}
function stateOnlyIds(s) {
  if (!s.doc.base) return /* @__PURE__ */ new Set();
  const shown2 = new Map(flatten(s.doc.screen.elements).map((l) => [
    l.el.id,
    l.el
  ]));
  return new Set(flatten(s.doc.base.elements).filter((l) => l.el.hidden === true && shown2.get(l.el.id)?.hidden !== true).map((l) => l.el.id));
}
function editedOutside(before, after) {
  const editing = after.editing;
  const owner = editing?.owner;
  if (owner === void 0 || !same2(before.editing, editing)) return false;
  const bare = (elements, el2) => {
    const { children: _children, states: _states, x: _x, y: _y, w, h: h2, ...rest } = el2;
    return el2.type === GROUP_TYPE2 ? rest : {
      ...rest,
      ...absoluteOffset(elements, el2.id),
      w,
      h: h2
    };
  };
  const outside2 = (state) => {
    const elements = state.doc.screen.elements;
    const inside = scopeIds(elements, owner);
    return flatten(elements).filter((l) => !inside.has(l.el.id)).map((l) => [
      l.parent,
      bare(elements, l.el)
    ]);
  };
  const placed = (state) => {
    const elements = written2(state.doc).elements;
    const inside = scopeIds(elements, owner);
    return new Map(flatten(elements).filter((l) => inside.has(l.el.id) && l.el.type !== GROUP_TYPE2).map((l) => [
      l.el.id,
      absoluteOffset(elements, l.el.id)
    ]));
  };
  const now = placed(after);
  const moved = [
    ...placed(before)
  ].some(([id, at]) => now.has(id) && !same2(at, now.get(id)));
  return moved || !same2(outside2(before), outside2(after));
}
function updateElement(s, id, fn) {
  return withScreen(s, (screen) => ({
    ...screen,
    elements: mapElement(screen.elements, id, fn)
  }));
}
function movingIds(elements, ids) {
  return topmostIds(elements, ids.filter((id) => !isLocked(elements, id)));
}
function rowDragIds(elements, selection, id) {
  const picked = selection.includes(id) ? selection : [
    id
  ];
  return picked.some((x) => isLocked(elements, x)) ? [] : topmostIds(elements, picked);
}
function moveBy(s, ids, dx, dy) {
  const moving = movingIds(s.doc.screen.elements, ids);
  const ordered = dx > 0 || dy > 0 ? [
    ...moving
  ].reverse() : moving;
  const staying = new Set(ids.filter((id) => !moving.includes(id)));
  return ordered.reduce((acc, id) => {
    const box7 = inLayout(acc.doc.screen.elements, id);
    if (box7) {
      const along = mainAxis(layoutOf(box7).dir) === "h" ? dy : dx;
      if (along === 0) return acc;
      const delta = along > 0 ? 1 : -1;
      const siblings = box7.children ?? [];
      const next = siblings[siblings.findIndex((c) => c.id === id) + delta];
      if (!next || staying.has(next.id)) {
        staying.add(id);
        return acc;
      }
      return withScreen(acc, (screen) => ({
        ...screen,
        elements: moveInSiblings(screen.elements, id, delta)
      }));
    }
    return updateElement(acc, id, (el2) => ({
      ...el2,
      x: el2.x + dx,
      y: el2.y + dy
    }));
  }, s);
}
function setRect(s, id, rect2) {
  return updateElement(s, id, (el2) => {
    const next = {
      ...el2,
      x: rect2.x,
      y: rect2.y,
      w: rect2.w,
      h: rect2.h
    };
    if (!el2.sizing) return next;
    const sizing = {
      ...el2.sizing
    };
    if (rect2.w !== el2.w) delete sizing.w;
    if (rect2.h !== el2.h) delete sizing.h;
    const { sizing: _old, ...rest } = next;
    return sizing.w || sizing.h ? {
      ...rest,
      sizing
    } : rest;
  });
}
function setLayout(s, id, dir) {
  return withWritten(s, s.editing, (screen) => {
    const box7 = findById(screen.elements, id)?.el;
    if (!box7) return screen;
    const had = layoutOf(box7);
    let next = screen;
    if (dir === "none") {
      if (!had) return screen;
      next = {
        ...screen,
        elements: unLayout(screen.elements, id)
      };
    } else if (had) {
      next = {
        ...screen,
        elements: mapElement(screen.elements, id, (el2) => ({
          ...el2,
          layout: {
            ...el2.layout,
            dir
          }
        }))
      };
    } else {
      const inside = new Set((box7.children ?? []).map((c) => c.id));
      next = dropPositionRows({
        ...screen,
        elements: toLayout(screen.elements, id, dir)
      }, inside);
    }
    return settleStated(next);
  });
}
function positionRowsOf(screen, ids, keys = [
  "x",
  "y"
]) {
  const wanted = new Set(ids);
  let n = 0;
  const count = (states) => {
    for (const st of states ?? []) {
      for (const [cid, row] of Object.entries(st.changes ?? {})) {
        if (wanted.has(cid) && keys.some((k) => row[k] !== void 0)) n++;
      }
    }
  };
  count(screen.states);
  for (const { el: el2 } of flatten(screen.elements)) count(el2.states);
  return n;
}
function positionRowsInside(screen, id) {
  return positionRowsOf(screen, (findById(screen.elements, id)?.el.children ?? []).map((c) => c.id));
}
function withoutLaidOutRows(s, ids, box7) {
  const el2 = findById(s.doc.screen.elements, box7)?.el;
  const L = el2 ? layoutOf(el2) : void 0;
  const across = L?.align === "stretch" ? crossAxis(L.dir) : void 0;
  if (positionRowsOf(written2(s.doc), ids, across ? [
    "x",
    "y",
    across
  ] : void 0) === 0) return s;
  return withWritten(s, s.editing, (screen) => dropPositionRows(screen, new Set(ids), across));
}
function setLayoutDetail(s, id, patch) {
  return updateElement(s, id, (el2) => {
    if (!el2.layout) return el2;
    const layout = {
      ...el2.layout
    };
    for (const [k, v] of Object.entries(patch)) {
      if (v === void 0) delete layout[k];
      else layout[k] = v;
    }
    return {
      ...el2,
      layout
    };
  });
}
function setSizing(s, id, axis, value) {
  return updateElement(s, id, (el2) => {
    const own = el2.sizing?.own ?? {
      w: el2.w,
      h: el2.h
    };
    const sizing = {
      ...el2.sizing ?? {
        own
      },
      own
    };
    if (typeof value === "number") delete sizing[axis];
    else sizing[axis] = value;
    const { sizing: _old, ...rest } = el2;
    const next = {
      ...rest,
      ...sizing.w || sizing.h ? {
        sizing
      } : {}
    };
    return typeof value === "number" ? {
      ...next,
      [axis]: value
    } : next;
  });
}
function setBoxSize(s, id, axis, value) {
  return setSizing(s, id, axis, value);
}
function setAbsRect(s, id, rect2) {
  const located = findById(s.doc.screen.elements, id);
  if (!located) return s;
  const origin = located.parent === void 0 ? {
    x: 0,
    y: 0
  } : absoluteOffset(s.doc.screen.elements, located.parent);
  return setRect(s, id, {
    ...rect2,
    x: rect2.x - origin.x,
    y: rect2.y - origin.y
  });
}
function framePosition(s, id) {
  const path = pathTo(s.doc.screen.elements, id);
  if (path.length === 0) return void 0;
  const pos = {
    x: 0,
    y: 0
  };
  for (let i = path.length - 1; i >= 0; i--) {
    if (i < path.length - 1 && path[i].type !== GROUP_TYPE2) break;
    pos.x += path[i].x;
    pos.y += path[i].y;
  }
  return pos;
}
function setFramePosition(s, id, pos) {
  const located = findById(s.doc.screen.elements, id);
  const now = framePosition(s, id);
  if (!located || !now) return s;
  const abs = absoluteOffset(s.doc.screen.elements, id);
  return setAbsRect(s, id, {
    x: abs.x - now.x + (pos.x ?? now.x),
    y: abs.y - now.y + (pos.y ?? now.y),
    w: located.el.w,
    h: located.el.h
  });
}
function setLocked(s, ids, locked) {
  return ids.reduce((acc, id) => updateElement(acc, id, (el2) => {
    const { locked: _old, ...rest } = el2;
    return locked ? {
      ...rest,
      locked: true
    } : rest;
  }), s);
}
function setText(s, id, text18) {
  return updateElement(s, id, (el2) => ({
    ...el2,
    text: text18
  }));
}
function setFrom(s, id, ref) {
  return updateElement(s, id, (el2) => {
    const { from: _old, ...rest } = el2;
    return ref ? {
      ...rest,
      from: ref
    } : rest;
  });
}
function setKeep(s, id, keep) {
  return updateElement(s, id, (el2) => {
    const { keep: _old, ...rest } = el2;
    return keep ? {
      ...rest,
      keep: true
    } : rest;
  });
}
function setName(s, id, name) {
  return updateElement(s, id, (el2) => {
    const { name: _old, ...rest } = el2;
    return name === void 0 || name === "" ? rest : {
      ...rest,
      name
    };
  });
}
function setProp(s, id, key, value) {
  return updateElement(s, id, (el2) => ({
    ...el2,
    props: {
      ...el2.props,
      [key]: value
    }
  }));
}
function editRows(s, id, fn) {
  return updateElement(s, id, (el2) => ({
    ...el2,
    props: {
      ...el2.props,
      items: fn(rowsOf(el2), el2)
    }
  }));
}
function setVariant(s, id, variant) {
  return updateElement(s, id, (el2) => {
    const { variant: _old, ...rest } = el2;
    return variant === void 0 ? rest : {
      ...rest,
      variant
    };
  });
}
function setStyle(s, id, key, value) {
  return updateElement(s, id, (el2) => {
    const style = {
      ...el2.style ?? {}
    };
    if (value === void 0) delete style[key];
    else style[key] = value;
    const { style: _old, ...rest } = el2;
    return Object.keys(style).length ? {
      ...rest,
      style
    } : rest;
  });
}
function nextId(s, type) {
  const ids = new Set(allIds(s.doc.screen.elements));
  for (let n = 1; ; n++) {
    const candidate = `${type}-${n}`;
    if (!ids.has(candidate)) return candidate;
  }
}
function place(s, screen, els) {
  const elements = [
    ...screen.elements,
    ...els
  ];
  const owner = s.editing?.owner;
  if (owner === void 0 || !findById(elements, owner)) return elements;
  return dropInto(elements, els.map((e) => e.id), owner, siblingIds(elements, owner).length);
}
var FAB_GAP = 24;
function fabSpot(s, size) {
  const elements = s.doc.screen.elements;
  const owner = s.editing?.owner;
  const box7 = owner === void 0 ? void 0 : findById(elements, owner)?.el;
  if (box7) {
    const at = absoluteOffset(elements, box7.id);
    return {
      x: Math.max(at.x, at.x + box7.w - FAB_GAP - size.w),
      y: Math.max(at.y, at.y + box7.h - FAB_GAP - size.h)
    };
  }
  const device = deviceSize(s.doc.screen.device);
  const bottom = rootBarTop(elements, device);
  return {
    x: Math.max(0, device.w - FAB_GAP - size.w),
    y: Math.max(0, bottom - FAB_GAP - size.h)
  };
}
function sidenavSpot(s) {
  const elements = s.doc.screen.elements;
  const owner = s.editing?.owner;
  const box7 = owner === void 0 ? void 0 : findById(elements, owner)?.el;
  return box7 ? absoluteOffset(elements, box7.id) : {
    x: 0,
    y: 0
  };
}
function addElement(s, type, registry2, at, defaults = NO_DEFAULTS) {
  const device = deviceSize(s.doc.screen.device);
  const id = nextId(s, type);
  const base = fillElement({
    id,
    type,
    x: 0,
    y: 0
  }, device, registry2, void 0, defaults);
  const spot = type === "fab" ? fabSpot(s, base) : type === "sidenav" ? sidenavSpot(s) : void 0;
  const x = spot ? spot.x : at ? snap2(at.x) : snap2((device.w - base.w) / 2);
  const y = spot ? spot.y : at ? snap2(at.y) : snap2((device.h - base.h) / 2);
  const el2 = {
    ...base,
    x,
    y
  };
  return select(withScreen(s, (screen) => ({
    ...screen,
    elements: place(s, screen, [
      el2
    ])
  })), [
    id
  ]);
}
function addPreset(s, preset, registry2, at, atRoot = false, link = true) {
  const device = deviceSize(s.doc.screen.device);
  const size = presetSize(preset, s, registry2);
  const x = snap2(at ? at.x : (device.w - size.w) / 2);
  const y = snap2(at ? at.y : (device.h - size.h) / 2);
  const raw = instantiatePreset(preset, allIds(s.doc.screen.elements), {
    x,
    y
  }, link);
  const el2 = fillElement(raw, device, registry2);
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: atRoot === "content" ? behindOverlays(screen.elements, el2) : atRoot ? [
      ...screen.elements,
      el2
    ] : place(s, screen, [
      el2
    ])
  }));
  return select(next, [
    el2.id
  ]);
}
function linkPreset(s, id, name) {
  return updateElement(s, id, (el2) => ({
    ...el2,
    set: name
  }));
}
function detachPreset(s, id, defaults, registry2) {
  return updateElement(s, id, (el2) => {
    const { set: _set, ...rest } = bakeDetached(el2, defaults, registry2);
    return rest;
  });
}
function resetItem(s, id, item, filled) {
  return updateElement(s, id, (el2) => {
    const out = {
      ...el2
    };
    const bag = out;
    const put2 = (o, k, v) => {
      if (v === void 0) delete o[k];
      else o[k] = v;
    };
    if (item === "w" || item === "h") out[item] = filled[item];
    else if (item === "text" || item === "variant") put2(bag, item, filled[item]);
    else if (item === "layout") put2(bag, "layout", filled.layout);
    else if (item.startsWith("props.")) {
      out.props = {
        ...out.props
      };
      put2(out.props, item.slice(6), filled.props[item.slice(6)]);
    } else if (item.startsWith("style.")) {
      const style = {
        ...out.style ?? {}
      };
      put2(style, item.slice(6), filled.style?.[item.slice(6)]);
      if (Object.keys(style).length) out.style = style;
      else delete out.style;
    }
    return out;
  });
}
function behindOverlays(elements, el2) {
  const i = elements.findIndex((e) => e.hidden === true);
  return i < 0 ? [
    ...elements,
    el2
  ] : [
    ...elements.slice(0, i),
    el2,
    ...elements.slice(i)
  ];
}
function presetSize(preset, s, registry2) {
  const probe = fillElement({
    ...preset.element,
    id: "_probe",
    x: 0,
    y: 0
  }, deviceSize(s.doc.screen.device), registry2);
  return {
    w: probe.w,
    h: probe.h
  };
}
function removeElements(s, ids) {
  if (ids.some((id) => isLocked(s.doc.screen.elements, id))) return s;
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: ids.reduce((els, id) => removeById(els, id), screen.elements)
  }));
  return {
    ...next,
    selection: next.selection.filter((id) => !ids.includes(id))
  };
}
function renameTree(el2, taken, shared) {
  const renamed = shared ?? /* @__PURE__ */ new Map();
  const rename = (e) => {
    const id = uniqueCopyId(e.id, taken);
    taken.add(id);
    renamed.set(e.id, id);
    const copy2 = {
      ...e,
      id
    };
    if (e.children) copy2.children = e.children.map(rename);
    return copy2;
  };
  const copy = remapStateIds(rename(el2), renamed);
  return shared ? copy : remapMirrorIds(remapBlockIds(copy, renamed), renamed);
}
function remapCopies(copies, renamed) {
  return copies.map((c) => remapMirrorIds(remapBlockIds(c, renamed), renamed));
}
function uniqueCopyId(id, taken) {
  const stem = id.replace(/-\d+$/, "");
  for (let n = 2; ; n++) {
    const candidate = `${stem}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}
function duplicate(s, ids) {
  const taken = new Set(allIds(s.doc.screen.elements));
  const renamed = /* @__PURE__ */ new Map();
  const made = [];
  for (const id of ids) {
    const elements = s.doc.screen.elements;
    const from = sourceOf2(s, id);
    if (!findById(elements, id) || !from) continue;
    if (s.editing !== void 0 && isHidden(elements, id)) continue;
    const { locked: _locked, ...source } = from;
    made.push({
      id,
      copy: renameTree({
        ...source,
        x: from.x + DUPLICATE_OFFSET,
        y: from.y + DUPLICATE_OFFSET
      }, taken, renamed)
    });
  }
  const copies = remapCopies(made.map((m) => m.copy), renamed);
  let next = s;
  made.forEach((m, i) => {
    const located = findById(next.doc.screen.elements, m.id);
    next = withScreen(next, (screen) => ({
      ...screen,
      elements: insertAt(screen.elements, located.parent, located.index + 1, copies[i])
    }));
  });
  return select(next, copies.map((c) => c.id));
}
function pruneBlocksIn(s, screenIds, only) {
  const screen = s.doc.screen;
  const states = screen.states ?? [];
  const { elements, dropped } = pruneBlocks(screen.elements, screenIds, only, states);
  const own = only === void 0 ? pruneScreenBlocks(screen.blocks, screen.elements, screenIds, states) : void 0;
  if (dropped.length === 0 && !own?.lost) return {
    state: s,
    dropped
  };
  let next = dropped.length ? withScreen(s, (shown2) => ({
    ...shown2,
    elements
  })) : s;
  if (own?.lost) {
    next = withWritten(next, next.editing, (base) => {
      const { blocks: _blocks, ...rest } = base;
      return own.blocks ? {
        ...rest,
        blocks: own.blocks
      } : rest;
    });
  }
  return {
    state: next,
    dropped: own?.lost ? [
      SCREEN,
      ...dropped
    ] : dropped
  };
}
function pruneMirrorsIn(s, screenIds, only) {
  const { elements, dropped } = pruneMirrors(s.doc.screen.elements, screenIds, only);
  if (dropped.length === 0) return {
    state: s,
    dropped
  };
  return {
    state: withScreen(s, (shown2) => ({
      ...shown2,
      elements
    })),
    dropped
  };
}
function appendRoot(s, els) {
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: place(s, screen, els)
  }));
  return select(next, els.map((e) => e.id));
}
function groupSelection(s) {
  const ids = s.selection;
  if (!canGroup(s.doc.screen.elements, ids)) return s;
  const id = nextId(s, GROUP_TYPE2);
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: groupElements(screen.elements, ids, id)
  }));
  return select(next, [
    id
  ]);
}
function ungroupSelection(s) {
  const { elements, released } = ungroupElements(s.doc.screen.elements, s.selection);
  if (released.length === 0) return s;
  return select(withScreen(s, (screen) => ({
    ...screen,
    elements
  })), released);
}
function moveInTree(s, ids, parent, index, registry2) {
  const elements = s.doc.screen.elements;
  const top = topmostIds(elements, ids);
  if (!canDrop(elements, top, parent, (t) => registry2.get(t)?.allowsChildren === true)) return s;
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: dropInto(screen.elements, top, parent, index)
  }));
  const box7 = parent === void 0 ? void 0 : findById(next.doc.screen.elements, parent)?.el;
  return select(box7 && layoutOf(box7) ? withoutLaidOutRows(next, top, box7.id) : next, top);
}
function dropInto(elements, ids, parent, index) {
  const { dx, dy } = dropShift(elements, ids, parent);
  const shifted = enteringParts(elements, ids, parent).reduce((els, id) => mapElement(els, id, (el2) => ({
    ...el2,
    x: el2.x + dx,
    y: el2.y + dy
  })), elements);
  const out = relocate(shifted, ids, parent, index);
  const target = parent === void 0 ? void 0 : findById(out, parent)?.el;
  if (target && layoutOf(target)) return out;
  const leaving2 = ids.filter((id) => inLayout(elements, id) !== void 0);
  return leaving2.reduce((els, id) => mapElement(els, id, (el2) => dropFill(el2)), out);
}
function dropOnCanvas(s, ids, target, registry2) {
  const elements = s.doc.screen.elements;
  const top = topmostIds(elements, ids);
  const entering2 = enteringParts(elements, top, target);
  if (entering2.length === 0) return s;
  if (!canDrop(elements, top, target, (t) => registry2.get(t)?.allowsChildren === true)) return s;
  return withScreen(s, (screen) => ({
    ...screen,
    elements: dropInto(screen.elements, entering2, target, siblingIds(screen.elements, target).length)
  }));
}
function slotInto(elements, ids, box7, index) {
  const target = findById(elements, box7)?.el;
  const L = target ? layoutOf(target) : void 0;
  const top = movingIds(elements, ids);
  if (!target || !L || top.length === 0 || pathTo(elements, box7).some((e) => top.includes(e.id))) {
    return {
      elements,
      moved: []
    };
  }
  const pos = L.dir === "column" ? "y" : "x";
  const other = pos === "y" ? "x" : "y";
  const seen = new Map(top.map((id) => [
    id,
    absoluteOffset(elements, id)
  ]));
  const moved = [
    ...top
  ].sort((a, b) => seen.get(a)[pos] - seen.get(b)[pos] || seen.get(a)[other] - seen.get(b)[other]);
  const siblings = target.children ?? [];
  const staying = siblings.filter((c) => !moved.includes(c.id));
  const at = index < staying.length ? siblings.indexOf(staying[index]) : siblings.length;
  return {
    elements: dropInto(elements, moved, box7, at),
    moved
  };
}
function moveToSlot(s, ids, box7, index) {
  const { moved } = slotInto(s.doc.screen.elements, ids, box7, index);
  if (moved.length === 0) return s;
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: slotInto(screen.elements, ids, box7, index).elements
  }));
  return withoutLaidOutRows(next, moved, box7);
}
function appendAtSlot(s, els, box7, index) {
  const ids = els.map((e) => e.id);
  const next = withScreen(s, (screen) => ({
    ...screen,
    elements: slotInto([
      ...screen.elements,
      ...els
    ], ids, box7, index).elements
  }));
  return select(withoutLaidOutRows(next, ids, box7), ids);
}
function liftOutOfLayouts(s, ids) {
  const elements = s.doc.screen.elements;
  const laidOut = movingIds(elements, ids).filter((id) => inLayout(elements, id) !== void 0);
  if (laidOut.length === 0) return s;
  return withScreen(s, (screen) => ({
    ...screen,
    elements: dropInto(screen.elements, laidOut, void 0, screen.elements.length)
  }));
}
function stackSelection(s, dir) {
  const elements = s.doc.screen.elements;
  const sel = keepExisting(s.doc, s.selection);
  if (!canWrap(elements, sel)) return s;
  const one = sel.length === 1 ? findById(elements, sel[0]).el : void 0;
  if (one && (one.type === "rect" || one.type === GROUP_TYPE2)) return setLayout(s, one.id, dir);
  const id = nextId(s, GROUP_TYPE2);
  const next = withWritten(s, s.editing, (screen) => settleStated(dropPositionRows({
    ...screen,
    elements: wrapInLayout(screen.elements, sel, id, dir)
  }, new Set(sel))));
  return select(next, [
    id
  ]);
}
function unstackSelection(s) {
  const elements = s.doc.screen.elements;
  if (s.selection.length !== 1) return s;
  const one = findById(elements, s.selection[0])?.el;
  if (!one || !layoutOf(one) || isLocked(elements, one.id)) return s;
  return setLayout(s, one.id, "none");
}
function frameIdAt(elements, id) {
  return id === void 0 ? void 0 : pathTo(elements, id).findLast((el2) => el2.type !== GROUP_TYPE2)?.id;
}
function enteringParts(elements, ids, parent) {
  const target = frameIdAt(elements, parent);
  return ids.filter((id) => {
    const located = findById(elements, id);
    return located !== void 0 && frameIdAt(elements, located.parent) !== target;
  });
}
function dropShift(elements, ids, parent) {
  const frameId = frameIdAt(elements, parent);
  const frame = frameId === void 0 ? void 0 : findById(elements, frameId)?.el;
  const rects = enteringParts(elements, ids, parent).map((id) => ({
    ...absoluteOffset(elements, id),
    w: findById(elements, id).el.w,
    h: findById(elements, id).el.h
  }));
  if (frame?.type !== "rect" || rects.length === 0) return {
    dx: 0,
    dy: 0
  };
  const origin = absoluteOffset(elements, frame.id);
  const left = Math.min(...rects.map((r) => r.x)) - origin.x;
  const top = Math.min(...rects.map((r) => r.y)) - origin.y;
  const right = Math.max(...rects.map((r) => r.x + r.w)) - origin.x;
  const bottom = Math.max(...rects.map((r) => r.y + r.h)) - origin.y;
  return shiftInto({
    x: left,
    y: top,
    w: right - left,
    h: bottom - top
  }, frame, scrollAxis(frame));
}
function reorder(s, id, delta) {
  if (isLocked(s.doc.screen.elements, id)) return s;
  return withScreen(s, (screen) => ({
    ...screen,
    elements: moveInSiblings(screen.elements, id, delta)
  }));
}
function setTheme(s, theme) {
  return {
    ...s,
    doc: {
      ...s.doc,
      project: {
        ...s.doc.project,
        theme
      }
    }
  };
}
function setDevice(s, device) {
  const doc = {
    ...s.doc,
    deviceExplicit: true,
    screen: {
      ...s.doc.screen,
      device
    }
  };
  if (s.doc.base) doc.base = {
    ...s.doc.base,
    device
  };
  return {
    ...s,
    doc
  };
}
function setTitle(s, title) {
  return withScreen(s, (screen) => ({
    ...screen,
    title
  }));
}
function toSaveBody(s) {
  const base = written2(s.doc);
  const screen = {
    ...base,
    device: s.doc.deviceExplicit ? base.device : void 0
  };
  const body = {
    screen,
    baseHash: s.baseHash
  };
  if (!same2(s.doc.project, s.savedDoc.project)) {
    body.project = s.doc.project;
    body.projectBaseHash = s.projectBaseHash;
  }
  return body;
}

// src/core/vnode.ts
var h = (tag, attrs = {}, ...children) => ({
  tag,
  attrs,
  children
});

// src/editor/visible.ts
function walkVisible(elements, visit, scrolls) {
  const walk = (list, ox, oy, clip) => {
    for (const e of list) {
      if (e.hidden === true) continue;
      const x = ox + e.x;
      const y = oy + e.y;
      const area = {
        left: Math.max(clip.left, x),
        top: Math.max(clip.top, y),
        right: Math.min(clip.right, x + e.w),
        bottom: Math.min(clip.bottom, y + e.h)
      };
      if (visit(e, area) && e.children) {
        const sent = scrollOf(scrolls, e.id);
        walk(e.children, x - sent.x, y - sent.y, e.type === GROUP_TYPE2 ? clip : area);
      }
    }
  };
  walk(elements, 0, 0, {
    left: -Infinity,
    top: -Infinity,
    right: Infinity,
    bottom: Infinity
  });
}
function visibleArea(elements, id, scrolls) {
  let rect2;
  let found = false;
  walkVisible(elements, (e, area) => {
    if (found) return false;
    if (e.id !== id) return true;
    found = true;
    if (area.left < area.right && area.top < area.bottom) {
      rect2 = {
        x: area.left,
        y: area.top,
        w: area.right - area.left,
        h: area.bottom - area.top
      };
    }
    return false;
  }, scrolls);
  return rect2;
}

// src/editor/dom.ts
function mount(node) {
  if (typeof node === "string") return document.createTextNode(node);
  const e = document.createElement(node.tag);
  for (const [k, v] of Object.entries(node.attrs)) e.setAttribute(k, v);
  for (const c of node.children) e.appendChild(mount(c));
  return e;
}
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === "boolean") {
      if (v) e.setAttribute(k, "");
    } else e.setAttribute(k, v);
  }
  for (const c of children) if (c !== null && c !== void 0 && c !== false) e.append(c);
  return e;
}
function tagged(node, guide) {
  node.setAttribute("data-guide", guide);
  return node;
}
function clear(node) {
  node.replaceChildren();
}

// src/editor/render.ts
function dragCopies(elements, ids, scrolls, at) {
  return ids.flatMap((id) => {
    const located = findById(elements, id);
    return located && !isHidden(elements, id) ? [
      {
        ...located.el,
        ...at?.get(id) ?? absoluteOffset(elements, id, scrolls)
      }
    ] : [];
  });
}
function scrollBar(elm, axis, sent, bar) {
  if (sent.at === void 0) return void 0;
  const elapsed = bar.now - sent.at;
  if (elapsed >= SCROLLBAR_HOLD + bar.fade) return void 0;
  const span = axis === "y" ? elm.h : elm.w;
  const reach = Math.max(span, contentExtent(elm, axis));
  if (reach <= span) return void 0;
  const length = Math.max(24, Math.round(span * span / reach));
  const start = Math.round((span - length) * (sent[axis] / (reach - span)));
  const place3 = axis === "y" ? `top:${start}px;height:${length}px;` : `left:${start}px;width:${length}px;`;
  return el("div", {
    class: `wf-scrollbar wf-scrollbar-${axis}`,
    style: `${place3}animation-duration:${bar.fade}ms;animation-delay:${SCROLLBAR_HOLD - elapsed}ms;`
  });
}
function handlesFor(elements, selection, id) {
  const located = findById(elements, id);
  if (selection.length !== 1 || located === void 0 || located.el.type === GROUP_TYPE2 || isLocked(elements, id) || isHidden(elements, id)) return [];
  const box7 = inLayout(elements, id);
  if (!box7) return HANDLES;
  const L = layoutOf(box7);
  const sized = (axis) => located.el.sizing?.[axis] !== "fill" && !(axis === crossAxis(L.dir) && L.align === "stretch");
  const w = sized("w");
  const h2 = sized("h");
  return HANDLES.filter((n) => n === "e" && w || n === "s" && h2 || n === "se" && w && h2);
}
function drawn(list) {
  return list.filter((e) => e.hidden !== true);
}
function renderElement(elm, registry2, inBorder = false, show, scrolls, bar) {
  const spec25 = registry2.get(elm.type);
  const classes = [
    "wf-el",
    `wf-type-${elm.type}`,
    spec25?.className?.(elm) ?? "",
    spec25 ? "" : "wf-unknown",
    elm.locked === true ? "is-locked" : "",
    inBorder ? "in-border" : ""
  ].filter(Boolean);
  const defaults = spec25?.box?.(elm) ?? {};
  const shown2 = show?.get(elm.id);
  const box7 = el("div", {
    class: classes.join(" "),
    "data-id": elm.id,
    style: (spec25?.innerBox ? frameStyle(elm, defaults) : boxStyle(elm, defaults)) + (shown2 ? presentationStyle(elm, defaults, shown2) : "")
  });
  const axis = scrollAxis(elm);
  const sent = scrollOf(scrolls, elm.id);
  const inside = axis === void 0 ? box7 : el("div", {
    class: "wf-scroll",
    style: `transform:translate(${-sent.x}px,${-sent.y}px);`
  });
  if (spec25) {
    for (const node of spec25.render(elm, h)) inside.appendChild(mount(node));
  } else {
    inside.appendChild(el("div", {
      class: "wf-unknown-label"
    }, elm.type));
  }
  if (elm.children) {
    const bordered = hasBorder(elm, defaults);
    for (const c of drawn(elm.children)) {
      inside.appendChild(renderElement(c, registry2, bordered, show, scrolls, bar));
    }
  }
  if (axis !== void 0) {
    box7.appendChild(inside);
    const node = bar ? scrollBar(elm, axis, sent, bar) : void 0;
    if (node) box7.appendChild(node);
  }
  return box7;
}
var place2 = (r, zoom) => `left:${r.x * zoom}px;top:${r.y * zoom}px;width:${r.w * zoom}px;height:${r.h * zoom}px;`;
function rowFrame(state, view) {
  if (!view.row) return void 0;
  const list = findById(state.doc.screen.elements, view.row.list)?.el;
  const r = absoluteRect(state, view.row.list, view.scrolls);
  if (!list || !r || view.row.index >= rowCount(list)) return void 0;
  const rowHeight = rowHeightOf(list);
  const top = r.y + view.row.index * rowHeight - scrollOf(view.scrolls, list.id).y;
  const y = Math.max(r.y, top);
  const bottom = Math.min(r.y + r.h, top + rowHeight);
  return bottom > y ? {
    x: r.x,
    y,
    w: r.w,
    h: bottom - y
  } : void 0;
}
function layoutOutlines(state, view) {
  if (view.playing || state.selection.length !== 1) return [];
  const id = state.selection[0];
  const elements = state.doc.screen.elements;
  const part = findById(elements, id)?.el;
  if (!part) return [];
  if (layoutOf(part)) {
    const origin = absoluteOffset(elements, id, view.scrolls);
    const sent = scrollOf(view.scrolls, id);
    const seen = visibleArea(elements, id, view.scrolls);
    if (!seen) return [];
    const clip = (r2) => {
      const x = Math.max(seen.x, r2.x + origin.x - sent.x);
      const y = Math.max(seen.y, r2.y + origin.y - sent.y);
      const right = Math.min(seen.x + seen.w, r2.x + origin.x - sent.x + r2.w);
      const bottom = Math.min(seen.y + seen.h, r2.y + origin.y - sent.y + r2.h);
      return right > x && bottom > y ? {
        x,
        y,
        w: right - x,
        h: bottom - y
      } : void 0;
    };
    const g = guidesOf(part);
    const out = [];
    const add = (kind, r2, text18) => {
      const rect2 = clip(r2);
      if (rect2) out.push({
        kind,
        id,
        rect: rect2,
        ...text18 !== void 0 ? {
          text: text18
        } : {}
      });
    };
    for (const r2 of g.bands) add("band", r2);
    for (const r2 of g.lines) add("line", r2);
    for (const l of g.labels) add("label", {
      x: l.x,
      y: l.y,
      w: 40,
      h: 16
    }, l.text);
    return out;
  }
  const box7 = inLayout(elements, id);
  if (!box7) return [];
  const r = absoluteRect(state, box7.id, view.scrolls);
  return r ? [
    {
      kind: "parent",
      id: box7.id,
      rect: r
    }
  ] : [];
}
function outlineNodes(state, view) {
  return [
    ...layoutOutlines(state, view),
    ...view.outlines
  ].flatMap((o) => {
    const r = absoluteRect(state, o.id, view.scrolls);
    if (!r) return [];
    return [
      el("div", {
        class: `wf-outline wf-outline-${o.kind}`,
        "data-outline": o.id,
        style: place2(o.rect ?? r, view.zoom)
      }, ...o.text !== void 0 ? [
        o.text
      ] : [])
    ];
  });
}
function showOutlines(root, state, view, outlines) {
  view.outlines = outlines;
  const overlay = root.querySelector(".wf-overlay");
  if (!overlay) return;
  for (const old of overlay.querySelectorAll(".wf-outline")) old.remove();
  for (const node of outlineNodes(state, view)) overlay.appendChild(node);
}
function renderCanvas(root, state, view, registry2, themes) {
  clear(root);
  const device = deviceSize(state.doc.screen.device);
  const theme = themeOrDefault(themes, state.doc.project.theme);
  const vars = Object.entries(themeCssVars(theme)).map(([k, v]) => `${k}:${v}`).join(";");
  const spin = `--wf-spin:-${Math.round(performance.now() % SPIN_MS)}ms;`;
  const frame = el("div", {
    class: "wf-frame",
    style: `width:${device.w}px;height:${device.h}px;transform:scale(${view.zoom});${vars};${spin}`
  });
  const playing = view.playing;
  view.scrolls = clampScrolls(state.doc.screen.elements, view.scrolls);
  const scrolls = playing ? playing.scrolls : view.scrolls;
  const bar = {
    now: performance.now(),
    fade: themeTone(theme).speed.fast
  };
  for (const e of drawn(playing?.elements ?? state.doc.screen.elements)) {
    frame.appendChild(renderElement(e, registry2, false, playing?.show, scrolls, bar));
  }
  if (playing?.screen) {
    const p = playing.screen;
    const cx = (1 - p.scale) * device.w / 2;
    const cy = (1 - p.scale) * device.h / 2;
    frame.style.transform += ` translate(${p.dx + cx}px,${p.dy + cy}px) scale(${p.scale})`;
    frame.style.opacity = String(p.opacity);
  }
  let under;
  if (playing?.under) {
    under = el("div", {
      class: "wf-frame wf-under",
      style: `width:${device.w}px;height:${device.h}px;transform:scale(${view.zoom});${vars};${spin}`
    });
    for (const e of drawn(playing.under.elements)) {
      under.appendChild(renderElement(e, registry2, false, playing.under.show, playing.under.scrolls, bar));
    }
  }
  if (view.linked) {
    for (const id of view.linked.ids) {
      frame.querySelector(`.wf-el[data-id="${CSS.escape(id)}"]`)?.classList.add("is-linked");
    }
  }
  const copies = playing ? [] : dragCopies(state.doc.screen.elements, view.dragged, view.scrolls, view.draggedAt);
  if (copies.length) {
    for (const id of view.dragged) {
      frame.querySelector(`.wf-el[data-id="${id}"]`)?.classList.add("is-dragged");
    }
    const layer = el("div", {
      class: "wf-drag-layer"
    });
    for (const c of copies) {
      const node = renderElement(c, registry2);
      for (const n of [
        node,
        ...node.querySelectorAll("[data-id]")
      ]) n.removeAttribute("data-id");
      layer.appendChild(node);
    }
    frame.appendChild(layer);
  }
  const overlay = el("div", {
    class: "wf-overlay",
    style: vars
  });
  const elements = state.doc.screen.elements;
  if (playing?.ghost) {
    overlay.appendChild(el("div", {
      class: "wf-ghost",
      style: place2(playing.ghost, view.zoom)
    }));
  }
  if (playing?.note) {
    const r = playing.note.rect;
    overlay.appendChild(el("div", {
      class: "wf-play-note",
      style: `left:${(r.x + r.w) * view.zoom}px;top:${r.y * view.zoom}px;`
    }, playing.note.text));
  }
  if (view.linked?.name !== void 0 && !playing) {
    const name = view.linked.name;
    for (const id of view.linked.ids) {
      const r = absoluteRect(state, id, view.scrolls);
      if (!r || isHidden(elements, id)) continue;
      overlay.appendChild(el("span", {
        class: "linked-tag",
        style: `left:${r.x * view.zoom}px;top:${r.y * view.zoom - 22}px;`
      }, name));
    }
  }
  const frames = playing?.bare !== true;
  if (frames && view.entered !== void 0) {
    const r = absoluteRect(state, view.entered, view.scrolls);
    if (r) overlay.appendChild(el("div", {
      class: "wf-entered",
      style: place2(r, view.zoom)
    }));
  }
  for (const id of frames ? state.selection : []) {
    if (view.draggedAt && view.dragged.includes(id)) continue;
    const r = absoluteRect(state, id, view.scrolls);
    if (!r) continue;
    const ghost = isHidden(elements, id) ? " is-hidden" : "";
    overlay.appendChild(el("div", {
      class: "wf-sel" + ghost,
      "data-sel": id,
      style: place2(r, view.zoom)
    }));
    const centers = handleCenters(r);
    for (const name of handlesFor(elements, state.selection, id)) {
      const c = centers[name];
      overlay.appendChild(el("div", {
        class: `wf-handle wf-handle-${name}`,
        "data-handle": name,
        style: `left:${c.x * view.zoom}px;top:${c.y * view.zoom}px;`
      }));
    }
  }
  if (frames && view.row) {
    const r = rowFrame(state, view);
    if (r) overlay.appendChild(el("div", {
      class: "wf-row-frame",
      style: place2(r, view.zoom)
    }));
  }
  for (const node of outlineNodes(state, view)) overlay.appendChild(node);
  const stage = el("div", {
    class: "wf-stage" + (playing?.screen || under ? " is-clipped" : ""),
    style: `width:${device.w * view.zoom}px;height:${device.h * view.zoom}px;`
  }, ...under ? [
    under
  ] : [], frame, overlay);
  root.appendChild(stage);
}
function fitZoom(root, device) {
  const pad = 48;
  const z = Math.min((root.clientWidth - pad) / device.w, (root.clientHeight - pad) / device.h);
  return Math.max(0.1, Math.min(2, Math.floor(z * 100) / 100));
}

// src/core/tween.ts
var clamp01 = (v) => Math.min(1, Math.max(0, v));
var round = (v, digits) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};
function bezier(x1, y1, x2, y2) {
  const at = (a, b, t) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (p) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < p) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
var EASINGS = {
  standard: bezier(0.2, 0, 0, 1),
  decelerate: bezier(0, 0, 0, 1),
  accelerate: bezier(0.3, 0, 1, 1),
  linear: clamp01
};
function spring(p) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return 1 - Math.exp(-6 * p) * Math.cos(p * Math.PI * 3.5);
}
var SCALE_FROM = 0.9;
function slideDistance(size) {
  return Math.min(48, Math.max(8, Math.round(size / 4)));
}
function presentation(name, v, size) {
  if (v >= 1) return void 0;
  const base = {
    opacity: round(clamp01(v), 3),
    dx: 0,
    dy: 0,
    scale: 1
  };
  const far = (length) => round((1 - v) * slideDistance(length), 2);
  switch (name) {
    case "fade":
      return base;
    case "slide-up":
      return {
        ...base,
        dy: far(size.h)
      };
    case "slide-down":
      return {
        ...base,
        dy: -far(size.h)
      };
    case "slide-left":
      return {
        ...base,
        dx: far(size.w)
      };
    case "slide-right":
      return {
        ...base,
        dx: -far(size.w)
      };
    case "scale":
      return {
        ...base,
        scale: round(SCALE_FROM + (1 - SCALE_FROM) * v, 4)
      };
    default:
      return void 0;
  }
}
function tracksFor(base, owner, changes, tone, motions = {}) {
  const scope = scopeIds(base.elements, owner);
  const own = (id) => {
    const row = changes[id];
    const el2 = findById(base.elements, id)?.el;
    if (!el2 || row?.hidden === void 0 || !scope.has(id)) return void 0;
    const shown2 = el2.hidden !== true;
    return shown2 === !row.hidden ? void 0 : !row.hidden;
  };
  const tracks = [];
  for (const [id, written3] of Object.entries(changes)) {
    if (!scope.has(id) || !findById(base.elements, id)) continue;
    const row = id in motions ? {
      ...written3,
      motion: motions[id]
    } : written3;
    let appears = own(id);
    if (isMotionOnly(row)) {
      const around = pathTo(base.elements, id).slice(0, -1).reverse();
      appears = around.map((el3) => own(el3.id)).find((v) => v !== void 0);
    }
    const el2 = findById(base.elements, id).el;
    const steps = isStepped(row.motion) ? soundSteps(row.motion, row, el2.type) : void 0;
    const played = isStepped(row.motion) && !steps ? {
      ...row,
      motion: {
        name: DEFAULT_MOTION[rowKind(row)]
      }
    } : row;
    tracks.push({
      id,
      row,
      name: motionName(played),
      duration: motionDuration(played, tone),
      easing: motionEasing(played.motion, tone),
      ...appears === void 0 ? {} : {
        appears
      },
      ...steps ? {
        steps,
        stepTone: tone
      } : {}
    });
  }
  return tracks;
}
function soundSteps(m, row, type) {
  if (!checkStepMotion(m, "", "row", [])) return void 0;
  if (rowKind(row) === "value" && !itemsOf(m).includes("progress")) return void 0;
  return blockedBy(m, type).length === 0 ? m : void 0;
}
var longest = (tracks) => Math.max(0, ...tracks.map((t) => t.duration));
function placedIds(elements) {
  return new Set(flatten(elements).filter(({ el: el2 }) => layoutOf(el2) || inLayout(elements, el2.id)).map(({ el: el2 }) => el2.id));
}
function geometryOf(row) {
  const out = {};
  for (const k of [
    "x",
    "y",
    "w",
    "h"
  ]) if (row[k] !== void 0) out[k] = row[k];
  return Object.keys(out).length > 0 ? out : void 0;
}
function moveScope(elements, owner) {
  const scope = scopeIds(elements, owner);
  for (const id of placedIds(elements)) scope.add(id);
  return scope;
}
function planTransition(base, editing, tone, motions = {}) {
  const index = stateIndex(base, editing);
  if (!editing || index <= 0) return void 0;
  const reach = scopeIds(base.elements, editing.owner);
  const written3 = statesOf(base, editing.owner)[index].changes ?? {};
  const changes = {};
  for (const [id, row] of Object.entries(written3)) if (reach.has(id)) changes[id] = row;
  const to = applyChanges(base, editing.owner, changes, registry).elements;
  const pushed = extractChanges(base.elements, to, placedIds(base.elements), false);
  const merged = {};
  for (const [id, row] of Object.entries(pushed)) {
    const move = geometryOf(row);
    if (move) merged[id] = move;
  }
  for (const [id, row] of Object.entries(changes)) merged[id] = {
    ...merged[id],
    ...row
  };
  const tracks = tracksFor(base, void 0, merged, tone, motions);
  return {
    base,
    owner: editing.owner,
    tracks,
    duration: longest(tracks)
  };
}
function planMove(screen, owner, fromState, toState, from, to, tone, underway, motions = {}) {
  const list = statesOf(screen, owner) ?? [];
  const rowsOf2 = (id) => list.find((s) => s.id === id)?.changes ?? {};
  const dest = rowsOf2(toState);
  const src = rowsOf2(fromState);
  const reach = scopeIds(from, owner);
  const scope = moveScope(from, owner);
  let start = from;
  for (const id of underway ?? []) {
    const shownInTo = findById(to, id)?.el;
    if (!reach.has(id) || !shownInTo || shownInTo.hidden === true) continue;
    start = mapElement(start, id, (el2) => ({
      ...el2,
      hidden: true
    }));
  }
  const changes = extractChanges(start, to, scope, false);
  for (const id of Object.keys(changes)) {
    if (reach.has(id)) continue;
    const move = geometryOf(changes[id]);
    if (move) changes[id] = move;
    else delete changes[id];
  }
  for (const id of Object.keys(changes)) {
    const motion = id in dest ? dest[id].motion : src[id]?.motion;
    if (motion) changes[id] = {
      ...changes[id],
      motion
    };
  }
  for (const rows2 of [
    dest,
    src
  ]) {
    for (const [id, row] of Object.entries(rows2)) {
      if (!isMotionOnly(row) || changes[id] || !scope.has(id)) continue;
      const around = pathTo(start, id).slice(0, -1);
      if (around.some((el2) => changes[el2.id]?.hidden !== void 0)) {
        changes[id] = {
          motion: row.motion
        };
      }
    }
  }
  const base = {
    elements: start,
    states: screen.states
  };
  const tracks = tracksFor(base, void 0, changes, tone, motions);
  return {
    base,
    owner,
    tracks,
    duration: longest(tracks)
  };
}
function mergeFrames(final, frames) {
  let elements = final;
  const show = /* @__PURE__ */ new Map();
  const at = /* @__PURE__ */ new Map();
  for (const { tr, frame } of frames) {
    for (const track of tr.tracks) {
      const moving = findById(frame.elements, track.id)?.el;
      if (!moving) continue;
      elements = mapElement(elements, track.id, (el2) => {
        const { children: _c, ...own } = moving;
        return {
          ...own,
          ...el2.children ? {
            children: el2.children
          } : {}
        };
      });
      const shown2 = frame.show.get(track.id);
      if (shown2) show.set(track.id, shown2);
      else show.delete(track.id);
      const q2 = frame.at?.get(track.id);
      if (q2 !== void 0) at.set(track.id, q2);
    }
  }
  return {
    elements: settleGroups(elements),
    show,
    at
  };
}
function planScreenMove(kind, motion, tone) {
  const row = {
    hidden: false,
    motion
  };
  return {
    kind,
    name: goMotionName(motion),
    duration: motionDuration(row, tone),
    easing: motionEasing(motion, tone)
  };
}
function screenShotAt(move, ms, size) {
  const p = move.duration <= 0 ? 1 : clamp01(ms / move.duration);
  const v = EASINGS[move.easing](move.kind === "go" ? p : 1 - p);
  const done = ms >= move.duration;
  if (move.name === "instant") {
    return {
      shown: done ? void 0 : v >= 1 ? void 0 : HIDDEN,
      done
    };
  }
  const base = {
    opacity: round(clamp01(v), 3),
    dx: 0,
    dy: 0,
    scale: 1
  };
  const far = (length) => round((1 - v) * length, 2);
  let shown2;
  switch (move.name) {
    case "slide-up":
      shown2 = {
        ...base,
        opacity: 1,
        dy: far(size.h)
      };
      break;
    case "slide-down":
      shown2 = {
        ...base,
        opacity: 1,
        dy: -far(size.h)
      };
      break;
    case "slide-left":
      shown2 = {
        ...base,
        opacity: 1,
        dx: far(size.w)
      };
      break;
    case "slide-right":
      shown2 = {
        ...base,
        opacity: 1,
        dx: -far(size.w)
      };
      break;
    case "scale":
      shown2 = {
        ...base,
        scale: round(SCALE_FROM + (1 - SCALE_FROM) * v, 4)
      };
      break;
    default:
      shown2 = base;
  }
  return {
    shown: v >= 1 && move.kind === "go" ? void 0 : shown2,
    done
  };
}
var HIDDEN = {
  opacity: 0,
  dx: 0,
  dy: 0,
  scale: 1
};
var entering = (ms) => (track) => track.duration <= 0 ? 1 : clamp01(ms / track.duration);
var leaving = (ms) => (track) => track.duration <= 0 ? 0 : 1 - clamp01(ms / track.duration);
var mixNumber = (a, b, e) => a + (b - a) * e;
function mixColor(a, b, e) {
  const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [
    0,
    1,
    2
  ].map((i) => {
    const v = Math.round(mixNumber(channel(a, i), channel(b, i), e));
    return Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0");
  }).join("").toUpperCase();
}
var writtenStyle = (el2) => ({
  ...el2.base ?? {},
  ...el2.style ?? {}
});
function mixStyle(key, from, to, e, half, theme) {
  if (key === "opacity") {
    return round(clamp01(mixNumber(from ?? 1, to ?? 1, e)), 3);
  }
  if (from !== null && to !== null) {
    if (key === "radius" || key === "size") {
      const sizes = key === "radius" ? theme.radius : theme.font.size;
      const px = (v) => typeof v === "number" ? v : sizes[v];
      const a = px(from);
      const b = px(to);
      if (typeof a === "number" && typeof b === "number") {
        return Math.max(0, round(mixNumber(a, b, e), 2));
      }
    }
    if (key === "fill" || key === "color" || key === "border") {
      const a = resolveColor(from, theme);
      const b = resolveColor(to, theme);
      if (HEX_COLOR.test(a) && HEX_COLOR.test(b)) return mixColor(a, b, e);
    }
  }
  return half ? to : from;
}
function mixRow(el2, row, p, e, theme, registry2, half = p >= 0.5) {
  const out = {};
  const ends = (from, to, between) => p <= 0 ? from : p >= 1 ? to : between();
  for (const k of [
    "x",
    "y",
    "w",
    "h"
  ]) {
    const to = row[k];
    if (to === void 0 || el2.type === GROUP_TYPE2 && (k === "w" || k === "h")) continue;
    out[k] = ends(el2[k], to, () => {
      const v = round(mixNumber(el2[k], to, e), 2);
      return k === "w" || k === "h" ? Math.max(0, v) : v;
    });
  }
  for (const k of [
    "text",
    "variant"
  ]) {
    const v = half ? row[k] : el2[k];
    if (row[k] !== void 0 && v !== void 0) out[k] = v;
  }
  if (row.props) {
    const props = {};
    for (const [k, to] of Object.entries(row.props)) {
      const from = el2.props[k] ?? null;
      const end = to ?? registry2.get(el2.type)?.props[k]?.default ?? null;
      props[k] = ends(from, to, () => typeof from === "number" && typeof end === "number" ? Math.round(mixNumber(from, end, e)) : half ? to : from);
    }
    out.props = props;
  }
  if (row.style) {
    const style = {};
    for (const [k, to] of Object.entries(row.style)) {
      const from = el2.style?.[k] ?? null;
      style[k] = ends(from, to, () => mixStyle(k, from, to, e, half, theme));
    }
    out.style = style;
  }
  return out;
}
function withTiming(tr, scale, easing) {
  const k = Math.max(0, scale);
  const tracks = tr.tracks.map((t) => ({
    ...t,
    duration: Math.round(t.duration * k),
    // A stepped motion keeps the easings of its steps (saved-motions spec §3.6).
    ...easing && !t.steps ? {
      easing,
      ...t.name === "spring" ? {
        name: "smooth"
      } : {}
    } : {}
  }));
  return {
    ...tr,
    tracks,
    duration: longest(tracks)
  };
}
var FOLLOW_MIN = 48;
var FOLLOW_DEFAULT = 160;
function followDistance(from, to, dir, trs) {
  const axis = dir === "up" || dir === "down" ? "y" : "x";
  const sign = dir === "down" || dir === "right" ? 1 : -1;
  let best = 0;
  for (const tr of trs) {
    for (const t of tr.tracks) {
      const a = findById(from, t.id)?.el;
      const b = findById(to, t.id)?.el;
      let moved = 0;
      if (a && b) {
        moved = (absoluteOffset(to, t.id)[axis] - absoluteOffset(from, t.id)[axis]) * sign;
        if (t.steps) moved *= peakProgress(t.steps);
      }
      const el2 = b ?? a;
      if (t.appears !== void 0 && el2) {
        const gone = t.steps ? stepShownAt(t, 0) : presentation(t.name, 0, el2);
        const off = gone ? axis === "y" ? gone.dy : gone.dx : 0;
        moved = Math.max(moved, (t.appears ? -off : off) * sign);
      }
      best = Math.max(best, moved);
    }
  }
  return best >= FOLLOW_MIN ? best : FOLLOW_DEFAULT;
}
function peakProgress(m) {
  const values = [
    m.start ?? {},
    ...m.steps.map((s) => s.to)
  ].map((v) => v.progress);
  return Math.max(1, ...values.filter((v) => typeof v === "number"));
}
function stepPresentation(s) {
  const at = (k, none) => s[k] ? numberAt(s[k]) : none;
  const shown2 = {
    opacity: at("opacity", 1),
    dx: at("dx", 0),
    dy: at("dy", 0),
    scale: at("scale", 1)
  };
  const identity = shown2.opacity === 1 && shown2.dx === 0 && shown2.dy === 0 && shown2.scale === 1;
  return identity ? void 0 : shown2;
}
function stepShownAt(track, v) {
  const tone = track.stepTone;
  return stepPresentation(sampleSteps(track.steps, v * stepTotal(track.steps, tone), tone, EASINGS));
}
function stepFrame(el2, track, p, theme, registry2) {
  const m = track.steps;
  const tone = track.stepTone;
  const q2 = track.appears === void 0 ? void 0 : track.appears ? p : 1 - p;
  const s = sampleSteps(m, (q2 ?? p) * stepTotal(m, tone), tone, EASINGS);
  const P2 = s.progress ? numberAt(s.progress) : q2 ?? p;
  const e = track.appears === false ? 1 - P2 : P2;
  const row = mixRow(el2, track.row, p, e, theme, registry2, e >= 0.5);
  if (track.row.hidden !== void 0) row.hidden = q2 === void 0 ? track.row.hidden : q2 <= 0;
  const gone = q2 !== void 0 && q2 <= 0;
  if (!gone) {
    const mixed = row.style ?? {};
    const written3 = writtenStyle(el2);
    for (const k of [
      "fill",
      "border",
      "color",
      "radius"
    ]) {
      const at = s[k];
      if (!at) continue;
      const now = k in mixed ? mixed[k] : written3[k] ?? null;
      const from = at.from ?? now;
      const to = at.to ?? now;
      const v = mixStyle(k, from, to, at.e, at.p >= 0.5, theme);
      if (v !== null) row.style = {
        ...row.style,
        [k]: v
      };
    }
  }
  const shown2 = stepPresentation(s);
  const out = {
    row
  };
  if (shown2 && (q2 === void 0 || q2 > 0 || track.row.hidden === void 0)) out.shown = shown2;
  if (q2 !== void 0) out.q = q2;
  return out;
}
function effectDone(e, now, tone) {
  return now - e.began >= stepTotal(e.motion, tone);
}
function overlayEffects(frame, effects, now, tone, theme) {
  if (effects.length === 0) return frame;
  let elements = frame.elements;
  const show = new Map(frame.show);
  for (const e of effects) {
    const el2 = findById(elements, e.id)?.el;
    if (!el2 || isHidden(elements, e.id) || effectDone(e, now, tone)) continue;
    const s = sampleSteps(e.motion, now - e.began, tone, EASINGS);
    const own = stepPresentation(s);
    if (own) {
      const had = show.get(e.id) ?? {
        opacity: 1,
        dx: 0,
        dy: 0,
        scale: 1
      };
      show.set(e.id, {
        ...had,
        opacity: round(had.opacity * own.opacity, 4),
        dx: round(had.dx + own.dx, 2),
        dy: round(had.dy + own.dy, 2),
        scale: round(had.scale * own.scale, 4)
      });
    }
    const written3 = writtenStyle(el2);
    const style = {};
    for (const k of [
      "fill",
      "border",
      "color",
      "radius"
    ]) {
      const at = s[k];
      if (!at) continue;
      const mine = written3[k] ?? null;
      const v = mixStyle(k, at.from ?? mine, at.to ?? mine, at.e, at.p >= 0.5, theme);
      if (v !== null) style[k] = v;
    }
    if (Object.keys(style).length > 0) {
      elements = mapElement(elements, e.id, (x) => ({
        ...x,
        style: {
          ...x.style,
          ...style
        }
      }));
    }
  }
  return {
    ...frame,
    elements,
    show
  };
}
function frameAt(tr, progress, theme, registry2, linear = false) {
  const rows2 = {};
  const show = /* @__PURE__ */ new Map();
  const at = /* @__PURE__ */ new Map();
  for (const track of tr.tracks) {
    const el2 = findById(tr.base.elements, track.id)?.el;
    if (!el2) continue;
    const p = clamp01(progress(track));
    if (track.steps) {
      const { row: row2, shown: shown2, q: q2 } = stepFrame(el2, track, p, theme, registry2);
      if (shown2) show.set(track.id, shown2);
      if (q2 !== void 0) at.set(track.id, q2);
      rows2[track.id] = row2;
      continue;
    }
    const ease = linear ? clamp01 : EASINGS[track.easing];
    const row = mixRow(el2, track.row, p, linear ? p : track.name === "spring" ? spring(p) : ease(p), theme, registry2);
    if (track.row.hidden !== void 0) row.hidden = track.row.hidden;
    if (track.appears !== void 0) {
      const q2 = track.appears ? p : 1 - p;
      if (track.row.hidden !== void 0) row.hidden = q2 <= 0;
      const shown2 = presentation(track.name, ease(q2), el2);
      if (shown2 && (q2 > 0 || track.row.hidden === void 0)) show.set(track.id, shown2);
      at.set(track.id, q2);
    }
    rows2[track.id] = row;
  }
  return {
    elements: applyChanges(tr.base, void 0, rows2, registry2, false).elements,
    show,
    at
  };
}
var PLAY_HOLD = 600;
function playAt(tr, ms) {
  const back = tr.duration + PLAY_HOLD;
  return {
    progress: ms < back ? entering(ms) : leaving(ms - back),
    done: ms >= back + tr.duration
  };
}
var LOOP_REST = 300;
var LOOP_HOLD = 500;
function sampleAt(tr, id, ms, rounds) {
  const length = tr.tracks.find((t) => t.id === id)?.duration ?? 0;
  const round2 = LOOP_REST + length + LOOP_HOLD;
  const done = rounds !== void 0 && ms >= rounds * round2;
  const around = new Set(pathTo(tr.base.elements, id).slice(0, -1).map((el2) => el2.id));
  const within = ms % round2;
  return {
    progress: (track) => {
      if (track.id !== id && track.appears === false && around.has(track.id)) return 0;
      if (track.id !== id || done) return 1;
      return within < LOOP_REST ? 0 : entering(within - LOOP_REST)(track);
    },
    done
  };
}

// src/editor/player.ts
var browserClock = {
  now: () => performance.now(),
  frame: (fn) => requestAnimationFrame(fn),
  cancel: (handle) => cancelAnimationFrame(handle)
};
function sampleRects(tr, id, theme, registry2) {
  const track = tr.tracks.find((t) => t.id === id);
  if (!track) return void 0;
  const at = (own) => {
    const elements = frameAt(tr, (t) => t.id === id ? own : 1, theme, registry2).elements;
    const el2 = findById(elements, id)?.el;
    if (!el2) return void 0;
    const { x, y } = absoluteOffset(elements, id);
    if (track.steps) {
      const v2 = track.appears === false ? 1 - own : own;
      const s = stepShownAt(track, v2) ?? {
        dx: 0,
        dy: 0,
        scale: 1
      };
      const w = el2.w * s.scale;
      const h2 = el2.h * s.scale;
      return {
        x: x + s.dx + (el2.w - w) / 2,
        y: y + s.dy + (el2.h - h2) / 2,
        w,
        h: h2
      };
    }
    const v = track.appears === void 0 ? 1 : track.appears ? own : 1 - own;
    const shift = presentation(track.name, v, el2);
    return {
      x: x + (shift?.dx ?? 0),
      y: y + (shift?.dy ?? 0),
      w: el2.w,
      h: el2.h
    };
  };
  const start = at(0);
  const end = at(1);
  return start && end ? {
    start,
    end
  } : void 0;
}
var Player = class {
  clock;
  registry;
  draw;
  handle;
  run;
  constructor(clock, registry2, draw) {
    this.clock = clock;
    this.registry = registry2;
    this.draw = draw;
  }
  /** What is running, if anything. */
  get running() {
    return this.run?.kind;
  }
  /**
   * ▶ (motion spec §5.2): the first look, into the state, a pause, back to the first look, once.
   * `onEnd` is called when it is over, also when it is stopped before that.
   */
  play(tr, theme, onEnd) {
    this.start("play", void 0, this.moments(tr, theme, (ms) => playAt(tr, ms)), onEnd);
  }
  /**
   * A sample of the motion of the part `id` (motion spec §5.3): that part alone goes from its
   * start to its end, `rounds` times (left out = until `stop`).
   */
  sample(tr, id, theme, rounds) {
    this.start("sample", id, this.moments(tr, theme, (ms) => sampleAt(tr, id, ms, rounds)));
  }
  /**
   * A sample of その場で動く (saved-motions spec §5.2, §3.4): the part `id` alone, on the look
   * `elements`, waits, plays `motion` on top of where it is, waits at its end and starts over,
   * `rounds` times (left out = until `stop`).
   */
  effect(elements, id, motion, theme, rounds) {
    const tone = themeTone(theme);
    const round2 = LOOP_REST + stepTotal(motion, tone) + LOOP_HOLD;
    const look = {
      elements,
      show: /* @__PURE__ */ new Map()
    };
    const runs = [
      {
        id,
        motion,
        began: LOOP_REST
      }
    ];
    this.start("sample", id, (ms) => {
      const within = ms % round2;
      return {
        // Before the rest is over the effect has not begun: the part is as it is.
        frame: within < LOOP_REST ? look : overlayEffects(look, runs, within, tone, theme),
        done: rounds !== void 0 && ms >= rounds * round2
      };
    });
  }
  /** Ends what is running and shows the document again. Nothing happens when nothing runs. */
  stop() {
    const run = this.run;
    if (!run) return;
    if (this.handle !== void 0) this.clock.cancel(this.handle);
    this.handle = void 0;
    this.run = void 0;
    try {
      this.draw(void 0);
    } finally {
      run.onEnd?.();
    }
  }
  /** A transition's moments: the frame of each progress. */
  moments(tr, theme, at) {
    return (ms) => {
      const { progress, done } = at(ms);
      return {
        frame: frameAt(tr, progress, theme, this.registry),
        done
      };
    };
  }
  start(kind, id, at, onEnd) {
    this.stop();
    const run = {
      kind,
      onEnd
    };
    this.run = run;
    const began = this.clock.now();
    const tick = () => {
      if (this.run !== run) return;
      try {
        const { frame, done } = at(this.clock.now() - began);
        if (done) {
          this.stop();
          return;
        }
        this.draw({
          frame,
          kind,
          ...id ? {
            id
          } : {}
        });
        this.handle = this.clock.frame(tick);
      } catch (e) {
        if (this.run === run) this.stop();
        throw e;
      }
    };
    tick();
  }
};

// src/editor/config.ts
var KEYMAP = [
  {
    key: "z",
    ctrl: true,
    shift: false,
    action: "undo"
  },
  {
    key: "z",
    ctrl: true,
    shift: true,
    action: "redo"
  },
  {
    key: "y",
    ctrl: true,
    action: "redo"
  },
  {
    key: "s",
    ctrl: true,
    action: "save"
  },
  {
    key: "Delete",
    action: "delete"
  },
  {
    key: "Backspace",
    action: "delete"
  },
  {
    key: "d",
    ctrl: true,
    action: "duplicate"
  },
  // Without Shift only: Ctrl+Shift+C stays the browser's.
  {
    key: "c",
    ctrl: true,
    shift: false,
    action: "copy"
  },
  {
    key: "x",
    ctrl: true,
    shift: false,
    action: "cut"
  },
  {
    key: "v",
    ctrl: true,
    shift: false,
    action: "paste"
  },
  {
    key: "]",
    ctrl: true,
    action: "forward"
  },
  {
    key: "[",
    ctrl: true,
    action: "backward"
  },
  {
    key: "Escape",
    action: "deselect"
  },
  {
    key: "0",
    ctrl: true,
    action: "zoom-fit"
  },
  {
    key: "1",
    ctrl: true,
    action: "zoom-100"
  },
  {
    key: "ArrowLeft",
    action: "nudge-left"
  },
  {
    key: "ArrowRight",
    action: "nudge-right"
  },
  {
    key: "ArrowUp",
    action: "nudge-up"
  },
  {
    key: "ArrowDown",
    action: "nudge-down"
  }
];
var LAYOUT = {
  leftWidth: 220,
  rightWidth: 360,
  headerHeight: 48,
  nudge: 1,
  nudgeLarge: 8,
  handleSize: 8,
  dragThreshold: 3,
  /** Start page cards. */
  galleryCardWidth: 200,
  galleryThumbScale: 0.25,
  /** Default open/closed state of the left column's sections. */
  leftSections: {
    select: false,
    elements: false,
    dynamic: false
  },
  /** Indent per nesting level in the Select tree (px). */
  treeIndent: 16
};
function matchKey(e) {
  const ctrl = e.ctrlKey || e.metaKey;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  for (const b of KEYMAP) {
    if (b.key !== key) continue;
    if ((b.ctrl ?? false) !== ctrl) continue;
    if (b.shift !== void 0 && b.shift !== e.shiftKey) continue;
    return b.action;
  }
  return void 0;
}

// src/editor/default-examples.ts
var EXAMPLE_W = 320;
var EXAMPLE_PART = "part";
var muted = {
  color: "$muted",
  size: "sm"
};
var bold = {
  weight: "bold"
};
var P = EXAMPLE_PART;
var DEFAULT_EXAMPLES = {
  text: {
    note: "\u898B\u51FA\u3057\u306E\u4E0B\u306E\u8AAC\u660E\u6587",
    h: 88,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 28,
        text: "\u4ECA\u6708\u306E\u652F\u51FA",
        style: {
          ...bold,
          size: "lg"
        }
      },
      {
        id: P,
        type: "text",
        x: 16,
        y: 52,
        w: 288,
        h: 24,
        text: "\u98DF\u8CBB\u30FB\u65E5\u7528\u54C1\u30FB\u4EA4\u901A\u8CBB\u306E\u5408\u8A08\u3067\u3059"
      }
    ]
  },
  button: {
    note: "\u30ED\u30B0\u30A4\u30F3\u753B\u9762\u306E\u6C7A\u5B9A\u306E\u30DC\u30BF\u30F3",
    h: 216,
    elements: [
      {
        id: "mail",
        type: "input",
        x: 16,
        y: 16,
        w: 288,
        h: 56,
        text: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9"
      },
      {
        id: "pass",
        type: "input",
        x: 16,
        y: 80,
        w: 288,
        h: 56,
        text: "\u30D1\u30B9\u30EF\u30FC\u30C9"
      },
      {
        id: P,
        type: "button",
        x: 16,
        y: 152,
        w: 288,
        h: 48,
        text: "\u30ED\u30B0\u30A4\u30F3"
      }
    ]
  },
  input: {
    note: "\u652F\u51FA\u3092\u8A18\u9332\u3059\u308B\u753B\u9762\u306E\u91D1\u984D\u306E\u6B04",
    h: 176,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 24,
        text: "\u652F\u51FA\u3092\u8A18\u9332",
        style: bold
      },
      {
        id: P,
        type: "input",
        x: 16,
        y: 48,
        w: 288,
        h: 56,
        text: "\u91D1\u984D",
        props: {
          placeholder: "0"
        }
      },
      {
        id: "save",
        type: "button",
        x: 16,
        y: 112,
        w: 288,
        h: 48,
        text: "\u4FDD\u5B58"
      }
    ]
  },
  checkbox: {
    note: "\u4F1A\u54E1\u767B\u9332\u306E\u540C\u610F\u306E\u5370",
    h: 160,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 24,
        text: "\u4F1A\u54E1\u767B\u9332",
        style: bold
      },
      {
        id: P,
        type: "checkbox",
        x: 16,
        y: 52,
        w: 288,
        h: 32,
        text: "\u5229\u7528\u898F\u7D04\u306B\u540C\u610F\u3059\u308B",
        props: {
          checked: true
        }
      },
      {
        id: "go",
        type: "button",
        x: 16,
        y: 96,
        w: 288,
        h: 48,
        text: "\u767B\u9332\u3059\u308B"
      }
    ]
  },
  toggle: {
    note: "\u8A2D\u5B9A\u753B\u9762\u306E\u5165\u30FB\u5207",
    h: 144,
    elements: [
      {
        id: "sec",
        type: "text",
        x: 16,
        y: 12,
        w: 288,
        h: 20,
        text: "\u901A\u77E5",
        style: muted
      },
      {
        id: P,
        type: "toggle",
        x: 16,
        y: 40,
        w: 288,
        h: 32,
        text: "\u901A\u77E5\u3092\u53D7\u3051\u53D6\u308B",
        props: {
          checked: true
        }
      },
      {
        id: "line",
        type: "divider",
        x: 16,
        y: 84,
        w: 288,
        h: 1
      },
      {
        id: "mail",
        type: "toggle",
        x: 16,
        y: 96,
        w: 288,
        h: 32,
        text: "\u30E1\u30FC\u30EB\u3067\u3082\u53D7\u3051\u53D6\u308B"
      }
    ]
  },
  image: {
    note: "\u8A18\u4E8B\u306E\u5199\u771F\u3068\u984C",
    h: 232,
    elements: [
      {
        id: P,
        type: "image",
        x: 16,
        y: 16,
        w: 288,
        h: 144,
        text: "\u5199\u771F"
      },
      {
        id: "title",
        type: "text",
        x: 16,
        y: 172,
        w: 288,
        h: 24,
        text: "\u4EAC\u90FD\u306E\u7D05\u8449",
        style: bold
      },
      {
        id: "date",
        type: "text",
        x: 16,
        y: 200,
        w: 288,
        h: 20,
        text: "2026/11/03",
        style: muted
      }
    ]
  },
  icon: {
    note: "\u30E1\u30CB\u30E5\u30FC\u306E\u884C\u306E\u982D\u306E\u5370",
    h: 112,
    elements: [
      {
        id: P,
        type: "icon",
        x: 16,
        y: 20,
        w: 24,
        h: 24,
        text: "\u2605"
      },
      {
        id: "fav",
        type: "text",
        x: 52,
        y: 20,
        w: 252,
        h: 24,
        text: "\u304A\u6C17\u306B\u5165\u308A"
      },
      {
        id: "line",
        type: "divider",
        x: 16,
        y: 60,
        w: 288,
        h: 1
      },
      {
        id: "gear",
        type: "icon",
        x: 16,
        y: 72,
        w: 24,
        h: 24,
        text: "\u2699"
      },
      {
        id: "set",
        type: "text",
        x: 52,
        y: 72,
        w: 252,
        h: 24,
        text: "\u8A2D\u5B9A"
      }
    ]
  },
  rect: {
    note: "\u91D1\u984D\u3092\u307E\u3068\u3081\u3066\u898B\u305B\u308B\u30AB\u30FC\u30C9",
    h: 152,
    elements: [
      {
        id: P,
        type: "rect",
        x: 16,
        y: 16,
        w: 288,
        h: 120,
        props: {
          elevated: true
        },
        children: [
          {
            id: "label",
            type: "text",
            x: 16,
            y: 16,
            w: 256,
            h: 20,
            text: "\u4ECA\u6708\u306E\u652F\u51FA",
            style: muted
          },
          {
            id: "sum",
            type: "text",
            x: 16,
            y: 40,
            w: 256,
            h: 36,
            text: "\xA5 48,200",
            style: {
              ...bold,
              size: 28
            }
          },
          {
            id: "diff",
            type: "text",
            x: 16,
            y: 84,
            w: 256,
            h: 20,
            text: "\u5148\u6708\u3088\u308A 3,100 \u5186\u5C11\u306A\u3044",
            style: muted
          }
        ]
      }
    ]
  },
  divider: {
    note: "\u9805\u76EE\u3068\u9805\u76EE\u306E\u9593\u306E\u7DDA",
    h: 136,
    elements: [
      {
        id: "l1",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 20,
        text: "\u540D\u524D",
        style: muted
      },
      {
        id: "v1",
        type: "text",
        x: 16,
        y: 36,
        w: 288,
        h: 24,
        text: "\u5C71\u7530 \u82B1\u5B50"
      },
      {
        id: P,
        type: "divider",
        x: 16,
        y: 72,
        w: 288,
        h: 1
      },
      {
        id: "l2",
        type: "text",
        x: 16,
        y: 84,
        w: 288,
        h: 20,
        text: "\u30E1\u30FC\u30EB",
        style: muted
      },
      {
        id: "v2",
        type: "text",
        x: 16,
        y: 104,
        w: 288,
        h: 24,
        text: "hanako@example.com"
      }
    ]
  },
  list: {
    note: "\u53CB\u3060\u3061\u306E\u4E00\u89A7",
    h: 212,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 12,
        w: 288,
        h: 24,
        text: "\u53CB\u3060\u3061",
        style: bold
      },
      {
        id: P,
        type: "list",
        x: 0,
        y: 44,
        w: 320,
        h: 168,
        props: {
          leading: "avatar",
          trailing: "chevron",
          items: [
            {
              text: "\u5C71\u7530 \u82B1\u5B50",
              sub: "\u30AA\u30F3\u30E9\u30A4\u30F3"
            },
            {
              text: "\u4F50\u85E4 \u592A\u90CE",
              sub: "3 \u5206\u524D"
            },
            {
              text: "\u9234\u6728 \u4E00\u90CE",
              sub: "\u6628\u65E5"
            }
          ]
        }
      }
    ]
  },
  navbar: {
    note: "\u8A2D\u5B9A\u753B\u9762\u306E\u3044\u3061\u3070\u3093\u4E0A\u306E\u5E2F",
    h: 176,
    elements: [
      {
        id: P,
        type: "navbar",
        x: 0,
        y: 0,
        w: 320,
        h: 96,
        text: "\u8A2D\u5B9A",
        props: {
          left: "back"
        }
      },
      {
        id: "l1",
        type: "text",
        x: 16,
        y: 112,
        w: 288,
        h: 20,
        text: "\u30A2\u30AB\u30A6\u30F3\u30C8",
        style: muted
      },
      {
        id: "v1",
        type: "text",
        x: 16,
        y: 136,
        w: 288,
        h: 24,
        text: "\u5C71\u7530 \u82B1\u5B50"
      }
    ]
  },
  tabbar: {
    note: "\u753B\u9762\u306E\u4E0B\u3067\u884C\u304D\u5148\u3092\u5207\u308A\u66FF\u3048\u308B\u30BF\u30D6",
    h: 200,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 24,
        text: "\u30DB\u30FC\u30E0",
        style: bold
      },
      {
        id: "pick",
        type: "image",
        x: 16,
        y: 48,
        w: 288,
        h: 56,
        text: "\u304A\u3059\u3059\u3081"
      },
      {
        id: P,
        type: "tabbar",
        x: 0,
        y: 116,
        w: 320,
        h: 84,
        props: {
          items: [
            "\u30DB\u30FC\u30E0",
            "\u3055\u304C\u3059",
            "\u30DE\u30A4\u30DA\u30FC\u30B8"
          ],
          active: 0
        }
      }
    ]
  },
  tabs: {
    note: "\u304A\u77E5\u3089\u305B\u306E\u7D5E\u308A\u8FBC\u307F",
    h: 176,
    elements: [
      {
        id: P,
        type: "tabs",
        x: 16,
        y: 16,
        w: 288,
        h: 36,
        props: {
          items: [
            "\u3059\u3079\u3066",
            "\u672A\u8AAD",
            "\u4FDD\u5B58\u6E08\u307F"
          ]
        }
      },
      {
        id: "rows",
        type: "list",
        x: 0,
        y: 64,
        w: 320,
        h: 112,
        props: {
          rows: 2,
          items: [
            {
              text: "\u65B0\u3057\u3044\u304A\u77E5\u3089\u305B",
              sub: "10:24"
            },
            {
              text: "\u767A\u9001\u3057\u307E\u3057\u305F",
              sub: "\u6628\u65E5"
            }
          ]
        }
      }
    ]
  },
  radio: {
    note: "\u914D\u9001\u65B9\u6CD5\u3092 1 \u3064\u9078\u3076",
    h: 208,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 24,
        text: "\u914D\u9001\u65B9\u6CD5",
        style: bold
      },
      {
        id: P,
        type: "radio",
        x: 16,
        y: 48,
        w: 288,
        props: {
          items: [
            "\u901A\u5E38\u914D\u9001",
            "\u304A\u6025\u304E\u4FBF",
            "\u5E97\u8217\u3067\u53D7\u3051\u53D6\u308A"
          ]
        }
      }
    ]
  },
  slider: {
    note: "\u4E88\u7B97\u306E\u4E0A\u9650\u3092\u6C7A\u3081\u308B",
    h: 112,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 24,
        text: "\u4E88\u7B97\u306E\u4E0A\u9650",
        style: bold
      },
      {
        id: P,
        type: "slider",
        x: 16,
        y: 48,
        w: 288,
        h: 48,
        props: {
          min: 0,
          max: 1e5,
          step: 1e3,
          value: 3e4,
          prefix: "\xA5"
        }
      }
    ]
  },
  progress: {
    note: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u306E\u5165\u529B\u306E\u9032\u307F\u5177\u5408",
    h: 108,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 200,
        h: 24,
        text: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u306E\u5165\u529B"
      },
      {
        id: "count",
        type: "text",
        x: 232,
        y: 18,
        w: 72,
        h: 20,
        text: "3 / 5",
        style: {
          ...muted,
          align: "right"
        }
      },
      {
        id: P,
        type: "progress",
        x: 16,
        y: 48,
        w: 288,
        h: 14,
        props: {
          value: 60
        }
      },
      {
        id: "left",
        type: "text",
        x: 16,
        y: 72,
        w: 288,
        h: 20,
        text: "\u3042\u3068 2 \u9805\u76EE\u3067\u5B8C\u4E86",
        style: muted
      }
    ]
  },
  chip: {
    note: "\u8208\u5473\u306E\u3042\u308B\u3053\u3068\u3092\u9078\u3076\u672D",
    h: 92,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 20,
        text: "\u8208\u5473",
        style: muted
      },
      {
        id: P,
        type: "chip",
        x: 16,
        y: 44,
        w: 64,
        h: 32,
        text: "\u6599\u7406",
        props: {
          checked: true
        }
      },
      {
        id: "c2",
        type: "chip",
        x: 88,
        y: 44,
        w: 64,
        h: 32,
        text: "\u65C5\u884C",
        props: {
          checked: true
        }
      },
      {
        id: "c3",
        type: "chip",
        x: 160,
        y: 44,
        w: 64,
        h: 32,
        text: "\u97F3\u697D"
      },
      {
        id: "c4",
        type: "chip",
        x: 232,
        y: 44,
        w: 64,
        h: 32,
        text: "\u6620\u753B"
      }
    ]
  },
  badge: {
    note: "\u304A\u77E5\u3089\u305B\u304C\u3042\u308B\u3053\u3068\u3092\u793A\u3059\u30D9\u30EB\u306E\u70B9",
    h: 136,
    elements: [
      {
        id: "nav",
        type: "navbar",
        x: 0,
        y: 0,
        w: 320,
        h: 96,
        text: "\u30DE\u30A4\u30DA\u30FC\u30B8"
      },
      {
        id: "bell",
        type: "icon",
        x: 272,
        y: 56,
        w: 24,
        h: 24,
        text: "bell"
      },
      {
        id: P,
        type: "badge",
        x: 288,
        y: 52,
        w: 10,
        h: 10
      },
      {
        id: "o1",
        type: "text",
        x: 16,
        y: 104,
        w: 180,
        h: 24,
        text: "#1024 \u30CE\u30FC\u30C8"
      },
      {
        id: "s1",
        type: "badge",
        x: 224,
        y: 106,
        w: 80,
        h: 20,
        text: "\u5B8C\u4E86",
        style: {
          fill: "#30A46C"
        }
      }
    ]
  },
  avatar: {
    note: "\u540D\u524D\u306E\u6A2A\u306E\u9854\u5199\u771F",
    h: 88,
    elements: [
      {
        id: P,
        type: "avatar",
        x: 16,
        y: 16,
        w: 56,
        h: 56,
        text: "\u5C71\u7530 \u82B1\u5B50",
        props: {
          online: true
        }
      },
      {
        id: "name",
        type: "text",
        x: 88,
        y: 20,
        w: 216,
        h: 24,
        text: "\u5C71\u7530 \u82B1\u5B50",
        style: bold
      },
      {
        id: "state",
        type: "text",
        x: 88,
        y: 48,
        w: 216,
        h: 20,
        text: "\u30AA\u30F3\u30E9\u30A4\u30F3",
        style: muted
      }
    ]
  },
  fab: {
    note: "\u30E1\u30E2\u306E\u4E00\u89A7\u306E\u53F3\u4E0B\u3067\u3001\u65B0\u3057\u304F\u8DB3\u3059\u30DC\u30BF\u30F3",
    h: 232,
    elements: [
      {
        id: "memos",
        type: "list",
        x: 0,
        y: 0,
        w: 320,
        h: 168,
        props: {
          items: [
            {
              text: "\u8CB7\u3044\u7269",
              sub: "\u725B\u4E73\u3001\u5375"
            },
            {
              text: "\u65C5\u884C\u306E\u6E96\u5099",
              sub: "\u5207\u7B26\u3092\u53D6\u308B"
            },
            {
              text: "\u8AAD\u307F\u305F\u3044\u672C",
              sub: "3 \u518A"
            }
          ]
        }
      },
      {
        id: P,
        type: "fab",
        x: 176,
        y: 168,
        w: 120,
        h: 48
      }
    ]
  },
  table: {
    note: "\u6CE8\u6587\u306E\u4E00\u89A7\u306E\u8868",
    h: 248,
    elements: [
      {
        id: "head",
        type: "text",
        x: 16,
        y: 16,
        w: 288,
        h: 24,
        text: "\u6CE8\u6587",
        style: bold
      },
      {
        id: P,
        type: "table",
        x: 16,
        y: 48,
        w: 288,
        h: 184,
        props: {
          columns: [
            "\u756A\u53F7",
            "\u304A\u5BA2\u69D8",
            "\u91D1\u984D"
          ],
          rows: [
            "#1024 | \u5C71\u7530 \u82B1\u5B50 | \xA53,200",
            "#1023 | \u4F50\u85E4 \u592A\u90CE | \xA51,480",
            "#1022 | \u9234\u6728 \u4E00\u90CE | \xA55,600"
          ]
        }
      }
    ]
  },
  sidenav: {
    note: "\u7BA1\u7406\u753B\u9762\u306E\u5DE6\u306B\u3044\u3064\u3082\u3042\u308B\u6848\u5185",
    h: 216,
    elements: [
      {
        id: P,
        type: "sidenav",
        x: 0,
        y: 0,
        w: 144,
        h: 216,
        props: {
          title: "\u7BA1\u7406",
          items: [
            "\u30DB\u30FC\u30E0",
            "\u6CE8\u6587",
            "\u8A2D\u5B9A"
          ],
          active: 1
        }
      },
      {
        id: "rows",
        type: "list",
        x: 160,
        y: 16,
        w: 144,
        h: 168
      }
    ]
  },
  breadcrumb: {
    note: "\u6CE8\u6587\u306E\u8A73\u7D30\u306E\u753B\u9762\u306E\u4E0A\u306E\u3001\u4ECA\u3044\u308B\u5834\u6240",
    h: 176,
    elements: [
      {
        id: P,
        type: "breadcrumb",
        x: 16,
        y: 16,
        w: 288,
        h: 20,
        props: {
          items: [
            "\u30DB\u30FC\u30E0",
            "\u6CE8\u6587",
            "\u8A73\u7D30"
          ]
        }
      },
      {
        id: "head",
        type: "text",
        x: 16,
        y: 44,
        w: 288,
        h: 32,
        text: "\u6CE8\u6587 #1024",
        style: {
          ...bold,
          size: "lg"
        }
      },
      {
        id: "body",
        type: "rect",
        x: 16,
        y: 88,
        w: 288,
        h: 72
      }
    ]
  }
};

// src/editor/hover-preview.ts
var HOVER_ROOM = {
  w: 204,
  h: 312,
  pad: 12
};
function movingOwner(el2) {
  if (el2.states?.[1]) return el2;
  for (const c of el2.children ?? []) {
    const found = movingOwner(c);
    if (found) return found;
  }
  return void 0;
}
function hoverLook(screen, found, registry2, tone) {
  const device = deviceSize(screen.device);
  const at = builtinAt(found, screen.elements, device);
  const raw = instantiatePreset(found.preset, allIds(screen.elements), {
    x: snap2(at.x),
    y: snap2(at.y)
  }, false);
  const el2 = fillElement(raw, device, registry2);
  const elements = found.content ? behindOverlays(screen.elements, el2) : [
    ...screen.elements,
    el2
  ];
  const stated = {
    elements,
    ...screen.states ? {
      states: screen.states
    } : {}
  };
  const owner = movingOwner(el2);
  const tr = owner ? planTransition(stated, {
    owner: owner.id,
    state: owner.states[1].id
  }, tone) : void 0;
  return {
    screen: stated,
    box: el2.id,
    tr
  };
}
function hoverAt(look, ms, theme, registry2) {
  const tr = look.tr;
  if (!tr) return {
    frame: {
      elements: look.screen.elements,
      show: /* @__PURE__ */ new Map()
    },
    done: true
  };
  const t = Math.max(0, ms - LOOP_REST);
  return {
    frame: frameAt(tr, ms < LOOP_REST ? () => 0 : entering(t), theme, registry2),
    done: ms >= LOOP_REST && t >= tr.duration
  };
}
function hoverStage(device) {
  const { w, h: h2, pad } = HOVER_ROOM;
  const scale = Math.min((w - 2 * pad) / device.w, (h2 - 2 * pad) / device.h);
  return {
    w,
    h: Math.min(h2, Math.round(device.h * scale) + 2 * pad),
    scale
  };
}
var PART_MARGIN = 8;
function partLook(after, defaults) {
  const id = after.selection[0];
  const found = findById(layerDefaults(after.doc.screen.elements, defaults), id);
  if (!found) throw new Error(`partLook: no part ${id}`);
  const part = {
    ...found.el,
    x: PART_MARGIN,
    y: PART_MARGIN
  };
  return {
    look: {
      screen: {
        elements: [
          part
        ]
      },
      box: id,
      tr: void 0
    },
    size: {
      w: part.w + 2 * PART_MARGIN,
      h: part.h + 2 * PART_MARGIN
    }
  };
}
function partStage(size, room = HOVER_ROOM) {
  const { w, h: h2, pad } = room;
  const scale = Math.min(1, (w - 2 * pad) / size.w, (h2 - 2 * pad) / size.h);
  return {
    w,
    h: Math.min(h2, Math.round(size.h * scale) + 2 * pad),
    scale
  };
}
var EXAMPLE_ROOM = {
  w: 284,
  h: 312,
  pad: 12
};
function exampleLook(type, defaults, registry2) {
  const ex = DEFAULT_EXAMPLES[type];
  if (!ex) return void 0;
  const scene = {
    w: EXAMPLE_W,
    h: ex.h
  };
  const elements = layerDefaults(ex.elements.map((e) => {
    const el2 = fillElement(e, scene, registry2);
    return {
      ...el2,
      x: el2.x + PART_MARGIN,
      y: el2.y + PART_MARGIN
    };
  }), defaults);
  const size = {
    w: scene.w + 2 * PART_MARGIN,
    h: scene.h + 2 * PART_MARGIN
  };
  return {
    look: {
      screen: {
        elements
      },
      box: EXAMPLE_PART,
      tr: void 0
    },
    size
  };
}

// src/editor/panels/dynamic-hover.ts
var DynamicHover = class {
  clock;
  registry;
  box;
  handle;
  constructor(clock, registry2) {
    this.clock = clock;
    this.registry = registry2;
  }
  /** Whether the window is up. */
  get open() {
    return this.box !== void 0;
  }
  /** Opens the window beside `row` (the one before goes) and plays the box into its second look. */
  show(row, c) {
    this.close();
    const kind = c.kind ?? "screen";
    const alone = kind !== "screen";
    const stage = kind === "screen" ? hoverStage(c.device) : partStage(c.device, kind === "example" ? EXAMPLE_ROOM : HOVER_ROOM);
    const vars = Object.entries(themeCssVars(c.theme)).map(([k, v]) => `${k}:${v}`).join(";");
    const fw = c.device.w * stage.scale;
    const fh = c.device.h * stage.scale;
    const frame = el("div", {
      class: "wf-frame wf-thumb-frame",
      style: `width:${c.device.w}px;height:${c.device.h}px;transform:scale(${stage.scale});${vars};`
    });
    const room = el("div", {
      class: alone ? "dynamic-hover-part" : "wf-thumb dynamic-hover-frame",
      style: `left:${Math.round((stage.w - fw) / 2)}px;top:${Math.round((stage.h - fh) / 2)}px;width:${Math.round(fw)}px;height:${Math.round(fh)}px;`
    }, frame);
    const box7 = el("div", {
      class: "motion-float dynamic-hover" + (kind === "example" ? " is-wide" : ""),
      "data-hover": c.look.box
    }, el("div", {
      class: "float-title"
    }, c.title), el("div", {
      class: alone ? "float-stage is-alone" : "float-stage",
      style: `width:${stage.w}px;height:${stage.h}px;${alone ? vars : ""}`
    }, room), el("div", {
      class: "float-note"
    }, c.note));
    this.box = box7;
    document.body.append(box7);
    this.place(row, box7);
    const draw = (ms) => {
      const { frame: f, done } = hoverAt(c.look, ms, c.theme, this.registry);
      clear(frame);
      for (const e of drawn(f.elements)) {
        frame.append(renderElement(e, this.registry, false, f.show));
      }
      if (kind === "example") {
        frame.querySelector(`.wf-el[data-id="${CSS.escape(c.look.box)}"]`)?.classList.add("is-hover-mark");
      }
      return done;
    };
    const began = this.clock.now();
    const tick = () => {
      this.handle = void 0;
      if (this.box !== box7) return;
      if (!row.isConnected) return this.close();
      try {
        if (!draw(this.clock.now() - began)) this.handle = this.clock.frame(tick);
      } catch (e) {
        this.close();
        throw e;
      }
    };
    try {
      draw(0);
    } catch (e) {
      this.close();
      throw e;
    }
    this.handle = this.clock.frame(tick);
  }
  /** Takes the window away; nothing happens when it is not up. */
  close() {
    if (this.handle !== void 0) this.clock.cancel(this.handle);
    this.handle = void 0;
    this.box?.remove();
    this.box = void 0;
  }
  /** Right of the left column, level with the row, inside the window and under the header. */
  place(row, box7) {
    const at = row.getBoundingClientRect();
    const right = document.getElementById("left")?.getBoundingClientRect().right ?? at.right;
    const top = Math.min(at.top - 8, globalThis.innerHeight - box7.offsetHeight - 8);
    box7.style.left = `${Math.round(right + 8)}px`;
    box7.style.top = `${Math.round(Math.max(LAYOUT.headerHeight + 8, top))}px`;
  }
};

// src/editor/menu.ts
function menuEntries(s, hasClip) {
  const elements = s.doc.screen.elements;
  const sel = s.selection.filter((id) => findById(elements, id) !== void 0);
  const any = sel.length > 0;
  const free = any && !sel.some((id) => isLocked(elements, id));
  const anyOpen = sel.some((id) => !isLocked(elements, id));
  const anyMarked = sel.some((id) => isLocked(elements, id));
  return [
    {
      action: "copy",
      label: "Copy",
      key: "Ctrl+C",
      enabled: any
    },
    {
      action: "cut",
      label: "Cut",
      key: "Ctrl+X",
      enabled: free
    },
    {
      action: "paste",
      label: "Paste",
      key: "Ctrl+V",
      enabled: hasClip
    },
    {
      action: "duplicate",
      label: "Duplicate",
      key: "Ctrl+D",
      enabled: any
    },
    {
      action: "delete",
      label: "Delete",
      key: "Del",
      enabled: free
    },
    "separator",
    {
      action: "group",
      label: "Group",
      enabled: canGroup(elements, sel)
    },
    {
      action: "ungroup",
      label: "Ungroup",
      enabled: canUngroup(elements, sel)
    },
    "separator",
    {
      action: "lock",
      label: "Lock",
      enabled: anyOpen
    },
    {
      action: "unlock",
      label: "Unlock",
      enabled: anyMarked
    }
  ];
}
function visibilityEntries(s) {
  const elements = s.doc.screen.elements;
  const sel = s.selection.map((id) => findById(elements, id)?.el).filter((e) => e !== void 0);
  return [
    {
      action: "hide",
      label: "Hide",
      enabled: sel.some((e) => e.hidden !== true)
    },
    {
      action: "show",
      label: "Show",
      enabled: sel.some((e) => e.hidden === true)
    }
  ];
}
function layoutEntries(s) {
  const elements = s.doc.screen.elements;
  const sel = s.selection.filter((id) => findById(elements, id) !== void 0);
  const wrap = canWrap(elements, sel);
  const one = sel.length === 1 ? findById(elements, sel[0]).el : void 0;
  const box7 = one && (one.type === "rect" || one.type === GROUP_TYPE2) ? one : void 0;
  const dir = box7 ? layoutOf(box7)?.dir : void 0;
  return [
    {
      action: "column",
      label: "\u7E26\u306B\u4E26\u3079\u308B",
      enabled: wrap && dir !== "column"
    },
    {
      action: "row",
      label: "\u6A2A\u306B\u4E26\u3079\u308B",
      enabled: wrap && dir !== "row"
    },
    {
      action: "unlayout",
      label: "\u4E26\u3079\u65B9\u3092\u5916\u3059",
      enabled: box7 !== void 0 && dir !== void 0 && !isLocked(elements, box7.id)
    }
  ];
}
function fullMenu(s, hasClip) {
  return [
    ...menuEntries(s, hasClip),
    ...visibilityEntries(s),
    "separator",
    ...layoutEntries(s)
  ];
}
function menuAllows(s, hasClip, action) {
  return fullMenu(s, hasClip).some((e) => e !== "separator" && e.action === action && e.enabled);
}
function defaultMenu(exists) {
  return [
    {
      label: "\u76F4\u3059",
      action: "default-edit",
      enabled: true
    },
    {
      label: "\u5143\u306E\u5F62\u306B\u623B\u3059",
      action: "default-reset",
      enabled: exists
    }
  ];
}
var closeOpen;
function closeMenu() {
  closeOpen?.();
  closeOpen = void 0;
}
function openMenu(client, entries, onPick) {
  closeMenu();
  const node = el("div", {
    class: "ctx-menu",
    role: "menu"
  });
  for (const entry of entries) {
    if (entry === "separator") {
      node.append(el("div", {
        class: "ctx-sep"
      }));
      continue;
    }
    const row = el("div", {
      class: "ctx-item" + (entry.enabled ? "" : " is-disabled"),
      role: "menuitem"
    }, el("span", {
      class: "ctx-label"
    }, entry.label), el("span", {
      class: "ctx-key"
    }, entry.key ?? ""));
    if (entry.enabled) {
      row.addEventListener("click", () => {
        closeMenu();
        onPick(entry.action);
      });
    }
    node.append(row);
  }
  node.addEventListener("contextmenu", (e) => e.preventDefault());
  document.body.append(node);
  const size = node.getBoundingClientRect();
  node.style.left = `${Math.max(0, Math.min(client.x, globalThis.innerWidth - size.width))}px`;
  node.style.top = `${Math.max(0, Math.min(client.y, globalThis.innerHeight - size.height))}px`;
  const onDown = (e) => {
    if (!node.contains(e.target)) closeMenu();
  };
  const onKey = (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  };
  document.addEventListener("pointerdown", onDown, true);
  document.addEventListener("keydown", onKey, true);
  closeOpen = () => {
    document.removeEventListener("pointerdown", onDown, true);
    document.removeEventListener("keydown", onKey, true);
    node.remove();
  };
}

// src/core/guide.ts
var HEADER_NAMES = [
  "home",
  "save",
  "undo",
  "redo",
  "edit",
  "play",
  "proposal",
  "screen",
  "zoom-fit",
  "zoom-100",
  "guide"
];
var SECTION_NAMES = [
  "select",
  "elements",
  "dynamic"
];
var DYNAMIC_IDS = [
  "dialog",
  "sheet",
  "menu",
  "notification",
  "select-open",
  "pager",
  "refresh",
  "toast",
  "drawer",
  "accordion",
  "loading",
  "field-error",
  "date-picker",
  "time-picker",
  "tooltip"
];
var START_TABS = [
  "recent",
  "templates"
];
var TEMPLATES_TABS = [
  "blank",
  "builtin",
  "custom",
  "ai"
];
var PROPS_ITEMS = /* @__PURE__ */ new Set([
  "title",
  "device",
  "x",
  "y",
  "w",
  "h",
  "text",
  "variant",
  "name"
]);
var ID = ID_PATTERN;
var has = (list, v) => list.includes(v);
function parseTarget(s, registry2) {
  if (s === "banner") return {
    kind: "banner",
    name: ""
  };
  const i = s.indexOf(":");
  if (i <= 0) return void 0;
  const kind = s.slice(0, i), name = s.slice(i + 1);
  if (name === "") return void 0;
  switch (kind) {
    case "header":
      return has(HEADER_NAMES, name) ? {
        kind,
        name
      } : void 0;
    case "section":
      return has(SECTION_NAMES, name) ? {
        kind,
        name
      } : void 0;
    case "select":
    case "canvas":
    case "state":
      return ID.test(name) ? {
        kind,
        name
      } : void 0;
    case "elements": {
      const [type, second, ...rest] = name.split(":");
      if (!/^[a-z]+$/.test(type) || registry2 && !registry2.has(type)) return void 0;
      if (second === void 0) return {
        kind,
        name
      };
      if (second === "default" && rest.length === 0) return {
        kind,
        name
      };
      if (second === "myset" && rest.length > 0 && rest.join(":") !== "") return {
        kind,
        name
      };
      return void 0;
    }
    case "dynamic":
      return has(DYNAMIC_IDS, name) ? {
        kind,
        name
      } : void 0;
    case "props":
      return PROPS_ITEMS.has(name) || /^(style|props|layout)\.[a-zA-Z]+$/.test(name) ? {
        kind,
        name
      } : void 0;
    case "block":
      return /^[1-9][0-9]*$/.test(name) ? {
        kind,
        name
      } : void 0;
    case "theme":
      return ID.test(name) ? {
        kind,
        name
      } : void 0;
    case "button":
    case "menu":
      return name.trim() === name ? {
        kind,
        name
      } : void 0;
    case "start": {
      if (has(START_TABS, name)) return {
        kind,
        name
      };
      const t = /^templates:([a-z]+)$/.exec(name);
      if (t) return has(TEMPLATES_TABS, t[1]) ? {
        kind,
        name
      } : void 0;
      const sc = /^screen:([^/]+)\/([^/]+)$/.exec(name);
      return sc && ID.test(sc[1]) && ID.test(sc[2]) ? {
        kind,
        name
      } : void 0;
    }
    default:
      return void 0;
  }
}
var guideTag = {
  header: (name) => `header:${name}`,
  banner: () => "banner",
  section: (name) => `section:${name}`,
  select: (id) => `select:${id}`,
  elementsType: (type) => `elements:${type}`,
  elementsDefault: (type) => `elements:${type}:default`,
  elementsMyset: (type, name) => `elements:${type}:myset:${name}`,
  dynamic: (id) => `dynamic:${id}`,
  canvas: (id) => `canvas:${id}`,
  props: (item) => `props:${item}`,
  state: (id) => `state:${id}`,
  block: (n) => `block:${n}`,
  theme: (id) => `theme:${id}`,
  start: (tab) => `start:${tab}`,
  startTemplates: (tab) => `start:templates:${tab}`,
  startScreen: (pid, id) => `start:screen:${pid}/${id}`
};

// src/editor/panels/tree.ts
var OPEN = "\u25BE";
var ROOT = "(root)";
var CLOSED = "\u25B8";
var LOCK = "\u{1F512}";
var EYE = {
  shown: "\u{1F441}",
  hidden: "\u2013",
  only: "\uFF0B"
};
var FRONT = Number.MAX_SAFE_INTEGER;
function rowLabel(elm, row) {
  return `${row + 1}  ${rowText(elm, row) ?? "(\u7DDA)"}`;
}
function treeLabel(elm, mark = true) {
  const base = elm.name ? elm.name : elm.text ? `${elm.type}  ${elm.text}` : `${elm.type}  ${elm.id}`;
  const L = mark ? layoutOf(elm) : void 0;
  return L ? `${base}  ${L.dir === "column" ? "\u2193" : "\u2192"}` : base;
}
function positionRowsNotice(box7) {
  return `${treeLabel(box7, false)} \u306E\u4E2D\u8EAB\u306E State \u306E\u4F4D\u7F6E\u306E\u9055\u3044\u3092\u843D\u3068\u3057\u307E\u3057\u305F(\u4E26\u3079\u308B\u7BB1\u306E\u4E2D\u3067\u306F\u4F4D\u7F6E\u306F\u7BB1\u304C\u6C7A\u3081\u307E\u3059)`;
}
function treeRows(screen, collapsed, isContainer, openLists = /* @__PURE__ */ new Set()) {
  const rows2 = [];
  if (collapsed.has(ROOT)) return rows2;
  const walk = (list, parent, depth) => {
    list.forEach((elm, index) => {
      const open = (elm.children?.length ?? 0) > 0 && !collapsed.has(elm.id);
      rows2.push({
        el: elm,
        parent,
        index,
        depth,
        container: isContainer(elm.type),
        open
      });
      if (open) walk(elm.children, elm.id, depth + 1);
      if (elm.type === "list" && hasRows(elm) && openLists.has(elm.id)) {
        rowsOf(elm).forEach((_r, row) => rows2.push({
          el: elm,
          parent,
          index,
          depth: depth + 1,
          container: false,
          open: false,
          row
        }));
      }
    });
  };
  walk(screen.elements, void 0, 1);
  return rows2;
}
function faintIds(screen) {
  const out = /* @__PURE__ */ new Set();
  const walk = (list, faint) => {
    for (const elm of list) {
      const f = faint || elm.hidden === true;
      if (f) out.add(elm.id);
      if (elm.children) walk(elm.children, f);
    }
  };
  walk(screen.elements, false);
  return out;
}
function eyeMark(elm, stateOnly) {
  return elm.hidden === true ? "hidden" : stateOnly.has(elm.id) ? "only" : "shown";
}
function dropZone(container, ratio) {
  if (container) return ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "into";
  return ratio < 0.5 ? "before" : "after";
}
function dropPlace(row, zone) {
  if (!row) return {
    parent: void 0,
    index: FRONT
  };
  if (zone === "into") return {
    parent: row.el.id,
    index: FRONT
  };
  if (zone === "before") return {
    parent: row.parent,
    index: row.index
  };
  return row.open ? {
    parent: row.el.id,
    index: 0
  } : {
    parent: row.parent,
    index: row.index + 1
  };
}
function trackDrag(container, p, rows2, ids, label, down) {
  let ghost;
  let line;
  let marked;
  let place3;
  const clearMarks = () => {
    line?.remove();
    line = void 0;
    marked?.classList.remove("is-drop-target");
    marked = void 0;
    place3 = void 0;
  };
  const onMove = (e) => {
    if (!ghost) {
      if (Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) < LAYOUT.dragThreshold) {
        return;
      }
      ghost = el("div", {
        class: "tree-ghost"
      }, ids.length > 1 ? `${label} \u307B\u304B ${ids.length - 1} \u500B` : label);
      document.body.append(ghost);
    }
    ghost.style.left = `${e.clientX + 12}px`;
    ghost.style.top = `${e.clientY + 8}px`;
    clearMarks();
    const rowEl = document.elementFromPoint(e.clientX, e.clientY)?.closest(".tree-row");
    if (!rowEl || !container.contains(rowEl)) return;
    const box7 = rowEl.getBoundingClientRect();
    const target = rows2.find((r) => r.el.id === rowEl.dataset.id);
    const zone = target ? dropZone(target.container, (e.clientY - box7.top) / box7.height) : "into";
    const next = dropPlace(target, zone);
    if (!p.canDrop(ids, next.parent)) return;
    place3 = next;
    if (zone === "into") {
      rowEl.classList.add("is-drop-target");
      marked = rowEl;
    } else {
      const indent = parseFloat(rowEl.style.paddingLeft || "0") + (zone === "after" && target?.open ? LAYOUT.treeIndent : 0);
      line = el("div", {
        class: "tree-drop-line"
      });
      line.style.left = `${box7.left + indent}px`;
      line.style.width = `${Math.max(0, box7.width - indent)}px`;
      line.style.top = `${(zone === "before" ? box7.top : box7.bottom) - 1}px`;
      document.body.append(line);
    }
  };
  const stop = (commit) => {
    globalThis.removeEventListener("pointermove", onMove);
    globalThis.removeEventListener("pointerup", onUp);
    globalThis.removeEventListener("pointercancel", onCancel);
    document.removeEventListener("keydown", onKey, true);
    const dragged = ghost !== void 0;
    const target = place3;
    ghost?.remove();
    clearMarks();
    if (!dragged) return;
    const swallow = (c) => c.stopPropagation();
    container.addEventListener("click", swallow, true);
    setTimeout(() => container.removeEventListener("click", swallow, true), 0);
    if (commit && target) p.onMove(ids, target.parent, target.index);
  };
  const onUp = () => stop(true);
  const onCancel = () => stop(false);
  const onKey = (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    stop(false);
  };
  globalThis.addEventListener("pointermove", onMove);
  globalThis.addEventListener("pointerup", onUp);
  globalThis.addEventListener("pointercancel", onCancel);
  document.addEventListener("keydown", onKey, true);
}
function renderTree(container, p) {
  clear(container);
  container.append(el("div", {
    class: "tree-row" + (p.selection.length === 0 ? " is-current" : ""),
    style: "padding-left:8px",
    onclick: () => p.onRoot(),
    oncontextmenu: (e) => {
      e.preventDefault();
      p.onMenu(void 0, {
        x: e.clientX,
        y: e.clientY
      });
    }
  }, el("span", {
    class: "tree-toggle",
    onclick: (e) => {
      e.stopPropagation();
      p.onToggle(ROOT);
    }
  }, p.collapsed.has(ROOT) ? CLOSED : OPEN), el("span", {
    class: "tree-label"
  }, "Root")));
  const rows2 = treeRows(p.screen, p.collapsed, p.isContainer, p.openLists);
  const here = (id) => {
    const part = findById(p.screen.elements, id)?.el;
    return part ? partLabel(part) : id;
  };
  const faint = faintIds(p.screen);
  for (const row of rows2) {
    const elm = row.el;
    if (row.row !== void 0) {
      const n = row.row;
      const current = p.focusedRow?.list === elm.id && p.focusedRow.index === n;
      container.append(el("div", {
        class: "tree-row is-row" + (current ? " is-current" : "") + (faint.has(elm.id) ? " is-faint" : ""),
        style: `padding-left:${8 + row.depth * LAYOUT.treeIndent}px`,
        "data-id": elm.id,
        "data-guide": guideTag.select(elm.id),
        onclick: (e) => e.shiftKey ? p.onSelect(elm.id, true) : p.onSelectRow(elm.id, n),
        oncontextmenu: (e) => {
          e.preventDefault();
          p.onMenu(elm.id, {
            x: e.clientX,
            y: e.clientY
          });
        }
      }, el("span", {
        class: "tree-toggle is-empty"
      }, ""), el("span", {
        class: "tree-label"
      }, rowLabel(elm, n))));
      continue;
    }
    const hasChildren = (elm.children?.length ?? 0) > 0;
    const listRows = elm.type === "list" && hasRows(elm);
    const opens = hasChildren || listRows;
    const isOpen = hasChildren ? row.open : p.openLists.has(elm.id);
    const toggle = el("span", {
      class: "tree-toggle" + (opens ? "" : " is-empty")
    }, opens ? isOpen ? OPEN : CLOSED : "");
    if (opens) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        if (hasChildren) p.onToggle(elm.id);
        else p.onToggleList(elm.id);
      });
    }
    const own = elm.locked === true;
    const lock = el("span", {
      class: "tree-lock" + (own ? " is-on" : ""),
      title: own ? "\u30ED\u30C3\u30AF\u3092\u5916\u3059" : "\u30ED\u30C3\u30AF\u3059\u308B"
    }, LOCK);
    lock.addEventListener("click", (e) => {
      e.stopPropagation();
      p.onToggleLock(elm.id);
    });
    const mark = eyeMark(elm, p.stateOnly);
    const eye = el("span", {
      class: "tree-eye" + (mark === "shown" ? "" : " is-on"),
      title: mark === "hidden" ? "\u3053\u306E State \u3067\u51FA\u3059" : "\u3053\u306E State \u3067\u96A0\u3059"
    }, EYE[mark]);
    eye.addEventListener("click", (e) => {
      e.stopPropagation();
      p.onToggleHidden(elm.id);
    });
    const node = el("div", {
      class: "tree-row" + (p.selection.includes(elm.id) ? " is-current" : "") + (faint.has(elm.id) ? " is-faint" : ""),
      style: `padding-left:${8 + row.depth * LAYOUT.treeIndent}px`,
      title: elm.id,
      "data-id": elm.id,
      "data-guide": guideTag.select(elm.id),
      onclick: (e) => p.onSelect(elm.id, e.shiftKey),
      oncontextmenu: (e) => {
        e.preventDefault();
        p.onMenu(elm.id, {
          x: e.clientX,
          y: e.clientY
        });
      }
    }, toggle, el("span", {
      class: "tree-label"
    }, treeLabel(elm)), ...elm.from ? [
      el("span", {
        class: "tree-from"
      }, `\u2190 ${refLabel(elm.from, here, p.kept ?? [], partLabel)}`)
    ] : [], eye, lock);
    node.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest(".tree-toggle, .tree-lock, .tree-eye")) return;
      const ids = p.dragIds(elm.id);
      if (ids.length > 0) trackDrag(container, p, rows2, ids, treeLabel(elm), e);
    });
    container.append(node);
  }
}

// src/editor/panels/play.ts
var PATH_START = "(\u3053\u306E\u753B\u9762\u304B\u3089\u59CB\u3081\u305F)";
var FRESH_MS = 1e3;
function playRows(run, title, changedAt, now, values) {
  const screen = run.screens[run.current];
  const label = (owner) => {
    if (owner === SCREEN) return "\u753B\u9762";
    const el2 = findById(screen.elements, owner)?.el;
    return el2 ? treeLabel(el2, false) : owner;
  };
  const stateName = (owner, id) => statesOf(screen, owner === SCREEN ? void 0 : owner)?.find((s) => s.id === id)?.name ?? id;
  return {
    screen: title(run.current),
    path: run.path.map(title),
    standing: standing(run).map(({ owner, state }) => ({
      owner,
      label: label(owner),
      state: stateName(owner, state),
      fresh: now - (changedAt.get(owner) ?? -Infinity) < FRESH_MS
    })),
    values: values ? valuesNow(run, values.registry).map(({ id, value }) => {
      const el2 = findById(screen.elements, id)?.el;
      const shown2 = findById(currentLook(run, values.registry), id)?.el;
      return {
        id,
        label: (el2 ? partLabel(el2) : id) + (el2?.keep === true ? "(\u6301\u3061\u8D8A\u3057)" : ""),
        value: shown2?.type === "list" && typeof value === "number" ? rowValueText(shown2, value) : valueTextOf(shown2 ?? el2, value),
        fresh: now - (values.changedAt.get(id) ?? -Infinity) < FRESH_MS
      };
    }) : [],
    kept: values ? keptNow(run, values.registry, values.order).map(({ screen: sid, id, value }) => {
      const el2 = findById(run.screens[sid].elements, id)?.el;
      const rows2 = run.keptRows?.[sid]?.[id];
      const held = el2 && rows2 ? withRows(el2, rows2) : el2;
      return {
        id: `${sid}/${id}`,
        label: `${title(sid)} \u203A ${el2 ? partLabel(el2) : id}`,
        value: held?.type === "list" && typeof value === "number" ? rowValueText(held, value) : valueTextOf(held, value),
        fresh: false
      };
    }) : [],
    pending: pending(run, now).map((p) => ({
      key: `${p.owner}
${p.kind}`,
      label: label(p.owner),
      kind: p.kind,
      left: p.left
    }))
  };
}
function valueTextOf(el2, value) {
  if (el2?.type === "slider" && typeof value === "number") return sliderText(el2, value);
  return el2 && CHOICE_TYPES.includes(el2.type) && typeof value === "number" ? choiceLabel(el2, value) : valueText2(value);
}
function leftText(ms) {
  return `\u3042\u3068 ${(Math.ceil(ms / 100) / 10).toFixed(1)} \u79D2`;
}
function renderPlayPanel(container, rows2, onRestart) {
  clear(container);
  const sub = (text18) => el("div", {
    class: "play-sub"
  }, text18);
  container.append(el("div", {
    class: "play-title"
  }, "\u518D\u751F"), sub("\u3044\u307E\u306E\u753B\u9762"), el("div", {
    class: "play-screen"
  }, rows2.screen), el("div", {
    class: "play-path muted"
  }, rows2.path.length ? `\u6765\u305F\u9053: ${[
    ...rows2.path,
    rows2.screen
  ].join(" \u203A ")}` : `\u6765\u305F\u9053: ${PATH_START}`), el("hr", {
    class: "play-rule"
  }), sub("\u3044\u307E\u306E State"));
  if (rows2.standing.length === 0) {
    container.append(el("div", {
      class: "muted play-none"
    }, "State \u3092\u6301\u3064\u7BB1\u306F\u3042\u308A\u307E\u305B\u3093"));
  }
  for (const r of rows2.standing) {
    container.append(el("div", {
      class: "play-row" + (r.fresh ? " is-fresh" : ""),
      "data-owner": r.owner
    }, el("span", {
      class: "play-row-label"
    }, r.label), el("span", {
      class: "play-row-state"
    }, r.state)));
  }
  container.append(sub("\u90E8\u54C1\u306E\u5024"));
  if (rows2.values.length === 0) {
    container.append(el("div", {
      class: "muted play-none"
    }, "\u5024\u3092\u6301\u3064\u90E8\u54C1\u306F\u3042\u308A\u307E\u305B\u3093"));
  }
  for (const r of rows2.values) {
    container.append(el("div", {
      class: "play-row play-value" + (r.fresh ? " is-fresh" : ""),
      "data-part": r.id
    }, el("span", {
      class: "play-row-label"
    }, r.label), el("span", {
      class: "play-row-state"
    }, r.value)));
  }
  container.append(sub("\u6301\u3061\u8D8A\u3059\u5024"));
  if (rows2.kept.length === 0) {
    container.append(el("div", {
      class: "muted play-none"
    }, "\u4ED6\u306E\u753B\u9762\u306B\u6301\u3061\u8D8A\u3059\u5024\u306F\u3042\u308A\u307E\u305B\u3093"));
  }
  for (const r of rows2.kept) {
    container.append(el("div", {
      class: "play-row play-value play-kept",
      "data-part": r.id
    }, el("span", {
      class: "play-row-label"
    }, r.label), el("span", {
      class: "play-row-state"
    }, r.value)));
  }
  container.append(el("hr", {
    class: "play-rule"
  }), sub("\u5F85\u3063\u3066\u3044\u308B\u3082\u306E"));
  if (rows2.pending.length === 0) container.append(el("div", {
    class: "muted play-none"
  }, "\u306A\u3057"));
  for (const p of rows2.pending) {
    container.append(el("div", {
      class: "play-row play-pending",
      "data-key": p.key
    }, el("span", {
      class: "play-row-label"
    }, p.label), el("span", {
      class: "play-row-kind"
    }, p.kind === "after" ? "\u6642\u9593\u304C\u305F\u3063\u305F\u3089" : "\u5F85\u3064"), el("span", {
      class: "play-row-state play-left"
    }, leftText(p.left))));
  }
  container.append(el("button", {
    class: "btn btn-block play-restart",
    onclick: onRestart
  }, "\u6700\u521D\u304B\u3089"));
}
function updateLeft(container, rows2) {
  const spots = container.querySelectorAll(".play-left");
  const keys = [
    ...container.querySelectorAll(".play-pending")
  ].map((r) => r.getAttribute("data-key"));
  if (spots.length !== rows2.pending.length || rows2.pending.some((p, i) => keys[i] !== p.key)) {
    return false;
  }
  rows2.pending.forEach((p, i) => {
    const text18 = leftText(p.left);
    if (spots[i].textContent !== text18) spots[i].textContent = text18;
  });
  return true;
}

// src/editor/play.ts
function playingOf(shot) {
  return {
    elements: shot.elements,
    show: shot.show,
    bare: true,
    ...shot.screen ? {
      screen: shot.screen
    } : {},
    ...shot.under ? {
      under: shot.under
    } : {},
    ...shot.scrolls ? {
      scrolls: shot.scrolls
    } : {}
  };
}
function followed(f, id) {
  for (const tr of f?.trs ?? []) {
    const track = tr.tracks.find((t) => t.id === id);
    if (track) return track.steps ? {
      tr,
      track
    } : void 0;
  }
  return void 0;
}
var Play = class {
  clock;
  deps;
  run;
  screens;
  startId;
  moves;
  /**
   * 「…で動かす」 going on on the current screen (saved-motions spec §3.4): put on top of what is
   * shown in `shot`, never into `last`, so that nothing of them leaks into the next move.
   */
  effects;
  screenMove;
  /** The swipe following the finger (gesture spec §4.4). */
  follow;
  /**
   * While a swipe let go all the way is told to the run: the moves of the owners it followed
   * (`owners`) take a share of the time (§4.5); the step's other moves take their normal time.
   */
  timing;
  /** While a swipe let go all the way is told to the run: the owners whose state it changed. */
  touched;
  handle;
  /** The frame drawn last, so that a new move continues from what is seen (spec §4.3). */
  last;
  dirty;
  /** The part under the pointer, and the one being pressed, for the reactions (spec §4.6). */
  hover;
  /** Whether the hover shows its reaction: false under a touch, which has no pointer resting there. */
  hoverLooks;
  pressed;
  /** Screen id -> how far each of its boxes has sent its contents (scroll spec §4.5). */
  scrolls;
  lastPanel;
  /** Set while a state changed within FRESH_MS ago and the panel has not yet been told it wore off. */
  freshDue;
  /** The brightness each reacting part is easing from and to, since when (spec §4.6, at the theme's fast speed). */
  bright;
  reacting;
  /** When the pointer last moved over another part or a press began or ended. */
  reactAt;
  /** When each owner of the current screen last changed state, for the panel to mark it. */
  changedAt;
  /** When each part of the current screen last changed its value, for the panel to mark it. */
  valueChangedAt;
  /**
   * ▶ of one block, while it plays: the states it began in, what to call when it is over, whether a
   * screen came or went (then it stays until stopped), when everything last came to rest, and
   * whether it is on its way back.
   */
  trial;
  constructor(clock, deps) {
    this.clock = clock;
    this.deps = deps;
    this.screens = {};
    this.startId = "";
    this.moves = [];
    this.effects = [];
    this.dirty = true;
    this.hoverLooks = true;
    this.scrolls = /* @__PURE__ */ new Map();
    this.lastPanel = 0;
    this.freshDue = false;
    this.bright = /* @__PURE__ */ new Map();
    this.reacting = false;
    this.reactAt = 0;
    this.changedAt = /* @__PURE__ */ new Map();
    this.valueChangedAt = /* @__PURE__ */ new Map();
  }
  get running() {
    return this.run !== void 0;
  }
  /**
   * Begins on `startId` with `screens` (the proposal's, as written; the open one with its unsaved
   * edits). When the start throws, nothing runs and `failed` is told.
   */
  start(screens, startId) {
    this.guarded(() => this.begin(screens, startId));
  }
  begin(screens, startId) {
    const now = this.clock.now();
    const { run, effects } = startRun(screens, startId, this.deps.theme(), this.deps.registry, now);
    this.prepare(screens, startId, run);
    this.apply(effects, now, startId, void 0);
    this.dirty = true;
    this.deps.changed();
    if (this.handle === void 0) this.loop();
  }
  /** What a run begins with: no moves, no marks, no reactions. */
  prepare(screens, startId, run) {
    this.screens = screens;
    this.startId = startId;
    this.moves = [];
    this.effects = [];
    this.screenMove = void 0;
    this.follow = void 0;
    this.last = void 0;
    this.hover = void 0;
    this.hoverLooks = true;
    this.pressed = void 0;
    this.scrolls = /* @__PURE__ */ new Map();
    this.changedAt = /* @__PURE__ */ new Map();
    this.valueChangedAt = /* @__PURE__ */ new Map();
    this.freshDue = false;
    this.bright = /* @__PURE__ */ new Map();
    this.reacting = false;
    this.run = run;
  }
  /**
   * ▶ of a block (triggers spec §5.3): the block `block` of `owner` (SCREEN = the screen's own) runs
   * its Then once on `startId`, which starts in `states` (as the canvas shows it). When everything has
   * come to rest, a pause (PLAY_HOLD), then each owner moves back to `states`, and `onEnd` is called;
   * a Then that went to another screen (or back) stays there until `stop`, which calls `onEnd` too.
   */
  tryBlock(screens, startId, states, owner, block, onEnd, scrolls) {
    this.guarded(() => {
      this.stop();
      const now = this.clock.now();
      let started;
      try {
        started = tryBlock(screens, startId, states, owner, block, this.deps.theme(), this.deps.registry, now);
      } catch (error) {
        onEnd();
        throw error;
      }
      const { run, effects, rows: rows2 } = started;
      this.prepare(screens, startId, run);
      if (scrolls && Object.keys(scrolls).length) this.scrolls.set(startId, scrolls);
      this.trial = {
        states,
        onEnd,
        moved: false,
        returning: false
      };
      const seen = {
        elements: lookOf(screens[startId], states, this.deps.registry, {}, (ref) => textOfRef(run, this.deps.registry, ref, startId), run.runs[startId]?.rows),
        show: /* @__PURE__ */ new Map()
      };
      this.apply(effects, now, startId, seen);
      this.reveal(rows2, now);
      this.dirty = true;
      if (this.handle === void 0) this.loop();
    });
  }
  /** Rows added (values spec §11): each list of the top screen is sent so that its new row shows. */
  reveal(rows2, now) {
    const run = this.run;
    if (!run || !rows2) return;
    for (const r of rows2) {
      if (r.screen !== run.current) continue;
      const look = this.frameOf(r.screen, void 0).elements;
      this.scrolls.set(r.screen, revealRow(look, this.scrollsOf(r.screen), r.part, r.at, now));
    }
    if (rows2.length) this.dirty = true;
  }
  /** ▶ of a block: once all is at rest, a pause; then back to where it began; then it is over. */
  settle(now) {
    const t = this.trial;
    const run = this.run;
    if (!t || !run) return;
    const busy = this.moves.length > 0 || this.effects.length > 0 || this.screenMove !== void 0 || nextDue(run) !== void 0;
    if (busy || t.moved) {
      t.restedAt = void 0;
      return;
    }
    if (t.returning) {
      this.stop();
      return;
    }
    t.restedAt ??= now;
    if (now - t.restedAt < PLAY_HOLD) return;
    t.returning = true;
    const held = run.runs[run.current].values;
    const back = restoreStates(run, t.states, now, this.deps.registry);
    this.run = back.run;
    this.apply(back.effects, now, back.run.current, this.last);
    this.noteValues(held, void 0, now);
  }
  /**
   * The parts whose value differs between `before` and `after` (what the current screen's parts
   * held): marked for the panel, and drawn again. Whether any did.
   */
  noteValues(before, after, now) {
    const ids = /* @__PURE__ */ new Set([
      ...Object.keys(before ?? {}),
      ...Object.keys(after ?? {})
    ]);
    let any = false;
    for (const id of ids) {
      if (before?.[id] === after?.[id]) continue;
      this.valueChangedAt.set(id, now);
      any = true;
    }
    if (any) {
      this.freshDue = true;
      this.dirty = true;
    }
    return any;
  }
  /** 「最初から」: the screen 再生 began on, in its first look; the way back is gone. */
  restart() {
    if (this.run) this.start(this.screens, this.startId);
  }
  /** Ends 再生 (or ▶ of a block, whose `onEnd` is called): the document is drawn again. */
  stop() {
    if (this.handle !== void 0) this.clock.cancel(this.handle);
    this.handle = void 0;
    const trial = this.trial;
    this.trial = void 0;
    if (!this.run) return;
    this.run = void 0;
    this.moves = [];
    this.effects = [];
    this.screenMove = void 0;
    this.follow = void 0;
    this.last = void 0;
    try {
      this.deps.draw(void 0);
    } finally {
      trial?.onEnd();
    }
  }
  /** Whether ▶ of a block is what runs. */
  get trying() {
    return this.trial !== void 0;
  }
  /** The parts of the top screen as they are drawn now (where a press lands). */
  elements() {
    return this.last?.elements ?? (this.run ? this.frameOf(this.run.current, void 0).elements : []);
  }
  /** The text typed into the input `id` (triggers spec §4.7). */
  type(id, text18) {
    this.event({
      kind: "input",
      id,
      text: text18
    });
  }
  /**
   * The pointer is over the part `id` (undefined = over nothing). `looks`: the part shows its hover
   * reaction (false for a touch, so that a tapped part is not left darker); a change of `looks` alone
   * fires no enter or leave.
   */
  hoverAt(id, looks = true) {
    if (!this.run) return;
    if (id === this.hover) {
      if (looks !== this.hoverLooks) {
        this.hoverLooks = looks;
        this.reactAt = this.clock.now();
        this.dirty = true;
      }
      return;
    }
    const was = this.hover;
    this.hover = id;
    this.hoverLooks = looks;
    this.reactAt = this.clock.now();
    this.dirty = true;
    if (was !== void 0) this.event({
      kind: "leave",
      id: was
    });
    if (id !== void 0) this.event({
      kind: "enter",
      id
    });
  }
  /** The part `id` is pressed, at `place` inside it when it has places. */
  pressAt(id, place3) {
    if (!this.run) return;
    this.pressed = id;
    this.reactAt = this.clock.now();
    this.dirty = true;
    this.event({
      kind: "press",
      id,
      ...place3 !== void 0 ? {
        place: place3
      } : {}
    });
  }
  /** The slider `id` is dragged to `value` (spec §4): it follows quietly; nothing fires until `slideEnd`. */
  slideAt(id, value) {
    if (!this.run) return;
    this.event({
      kind: "slide",
      id,
      value
    });
  }
  /**
   * The finger left the slider `id`, which held `before` when it went down (spec §4): its change
   * blocks fire when it holds something else now, then, for a tap (`press`), it is pressed.
   */
  slideEnd(id, before, press) {
    if (!this.run) return;
    if (press) {
      this.pressed = id;
      this.reactAt = this.clock.now();
      this.dirty = true;
    }
    this.event({
      kind: "slideEnd",
      id,
      before,
      press
    });
  }
  /** What the part `id` of the top screen holds now (undefined = no such part, or it holds no value). */
  valueOf(id) {
    const run = this.run;
    if (!run) return void 0;
    return valueIn(currentLook(run, this.deps.registry), run.runs[run.current].values, id);
  }
  /** The on/off mark at the end of row `row` of the list `id` was pressed (values spec §11): the row is not pressed. */
  checkAt(id, row) {
    if (!this.run) return;
    this.event({
      kind: "check",
      id,
      row
    });
  }
  /** The pointer went down on the part `id`: it looks pressed (spec §4.6) until `release`; the press itself comes on release. */
  pressDown(id) {
    if (!this.run) return;
    this.pressed = id;
    this.reactAt = this.clock.now();
    this.dirty = true;
  }
  /** How far each box of the screen `id` (the top one when left out) has sent its contents. */
  scrollsOf(id) {
    const screen = id ?? this.run?.current;
    return screen === void 0 ? {} : this.scrolls.get(screen) ?? {};
  }
  /** The box `id` of the top screen is sent further by (`dx`, `dy`) (a wheel, scroll spec §4.1), within its range. */
  scrollBy(id, by) {
    if (!this.run) return;
    const screen = this.run.current;
    this.scrolls.set(screen, scrollBy(this.elements(), this.scrollsOf(screen), id, by, this.clock.now()));
    this.dirty = true;
  }
  /** The box `id` of the top screen is sent to `to` on `axis` (a drag, spec §4.2), within its range. */
  scrollTo(id, axis, to) {
    if (!this.run) return;
    const screen = this.run.current;
    const held = this.scrollsOf(screen);
    this.scrolls.set(screen, scrollTo(this.elements(), held, id, axis, to, this.clock.now()));
    this.dirty = true;
  }
  release() {
    if (this.pressed === void 0) return;
    this.pressed = void 0;
    this.reactAt = this.clock.now();
    this.dirty = true;
  }
  key(key) {
    this.event({
      kind: "key",
      key
    });
  }
  /** Whether a swipe is following the finger now (gesture spec §4.4); a screen change ends it. */
  get following() {
    return this.follow !== void 0;
  }
  /** Gesture spec §4.1: how long the hold blocks around the part `hit` wait, shortest first. */
  holdTimes(hit) {
    const run = this.run;
    return run ? holdTimes(run.screens[run.current], hit)?.times ?? [] : [];
  }
  /** The part `id` was held still for `ms` (gesture spec §4.1). */
  holdAt(id, place3, ms) {
    if (!this.run) return;
    this.event({
      kind: "hold",
      id,
      ms,
      ...place3 !== void 0 ? {
        place: place3
      } : {}
    });
  }
  /** Whether `owner` (SCREEN = the screen) takes a swipe toward `dir` begun on `hit` at `place` (gesture spec §4.3). */
  swipeTakes(owner, dir, hit, place3) {
    const run = this.run;
    return run ? swipeTakes(run.screens[run.current], owner, dir, hit, place3) : false;
  }
  /**
   * Gesture spec §4.4: a swipe on `owner` toward `dir` begins. Where it heads is worked out without
   * changing the run; the parts it moves leave the moves they were in and are drawn from what is seen,
   * as far along as `swipeTo` says. Returns the distance that is all the way.
   */
  swipeBegin(owner, dir, hit, place3) {
    const run = this.run;
    if (!run) return FOLLOW_DEFAULT;
    const id = run.current;
    const begun = {
      ...run.runs[id].states
    };
    const heads = swipePreview(run, {
      owner,
      dir,
      ...hit !== void 0 ? {
        hit
      } : {},
      ...place3 !== void 0 ? {
        place: place3
      } : {}
    }, this.deps.registry);
    const seen = this.last ?? this.frameOf(id, void 0);
    const to = this.lookIn(heads);
    const now = this.clock.now();
    const changed = differing(begun, heads).sort((a, b) => this.depthOf(id, b) - this.depthOf(id, a));
    const trs = [];
    const starts = /* @__PURE__ */ new Map();
    const taken = /* @__PURE__ */ new Set();
    for (const o of changed) {
      const m = this.moveOf(o, begun[o], heads[o], seen.elements, seen.at, to, now);
      const tracks = m.tr.tracks.filter((t) => !taken.has(t.id));
      for (const t of tracks) {
        taken.add(t.id);
        const s = m.starts.get(t.id);
        if (s !== void 0) starts.set(t.id, s);
      }
      trs.push({
        ...m.tr,
        tracks,
        duration: Math.max(0, ...tracks.map((t) => t.duration))
      });
    }
    this.moves = this.moves.map((m) => ({
      ...m,
      tr: {
        ...m.tr,
        tracks: m.tr.tracks.filter((t) => !taken.has(t.id))
      }
    }));
    const distance = followDistance(seen.elements, to, dir, trs);
    this.follow = {
      owner,
      dir,
      ...hit !== void 0 ? {
        hit
      } : {},
      ...place3 !== void 0 ? {
        place: place3
      } : {},
      screen: id,
      begun,
      heads,
      trs,
      starts,
      distance,
      p: 0
    };
    this.dirty = true;
    return distance;
  }
  /** How far along the swipe is (0..1). */
  swipeTo(p) {
    if (!this.follow) return;
    this.follow.p = Math.min(1, Math.max(0, p));
    this.dirty = true;
  }
  /**
   * Gesture spec §4.5: the swipe is let go. All the way: the run is told, and its moves start from what
   * is seen, in (1 − p) of their time, decelerating. Short (or what the run did not move after all):
   * back from what is seen to the run's look, in p of the time.
   */
  swipeEnd(complete) {
    const f = this.follow;
    this.follow = void 0;
    if (!f || !this.run || this.run.current !== f.screen) return;
    this.dirty = true;
    const touched = /* @__PURE__ */ new Set();
    if (complete) {
      this.timing = {
        scale: 1 - f.p,
        easing: "decelerate",
        owners: new Set(differing(f.begun, f.heads)),
        follow: f
      };
      this.touched = touched;
      try {
        this.event({
          kind: "swipe",
          owner: f.owner,
          dir: f.dir,
          ...f.hit !== void 0 ? {
            hit: f.hit
          } : {},
          ...f.place !== void 0 ? {
            place: f.place
          } : {}
        });
      } finally {
        this.timing = void 0;
        this.touched = void 0;
      }
    }
    const run = this.run;
    if (!run || run.current !== f.screen) return;
    const now = this.clock.now();
    const seen = this.last ?? this.frameOf(run.current, void 0);
    const standing2 = run.runs[run.current].states;
    const to = this.frameOf(run.current, void 0).elements;
    const drawn2 = differing(f.begun, f.heads).sort((a, b) => this.depthOf(run.current, b) - this.depthOf(run.current, a));
    const taken = /* @__PURE__ */ new Set();
    for (const o of drawn2) {
      if (touched.has(o)) continue;
      const m = this.moveOf(o, f.heads[o], standing2[o], seen.elements, seen.at, to, now);
      const timed = withTiming(m.tr, f.p, "decelerate");
      const tracks = timed.tracks.filter((t) => !taken.has(t.id));
      for (const t of tracks) taken.add(t.id);
      this.moves = this.moves.filter((x) => x.owner !== o);
      this.moves.push({
        ...m,
        tr: {
          ...timed,
          tracks,
          duration: Math.max(0, ...tracks.map((t) => t.duration))
        }
      });
    }
  }
  /**
   * One event to the run; what it says happened becomes moves. When the step throws (blocks that
   * set each other off for ever, RunLimitError), the run ends and `failed` is told, as for a frame.
   */
  event(e) {
    this.guarded(() => {
      if (!this.run) return;
      const now = this.clock.now();
      const before = this.run.current;
      const waiting = this.run.runs[before].timers.map((t) => t.id).join();
      const held = this.run.runs[before].values;
      const heldRows = this.run.runs[before].rows;
      const { run, effects, rows: rows2 } = step(this.run, e, now, this.deps.registry);
      this.run = run;
      this.apply(effects, now, before, this.last);
      this.reveal(rows2, now);
      const valued2 = run.current === before && this.noteValues(held, run.runs[before].values, now);
      const rowed = run.current === before && rowsDiffer(heldRows, run.runs[before].rows);
      const moved = effects.length > 0 || run.current !== before || valued2 || rowed || run.runs[run.current].timers.map((t) => t.id).join() !== waiting;
      if (moved) this.deps.changed();
    });
  }
  /** Runs `fn`; when it throws, the run ends (the document is drawn again) and `failed` is told once. */
  guarded(fn) {
    try {
      fn();
    } catch (error) {
      this.stop();
      this.deps.failed(error);
    }
  }
  /**
   * Turns effects into moves. State effects of one owner on one screen become one move, from what
   * is seen (`seen`, on the screen `before`; a screen just come to starts from its first look) to
   * the look the run is heading for. A screen effect replaces the state moves (they were the old
   * screen's) and sets the screen move.
   */
  apply(effects, now, before, seen) {
    const run = this.run;
    const tone = themeTone(this.deps.theme());
    const owners2 = /* @__PURE__ */ new Map();
    for (const eff of effects) {
      if (eff.kind === "play") {
        if (eff.screen !== run.current) continue;
        this.effects = this.effects.filter((e) => e.id !== eff.part);
        this.effects.push({
          id: eff.part,
          motion: eff.motion,
          began: now
        });
        continue;
      }
      if (eff.kind === "state") {
        this.changedAt.set(eff.owner, now);
        this.freshDue = true;
        this.touched?.add(eff.owner);
        const key = `${eff.screen}
${eff.owner}`;
        const had = owners2.get(key);
        owners2.set(key, {
          screen: eff.screen,
          from: had ? had.from : eff.from,
          to: eff.to
        });
        continue;
      }
      if (this.trial) this.trial.moved = true;
      this.moves = [];
      this.effects = [];
      this.follow = void 0;
      this.changedAt = /* @__PURE__ */ new Map();
      this.valueChangedAt = /* @__PURE__ */ new Map();
      this.freshDue = false;
      for (const key of [
        ...owners2.keys()
      ]) if (!key.startsWith(`${eff.to}
`)) owners2.delete(key);
      const sentFrom = this.scrollsOf(eff.from);
      const fromLook = {
        ...seen ?? this.frameOf(eff.from, before === eff.from ? void 0 : {}),
        ...Object.keys(sentFrom).length ? {
          scrolls: sentFrom
        } : {}
      };
      if (eff.kind === "go") {
        this.scrolls.delete(eff.to);
        this.screenMove = {
          move: planScreenMove("go", eff.motion, tone),
          began: now,
          under: fromLook
        };
      } else {
        this.screenMove = {
          move: planScreenMove("back", eff.motion, tone),
          began: now,
          top: fromLook
        };
      }
      this.last = void 0;
      seen = void 0;
    }
    const ordered = [
      ...owners2
    ].sort((a, b) => this.depthOf(b[0].split("\n")[0], b[0].split("\n")[1]) - this.depthOf(a[0].split("\n")[0], a[0].split("\n")[1]));
    for (const [key, o] of ordered) {
      const screen = run.screens[o.screen];
      const standing2 = run.runs[o.screen];
      if (!screen || !standing2 || o.screen !== run.current) continue;
      const owner = key.split("\n")[1];
      const from = o.screen === before && seen ? seen.elements : this.frameOf(o.screen, {}).elements;
      const way = o.screen === before && seen ? seen.at : void 0;
      const made = this.moveOf(owner, o.from, o.to, from, way, this.lookIn(standing2.states), now);
      const planned = this.timing?.owners.has(owner) ? withTiming(made.tr, this.timing.scale, this.timing.easing) : made.tr;
      this.moves = this.moves.filter((m) => m.owner !== owner);
      const busy = /* @__PURE__ */ new Set();
      for (const m of this.moves) {
        for (const t of m.tr.tracks) if (now - m.began < t.duration) busy.add(t.id);
      }
      const free = planned.tracks.filter((t) => !busy.has(t.id));
      const follow = this.timing?.owners.has(owner) ? this.timing.follow : void 0;
      const tracks = [];
      for (const t of free) {
        const kept = t.steps && t.appears === void 0 ? followed(follow, t.id) : void 0;
        if (!kept) {
          tracks.push(t);
          continue;
        }
        const rest = withTiming({
          ...kept.tr,
          tracks: [
            kept.track
          ]
        }, this.timing.scale);
        const p0 = follow.starts.get(t.id);
        const at = p0 === void 0 ? follow.p : p0 + (1 - p0) * follow.p;
        this.moves.push({
          owner,
          tr: rest,
          began: now,
          starts: /* @__PURE__ */ new Map([
            [
              t.id,
              at
            ]
          ])
        });
      }
      const tr = {
        ...planned,
        tracks,
        duration: Math.max(0, ...tracks.map((t) => t.duration))
      };
      this.moves.push({
        owner,
        tr,
        began: now,
        starts: made.starts
      });
    }
    this.dirty = true;
  }
  /**
   * The move of `owner` on the current screen from `from` (`way`: how far each coming or going part
   * is in it) to `to`, with each coming or going part's start, as `apply` plans it (spec §4.3).
   */
  moveOf(owner, fromState, toState, from, way, to, now) {
    const run = this.run;
    const planned = planMove(run.screens[run.current], owner === "" ? void 0 : owner, fromState, toState, from, to, themeTone(this.deps.theme()), way ? [
      ...way.keys()
    ] : void 0);
    const starts = /* @__PURE__ */ new Map();
    for (const t of planned.tracks) {
      if (t.appears === void 0) continue;
      const v = isHidden(from, t.id) ? 0 : way?.get(t.id) ?? 1;
      starts.set(t.id, t.appears ? v : 1 - v);
    }
    return {
      owner,
      tr: planned,
      began: now,
      starts
    };
  }
  /** The depth of `owner` on the screen `screenId`: the screen first (-1), then the boxes outer to inner. */
  depthOf(screenId, owner) {
    const s = this.run.screens[screenId];
    return owner === "" || !s ? -1 : pathTo(s.elements, owner).length;
  }
  /** The look of the current screen in `states`, with the run's values, rows and mirrored texts. */
  lookIn(states) {
    const run = this.run;
    const id = run.current;
    const standing2 = run.runs[id];
    return lookOf(run.screens[id], states, this.deps.registry, standing2.values, (ref) => textOfRef(run, this.deps.registry, ref, id), standing2.rows);
  }
  /**
   * The look of the screen `id` in the states given, with nothing typed or chosen (undefined = as
   * the run has it, values too).
   */
  frameOf(id, states) {
    const run = this.run;
    const screen = run.screens[id];
    const elements = screen ? lookOf(screen, states ?? run.runs[id]?.states ?? {}, this.deps.registry, states ? {} : run.runs[id]?.values, (ref) => textOfRef(run, this.deps.registry, ref, id), run.runs[id]?.rows) : [];
    return {
      elements,
      show: /* @__PURE__ */ new Map()
    };
  }
  /** The frame of the top screen now: every move as far as it is, over the look the run heads for. */
  compose(now) {
    const run = this.run;
    const { registry: registry2 } = this.deps;
    const target = this.frameOf(run.current, void 0).elements;
    const theme = this.deps.theme();
    const frames = this.moves.map((m) => {
      const plain = entering(now - m.began);
      const progress2 = (t) => {
        const p0 = m.starts.get(t.id);
        return p0 === void 0 ? plain(t) : p0 + (1 - p0) * plain(t);
      };
      return {
        tr: m.tr,
        frame: frameAt(m.tr, progress2, theme, registry2)
      };
    });
    const f = this.follow;
    const following = f ? f.trs.map((tr) => ({
      tr,
      frame: frameAt(tr, (t) => {
        const p0 = f.starts.get(t.id);
        return p0 === void 0 ? f.p : p0 + (1 - p0) * f.p;
      }, theme, registry2, true)
    })) : [];
    const all = [
      ...frames,
      ...following
    ];
    const merged = all.length ? mergeFrames(target, all) : {
      elements: target,
      show: /* @__PURE__ */ new Map()
    };
    this.moves = this.moves.filter((m) => now - m.began < m.tr.duration);
    const reaction = reactionOf(theme);
    const wanted = /* @__PURE__ */ new Map();
    const want = (id, value) => {
      const el2 = id === void 0 ? void 0 : findById(merged.elements, id)?.el;
      if (el2 && pressable(run.screens[run.current], el2)) wanted.set(id, value);
    };
    if (this.hoverLooks) want(this.hover, reaction.hover);
    want(this.pressed, reaction.press);
    const tone = themeTone(theme);
    const ease = EASINGS[tone.easing];
    const fast = tone.speed.fast;
    const progress = (since, at = now) => fast <= 0 ? 1 : Math.max(0, Math.min(1, (at - since) / fast));
    this.reacting = false;
    for (const id of /* @__PURE__ */ new Set([
      ...wanted.keys(),
      ...this.bright.keys()
    ])) {
      const to = wanted.get(id) ?? 1;
      let b = this.bright.get(id);
      if (!b && to === 1) continue;
      if (!b) b = {
        from: 1,
        to,
        since: this.reactAt
      };
      else if (b.to !== to) {
        const at = Math.max(b.since, this.reactAt);
        b = {
          from: b.from + (b.to - b.from) * ease(progress(b.since, at)),
          to,
          since: at
        };
      }
      this.bright.set(id, b);
      const p = progress(b.since);
      const value = b.from + (b.to - b.from) * ease(p);
      if (p < 1) this.reacting = true;
      else if (b.to === 1) this.bright.delete(id);
      if (!findById(merged.elements, id)) {
        this.bright.delete(id);
        continue;
      }
      if (value === 1) continue;
      const had = merged.show.get(id) ?? {
        opacity: 1,
        dx: 0,
        dy: 0,
        scale: 1
      };
      merged.show.set(id, {
        ...had,
        brightness: value
      });
    }
    return merged;
  }
  loop() {
    const tick = () => {
      this.handle = void 0;
      this.guarded(() => {
        if (!this.run) return;
        const now = this.clock.now();
        const due = nextDue(this.run);
        if (due !== void 0 && due <= now) this.event({
          kind: "tick"
        });
        if (!this.run) return;
        const busy = this.moves.length > 0 || this.effects.length > 0 || this.screenMove !== void 0 || this.reacting;
        if (busy || this.dirty) {
          this.dirty = false;
          this.deps.draw(this.shot(now));
        }
        if (this.freshDue) {
          const newest = Math.max(-Infinity, ...this.changedAt.values(), ...this.valueChangedAt.values());
          if (now - newest >= FRESH_MS) {
            this.freshDue = false;
            this.deps.changed();
          }
        }
        if (this.run && nextDue(this.run) !== void 0 && now - this.lastPanel >= 200) {
          this.lastPanel = now;
          this.deps.counting();
        }
        this.settle(now);
        if (this.run) this.handle = this.clock.frame(tick);
      });
    };
    tick();
  }
  /** One moment: the top screen's frame, with a screen beneath and the top shown on its way when a screen moves. */
  shot(now) {
    const composed = this.compose(now);
    this.last = composed;
    const live = this.withEffects(composed, now);
    const run = this.run;
    const held = this.scrolls.get(run.current);
    const scrolls = held ? clampScrolls(live.elements, held) : void 0;
    if (scrolls && scrolls !== held) this.scrolls.set(run.current, scrolls);
    const sent = scrolls && Object.keys(scrolls).length ? {
      scrolls
    } : {};
    const sm = this.screenMove;
    if (!sm) return {
      elements: live.elements,
      show: live.show,
      ...sent
    };
    const { shown: shown2, done } = screenShotAt(sm.move, now - sm.began, deviceSize(run.screens[run.current].device));
    if (done) {
      this.screenMove = void 0;
      return {
        elements: live.elements,
        show: live.show,
        ...sent
      };
    }
    if (sm.move.kind === "go") {
      return {
        elements: live.elements,
        show: live.show,
        ...sent,
        ...shown2 ? {
          screen: shown2
        } : {},
        ...sm.under ? {
          under: sm.under
        } : {}
      };
    }
    return {
      elements: sm.top?.elements ?? [],
      show: sm.top?.show ?? /* @__PURE__ */ new Map(),
      ...sm.top?.scrolls ? {
        scrolls: sm.top.scrolls
      } : {},
      ...shown2 ? {
        screen: shown2
      } : {},
      under: {
        ...live,
        ...sent
      }
    };
  }
  /**
   * `frame` with the parts moving in place put on top (saved-motions spec §3.4). An effect that is
   * over, or whose part is gone or hidden where the run is heading, is dropped for good: a part
   * shown again does not resume. A part still on its way in (hidden only in this in-between frame)
   * keeps its effect; it shows once the part does.
   */
  withEffects(frame, now) {
    if (this.effects.length === 0) return frame;
    const theme = this.deps.theme();
    const tone = themeTone(theme);
    const heading = this.frameOf(this.run.current, void 0).elements;
    this.effects = this.effects.filter((e) => !effectDone(e, now, tone) && findById(heading, e.id) !== void 0 && !isHidden(heading, e.id));
    return overlayEffects(frame, this.effects, now, tone, theme);
  }
};
function rowsDiffer(a, b) {
  const ids = /* @__PURE__ */ new Set([
    ...Object.keys(a ?? {}),
    ...Object.keys(b ?? {})
  ]);
  return [
    ...ids
  ].some((id) => a?.[id] !== b?.[id]);
}
function differing(a, b) {
  return [
    .../* @__PURE__ */ new Set([
      ...Object.keys(a),
      ...Object.keys(b)
    ])
  ].filter((k) => a[k] !== b[k]);
}

// src/editor/movement-model.ts
var UNNAMED = "\u4F5C\u3063\u3066\u3044\u308B\u52D5\u304D";
function fromRow(motion, kind, size, tone) {
  if (isStepped(motion)) {
    const { label: _label, ...rest } = motion;
    return rest;
  }
  const name = motion?.name !== void 0 && motionFits(motion.name, kind) ? motion.name : DEFAULT_MOTION[kind];
  const timing2 = {
    ...motion?.speed !== void 0 ? {
      ms: motion.speed
    } : {},
    ...motion?.easing ? {
      easing: motion.easing
    } : {}
  };
  const appear = (start, to) => ({
    start,
    steps: [
      {
        to: {
          progress: 1,
          ...to
        },
        ...timing2
      }
    ]
  });
  const dy = slideDistance(size.h);
  const dx = slideDistance(size.w);
  switch (name) {
    case "slide-up":
      return appear({
        dy,
        opacity: 0
      }, {
        dy: 0,
        opacity: 1
      });
    case "slide-down":
      return appear({
        dy: -dy,
        opacity: 0
      }, {
        dy: 0,
        opacity: 1
      });
    case "slide-left":
      return appear({
        dx,
        opacity: 0
      }, {
        dx: 0,
        opacity: 1
      });
    case "slide-right":
      return appear({
        dx: -dx,
        opacity: 0
      }, {
        dx: 0,
        opacity: 1
      });
    case "scale":
      return appear({
        scale: SCALE_FROM,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1
      });
    case "smooth":
      return {
        steps: [
          {
            to: {
              progress: 1
            },
            ...timing2
          }
        ]
      };
    case "spring": {
      const speed = motion?.speed ?? "normal";
      const total = typeof speed === "number" ? speed : tone.speed[speed];
      const first = Math.round(0.6 * total);
      return {
        steps: [
          {
            to: {
              progress: 1.18
            },
            ms: first
          },
          {
            to: {
              progress: 1
            },
            ms: total - first
          }
        ]
      };
    }
    case "instant":
      return {
        steps: [
          {
            to: kind === "value" ? {
              progress: 1
            } : {
              opacity: 1
            },
            ms: 0
          }
        ]
      };
    default:
      return appear({
        opacity: 0
      }, {
        opacity: 1
      });
  }
}
function fromEffect(m) {
  const steps = (m && effectSteps(m)) ?? findEffect(DEFAULT_EFFECT).motion;
  const { label: _label, ...rest } = steps;
  return rest;
}
var withMotion = (b, motion) => ({
  ...b,
  motion
});
var without = (values, item) => {
  const { [item]: _gone, ...rest } = values;
  return rest;
};
function withStart(motion, start) {
  const { start: _old, ...rest } = motion;
  return Object.keys(start).length > 0 ? {
    ...rest,
    start
  } : rest;
}
function pruneStart(motion) {
  if (!motion.start) return motion;
  const written3 = new Set(motion.steps.flatMap((s) => Object.keys(s.to)));
  const start = {};
  for (const [k, v] of Object.entries(motion.start)) if (written3.has(k)) start[k] = v;
  return withStart(motion, start);
}
var replaceStep = (motion, i, step2) => ({
  ...motion,
  steps: motion.steps.map((s, j) => j === i ? step2 : s)
});
var keeps = (b, i, item) => b.use === "value" && i === 0 && item === "progress";
function addItem(b, i, item) {
  const step2 = b.motion.steps[i];
  if (!step2 || item in step2.to || item === "progress" && b.use === "effect") return b;
  let motion = replaceStep(b.motion, i, {
    ...step2,
    to: {
      ...step2.to,
      [item]: IDENTITY[item]
    }
  });
  const start = b.motion.start ?? {};
  if (i === 0 && item !== "progress" && !(item in start)) {
    motion = withStart(motion, {
      ...start,
      [item]: START_VALUE[item]
    });
  }
  return withMotion(b, motion);
}
function removeItem(b, i, item) {
  const step2 = b.motion.steps[i];
  if (!step2 || !(item in step2.to) || keeps(b, i, item)) return b;
  return withMotion(b, pruneStart(replaceStep(b.motion, i, {
    ...step2,
    to: without(step2.to, item)
  })));
}
function setValue(b, i, item, side, v) {
  const step2 = b.motion.steps[i];
  if (!step2 || !(item in step2.to)) return b;
  if (side === "from") {
    if (i !== 0) return b;
    return withMotion(b, withStart(b.motion, {
      ...b.motion.start ?? {},
      [item]: v
    }));
  }
  return withMotion(b, replaceStep(b.motion, i, {
    ...step2,
    to: {
      ...step2.to,
      [item]: v
    }
  }));
}
function addStep(b) {
  if (b.motion.steps.length >= STEPS_MAX) return b;
  return withMotion(b, {
    ...b.motion,
    steps: [
      ...b.motion.steps,
      {
        to: {}
      }
    ]
  });
}
function removeStep(b, i) {
  if (b.motion.steps.length <= 1 || !b.motion.steps[i]) return b;
  return withMotion(b, pruneStart({
    ...b.motion,
    steps: b.motion.steps.filter((_, j) => j !== i)
  }));
}
function setTiming(b, i, ms, easing) {
  const step2 = b.motion.steps[i];
  if (!step2) return b;
  return withMotion(b, replaceStep(b.motion, i, {
    to: step2.to,
    ...ms !== void 0 ? {
      ms
    } : {},
    ...easing ? {
      easing
    } : {}
  }));
}
function setDelay(b, ms) {
  const { delay: _old, ...rest } = b.motion;
  return withMotion(b, ms > 0 ? {
    ...rest,
    delay: ms
  } : rest);
}
function setUse(b, use) {
  const { rounds, ...rest } = b;
  if (use === "effect") {
    const steps = b.motion.steps.map((s) => ({
      ...s,
      to: without(s.to, "progress")
    }));
    const motion2 = withStart({
      ...b.motion,
      steps,
      ...rounds
    }, without(b.motion.start ?? {}, "progress"));
    return {
      ...rest,
      use,
      motion: motion2
    };
  }
  const { repeat, alternate, ...motion } = b.motion;
  const aside = repeat === void 0 && alternate === void 0 ? rounds : {
    ...repeat !== void 0 ? {
      repeat
    } : {},
    ...alternate !== void 0 ? {
      alternate
    } : {}
  };
  return {
    ...rest,
    use,
    motion,
    ...aside ? {
      rounds: aside
    } : {}
  };
}
function setRounds(b, repeat, alternate) {
  const { repeat: _repeat, alternate: _alternate, ...rest } = b.motion;
  return withMotion(b, {
    ...rest,
    ...repeat !== 1 ? {
      repeat
    } : {},
    ...alternate ? {
      alternate: true
    } : {}
  });
}
function chips(b) {
  const now = {
    ...START_VALUE,
    ...b.motion.start ?? {}
  };
  return b.motion.steps.map((step2, i) => {
    const row = STEP_ITEMS.filter((k) => k in step2.to).map((item) => ({
      step: i,
      item,
      text: chipText(item, now[item], step2.to[item]),
      removable: !keeps(b, i, item)
    }));
    Object.assign(now, step2.to);
    return row;
  });
}
function joinTypes(types) {
  return types.length < 2 ? types.join("") : `${types.slice(0, -1).join(" \xB7 ")} \u3068 ${types[types.length - 1]}`;
}
var labels = (items) => items.map((k) => ITEM_LABEL[k]).join("\u30FB");
function itemTypesText(item) {
  if (item === "progress") return "\u5024\u304C\u5909\u308F\u308B\u30FB\u73FE\u308C\u308B\u90E8\u54C1\u306E\u3001State \u306E\u5024\u306E\u9032\u307F";
  if (item === "color") {
    return "text \xB7 button \xB7 input(\u898B\u51FA\u3057)\xB7 checkbox \xB7 toggle \xB7 navbar(\u984C)\xB7 tabs \xB7 radio \xB7 slider \xB7 image(\u8AAC\u660E)\xB7 progress(\u5272\u5408\u306E\u6587\u5B57)\xB7 chip \xB7 badge(\u6587\u5B57)\xB7 fab \xB7 table(\u307E\u3059\u76EE)\xB7 sidenav(\u9805\u76EE)\xB7 breadcrumb(\u524D\u306E\u6BB5\u3068\u300C/\u300D)";
  }
  return ITEM_TYPES[item].length === ALL_TYPES.length ? "\u5168\u90E8\u306E\u90E8\u54C1" : ITEM_TYPES[item].join(" \xB7 ");
}
function fitText(b) {
  const items = itemsOf(b.motion);
  const fits = fitTypes(b.motion);
  const blocked = ALL_TYPES.filter((t) => !fits.includes(t));
  const fitsText = blocked.length === 0 ? "\u5168\u90E8\u306E\u90E8\u54C1" : fits.length === 0 ? "\u4ED8\u3051\u3089\u308C\u308B\u90E8\u54C1\u304C\u3042\u308A\u307E\u305B\u3093" : fits.join(" \xB7 ");
  if (items.length === 0) return {
    fits: fitsText,
    why: ""
  };
  if (blocked.length === 0) {
    return {
      fits: fitsText,
      why: `${labels(items)}\u3060\u3051\u306A\u306E\u3067\u3001\u3069\u306E\u90E8\u54C1\u306B\u3082\u4ED8\u3051\u3089\u308C\u307E\u3059`
    };
  }
  const blockers = items.filter((k) => blocked.some((t) => !ITEM_TYPES[k].includes(t)));
  return {
    fits: fitsText,
    why: `${labels(blockers)}\u3092\u5909\u3048\u308B\u306E\u3067\u3001${joinTypes(blocked)} \u306B\u306F\u4ED8\u3051\u3089\u308C\u307E\u305B\u3093`
  };
}
function takenNames(b, saved2) {
  const own = b.origin.kind === "saved" ? b.origin.name : void 0;
  return saved2.map((e) => e.name).filter((n) => n !== own);
}
function problems(b, names) {
  const out = [];
  const name = b.name.trim();
  if (name === "") out.push("\u540D\u524D\u3092\u5165\u308C\u307E\u3059");
  else if (names.includes(name)) out.push("\u540C\u3058\u540D\u524D\u306E\u52D5\u304D\u304C\u3042\u308A\u307E\u3059");
  b.motion.steps.forEach((s, i) => {
    if (Object.keys(s.to).length === 0) out.push(`\u6BB5 ${i + 1} \u306B\u9805\u76EE\u304C\u3042\u308A\u307E\u305B\u3093`);
  });
  if (b.use === "value" && !itemsOf(b.motion).includes("progress")) {
    out.push("\u5024\u304C\u5909\u308F\u308B\u52D5\u304D\u306F \u9032\u307F \u3092\u4F7F\u3044\u307E\u3059");
  }
  if (b.use === "effect" && itemsOf(b.motion).includes("progress")) {
    out.push("\u305D\u306E\u5834\u3067\u52D5\u304F\u52D5\u304D\u306B \u9032\u307F \u306F\u4F7F\u3048\u307E\u305B\u3093");
  }
  for (const item of endProblems(b.motion)) {
    out.push(`${ITEM_LABEL[item]} \u304C\u6700\u5F8C\u306B ${valueText(item, IDENTITY[item])} \u306B\u623B\u3063\u3066\u3044\u307E\u305B\u3093`);
  }
  if (b.origin.kind !== "saved" && !fitsType(b.motion, b.partType)) {
    out.push("\u4ED8\u3051\u3089\u308C\u306A\u3044\u90E8\u54C1\u3067\u3059");
  }
  return out;
}
function toSaved(b) {
  const { label: _label, ...motion } = b.motion;
  return {
    name: b.name.trim(),
    use: b.use,
    motion: normalizeStepMotion(motion)
  };
}
function saveProblem(status) {
  if (status >= 200 && status < 300) return void 0;
  return status === 409 ? "\u540C\u3058\u540D\u524D\u306E\u52D5\u304D\u304C\u3042\u308A\u307E\u3059" : "\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F";
}
function playable(b) {
  const steps = b.motion.steps.filter((s) => Object.keys(s.to).length > 0);
  if (steps.length === 0) return void 0;
  const m = pruneStart({
    ...b.motion,
    steps
  });
  const failing = b.use === "effect" ? [] : endProblems(m);
  if (failing.length === 0 || steps.length >= STEPS_MAX) return m;
  const back = {};
  for (const item of failing) Object.assign(back, {
    [item]: IDENTITY[item]
  });
  return {
    ...m,
    steps: [
      ...m.steps,
      {
        to: back,
        ms: 0
      }
    ]
  };
}
var PERCENT_MAX = {
  progress: 200,
  scale: 300,
  opacity: 100
};
function parseValue(item, text18) {
  const t = text18.trim();
  const n = t === "" ? NaN : Number(t);
  switch (item) {
    case "progress":
    case "scale":
    case "opacity": {
      if (!Number.isFinite(n) || n < 0 || n > PERCENT_MAX[item]) return void 0;
      return Math.round(n) / 100;
    }
    case "dx":
    case "dy": {
      const v = Math.round(n);
      return Number.isFinite(n) && Math.abs(v) <= OFFSET_MAX ? v : void 0;
    }
    case "radius": {
      if (t === "" || t === "\u305D\u306E\u307E\u307E") return null;
      if (SIZE_TOKENS.includes(t)) return t;
      const v = Math.round(n);
      return Number.isFinite(n) && v >= 0 && v <= RADIUS_MAX ? v : void 0;
    }
    case "fill":
    case "border":
    case "color": {
      if (t === "" || t === "\u305D\u306E\u307E\u307E") return null;
      if (t === "none" || HEX_COLOR.test(t)) return t;
      return t.startsWith("$") && COLOR_NAMES.includes(t.slice(1)) ? t : void 0;
    }
  }
}
function inputText(item, v) {
  if (v === null) return "";
  if (item in PERCENT_MAX) return String(Math.round(v * 100));
  return String(v);
}

// src/editor/panels/blocks.ts
function chip(choices, current, on, opts = {}) {
  const list = choices.some((c) => c.value === current) ? [
    ...choices
  ] : [
    ...choices,
    {
      value: current,
      label: opts.extra ?? String(current)
    }
  ];
  const select2 = el("select", {
    class: opts.cls ? `chip ${opts.cls}` : "chip",
    ...opts.disabled ? {
      disabled: true
    } : {}
  }, ...list.map((c, i) => el("option", {
    value: String(i),
    ...c.value === current ? {
      selected: true
    } : {},
    ...opts.enabled && c.value !== current && !opts.enabled(c.value) ? {
      disabled: true
    } : {}
  }, c.label)));
  select2.addEventListener("change", () => on(list[Number(select2.value)].value));
  return select2;
}
function msField(ms, on, min = 0, max = BLOCK_MS_MAX) {
  const input = el("input", {
    type: "number",
    class: "chip chip-ms",
    min: String(min),
    max: String(max),
    step: "100",
    value: String(ms)
  });
  input.addEventListener("change", () => {
    const v = Number(input.value);
    if (input.value.trim() === "" || !Number.isInteger(v) || v < min || v > max) {
      input.value = String(ms);
      return;
    }
    if (v !== ms) on(v);
  });
  return el("span", {
    class: "blk-ms"
  }, input, el("span", {
    class: "blk-word"
  }, "\u30DF\u30EA\u79D2"));
}
var word = (text18) => el("span", {
  class: "blk-word"
}, text18);
function button(text18, cls, on, disabled = false) {
  const b = el("button", {
    class: `btn ${cls}`,
    ...disabled ? {
      disabled: true
    } : {}
  }, text18);
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    on();
  });
  return b;
}
function tools(index, count, ctx) {
  const out = [];
  const play = ctx.ui.play;
  if (play) out.push(button("\u25B6", "blk-play", () => play(index)));
  const more = el("button", {
    class: "btn blk-more",
    title: "\u30D6\u30ED\u30C3\u30AF\u306E\u64CD\u4F5C"
  }, "\u22EF");
  more.addEventListener("click", (e) => {
    e.stopPropagation();
    ctx.ui.more(index, count, {
      x: e.clientX,
      y: e.clientY
    });
  });
  out.push(more);
  return out;
}
function ownerOf(ctx) {
  return ctx.place.owner === void 0 ? void 0 : findById(ctx.screen.elements, ctx.place.owner)?.el;
}
function triggerStrip(b, put2, ctx) {
  const strip = el("div", {
    class: "blk-strip blk-trigger"
  }, el("span", {
    class: "blk-label"
  }, "Trigger"));
  const label = EVENTS.find((e) => e.event === b.on.event)?.label ?? b.on.event;
  const owner = ownerOf(ctx);
  strip.append(chip(eventChoices(ctx.type, ctx.registry, owner), b.on.event, (v) => put2(withEvent(b, v)), {
    extra: label
  }));
  const parts = triggerParts(b, owner);
  if (parts.dir) strip.append(chip(DIRS, parts.dir, (v) => put2(withDir(b, v))));
  if (parts.places && owner) {
    const at = b.on.at;
    const extra = at !== void 0 ? {
      extra: placeLabel(owner, at)
    } : {};
    strip.append(chip(parts.places, at, (v) => put2(withPlace(b, v)), extra));
  }
  if (parts.ms) {
    const { value, min, max } = parts.ms;
    strip.append(msField(value, (v) => put2(withTriggerMs(b, v)), min, max));
  }
  if (parts.key) strip.append(chip(KEYS, parts.key, (v) => put2(withKey(b, v))));
  return strip;
}
function textField(current, on) {
  const input = el("input", {
    type: "text",
    class: "chip chip-text",
    placeholder: "\u7A7A",
    value: current
  });
  input.addEventListener("change", () => {
    if (input.value !== current) on(input.value);
  });
  return input;
}
function valueControl(part, current, on, ctx) {
  const choices = valueChoices(ctx.screen, part);
  if (choices) {
    return chip(choices, current, on, {
      extra: ctx.names.value?.(part, current) ?? valueText2(current)
    });
  }
  const target = findById(ctx.screen.elements, part)?.el;
  if (target && valueKind(target) === "range") return numberField(Number(current), on);
  return textField(String(current), on);
}
function numberField(current, on) {
  const input = el("input", {
    type: "number",
    class: "chip chip-num",
    step: "any",
    value: String(current)
  });
  input.addEventListener("change", () => {
    const v = input.value.trim() === "" ? NaN : Number(input.value);
    if (!Number.isFinite(v)) input.value = String(current);
    else if (v !== current) on(v);
  });
  return input;
}
function rangeFields(range, kind, on) {
  const field2 = (side) => el("input", {
    type: "number",
    class: "chip chip-num",
    ...kind === "length" ? {
      min: "0",
      step: "1"
    } : {
      step: "any"
    },
    value: range[side] === void 0 ? "" : String(range[side])
  });
  const min = field2("min");
  const max = field2("max");
  const textOf = (input) => input.validity.badInput ? "?" : input.value;
  const changed = () => {
    const next = rangeFrom(textOf(min), textOf(max), kind);
    if (!next) {
      min.value = range.min === void 0 ? "" : String(range.min);
      max.value = range.max === void 0 ? "" : String(range.max);
      return;
    }
    if (next.min !== range.min || next.max !== range.max) on(next);
  };
  min.addEventListener("change", changed);
  max.addEventListener("change", changed);
  return el("span", {
    class: "blk-range"
  }, min, word("\u4EE5\u4E0A"), max, word("\u4EE5\u4E0B"));
}
function conditionRow(c, set, remove, ctx) {
  const row = el("div", {
    class: "blk-row-item"
  });
  const who = isValueCondition(c) ? c.part : c.box;
  row.append(chip(targetChoices(ctx.screen, partLabel), who, (w) => set(conditionOn(ctx.screen, c, w)), {
    extra: who ?? "\u753B\u9762"
  }), word("\u304C"));
  let tail = [
    {
      value: false,
      label: "\u3067\u3042\u308B"
    },
    {
      value: true,
      label: "\u3067\u306A\u3044"
    }
  ];
  if (isValueCondition(c)) {
    const cmp = compareOf(c);
    const kinds = compareChoices(ctx.place, c.part);
    row.append(chip(kinds, cmp?.kind, (kind) => {
      if (kind !== void 0) set(withCompare(c, kind, ctx.place));
    }, {
      extra: "?",
      enabled: (v) => kinds.find((k) => k.value === v)?.enabled === true
    }));
    const put2 = (patch) => set({
      ...c,
      ...patch
    });
    switch (cmp?.kind) {
      case "is":
        row.append(valueControl(c.part, cmp.value, (is) => put2({
          is
        }), ctx));
        break;
      case "same":
        row.append(chip(sourceChoices(ctx.place, c.part, partLabel), refKey(cmp.ref), (k) => put2({
          is: parseRefKey(k)
        }), {
          extra: ctx.names.ref(cmp.ref)
        }));
        break;
      case "has":
        row.append(textField(cmp.text, (has2) => put2({
          has: has2
        })));
        tail = [
          {
            value: false,
            label: "\u3092\u542B\u3080"
          },
          {
            value: true,
            label: "\u3092\u542B\u307E\u306A\u3044"
          }
        ];
        break;
      case "length":
        row.append(rangeFields(cmp.range, "length", (length) => put2({
          length
        })));
        break;
      case "number":
        row.append(rangeFields(cmp.range, "number", (number) => put2({
          number
        })));
        break;
      case void 0:
        break;
    }
  } else {
    row.append(chip(stateChoices(ctx.screen, c.box), c.state, (state) => set({
      ...c,
      state
    })));
  }
  row.append(chip(tail, c.not === true, (not) => {
    const { not: _old, ...rest } = c;
    set(not ? {
      ...rest,
      not: true
    } : rest);
  }), button("\u2715", "blk-remove", remove));
  return row;
}
function actionControls(a, set, last, at, ctx) {
  const out = [];
  const kept = ctx.place.kept ?? [];
  if (a.act === "play") {
    out.push(chip(playParts(ctx.screen, partLabel), a.part, (w) => set(actionOn(ctx.screen, a, w, kept)), {
      extra: a.part,
      cls: "chip-play-part"
    }), word("\u3092"), motionChip(a, set, at, ctx));
  } else if (a.act === "add") {
    const from = a.from;
    out.push(chip(actionTargets(ctx.place, partLabel), a.part, (w) => set(actionOn(ctx.screen, a, w, kept)), {
      extra: a.part
    }), word("\u306B"), chip(sourceChoices(ctx.place, a.part, partLabel, true), refKey(from), (k) => set({
      act: "add",
      part: a.part,
      from: parseRefKey(k)
    }), {
      extra: ctx.names.ref(from)
    }));
  } else if (a.act === "remove") {
    const list = findById(ctx.screen.elements, a.part)?.el;
    out.push(chip(actionTargets(ctx.place, partLabel), a.part, (w) => set(actionOn(ctx.screen, a, w, kept)), {
      extra: a.part
    }), word("\u306E"), chip(list ? removeAtChoices(list) : [
      {
        value: void 0,
        label: "\u62BC\u3057\u305F\u884C"
      }
    ], a.at, (at2) => set(at2 === void 0 ? {
      act: "remove",
      part: a.part
    } : {
      act: "remove",
      part: a.part,
      at: at2
    }), {
      extra: list && a.at !== void 0 ? placeLabel(list, a.at) : "\u62BC\u3057\u305F\u884C"
    }));
  } else if (a.act === "value" && a.from) {
    const from = a.from;
    out.push(chip(actionTargets(ctx.place, partLabel), a.part, (w) => set(actionOn(ctx.screen, a, w, kept)), {
      extra: a.part
    }), word("\u306E\u5024\u3092"), chip(sourceChoices(ctx.place, a.part, partLabel), refKey(from), (k) => set(withSource(a, parseRefKey(k))), {
      extra: ctx.names.ref(from)
    }));
  } else if (a.act === "set" || a.act === "value") {
    const who = a.act === "value" ? a.part : a.box;
    out.push(chip(actionTargets(ctx.place, partLabel), who, (w) => set(actionOn(ctx.screen, a, w, kept)), {
      extra: who ?? "\u753B\u9762"
    }), word("\u3092"), a.act === "value" ? valueControl(a.part, a.to ?? "", (to) => set({
      act: "value",
      part: a.part,
      to
    }), ctx) : chip(stateChoices(ctx.screen, a.box), a.state, (state) => set({
      ...a,
      state
    })));
  } else if (a.act === "next" || a.act === "prev" || a.act === "reset") {
    out.push(chip(stateOwners(ctx.screen, partLabel), a.box, (box7) => set(actionOn(ctx.screen, a, box7)), {
      extra: a.box ?? "\u753B\u9762"
    }), word("\u3092"));
  } else if (a.act === "go") {
    const screens = ctx.ui.screens.map((x) => ({
      value: x.id,
      label: x.title
    }));
    const motions = [
      {
        value: void 0,
        label: "\u30C6\u30FC\u30DE\u306E\u307E\u307E"
      },
      ...motionsFor("appear").map((m) => ({
        value: m.name,
        label: m.label
      }))
    ];
    out.push(chip(screens, a.screen, (screen) => set({
      ...a,
      screen
    })), chip(motions, a.motion?.name, (name) => {
      const { motion: _old, ...rest } = a;
      set(name === void 0 ? rest : {
        ...rest,
        motion: {
          ...a.motion,
          name
        }
      });
    }, {
      extra: findMotion(a.motion?.name ?? "")?.label
    }));
  } else if (a.act === "wait") {
    out.push(msField(a.ms, (ms) => set({
      ...a,
      ms
    })));
  }
  const kinds = kindChoices(ctx.place, last, a);
  out.push(chip(kinds, kindOf(a), (kind) => set(asKind(a, kind, ctx.place)), {
    enabled: (v) => kinds.find((k) => k.value === v)?.enabled === true,
    ...a.act === "play" ? {
      cls: "chip-play-kind"
    } : {}
  }));
  return out;
}
function motionChip(a, set, at, ctx) {
  const fx = ctx.ui.effects;
  const open = fx?.open?.branch === at.branch && fx.open.index === at.index;
  const b = el("button", {
    class: "chip blk-motion" + (open ? " is-open" : ""),
    ...fx ? {} : {
      disabled: true
    }
  }, `${effectLabel(a.motion)} \u25BE`);
  if (fx) b.addEventListener("click", () => fx.toggle(at.branch, at.index));
  return el("span", {
    class: "blk-motion-at"
  }, b, fx && open ? effectMenu(a, set, at, fx, ctx) : null);
}
function effectMenu(a, set, at, fx, ctx) {
  const type = findById(ctx.screen.elements, a.part)?.el.type;
  const choices = effectChoices(type ?? "", type === void 0 ? [] : fx.saved);
  const current = effectKey(a.motion, choices);
  const menu2 = el("div", {
    class: "blk-motion-menu",
    role: "menu"
  });
  const item = (c) => {
    const mark = c.key === current;
    const node = el("button", {
      class: "blk-motion-item" + (mark ? " is-current" : ""),
      role: "menuitem",
      "data-effect": c.key
    }, el("span", {
      class: "blk-motion-label"
    }, mark ? `${c.label} \u2713` : c.label), c.note ? el("span", {
      class: "blk-motion-note"
    }, c.note) : null);
    node.addEventListener("mouseenter", () => fx.sample(a.part, c.motion, c.label, node));
    node.addEventListener("mouseleave", () => fx.unsample());
    node.addEventListener("click", () => {
      if (mark) fx.toggle(at.branch, at.index);
      else set({
        act: "play",
        part: a.part,
        motion: c.motion
      });
    });
    if (c.mine) {
      node.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        fx.unsample();
        openMenu({
          x: e.clientX,
          y: e.clientY
        }, [
          {
            action: "motion-edit",
            label: "\u76F4\u3059",
            enabled: true
          },
          {
            action: "motion-delete",
            label: "\u6D88\u3059",
            enabled: true
          }
        ], (action) => {
          if (action === "motion-edit") fx.edit(c.label, a.part);
          else if (action === "motion-delete" && confirm(`\u300C${c.label}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002\u4F7F\u3063\u3066\u3044\u308B\u90E8\u54C1\u306F\u3001\u4ECA\u306E\u52D5\u304D\u306E\u307E\u307E\u52D5\u304D\u307E\u3059`)) fx.remove(c.label);
        });
      });
    }
    return node;
  };
  const mine = choices.filter((c) => c.mine);
  menu2.append(...choices.filter((c) => !c.mine).map(item));
  if (mine.length > 0) {
    menu2.append(el("div", {
      class: "blk-motion-sep"
    }), el("div", {
      class: "blk-motion-head"
    }, "MySet"), ...mine.map(item));
  }
  const make = el("button", {
    class: "blk-motion-item blk-motion-new",
    role: "menuitem"
  }, "+ \u52D5\u304D\u3092\u4F5C\u308B");
  make.addEventListener("click", () => fx.build(at.branch, at.index));
  menu2.append(el("div", {
    class: "blk-motion-sep"
  }), make);
  return menu2;
}
function actionStrip(b, branch, put2, ctx) {
  const list = (branch === "do" ? b.do : b.else) ?? [];
  const name = branch === "do" ? "Then" : "Else";
  const add = button("+ \u51E6\u7406", "blk-add", () => put2(addAction(b, branch, ctx.place)));
  const strip = el("div", {
    class: `blk-strip blk-${branch === "do" ? "then" : "else"}${list.length ? "" : " is-empty"}`
  }, el("div", {
    class: "blk-strip-head"
  }, el("span", {
    class: "blk-label"
  }, name), add));
  list.forEach((a, i) => {
    const row = el("div", {
      class: "blk-row-item"
    }, el("span", {
      class: "blk-num"
    }, `${i + 1}.`), ...actionControls(a, (next) => put2(withAction(b, branch, i, next)), i === list.length - 1, {
      branch,
      index: i
    }, ctx));
    if (branch === "else" || list.length > 1) {
      row.append(button("\u2715", "blk-remove", () => put2(removeAction(b, branch, i))));
    }
    strip.append(row);
  });
  return strip;
}
function ifStrip(b, put2, ctx) {
  const conditions = conditionsOf(b);
  const add = button("+ \u6761\u4EF6", "blk-add", () => put2(addCondition(b, ctx.place)), defaultCondition(ctx.place) === void 0);
  const head = el("div", {
    class: "blk-strip-head"
  }, el("span", {
    class: "blk-label"
  }, "If"));
  if (conditions.length > 0) {
    head.append(chip(MATCHES, b.if?.any ? "any" : "all", (w) => put2(withMatch(b, w)), {
      disabled: conditions.length < 2
    }));
  }
  head.append(add);
  const strip = el("div", {
    class: "blk-strip blk-if" + (conditions.length ? "" : " is-empty")
  }, head);
  conditions.forEach((c, i) => {
    strip.append(conditionRow(c, (next) => put2(withCondition(b, i, next)), () => put2(removeCondition(b, i)), ctx));
  });
  return strip;
}
function openBlock(b, index, count, ctx) {
  const put2 = (next) => ctx.ui.change((list) => list.map((x, n) => n === index ? next : x), index);
  const hint = triggerParts(b, ownerOf(ctx)).hint;
  const no = el("span", {
    class: "blk-no",
    title: "\u7573\u3080"
  }, `${circled(index + 1)} \u30D6\u30ED\u30C3\u30AF`);
  no.addEventListener("click", () => ctx.ui.toggle(index));
  const card2 = el("div", {
    class: "blk is-open",
    "data-block": String(index),
    "data-guide": guideTag.block(index + 1)
  }, el("div", {
    class: "blk-head"
  }, no, el("span", {
    class: "blk-gap"
  }), ...tools(index, count, ctx)), triggerStrip(b, put2, ctx), ...hint ? [
    el("div", {
      class: "blk-hint"
    }, hint)
  ] : [], ifStrip(b, put2, ctx), actionStrip(b, "do", put2, ctx));
  if (b.if) card2.append(actionStrip(b, "else", put2, ctx));
  return card2;
}
function foldedBlock(b, index, count, ctx) {
  const row = el("div", {
    class: "blk is-folded",
    "data-block": String(index),
    "data-guide": guideTag.block(index + 1)
  }, el("span", {
    class: "blk-no"
  }, circled(index + 1)), el("span", {
    class: "blk-sentence",
    title: blockText(b, ctx.names)
  }, blockText(b, ctx.names)), ...tools(index, count, ctx));
  row.addEventListener("click", () => ctx.ui.toggle(index));
  return row;
}
function blockSection(s, owner, ui, registry2) {
  const screen = written2(s.doc);
  const titles = new Map(ui.screens.map((x) => [
    x.id,
    x.title
  ]));
  const ctx = {
    screen,
    place: {
      screen,
      owner,
      screens: ui.screens.map((x) => x.id),
      kept: ui.kept
    },
    names: namesOf(screen, (id) => titles.get(id) ?? id, ui.kept),
    ui,
    type: owner === void 0 ? void 0 : findById(screen.elements, owner)?.el.type,
    registry: registry2
  };
  const blocks = owner === void 0 ? screen.blocks ?? [] : findById(screen.elements, owner)?.el.blocks ?? [];
  const box7 = el("div", {
    class: "blocks"
  }, el("div", {
    class: "muted blocks-title"
  }, "\u30D6\u30ED\u30C3\u30AF"));
  blocks.forEach((b, i) => {
    box7.append(i === ui.open ? openBlock(b, i, blocks.length, ctx) : foldedBlock(b, i, blocks.length, ctx));
  });
  box7.append(el("button", {
    class: "btn btn-block block-add",
    onclick: () => ui.change((list) => [
      ...list,
      newBlock(ctx.place)
    ], blocks.length)
  }, "+ \u30D6\u30ED\u30C3\u30AF\u3092\u8DB3\u3059"));
  return box7;
}

// src/editor/panels/animation.ts
function stateRows(s, owner) {
  const states = statesOf(written2(s.doc), owner) ?? [
    DEFAULT_STATE
  ];
  const shown2 = s.editing && s.editing.owner === owner ? s.editing.state : states[0].id;
  return states.map((st, i) => ({
    id: st.id,
    name: st.name,
    first: i === 0,
    current: st.id === shown2
  }));
}
function diffRows(s) {
  const base = written2(s.doc);
  const index = stateIndex(base, s.editing);
  if (!s.editing || index <= 0) return [];
  const changes = statesOf(base, s.editing.owner)[index].changes ?? {};
  const out = [];
  for (const [id, row] of Object.entries(changes)) {
    const b = findById(base.elements, id)?.el;
    if (!b) continue;
    const label = b.name ?? b.text ?? b.id;
    const add = (text18, keys) => out.push({
      id,
      label,
      text: text18,
      keys
    });
    const pairs = (keys) => keys.filter((k) => row[k] !== void 0).map((k) => `${k} ${b[k]} \u2192 ${row[k]}`).join(", ");
    if (row.x !== void 0 || row.y !== void 0) add(`\u4F4D\u7F6E ${pairs([
      "x",
      "y"
    ])}`, [
      "x",
      "y"
    ]);
    if (row.w !== void 0 || row.h !== void 0) add(`\u5927\u304D\u3055 ${pairs([
      "w",
      "h"
    ])}`, [
      "w",
      "h"
    ]);
    if (row.text !== void 0) add("\u6587\u5B57", [
      "text"
    ]);
    if (row.variant !== void 0 || row.style) add("\u898B\u305F\u76EE", [
      "variant",
      "style"
    ]);
    if (row.props) add("\u8A2D\u5B9A", [
      "props"
    ]);
    if (row.hidden !== void 0) add(row.hidden ? "\u975E\u8868\u793A" : "\u8868\u793A", [
      "hidden"
    ]);
    if (isMotionOnly(row)) add("\u4E00\u7DD2\u306B\u8868\u793A", [
      "motion"
    ]);
  }
  return out;
}
var SPEED_LABEL = {
  fast: "Fast",
  normal: "Normal",
  slow: "Slow"
};
var EASING_LABEL = {
  standard: "Standard",
  decelerate: "Decelerate",
  accelerate: "Accelerate",
  linear: "Linear"
};
var speedLabel = (speed) => typeof speed === "number" ? `${speed} ms` : SPEED_LABEL[speed];
function toneText(name, motion) {
  if (name === "instant") return "";
  const easing = name !== "spring" && motion?.easing ? [
    EASING_LABEL[motion.easing]
  ] : [];
  return [
    speedLabel(motion?.speed ?? "normal"),
    ...easing
  ].join(" \xB7 ");
}
function mineFor(saved2, kind, type, written3) {
  return saved2.flatMap((e) => e.saved && e.saved.use === kind && fitsType(e.saved.motion, type) ? [
    e.saved
  ] : []).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0).map((m) => {
    const motion = withLabel(m);
    return {
      name: m.name,
      motion,
      current: isStepped(written3) && written3.label === m.name && sameMotion(written3, motion)
    };
  });
}
function unreadableMotions(screen) {
  const owners2 = [
    void 0,
    ...flatten(screen.elements).map(({ el: el2 }) => el2.id)
  ];
  const out = [];
  for (const owner of owners2) {
    for (const state of statesOf(screen, owner) ?? []) {
      for (const [id, row] of Object.entries(state.changes ?? {})) {
        const m = row.motion;
        const type = findById(screen.elements, id)?.el.type;
        if (isStepped(m) && type !== void 0 && !soundSteps(m, row, type)) {
          out.push(m.label ?? CUSTOM_LABEL);
        }
      }
    }
  }
  for (const owner of owners2) {
    for (const block of blocksAt(screen, owner)) {
      for (const a of [
        ...block.do,
        ...block.else ?? []
      ]) {
        if (a.act !== "play") continue;
        const type = findById(screen.elements, a.part)?.el.type;
        if (type !== void 0 && !soundEffect(a.motion, type)) out.push(effectLabel(a.motion));
      }
    }
  }
  return out;
}
function motionRows(s, tone = DEFAULT_TONE, saved2 = []) {
  const base = written2(s.doc);
  const index = stateIndex(base, s.editing);
  if (!s.editing || index <= 0) return [];
  const changes = statesOf(base, s.editing.owner)[index].changes ?? {};
  const out = [];
  for (const [id, row] of Object.entries(changes)) {
    const b = findById(base.elements, id)?.el;
    if (!b) continue;
    const kind = rowKind(row);
    const steps = isStepped(row.motion) && soundSteps(row.motion, row, b.type) ? row.motion : void 0;
    const bundled = isStepped(row.motion) ? void 0 : row.motion;
    const name = steps ? motionName(row) : isStepped(row.motion) ? DEFAULT_MOTION[kind] : motionName(row);
    const speed = bundled?.speed ?? "normal";
    const easing = bundled?.easing;
    const speedFree = name !== "instant";
    const easingFree = speedFree && name !== "spring";
    const toneLine = toneText(name, bundled);
    const text18 = steps ? `${motionLabel(steps, kind)} \xB7 ${stepTotal(steps, tone)} ms` : [
      findMotion(name)?.label ?? name,
      ...toneLine ? [
        toneLine
      ] : []
    ].join(" \xB7 ");
    out.push({
      id,
      kind,
      name,
      speed,
      ...easing ? {
        easing
      } : {},
      text: text18,
      candidates: motionsFor(kind).map((m) => ({
        name: m.name,
        label: m.label,
        current: m.name === name
      })),
      stepped: steps !== void 0,
      mine: mineFor(saved2, kind, b.type, row.motion),
      speedFree,
      easingFree,
      inner: row.hidden !== void 0 && (b.children ?? []).length > 0
    });
  }
  return out;
}
function innerRows(s, id) {
  const base = written2(s.doc);
  if (!s.editing) return [];
  return innerParts(base, s.editing, id).flatMap((p) => {
    const part = findById(s.doc.screen.elements, p.id)?.el;
    return part ? [
      {
        ...p,
        label: treeLabel(part)
      }
    ] : [];
  });
}
function chosen(row, patch) {
  return {
    name: row.name,
    speed: row.speed,
    ...row.easing ? {
      easing: row.easing
    } : {},
    ...patch
  };
}
function option(value, label, selected) {
  return el("option", {
    value,
    ...selected ? {
      selected: true
    } : {}
  }, label);
}
function motionEditor(row, ui) {
  const box7 = el("div", {
    class: "motion-editor"
  });
  const candidates = el("div", {
    class: "motion-candidates"
  });
  for (const c of row.candidates) {
    const button2 = el("button", {
      class: "btn motion-candidate" + (c.current ? " is-current" : ""),
      "data-motion": c.name
    }, c.current ? `${c.label} \u2713` : c.label);
    button2.addEventListener("mouseenter", () => ui.sample(row.id, chosen(row, {
      name: c.name
    }), c.label, button2));
    button2.addEventListener("mouseleave", () => ui.unsample());
    button2.addEventListener("click", () => ui.choose(row.id, chosen(row, {
      name: c.name
    })));
    candidates.append(button2);
  }
  box7.append(candidates);
  if (row.mine.length > 0) {
    box7.append(el("div", {
      class: "motion-mine-label"
    }, "MySet"));
    const mine = el("div", {
      class: "motion-candidates motion-mine"
    });
    for (const m of row.mine) mine.append(mineButton(row, m, ui));
    box7.append(mine);
  }
  if (row.stepped) {
    box7.append(el("div", {
      class: "motion-tone-note"
    }, "\u901F\u3055\u3068\u7DE9\u6025\u306F\u3001\u4FDD\u5B58\u3057\u305F\u52D5\u304D\u306E\u6BB5\u3054\u3068"));
  } else toneControls(box7, row, ui);
  if (row.inner) {
    const add = el("button", {
      class: "btn btn-block motion-inner-add",
      "data-part": row.id
    }, "+ \u4E2D\u8EAB\u306E\u52D5\u304D");
    add.addEventListener("click", () => ui.pick(row.id, add));
    box7.append(add);
  }
  const save = el("button", {
    class: "btn btn-block motion-save"
  }, "\u3053\u306E\u52D5\u304D\u3092\u4FDD\u5B58");
  save.addEventListener("click", () => ui.build(row.id));
  box7.append(save);
  return box7;
}
function toneControls(box7, row, ui) {
  const custom = typeof row.speed === "number";
  const speed = el("select", {
    class: "motion-speed",
    ...row.speedFree ? {} : {
      disabled: true
    }
  }, ...MOTION_SPEEDS.map((v) => option(v, SPEED_LABEL[v], row.speed === v)), option("custom", "\u6570\u5024", custom));
  speed.addEventListener("change", () => {
    const v = speed.value;
    const from = custom ? row.speed : ui.tone.speed[row.speed];
    ui.choose(row.id, chosen(row, {
      speed: v === "custom" ? from : v
    }));
  });
  const easing = el("select", {
    class: "motion-easing",
    ...row.easingFree ? {} : {
      disabled: true
    }
  }, option("", "\u30C6\u30FC\u30DE\u306E\u307E\u307E", row.easing === void 0), ...MOTION_EASINGS.map((v) => option(v, EASING_LABEL[v], row.easing === v)));
  easing.addEventListener("change", () => {
    const { easing: _old, ...rest } = chosen(row, {});
    const v = easing.value;
    ui.choose(row.id, v === "" ? rest : {
      ...rest,
      easing: v
    });
  });
  const tone = el("div", {
    class: "motion-tone"
  }, el("label", {}, "\u901F\u3055"), speed, el("label", {}, "\u7DE9\u6025"), easing);
  box7.append(tone);
  if (custom) {
    const ms = el("input", {
      type: "number",
      class: "motion-ms",
      min: "0",
      max: String(MOTION_SPEED_MAX),
      step: "10",
      value: String(row.speed),
      ...row.speedFree ? {} : {
        disabled: true
      }
    });
    ms.addEventListener("change", () => {
      const v = Math.round(Number(ms.value));
      if (!Number.isFinite(v) || ms.value.trim() === "" || v < 0 || v > MOTION_SPEED_MAX) {
        ms.value = String(row.speed);
        return;
      }
      ui.choose(row.id, chosen(row, {
        speed: v
      }));
    });
    box7.append(el("div", {
      class: "motion-tone"
    }, el("label", {}, "\u30DF\u30EA\u79D2"), ms));
  }
}
function mineButton(row, m, ui) {
  const button2 = el("button", {
    class: "btn motion-candidate motion-mine-item" + (m.current ? " is-current" : ""),
    "data-mine": m.name
  }, m.current ? `${m.name} \u2713` : m.name);
  button2.addEventListener("mouseenter", () => ui.sample(row.id, m.motion, m.name, button2));
  button2.addEventListener("mouseleave", () => ui.unsample());
  button2.addEventListener("click", () => ui.choose(row.id, m.motion));
  button2.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    ui.unsample();
    openMenu({
      x: e.clientX,
      y: e.clientY
    }, [
      {
        action: "motion-edit",
        label: "\u76F4\u3059",
        enabled: true
      },
      {
        action: "motion-rename",
        label: "\u540D\u524D\u3092\u5909\u3048\u308B",
        enabled: true
      },
      {
        action: "motion-delete",
        label: "\u6D88\u3059",
        enabled: true
      }
    ], (action) => {
      if (action === "motion-edit") ui.edit(m.name);
      else if (action === "motion-rename") startMineRename(button2, m.name, ui);
      else if (action === "motion-delete" && confirm(`\u300C${m.name}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002\u4F7F\u3063\u3066\u3044\u308B\u90E8\u54C1\u306F\u3001\u4ECA\u306E\u52D5\u304D\u306E\u307E\u307E\u52D5\u304D\u307E\u3059`)) ui.remove(m.name);
    });
  });
  return button2;
}
var RENAME_HINT = "Enter \u3067\u6C7A\u307E\u308B \xB7 Esc \u3067\u3084\u3081\u308B";
function startMineRename(button2, name, ui) {
  const input = el("input", {
    type: "text",
    class: "motion-mine-rename",
    value: name
  });
  const why = el("div", {
    class: "motion-mine-why"
  }, RENAME_HINT);
  const edit = el("div", {
    class: "motion-mine-edit"
  }, input, why);
  let done = false;
  let busy = false;
  const giveUp = () => {
    if (done || busy) return;
    done = true;
    edit.replaceWith(button2);
  };
  const submit = async () => {
    if (busy) return;
    const to = input.value.trim();
    if (to === name) return giveUp();
    busy = true;
    const error = await ui.rename(name, to);
    busy = false;
    if (error === void 0) {
      done = true;
      return;
    }
    why.textContent = error;
    why.classList.add("is-error");
    input.focus();
  };
  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.isComposing) return;
    if (e.key === "Enter") void submit();
    else if (e.key === "Escape") giveUp();
  });
  input.addEventListener("blur", giveUp);
  input.addEventListener("click", (e) => e.stopPropagation());
  button2.replaceWith(edit);
  input.focus();
  input.select();
}
function startRename(s, owner, row, label, h2) {
  const input = el("input", {
    type: "text",
    class: "state-rename",
    value: row.name
  });
  let done = false;
  const finish = (commit) => {
    if (done) return;
    const name = input.value.trim();
    if (commit && name !== row.name) {
      if (!canNameState(written2(s.doc), owner, row.id, name)) {
        input.classList.add("is-invalid");
        return;
      }
      done = true;
      h2.edit((st) => renameStateOf(st, owner, row.id, name));
      return;
    }
    done = true;
    input.replaceWith(label);
  };
  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.isComposing) return;
    if (e.key === "Enter") finish(true);
    else if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));
  input.addEventListener("click", (e) => e.stopPropagation());
  label.replaceWith(input);
  input.focus();
  input.select();
}
function animationSection(s, owner, h2, registry2, states = true) {
  const box7 = el("div", {
    class: "anim"
  }, el("div", {
    class: "sub-title"
  }, "Animation"));
  if (states) stateSection(box7, s, owner, h2);
  if (h2.blocks) box7.append(blockSection(s, owner, h2.blocks(owner), registry2));
  return box7;
}
function stateSection(box7, s, owner, h2) {
  box7.append(el("div", {
    class: "muted"
  }, "State"));
  const written_ = statesOf(written2(s.doc), owner) !== void 0;
  const rows2 = stateRows(s, owner);
  for (const row of rows2) {
    const label = el("span", {
      class: "state-name"
    }, row.name);
    const node = el("div", {
      class: "state-row" + (row.current ? " is-current" : ""),
      "data-state": row.id,
      "data-guide": guideTag.state(row.id)
    }, label, el("span", {
      class: "state-note"
    }, row.first ? "\u6700\u521D\u306E State" : row.current ? "\u7DE8\u96C6\u4E2D" : ""));
    const ui = h2.motion;
    if (ui && !row.first) {
      const play = el("button", {
        class: "btn state-play",
        title: "\u518D\u751F"
      }, "\u25B6");
      play.addEventListener("click", (e) => {
        e.stopPropagation();
        ui.play(owner, row.id);
      });
      play.addEventListener("dblclick", (e) => e.stopPropagation());
      node.append(play);
    }
    node.addEventListener("click", () => {
      if (row.current) return;
      h2.show((st) => setEditing(st, row.first ? void 0 : {
        owner,
        state: row.id
      }));
    });
    if (written_) node.addEventListener("dblclick", () => startRename(s, owner, row, label, h2));
    node.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (!row.first) h2.onStateMenu(owner, row.id, {
        x: e.clientX,
        y: e.clientY
      });
    });
    box7.append(node);
  }
  box7.append(el("button", {
    class: "btn btn-block state-add",
    onclick: () => h2.edit((st) => addStateTo(st, owner))
  }, "+ State \u3092\u8DB3\u3059"));
  const shown2 = rows2.find((r) => r.current);
  if (shown2 && !shown2.first) {
    box7.append(el("div", {
      class: "muted"
    }, `\u300C${shown2.name}\u300D\u3067\u5909\u3048\u305F\u70B9`));
    const diffs = diffRows(s);
    if (diffs.length === 0) box7.append(el("div", {
      class: "muted state-nodiff"
    }, "\u9055\u3044\u306A\u3057"));
    const ui = h2.motion;
    for (const m of motionRows(s, ui?.tone, ui?.saved)) {
      const open = ui?.open === m.id;
      const part = el("div", {
        class: "motion-part" + (open ? " is-open" : ""),
        "data-part": m.id
      });
      for (const d of diffs.filter((x) => x.id === m.id)) {
        part.append(el("div", {
          class: "state-diff"
        }, el("span", {
          class: "state-diff-text",
          title: d.id
        }, `${d.label}  ${d.text}`), el("button", {
          class: "btn state-revert",
          onclick: () => h2.edit((st) => revertInState(st, d.id, d.keys))
        }, "\u623B\u3059")));
      }
      const line = el("div", {
        class: "motion-line" + (ui ? "" : " is-static")
      }, open ? "\u25BE \u52D5\u304D" : `\u25B8 ${m.text}`);
      if (ui) line.addEventListener("click", () => ui.toggle(m.id));
      part.append(line);
      if (ui && open) part.append(motionEditor(m, ui));
      box7.append(part);
    }
  }
}

// src/editor/panels/preview.ts
var SAMPLE_STAGE = {
  w: 204,
  h: 120
};
var SAMPLE_PAD = 12;
function fitSample(start, end, stage = SAMPLE_STAGE, pad = SAMPLE_PAD) {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const w = Math.max(start.x + start.w, end.x + end.w) - left;
  const h2 = Math.max(start.y + start.h, end.y + end.h) - top;
  const scale = Math.min(1, (stage.w - 2 * pad) / Math.max(1, w), (stage.h - 2 * pad) / Math.max(1, h2));
  return {
    x: left - (stage.w / scale - w) / 2,
    y: top - (stage.h / scale - h2) / 2,
    scale
  };
}
var float;
var outside;
function closeFloat() {
  float?.remove();
  float = void 0;
  if (outside) document.removeEventListener("pointerdown", outside, true);
  outside = void 0;
}
function openFloat(over, box7) {
  closeFloat();
  float = box7;
  document.body.append(box7);
  const part = over.getAttribute("data-part");
  const anchor = over.isConnected || part === null ? over : document.querySelector(`button[data-part="${CSS.escape(part)}"]`) ?? over;
  const at = anchor.getBoundingClientRect();
  const panel = document.getElementById("right")?.getBoundingClientRect();
  const left = (panel?.left ?? at.left) - box7.offsetWidth - 12;
  const top = Math.min(at.top - 48, globalThis.innerHeight - box7.offsetHeight - 8);
  box7.style.left = `${Math.max(8, left)}px`;
  box7.style.top = `${Math.max(LAYOUT.headerHeight + 8, top)}px`;
}
function openSample(over, opts) {
  const fit = fitSample(opts.rects.start, opts.rects.end);
  const vars = Object.entries(themeCssVars(opts.theme)).map(([k, v]) => `${k}:${v}`).join(";");
  const inner = el("div", {
    class: "float-inner",
    style: `width:${SAMPLE_STAGE.w / fit.scale}px;height:${SAMPLE_STAGE.h / fit.scale}px;transform:scale(${fit.scale});${vars};`
  });
  const stage = el("div", {
    class: "float-stage",
    style: `width:${SAMPLE_STAGE.w}px;height:${SAMPLE_STAGE.h}px;`
  }, inner);
  openFloat(over, el("div", {
    class: "motion-float motion-sample"
  }, el("div", {
    class: "float-title"
  }, opts.title), stage, el("div", {
    class: "float-note"
  }, opts.note)));
  const { start, end } = opts.rects;
  const moves = !sameRect(start, end);
  return {
    draw(frame) {
      clear(inner);
      if (moves) {
        inner.append(el("div", {
          class: "wf-ghost",
          style: `left:${start.x - fit.x}px;top:${start.y - fit.y}px;width:${start.w}px;height:${start.h}px;`
        }));
      }
      const part = findById(frame.elements, opts.id)?.el;
      if (!part || isHidden(frame.elements, opts.id)) return;
      const at = absoluteOffset(frame.elements, opts.id);
      inner.append(renderElement({
        ...part,
        x: at.x - fit.x,
        y: at.y - fit.y
      }, opts.registry, false, frame.show));
    }
  };
}
function openPicker(over, rows2, onPick) {
  const box7 = el("div", {
    class: "motion-float motion-picker"
  }, el("div", {
    class: "float-title"
  }, "\u4E2D\u8EAB\u3092\u9078\u3076"));
  if (rows2.length === 0) box7.append(el("div", {
    class: "muted"
  }, "\u8DB3\u305B\u308B\u90E8\u54C1\u304C\u3042\u308A\u307E\u305B\u3093"));
  for (const row of rows2) {
    const node = el("div", {
      class: "float-row" + (row.added ? " is-added" : ""),
      "data-part": row.id,
      style: `padding-left:${8 + row.depth * 16}px;`
    }, el("span", {
      class: "float-row-label"
    }, row.label), row.added ? el("span", {
      class: "float-row-note"
    }, "\u8DB3\u3057\u3066\u3042\u308B") : null);
    if (!row.added) node.addEventListener("click", () => onPick(row.id));
    box7.append(node);
  }
  openFloat(over, box7);
  const opener = over.getAttribute("data-part");
  outside = (e) => {
    const target = e.target;
    if (box7.contains(target)) return;
    const button2 = target.closest?.(".motion-inner-add");
    if (button2 && button2.getAttribute("data-part") === opener) return;
    closeFloat();
  };
  document.addEventListener("pointerdown", outside, true);
}
function pickerOpen() {
  return float?.classList.contains("motion-picker") === true;
}

// src/editor/animation-ui.ts
function dropEffectsList() {
  for (const node of document.querySelectorAll(".blk-motion-menu")) node.remove();
  for (const node of document.querySelectorAll(".blk-motion.is-open")) {
    node.classList.remove("is-open");
  }
}
var actionAt = (block, branch, i) => (branch === "do" ? block?.do : block?.else)?.[i];
function failText(body, status) {
  const errors = body.errors;
  if (typeof body.error === "string") return body.error;
  return errors?.[0]?.message ?? `HTTP ${status}`;
}
function reached(p) {
  return p.catch((e) => ({
    ok: false,
    status: 0,
    body: {
      error: `\u30B5\u30FC\u30D0\u30FC\u306B\u5C4A\u304D\u307E\u305B\u3093: ${e instanceof Error ? e.message : String(e)}`
    }
  }));
}
function stateText(s, owner, state) {
  const box7 = owner === void 0 ? void 0 : findById(s.doc.screen.elements, owner)?.el;
  const name = statesOf(written2(s.doc), owner)?.find((x) => x.id === state)?.name;
  return `${box7 ? treeLabel(box7, false) : "\u753B\u9762"} \u306E\u300C${name ?? ""}\u300D`;
}
var AnimationUi = class {
  deps;
  /** Shows motions on the canvas: ▶ and a candidate's sample (motion spec §5.2, §5.3). */
  player;
  /** ▶ of a block (triggers spec §5.3): a run of its Then alone, drawn as 再生 draws. */
  trier;
  /** What ▶ is playing: the strip says so with 止める, and nothing can be edited meanwhile. */
  playing;
  /** What a running sample adds to the canvas, and its window (none for a sample shown once). */
  sampling;
  /** The press that is going on stopped ▶: the list it would open stays shut. */
  stoppedByPress;
  /** The part whose motion is open (one at a time). */
  motionOpen;
  /** The block that is open in ブロック, and whose it is (undefined owner = the screen). */
  blockOpen;
  /**
   * The 「…で動かす」 row of the open block whose motion list is open (one at a time), and what takes
   * away the listeners it put on the page (a press outside it, Esc).
   */
  effectsOpen;
  /** 「動きを作る」 while it is open in the right panel (saved-motions spec §5.2). */
  building;
  constructor(clock, deps) {
    this.deps = deps;
    this.stoppedByPress = false;
    this.player = new Player(clock, registry, (shot) => this.drawShot(shot));
    this.trier = new Play(clock, {
      registry,
      theme: () => this.deps.theme(),
      draw: (shot) => this.deps.show(shot ? playingOf(shot) : void 0),
      changed: () => {
      },
      counting: () => {
      },
      failed: (error) => this.deps.failed(error)
    });
  }
  /** Whether a ▶ is playing. */
  get previewing() {
    return this.playing !== void 0;
  }
  /** The strip's words and its 止める while a ▶ plays. */
  strip() {
    return this.playing;
  }
  /** Whatever plays or goes round stops (another screen, a reload, 再生). */
  stop() {
    this.player.stop();
    this.trier.stop();
  }
  /** A sample going round stops; ▶ goes on. */
  unsample() {
    if (this.player.running === "sample") this.player.stop();
  }
  /** Another screen: no motion and no block is open on it, and 「動きを作る」 is gone. */
  forget() {
    this.motionOpen = void 0;
    this.blockOpen = void 0;
    this.closeEffects();
    this.building = void 0;
  }
  /** The block of `owner` (undefined = the screen) that is open, by its place; undefined = none. */
  openBlock(owner) {
    const open = this.blockOpen;
    return open && open.owner === owner ? open.index : void 0;
  }
  /** Undo and redo: every block folds, for the open one's place may now hold another block. */
  foldBlocks() {
    this.blockOpen = void 0;
    this.closeEffects();
  }
  /** A press on the canvas: while ▶ plays it stops it, and does nothing else. */
  canvasDown(e) {
    this.stoppedByPress = this.playing !== void 0;
    if (!e.target.closest("#state-badge")) this.stopOn(e);
  }
  /** The right button that stopped ▶ does not open the list as well. */
  canvasMenu(e) {
    if (this.stoppedByPress) {
      this.stoppedByPress = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    } else this.stopOn(e, false);
  }
  /**
   * A press let go (or taken by the browser): a later right click opens the list again. Not the
   * right button's own release: its list may come after it (a right press that stopped ▶).
   */
  released(e) {
    if (e.type === "pointercancel" || e.button !== 2) this.stoppedByPress = false;
  }
  /** While ▶ runs: the event goes nowhere else; with `stop` (a press, Esc) the playing ends. */
  stopOn(e, stop = true) {
    if (!this.playing) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (stop) this.playing.stop();
  }
  /** One moment from the player onto the canvas; `undefined` = the document is drawn again. */
  drawShot(shot) {
    if (!shot) {
      if (this.sampling?.window) closeFloat();
      this.sampling = void 0;
      this.deps.show(void 0);
      return;
    }
    const sample = shot.kind === "sample" ? this.sampling : void 0;
    this.deps.show({
      elements: shot.frame.elements,
      show: shot.frame.show,
      bare: shot.kind === "play",
      ...sample?.ghost ? {
        ghost: sample.ghost
      } : {},
      ...sample?.note ? {
        note: sample.note
      } : {}
    });
    sample?.window?.draw(shot.frame);
  }
  /**
   * Before a ▶: nothing else moves or floats, and nothing but the canvas takes input, by pointer or
   * by key (motion spec §5.2). `stop` is what 止める, a press on the canvas and Esc do.
   */
  begin(text18, stop) {
    this.deps.abandon();
    closeMenu();
    closeFloat();
    this.player.stop();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    this.playing = {
      text: text18,
      stop
    };
    for (const node of this.deps.panels()) node.inert = true;
    document.body.classList.add("is-playing");
    this.deps.renderBadge();
  }
  /** The ▶ is over, or was stopped. */
  end() {
    this.playing = void 0;
    for (const node of this.deps.panels()) node.inert = false;
    document.body.classList.remove("is-playing");
    this.deps.renderBadge();
    this.sampleBuilder();
  }
  /**
   * ▶ of a state row: the first look, into that state, a pause, back, once, whatever is shown for
   * editing. Nothing is written, nothing goes into the history, the unsaved mark stays as it is; when
   * it is over the canvas shows what it showed before.
   */
  playState(owner, state) {
    const s = this.deps.state();
    if (!s || this.playing) return;
    const theme = this.deps.theme();
    const tr = planTransition(written2(s.doc), {
      owner,
      state
    }, themeTone(theme));
    if (!tr) return;
    this.begin(`${stateText(s, owner, state)}\u3092\u518D\u751F\u4E2D`, () => this.player.stop());
    this.player.play(tr, theme, () => this.end());
  }
  /**
   * ▶ of a block (triggers spec §5.3): its Then once, whatever its If says, from the look the canvas
   * shows; a pause, and back to that look. A Then that goes to another screen shows it and stays
   * until 止める. Nothing is written; the strip and the stopping are those of a state's ▶.
   */
  async tryBlock(owner, index) {
    const s = this.deps.state();
    if (!s || this.playing) return;
    const block = blocksAt(written2(s.doc), owner)[index];
    const screenId = s.doc.screen.id;
    if (!block) return;
    let screens = {
      [screenId]: written2(s.doc)
    };
    if (block.do.some((a) => a.act === "go")) {
      screens = await this.deps.readScreens();
      if (!screens || this.playing || this.deps.replaying()) return;
      if (this.deps.state()?.doc.screen.id !== screenId) return;
    }
    const now = this.deps.state() ?? s;
    const states = now.editing ? {
      [now.editing.owner ?? SCREEN]: now.editing.state
    } : {};
    const who = owner === void 0 ? void 0 : findById(now.doc.screen.elements, owner)?.el;
    this.begin(`${who ? partLabel(who) : "\u753B\u9762"} \u306E\u30D6\u30ED\u30C3\u30AF ${circled(index + 1)} \u3092\u518D\u751F\u4E2D`, () => this.trier.stop());
    this.trier.tryBlock(screens, screenId, states, owner ?? SCREEN, index, () => this.end(), this.deps.scrolls?.());
  }
  /** What Animation needs for its motion controls. */
  motionUi() {
    return {
      open: this.motionOpen,
      tone: themeTone(this.deps.theme()),
      toggle: (id) => {
        this.motionOpen = this.motionOpen === id ? void 0 : id;
        closeFloat();
        this.deps.renderAll();
        if (this.motionOpen !== void 0) this.deps.refreshSaved?.();
      },
      saved: this.deps.saved?.() ?? [],
      refreshSaved: () => this.deps.refreshSaved?.(),
      build: (id) => this.deps.openBuilder?.({
        from: "row",
        id
      }),
      edit: (name) => this.deps.openBuilder?.({
        from: "saved",
        name,
        at: this.motionOpen
      }),
      rename: (name, to) => this.renameSaved(name, to),
      remove: (name) => void this.removeSaved(name),
      play: (owner, state) => this.playState(owner, state),
      sample: (id, motion, label, over) => this.sampleMotion(id, motion, label, over),
      unsample: () => this.unsample(),
      choose: (id, motion) => this.chooseMotion(id, motion),
      pick: (id, over) => {
        const s = this.deps.state();
        if (!s) return;
        if (pickerOpen()) return closeFloat();
        openPicker(over, innerRows(s, id), (part) => {
          closeFloat();
          this.deps.edit((st) => setMotionIn(st, part, {
            name: "fade"
          }));
        });
      }
    };
  }
  /** 名前を変える of a saved motion: the error text, or undefined once it is done. */
  async renameSaved(name, to) {
    if (to === "") return "\u540D\u524D\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044";
    const r = await reached(renameMotion(name, to));
    if (!r.ok) return r.status === 409 ? `\u300C${to}\u300D\u306F\u65E2\u306B\u3042\u308A\u307E\u3059` : failText(r.body, r.status);
    this.deps.refreshSaved?.();
    return void 0;
  }
  /** 消す of a saved motion; the parts that use it keep the copy they hold. */
  async removeSaved(name) {
    const r = await reached(deleteMotion(name));
    if (!r.ok) this.deps.notice?.(`\u52D5\u304D\u3092\u6D88\u305B\u307E\u305B\u3093: ${failText(r.body, r.status)}`, true);
    this.deps.refreshSaved?.();
  }
  /** Whether 「動きを作る」 is open: the right panel draws it in place of the properties. */
  get builderOpen() {
    return this.building !== void 0;
  }
  /**
   * Opens 「動きを作る」 (saved-motions spec §5.2) from a row of the shown state (its motion as steps,
   * the use fixed by the row) or from a saved motion (直す). False when there is nothing to open.
   */
  startBuilder(request2) {
    const s = this.deps.state();
    if (!s || this.playing) return false;
    const base = written2(s.doc);
    let b;
    let sampleId;
    if (request2.from === "row") {
      const editing = s.editing;
      const index = stateIndex(base, editing);
      const row = editing && index > 0 ? statesOf(base, editing.owner)?.[index]?.changes?.[request2.id] : void 0;
      const part = findById(base.elements, request2.id)?.el;
      if (!editing || !row || !part) return false;
      const kind = rowKind(row);
      b = {
        origin: {
          kind: "row",
          owner: editing.owner,
          state: editing.state,
          id: request2.id
        },
        name: "",
        use: kind,
        useFixed: true,
        motion: fromRow(row.motion, kind, part, themeTone(this.deps.theme())),
        partType: part.type
      };
    } else if (request2.from === "block") {
      const { owner, block, branch, action } = request2;
      const a = actionAt(blocksAt(base, owner)[block], branch, action);
      const part = a?.act === "play" ? findById(base.elements, a.part)?.el : void 0;
      if (a?.act !== "play" || !part) return false;
      b = {
        origin: {
          kind: "block",
          owner,
          block,
          branch,
          action,
          part: a.part
        },
        name: "",
        use: "effect",
        useFixed: true,
        motion: fromEffect(a.motion),
        partType: part.type
      };
    } else {
      const saved2 = this.deps.saved?.().find((e) => e.name === request2.name)?.saved;
      if (!saved2) {
        this.deps.notice?.(`\u300C${request2.name}\u300D\u3092\u8AAD\u3081\u307E\u305B\u3093`, true);
        return false;
      }
      sampleId = request2.at;
      b = {
        origin: {
          kind: "saved",
          name: saved2.name
        },
        name: saved2.name,
        use: saved2.use,
        useFixed: false,
        motion: saved2.motion,
        partType: ""
      };
    }
    closeMenu();
    this.closeEffects();
    this.unsample();
    closeFloat();
    this.building = {
      b,
      saving: false,
      ...sampleId ? {
        sampleId
      } : {}
    };
    return true;
  }
  /** ← 戻る and やめる: the builder goes, nothing is written. */
  closeBuilder() {
    if (!this.building) return;
    this.building = void 0;
    this.unsample();
    closeFloat();
    this.deps.renderAll();
  }
  /** What the panel 「動きを作る」 needs; undefined when it is not open. */
  builderUi() {
    const at = this.building;
    if (!at) return void 0;
    const live = () => this.building === at;
    return {
      builder: at.b,
      tone: themeTone(this.deps.theme()),
      saving: at.saving,
      problems: () => {
        const lines = problems(at.b, takenNames(at.b, this.deps.saved?.() ?? []));
        return at.failed && !lines.includes(at.failed) ? [
          ...lines,
          at.failed
        ] : lines;
      },
      change: (next) => {
        if (!live()) return;
        at.b = {
          ...next,
          name: at.b.name
        };
        at.failed = void 0;
        this.deps.renderAll();
      },
      setName: (name) => {
        if (!live()) return;
        at.b = {
          ...at.b,
          name
        };
        at.failed = void 0;
        this.sampleBuilder();
      },
      save: () => void this.saveBuilt(),
      close: () => live() && this.closeBuilder()
    };
  }
  /**
   * While 「動きを作る」 is open, its part goes round by the motion as it is now, on the canvas and
   * in the window; again after every change. A row's part moves in the state the builder was opened
   * from; a saved motion's, in the shown state, when it has that part's row and the motion fits it.
   * その場で動く moves the block's part (a saved motion's: the row's) on the look shown, by its steps
   * as they are. `anchor` = the panel as drawn now.
   */
  sampleBuilder(anchor) {
    const at = this.building;
    if (!at) return;
    if (anchor) at.anchor = anchor;
    const s = this.deps.state();
    if (!s || this.playing || !at.anchor?.isConnected) return;
    const origin = at.b.origin;
    const name = at.b.name.trim() || UNNAMED;
    const opts = {
      note: "\u21BB \u76F4\u3059\u305F\u3073\u306B\u7E70\u308A\u8FD4\u3059",
      keepFocus: true
    };
    if (at.b.use === "effect") {
      const id = origin.kind === "block" ? origin.part : at.sampleId;
      const steps = playable(at.b);
      this.unsample();
      closeFloat();
      if (id && steps) this.sampleEffect(id, steps, name, at.anchor, opts);
      return;
    }
    const target = origin.kind === "row" ? {
      editing: {
        owner: origin.owner,
        state: origin.state
      },
      id: origin.id
    } : s.editing && at.sampleId ? {
      editing: s.editing,
      id: at.sampleId
    } : void 0;
    const motion = playable(at.b);
    this.unsample();
    closeFloat();
    if (!target || !motion) return;
    this.sampleMotion(target.id, motion, name, at.anchor, {
      editing: target.editing,
      ...opts
    });
  }
  /**
   * 保存 (saved-motions spec §5.2): the saved motion's file, then, opened from a row, that row (an
   * edit that can be undone; never the state shown now); opened from a block, its 「…で動かす」 when
   * that place still holds one (else the file alone, and it is said). A failure keeps the builder
   * open with its line; 409 says the name is taken.
   */
  async saveBuilt() {
    const at = this.building;
    if (!at || at.saving) return;
    if (problems(at.b, takenNames(at.b, this.deps.saved?.() ?? [])).length > 0) return;
    const { name, use, motion } = toSaved(at.b);
    const origin = at.b.origin;
    const overwrite = origin.kind === "saved" && origin.name === name;
    at.saving = true;
    at.failed = void 0;
    this.deps.renderAll();
    const r = await reached((this.deps.saveMotion ?? saveMotion)(name, use, motion, overwrite));
    at.saving = false;
    if (this.building !== at) {
      this.deps.refreshSaved?.();
      return;
    }
    if (!r.ok) {
      at.failed = saveProblem(r.status);
      if (r.status === 409) this.deps.refreshSaved?.();
      this.deps.renderAll();
      return;
    }
    if (origin.kind === "saved" && origin.name !== name) {
      const gone = await reached(deleteMotion(origin.name));
      if (!gone.ok) {
        this.deps.notice?.(`\u300C${origin.name}\u300D\u3092\u6D88\u305B\u307E\u305B\u3093: ${failText(gone.body, gone.status)}`, true);
      }
      if (this.building !== at) return this.deps.refreshSaved?.();
    }
    this.building = void 0;
    this.unsample();
    closeFloat();
    const copy = withLabel({
      version: 1,
      name,
      use,
      motion
    });
    if (origin.kind === "row") {
      this.deps.edit((s) => setMotionAt(s, {
        owner: origin.owner,
        state: origin.state
      }, origin.id, copy));
    } else if (origin.kind === "block") this.putInBlock(origin, copy);
    else this.deps.renderAll();
    this.deps.refreshSaved?.();
  }
  /**
   * The saved copy into the 「…で動かす」 the builder was opened from, as one edit. An undo or another
   * edit while it was open may have moved or changed that action, or turned it to another part:
   * then nothing is written.
   */
  putInBlock(origin, copy) {
    const { owner, block, branch, action, part } = origin;
    const s = this.deps.state();
    const now = s && actionAt(blocksAt(written2(s.doc), owner)[block], branch, action);
    if (now?.act !== "play" || now.part !== part) {
      this.deps.renderAll();
      this.deps.notice?.("\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002\u30D6\u30ED\u30C3\u30AF\u306E\u51E6\u7406\u304C\u5909\u308F\u3063\u305F\u306E\u3067\u3001\u52D5\u304D\u306F\u4ED8\u3051\u3066\u3044\u307E\u305B\u3093");
      return;
    }
    this.deps.edit((st) => setBlocks(st, owner, (list) => list.map((blk, i) => i === block ? withAction(blk, branch, action, {
      act: "play",
      part,
      motion: copy
    }) : blk)));
  }
  /** What ブロック needs for the blocks of `owner` (undefined = the screen), triggers spec §5.3. */
  blockUi(owner) {
    const open = this.openBlock(owner);
    const change = (fn, next) => {
      this.blockOpen = next === void 0 ? void 0 : {
        owner,
        index: next
      };
      this.closeEffects();
      this.deps.edit((s) => setBlocks(s, owner, fn));
    };
    const list = this.effectsOpen;
    return {
      open,
      screens: this.deps.screens(),
      kept: this.deps.kept?.() ?? [],
      play: (index) => void this.tryBlock(owner, index),
      toggle: (index) => {
        this.blockOpen = open === index ? void 0 : {
          owner,
          index
        };
        this.closeEffects();
        this.deps.renderAll();
      },
      change,
      effects: {
        saved: this.deps.saved?.() ?? [],
        ...list && list.owner === owner && list.block === open ? {
          open: {
            branch: list.branch,
            index: list.index
          }
        } : {},
        toggle: (branch, index) => this.toggleEffects(owner, branch, index),
        sample: (part, motion, label, over) => {
          const steps = effectSteps(motion);
          if (steps) this.sampleEffect(part, steps, label, over);
        },
        unsample: () => this.unsample(),
        build: (branch, index) => {
          const block = this.openBlock(owner);
          if (block === void 0) return;
          this.closeEffects();
          this.deps.openBuilder?.({
            from: "block",
            owner,
            block,
            branch,
            action: index
          });
        },
        edit: (name, part) => {
          this.closeEffects();
          this.deps.openBuilder?.({
            from: "saved",
            name,
            at: part
          });
        },
        remove: (name) => void this.removeSaved(name)
      },
      more: (index, count, client) => openMenu(client, [
        {
          action: "duplicate",
          label: "\u8907\u88FD",
          enabled: true
        },
        {
          action: "up",
          label: "\u4E0A\u3078",
          enabled: index > 0
        },
        {
          action: "down",
          label: "\u4E0B\u3078",
          enabled: index < count - 1
        },
        "separator",
        {
          action: "delete",
          label: "\u524A\u9664",
          enabled: true
        }
      ], (action) => {
        if (action === "duplicate") change((list2) => duplicateAt(list2, index), index + 1);
        else if (action === "up") change((list2) => moveAt(list2, index, -1), index - 1);
        else if (action === "down") change((list2) => moveAt(list2, index, 1), index + 1);
        else if (action === "delete") change((list2) => removeAt(list2, index));
      })
    };
  }
  /**
   * The motion chip of the 「…で動かす」 `index` of the `branch` of the block of `owner` that is open:
   * its list opens (another closes), or closes when it is the one open. Nothing opens when no block
   * of `owner` is open. Opening asks for the saved motions again, as a row's candidates do.
   */
  toggleEffects(owner, branch, index) {
    const block = this.openBlock(owner);
    if (block === void 0) return;
    const was = this.effectsOpen;
    this.closeEffects();
    const same3 = was !== void 0 && was.owner === owner && was.block === block && was.branch === branch && was.index === index;
    if (!same3) {
      const gone = () => {
        if (document.querySelector(".blk-motion-menu")) return false;
        this.closeEffects();
        return true;
      };
      const onDown = (e) => {
        if (gone()) return;
        const target = e.target;
        if (target?.closest?.(".blk-motion-menu, .blk-motion, .ctx-menu")) return;
        this.closeEffects();
        dropEffectsList();
      };
      const onKey = (e) => {
        if (gone() || e.key !== "Escape" || e.isComposing) return;
        if (document.querySelector(".ctx-menu")) return;
        e.preventDefault();
        e.stopPropagation();
        this.closeEffects();
        dropEffectsList();
      };
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("keydown", onKey, true);
      this.effectsOpen = {
        owner,
        block,
        branch,
        index,
        off: () => {
          document.removeEventListener("pointerdown", onDown, true);
          document.removeEventListener("keydown", onKey, true);
        }
      };
    }
    this.deps.renderAll();
    if (!same3) {
      document.querySelector(".blk-motion-menu")?.scrollIntoView?.({
        block: "nearest"
      });
      this.deps.refreshSaved?.();
    }
  }
  /** The motion list closes, its listeners go, and a sample shown from it stops. */
  closeEffects() {
    const list = this.effectsOpen;
    if (!list) return;
    this.effectsOpen = void 0;
    list.off();
    this.unsample();
  }
  /**
   * The pointer is on a candidate: the part moves by it on the canvas, round and round, and a copy
   * does the same in the floating window. Nothing is written until the candidate is pressed.
   */
  sampleMotion(id, motion, label, over, opts = {}) {
    const s = this.deps.state();
    const editing = opts.editing ?? s?.editing;
    if (!s || !editing || this.playing) return;
    const theme = this.deps.theme();
    const tr = planTransition(written2(s.doc), editing, themeTone(theme), {
      [id]: motion
    });
    const rects = tr && sampleRects(tr, id, theme, registry);
    if (!tr || !rects) return;
    if (isStepped(motion) && !tr.tracks.find((t) => t.id === id)?.steps) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && !(opts.keepFocus && active.closest("#right"))) {
      active.blur();
    }
    this.player.stop();
    const { start, end } = rects;
    const tone = isStepped(motion) ? "" : toneText(motion.name ?? "", motion);
    this.sampling = {
      ...sameRect(start, end) ? {} : {
        ghost: start
      },
      note: {
        text: `\u21BB ${label} \u3092\u7E70\u308A\u8FD4\u3057\u4E2D`,
        rect: end
      },
      window: openSample(over, {
        id,
        title: `\u898B\u672C: ${label}`,
        note: opts.note ?? (tone ? `\u21BB \u7E70\u308A\u8FD4\u3057 \xB7 ${tone}` : "\u21BB \u7E70\u308A\u8FD4\u3057"),
        rects,
        theme,
        registry
      })
    };
    this.player.sample(tr, id, theme);
  }
  /**
   * A sample of その場で動く (saved-motions spec §5.2, §5.3): the part `id` moves by `motion` on the
   * look the canvas shows, round and round, and a copy does the same in the floating window. It
   * starts and ends where the part is: no start is drawn dashed.
   */
  sampleEffect(id, motion, label, over, opts = {}) {
    const s = this.deps.state();
    if (!s || this.playing) return;
    const elements = s.doc.screen.elements;
    const part = findById(elements, id)?.el;
    if (!part) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && !(opts.keepFocus && active.closest("#right"))) {
      active.blur();
    }
    this.player.stop();
    const theme = this.deps.theme();
    const { x, y } = absoluteOffset(elements, id);
    const rect2 = {
      x,
      y,
      w: part.w,
      h: part.h
    };
    this.sampling = {
      note: {
        text: `\u21BB ${label} \u3092\u7E70\u308A\u8FD4\u3057\u4E2D`,
        rect: rect2
      },
      window: openSample(over, {
        id,
        title: `\u898B\u672C: ${label}`,
        note: opts.note ?? "\u21BB \u7E70\u308A\u8FD4\u3057",
        rects: {
          start: rect2,
          end: rect2
        },
        theme,
        registry
      })
    };
    this.player.effect(elements, id, motion, theme);
  }
  /** A candidate was pressed, or the speed or easing changed: written as an edit, then shown once. */
  chooseMotion(id, motion) {
    const before = this.deps.state();
    if (!before?.editing) return;
    const same3 = sameWritten(setMotionIn(before, id, motion).doc, before.doc);
    if (!same3) this.deps.edit((s2) => setMotionIn(s2, id, motion));
    const s = this.deps.state();
    const theme = this.deps.theme();
    const tr = s?.editing && planTransition(written2(s.doc), s.editing, themeTone(theme));
    if (tr?.tracks.some((t) => t.id === id)) this.player.sample(tr, id, theme, 1);
  }
};

// src/editor/typing.ts
function takesTyping(part) {
  return part.type === "input" && part.props.kind !== "select";
}
var Typing = class {
  host;
  deps;
  input;
  target;
  /** `host` is the canvas's scrolling box, which the field is laid out in. */
  constructor(host2, deps) {
    this.host = host2;
    this.deps = deps;
  }
  /** The input being typed into; undefined = none. */
  get id() {
    return this.target;
  }
  /**
   * Typing into the input `id`, which holds `text` (a multi-line one takes Enter as a new line):
   * the field is laid over it and takes the keyboard.
   */
  open(id, text18, multiline) {
    if (this.target === id && this.input) {
      this.input.focus();
      return;
    }
    this.close();
    const input = multiline ? el("textarea", {
      class: "play-typing"
    }) : el("input", {
      class: "play-typing",
      type: "text"
    });
    input.value = text18;
    this.input = input;
    this.target = id;
    input.addEventListener("input", (e) => {
      if (e.isComposing) return;
      this.deps.typed(id, input.value);
    });
    input.addEventListener("compositionend", () => this.deps.typed(id, input.value));
    input.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.isComposing) return;
      const key = ke.key === "Escape" ? "escape" : ke.key === "Enter" && !multiline ? "enter" : void 0;
      if (!key) return;
      e.preventDefault();
      this.close();
      this.deps.key(key);
    });
    input.addEventListener("blur", () => {
      if (this.input === input) this.close();
    });
    this.host.appendChild(input);
    if (!this.place()) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }
  /** Lays the field over the input as drawn now; when it is not drawn, typing ends. Whether it is. */
  place() {
    const input = this.input;
    if (!input || this.target === void 0) return false;
    const field2 = this.deps.field(this.target);
    if (!field2) {
      this.close();
      return false;
    }
    const r = field2.getBoundingClientRect();
    const box7 = this.host.getBoundingClientRect();
    const look = getComputedStyle(field2);
    const zoom = field2.offsetWidth > 0 ? r.width / field2.offsetWidth : 1;
    const s = input.style;
    s.left = `${r.left - box7.left + this.host.scrollLeft}px`;
    s.top = `${r.top - box7.top + this.host.scrollTop}px`;
    s.width = `${r.width}px`;
    s.height = `${r.height}px`;
    s.fontSize = `${parseFloat(look.fontSize) * zoom}px`;
    s.fontFamily = look.fontFamily;
    s.color = getComputedStyle(field2.closest(".wf-frame") ?? field2).color;
    s.padding = input instanceof HTMLTextAreaElement ? `${8 * zoom}px ${10 * zoom}px` : `0 ${10 * zoom}px`;
    s.borderRadius = `${parseFloat(look.borderTopLeftRadius) * zoom}px`;
    s.background = look.backgroundColor;
    return true;
  }
  /** Typing ends; what was typed stays the input's text. */
  close() {
    const input = this.input;
    this.input = void 0;
    this.target = void 0;
    input?.remove();
  }
};

// src/editor/interact.ts
var DOUBLE_PRESS_MS = 400;
function pickTarget(elements, hitId, entered) {
  const path = pathTo(elements, hitId);
  const into = entered === void 0 ? [] : pathTo(elements, entered).map((e) => e.id);
  const open = entered !== void 0 && path.some((e) => e.id === entered) ? into : [];
  for (const e of path) {
    if (e.type === GROUP_TYPE2 && e.locked !== true && !open.includes(e.id)) return e.id;
  }
  return hitId;
}
function stillEntered(elements, hitId, entered) {
  if (entered === void 0) return void 0;
  const path = pathTo(elements, hitId).map((e) => e.id);
  const groups = pathTo(elements, entered).filter((e) => e.type === GROUP_TYPE2 && e.locked !== true).map((e) => e.id);
  return groups.reverse().find((id) => path.includes(id));
}
function marqueeHits(elements, box7, scrolls) {
  const hits = [];
  walkVisible(elements, (e, area) => {
    const touched = area.left < area.right && area.top < area.bottom && area.left <= box7.x + box7.w && area.right >= box7.x && area.top <= box7.y + box7.h && area.bottom >= box7.y;
    if (e.locked === true) return touched;
    if (touched) hits.push(e.id);
    return false;
  }, scrolls);
  return hits;
}
function marqueeNewHits(elements, box7, base, scrolls) {
  return marqueeHits(elements, box7, scrolls).filter((id) => !base.includes(id));
}
function partsAt(elements, point, scrolls) {
  const hits = [];
  walkVisible(elements, (e, area) => {
    if (area.left <= point.x && point.x < area.right && area.top <= point.y && point.y < area.bottom) {
      hits.push(e.id);
    }
    return true;
  }, scrolls);
  return hits.reverse();
}
function frontLockedPart(elements, point, scrolls) {
  const front = partsAt(elements, point, scrolls).find((id) => findById(elements, id)?.el.type !== GROUP_TYPE2);
  return front !== void 0 && isLocked(elements, front) ? front : void 0;
}
function dropTargetAt(elements, point, moving, device, scrolls) {
  if (point.x < 0 || point.y < 0 || point.x >= device.w || point.y >= device.h) return void 0;
  return partsAt(elements, point, scrolls).find((id) => {
    const path = pathTo(elements, id);
    const last = path[path.length - 1];
    const holds2 = last.type === "rect" || last.type === GROUP_TYPE2 && layoutOf(last) !== void 0;
    return holds2 && !path.some((e) => moving.includes(e.id));
  });
}
function dropPlaceAt(elements, point, moving, device, scrolls) {
  let id = dropTargetAt(elements, point, moving, device, scrolls);
  if (id === void 0) return {};
  const located = findById(elements, id);
  const outer = located.parent === void 0 ? void 0 : findById(elements, located.parent)?.el;
  const OL = outer ? layoutOf(outer) : void 0;
  if (outer && OL) {
    const reorder2 = moving.some((m) => findById(elements, m)?.parent === outer.id);
    const inner = moving.some((m) => findById(elements, m)?.parent === id);
    const seen = absoluteOffset(elements, id, scrolls);
    const length = OL.dir === "column" ? located.el.h : located.el.w;
    const at = OL.dir === "column" ? point.y - seen.y : point.x - seen.x;
    const band = Math.min(16, length / 4);
    if (!inner && (reorder2 || at < band || at >= length - band)) id = outer.id;
  }
  const box7 = findById(elements, id).el;
  const L = layoutOf(box7);
  if (!L) return {
    target: id
  };
  const origin = absoluteOffset(elements, id, scrolls);
  const sent = scrollOf(scrolls, id);
  const along = L.dir === "column" ? point.y - origin.y + sent.y : point.x - origin.x + sent.x;
  return {
    target: id,
    slot: {
      box: id,
      index: slotIndex(box7, along, moving)
    }
  };
}
function dropOutline(elements, moving, target, scrolls) {
  if (target === void 0) return void 0;
  const box7 = findById(elements, target)?.el;
  if (!box7) return void 0;
  const laidOut = layoutOf(box7) !== void 0;
  const entering2 = laidOut ? moving.filter((id) => findById(elements, id)?.parent !== target) : enteringParts(elements, moving, target);
  if (entering2.length === 0 || box7.type !== "rect" && !laidOut) return void 0;
  let rect2;
  walkVisible(elements, (e, area) => {
    if (e.id === target && area.left < area.right && area.top < area.bottom) {
      rect2 = {
        x: area.left,
        y: area.top,
        w: area.right - area.left,
        h: area.bottom - area.top
      };
    }
    return rect2 === void 0;
  }, scrolls);
  return rect2;
}
function slotLine(state, box7, ids, scrolls) {
  const b = findById(state.doc.screen.elements, box7)?.el;
  const L = b ? layoutOf(b) : void 0;
  const first = b?.children?.find((c) => ids.includes(c.id));
  const outer = absoluteRect(state, box7, scrolls);
  const r = first ? absoluteRect(state, first.id, scrolls) : void 0;
  if (!L || !outer || !r) return void 0;
  const [pv, ph] = L.pad;
  const back = Math.floor(L.gap / 2) + 1;
  return L.dir === "column" ? {
    x: outer.x + ph,
    y: Math.max(outer.y + pv, r.y - back),
    w: Math.max(0, outer.w - 2 * ph),
    h: 3
  } : {
    x: Math.max(outer.x + ph, r.x - back),
    y: outer.y + pv,
    w: 3,
    h: Math.max(0, outer.h - 2 * pv)
  };
}
function dragFrame(base, ids, startRects, delta, now, grid, scrolls) {
  const elements = base.doc.screen.elements;
  const device = deviceSize(base.doc.screen.device);
  const { target, slot } = dropPlaceAt(elements, now, ids, device, scrolls);
  const area = dropOutline(elements, ids, target, scrolls);
  const outlines = area && target !== void 0 ? [
    {
      kind: "drop",
      id: target,
      rect: area
    }
  ] : [];
  const seen = (id) => absoluteRect(base, id, scrolls);
  if (slot) {
    const state2 = moveToSlot(base, ids, slot.box, slot.index);
    const at = /* @__PURE__ */ new Map();
    for (const id of ids) {
      const r = seen(id);
      if (r) {
        const m = moveRect(r, delta.dx, delta.dy, grid);
        at.set(id, {
          x: m.x,
          y: m.y
        });
      }
    }
    const drop = outlines.pop();
    const drawn2 = drop && visibleArea(state2.doc.screen.elements, drop.id, scrolls);
    if (drop && drawn2) outlines.push({
      ...drop,
      rect: drawn2
    });
    const line = slotLine(state2, slot.box, ids, scrolls);
    if (line) outlines.push({
      kind: "slot",
      id: slot.box,
      rect: line
    });
    return {
      state: state2,
      target,
      slot,
      at,
      outlines
    };
  }
  const lifted = new Set(ids.filter((id) => inLayout(elements, id) !== void 0));
  let state = liftOutOfLayouts(base, ids);
  for (const id of ids) {
    const r = lifted.has(id) ? seen(id) : startRects.get(id);
    if (r) state = setAbsRect(state, id, moveRect(r, delta.dx, delta.dy, grid));
  }
  return {
    state,
    target,
    outlines
  };
}
function keyDuringGesture(action) {
  if (action === "deselect") return "cancel";
  return action === "save" || action === "zoom-fit" || action === "zoom-100" ? "pass" : "hold";
}
function pressAction(running, press) {
  if (press.button !== 0 || !press.isPrimary) return "ignore";
  if (running === void 0) return "start";
  return running.pointerId === press.pointerId ? "restart" : "ignore";
}
function clientToFrame(client, frame, zoom) {
  return {
    x: (client.x - frame.left) / zoom,
    y: (client.y - frame.top) / zoom
  };
}
function gestureEnd(g, how, state, registry2) {
  if (g.kind === "pick") return state;
  if (g.kind === "marquee") {
    if (how === "cancel") return state;
    if (!g.began) return state.selection.length ? select(state, []) : state;
    return select(state, keepExisting(state.doc, [
      ...g.base ?? [],
      ...g.hits ?? []
    ]));
  }
  if (!g.began) return state;
  if (how === "cancel") return g.before ? rollBack(state, g.before) : state;
  if (g.kind !== "move") return state;
  return g.slot ? state : dropOnCanvas(state, g.ids, g.target, registry2);
}
function pressGesture(before, state, id, press, start) {
  const els = state.doc.screen.elements;
  const rects = /* @__PURE__ */ new Map();
  for (const sid of movingIds(els, state.selection)) {
    const r = absoluteRect(state, sid);
    if (r) rects.set(sid, r);
  }
  const onList = before.selection.length === 1 && before.selection[0] === id && findById(els, id)?.el.type === "list";
  const common = {
    pointerId: press.pointerId,
    startX: press.clientX,
    startY: press.clientY,
    began: false,
    ...onList && start ? {
      rowPick: {
        id,
        point: start
      }
    } : {}
  };
  if (rects.size > 0) {
    return {
      kind: "move",
      ...common,
      start,
      ids: [
        ...rects.keys()
      ],
      startRects: rects
    };
  }
  return common.rowPick ? {
    kind: "pick",
    ...common,
    ids: [],
    startRects: /* @__PURE__ */ new Map()
  } : void 0;
}
function releasedRow(g, how, state, scrolls) {
  if (how !== "release" || g.began || !g.rowPick) return void 0;
  const index = rowAt(state, g.rowPick.id, g.rowPick.point, scrolls);
  return index === void 0 ? void 0 : {
    list: g.rowPick.id,
    index
  };
}
function copiesPageText(selection, canvas) {
  if (!selection || selection.isCollapsed) return false;
  return !canvas.contains(selection.anchorNode) || !canvas.contains(selection.focusNode);
}
function resolvePress(elements, box7, entered) {
  const hitId = box7.dataset.id ?? "";
  const stay = stillEntered(elements, hitId, entered);
  return {
    hitId,
    id: pickTarget(elements, hitId, stay),
    entered: stay
  };
}
function attachInteractions(deps) {
  const { canvas } = deps;
  let gesture;
  let lastPress;
  const framePoint = (clientX, clientY) => {
    const fr = canvas.querySelector(".wf-frame")?.getBoundingClientRect();
    return fr ? clientToFrame({
      x: clientX,
      y: clientY
    }, fr, deps.view.zoom) : void 0;
  };
  const marqueeAt = (g, clientX, clientY) => {
    const a = framePoint(g.startX, g.startY);
    const b = framePoint(clientX, clientY);
    if (!a || !b) return [];
    const box7 = {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y)
    };
    return marqueeNewHits(deps.getState().doc.screen.elements, box7, g.base ?? [], deps.view.scrolls);
  };
  const update = (g, p) => {
    g.last = p;
    if (g.kind === "marquee") {
      const box7 = g.box;
      box7.style.left = `${Math.min(p.x, g.startX)}px`;
      box7.style.top = `${Math.min(p.y, g.startY)}px`;
      box7.style.width = `${Math.abs(p.x - g.startX)}px`;
      box7.style.height = `${Math.abs(p.y - g.startY)}px`;
      const hits = marqueeAt(g, p.x, p.y);
      if (hits.join("\n") !== (g.hits ?? []).join("\n")) {
        g.hits = hits;
        showOutlines(canvas, deps.getState(), deps.view, hits.map((id) => ({
          kind: "preview",
          id
        })));
      }
      return;
    }
    const now = framePoint(p.x, p.y);
    if (!now || !g.start) return;
    const dx = now.x - g.start.x;
    const dy = now.y - g.start.y;
    const grid = p.alt ? 1 : GRID;
    const scrolls = deps.view.scrolls;
    if (g.kind === "move" && g.origin) {
      const f = dragFrame(g.origin, g.ids, g.startRects, {
        dx,
        dy
      }, now, grid, scrolls);
      g.target = f.target;
      g.slot = f.slot;
      deps.view.draggedAt = f.at;
      deps.setState(f.state);
      if (JSON.stringify(f.outlines) !== JSON.stringify(deps.view.outlines)) {
        showOutlines(canvas, f.state, deps.view, f.outlines);
      }
      return;
    }
    let state = deps.getState();
    for (const id of g.ids) {
      const start = g.startRects.get(id);
      if (!start) continue;
      state = setAbsRect(state, id, resizeRect(start, g.handle ?? "se", dx, dy, {
        grid
      }));
    }
    deps.setState(state);
  };
  const finish = (how) => {
    const g = gesture;
    if (!g) return;
    gesture = void 0;
    g.box?.remove();
    deps.view.dragged = [];
    deps.view.draggedAt = void 0;
    const state = deps.getState();
    if (!state) return;
    showOutlines(canvas, state, deps.view, []);
    const dropsRows = how === "release" && g.began && g.slot !== void 0 && g.origin !== void 0 && positionRowsOf(written2(g.origin.doc), g.ids) > 0;
    const next = gestureEnd(g, how, state, deps.registry);
    const row = releasedRow(g, how, next, deps.view.scrolls);
    if (row) deps.view.row = row;
    const picked = row !== void 0;
    if (next !== state || g.began || picked) deps.setState(next);
    if (dropsRows) {
      const box7 = findById(next.doc.screen.elements, g.slot.box)?.el;
      if (box7) deps.notice?.(positionRowsNotice(box7));
    }
  };
  const follow = () => {
    if (gesture?.began && gesture.last) update(gesture, gesture.last);
  };
  canvas.addEventListener("pointerdown", (e) => {
    const press = pressAction(gesture, e);
    if (press === "ignore") return;
    if (press === "restart") finish("cancel");
    const target = e.target;
    if (target.closest(".wf-inline")) return;
    const before = deps.getState();
    const handle = target.closest(".wf-handle")?.dataset.handle;
    if (handle && before.selection.length === 1) {
      const id2 = before.selection[0];
      const rect2 = absoluteRect(before, id2);
      if (!rect2 || isLocked(before.doc.screen.elements, id2)) return;
      gesture = {
        kind: "resize",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        start: framePoint(e.clientX, e.clientY),
        ids: [
          id2
        ],
        startRects: /* @__PURE__ */ new Map([
          [
            id2,
            rect2
          ]
        ]),
        handle,
        began: false
      };
      e.preventDefault();
      return;
    }
    const box7 = target.closest(".wf-el");
    if (!box7) {
      lastPress = void 0;
      if (!target.closest("#canvas")) return;
      deps.view.entered = void 0;
      deps.setState(e.shiftKey ? before : select(before, []));
      gesture = {
        kind: "marquee",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        ids: [],
        startRects: /* @__PURE__ */ new Map(),
        began: false,
        base: e.shiftKey ? before.selection : []
      };
      return;
    }
    const elements = before.doc.screen.elements;
    const { hitId, id, entered } = resolvePress(elements, box7, deps.view.entered);
    deps.view.entered = entered;
    const now = performance.now();
    const isSecondPress = lastPress !== void 0 && lastPress.id === hitId && now - lastPress.time < DOUBLE_PRESS_MS && Math.hypot(e.clientX - lastPress.x, e.clientY - lastPress.y) < LAYOUT.dragThreshold;
    lastPress = {
      id: hitId,
      time: now,
      x: e.clientX,
      y: e.clientY
    };
    if (isSecondPress) {
      lastPress = void 0;
      if (id !== hitId) {
        deps.view.entered = id;
        deps.setState(select(before, [
          pickTarget(elements, hitId, id)
        ]));
      } else {
        startInlineEdit(deps, id, rowAt(before, id, framePoint(e.clientX, e.clientY), deps.view.scrolls));
      }
      e.preventDefault();
      return;
    }
    let state = before;
    if (e.shiftKey) state = toggleSelect(state, id);
    else if (!state.selection.includes(id)) state = select(state, [
      id
    ]);
    deps.setState(state);
    gesture = pressGesture(before, state, id, e, framePoint(e.clientX, e.clientY));
    e.preventDefault();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!gesture || e.pointerId !== gesture.pointerId) return;
    if (!(e.buttons & 1)) {
      finish("cancel");
      return;
    }
    if (!gesture.began) {
      const dist = Math.hypot(e.clientX - gesture.startX, e.clientY - gesture.startY);
      if (dist < LAYOUT.dragThreshold) return;
      gesture.began = true;
      if (gesture.kind === "pick") return;
      canvas.setPointerCapture(e.pointerId);
      if (gesture.kind === "marquee") {
        gesture.box = el("div", {
          class: "wf-marquee"
        });
        document.body.append(gesture.box);
      } else {
        gesture.before = deps.getState();
        gesture.origin = beginEdit(gesture.before);
        if (gesture.kind === "move") deps.view.dragged = gesture.ids;
        deps.setState(gesture.origin);
      }
    }
    if (gesture.kind !== "pick") update(gesture, {
      x: e.clientX,
      y: e.clientY,
      alt: e.altKey
    });
  });
  const release = (e) => {
    if (gesture?.pointerId === e.pointerId) finish("release");
  };
  const cancel = (e) => {
    if (gesture?.pointerId === e.pointerId) finish("cancel");
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", cancel);
  globalThis.addEventListener("pointerup", (e) => release(e));
  globalThis.addEventListener("pointercancel", (e) => cancel(e));
  globalThis.addEventListener("blur", () => finish("cancel"));
  canvas.addEventListener("scroll", follow);
  canvas.addEventListener("contextmenu", (e) => {
    const target = e.target;
    if (target.closest(".wf-inline")) return;
    e.preventDefault();
    if (gesture) return;
    const before = deps.getState();
    if (!before) return;
    const pointer = framePoint(e.clientX, e.clientY);
    const at = pointer ?? {
      x: 0,
      y: 0
    };
    const box7 = target.closest(".wf-el");
    const onHandle = target.closest(".wf-handle") !== null;
    const elements = before.doc.screen.elements;
    const device = deviceSize(before.doc.screen.device);
    const inFrame = pointer !== void 0 && at.x >= 0 && at.y >= 0 && at.x < device.w && at.y < device.h;
    const locked = inFrame && !onHandle ? frontLockedPart(elements, at, deps.view.scrolls) : void 0;
    let state = before;
    if (locked !== void 0) {
      deps.view.entered = stillEntered(elements, locked, deps.view.entered);
      if (!state.selection.includes(locked)) state = select(state, [
        locked
      ]);
    } else if (box7) {
      const { id, entered } = resolvePress(elements, box7, deps.view.entered);
      deps.view.entered = entered;
      if (!state.selection.includes(id)) state = select(state, [
        id
      ]);
    } else if (!onHandle) {
      deps.view.entered = void 0;
      state = select(state, []);
    }
    deps.setState(state);
    deps.onMenu({
      x: e.clientX,
      y: e.clientY
    }, at);
  });
  canvas.addEventListener("wheel", (e) => {
    if (!e.ctrlKey) {
      const state = deps.getState();
      const point = framePoint(e.clientX, e.clientY);
      if (!state || !point) return;
      const device = deviceSize(state.doc.screen.device);
      if (point.x >= 0 && point.y >= 0 && point.x < device.w && point.y < device.h) {
        e.preventDefault();
      }
      const elements = state.doc.screen.elements;
      const hit = partsAt(elements, point, deps.view.scrolls)[0];
      if (hit === void 0) return;
      const step2 = wheelStep(e, deps.view.zoom, device);
      const target = pickScrollTarget(elements, deps.view.scrolls, hit, step2.dx, step2.dy);
      if (!target) return;
      deps.view.scrolls = scrollBy(elements, deps.view.scrolls, target.id, step2, performance.now());
      deps.setState(state);
      follow();
      return;
    }
    e.preventDefault();
    const next = Math.min(2, Math.max(0.1, Math.round((deps.view.zoom + (e.deltaY < 0 ? 0.1 : -0.1)) * 10) / 10));
    deps.view.zoom = next;
    deps.setState(deps.getState());
    follow();
  }, {
    passive: false
  });
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable;
    const action = matchKey(e);
    if (!action) return;
    if (gesture) {
      const during = keyDuringGesture(action);
      if (during !== "pass") {
        e.preventDefault();
        if (during === "cancel") finish("cancel");
        return;
      }
    }
    if (typing && action !== "save") return;
    if ((action === "copy" || action === "cut" || action === "paste") && !deps.getState()) return;
    if ((action === "copy" || action === "cut") && copiesPageText(document.getSelection(), deps.canvas)) return;
    e.preventDefault();
    deps.onAction(action, e);
    if (action === "zoom-fit" || action === "zoom-100") follow();
  });
  return {
    busy: () => gesture !== void 0,
    abandon: () => {
      const g = gesture;
      gesture = void 0;
      g?.box?.remove();
      deps.view.outlines = [];
      deps.view.dragged = [];
      deps.view.draggedAt = void 0;
    }
  };
}
function rowAt(state, id, point, scrolls) {
  const el2 = findById(state.doc.screen.elements, id)?.el;
  const abs = el2?.type === "list" ? absoluteRect(state, id, scrolls) : void 0;
  if (!el2 || !abs || !point) return void 0;
  const place3 = placeIn(el2, point.x - abs.x, point.y - abs.y, scrollOf(scrolls, id));
  return typeof place3 === "number" ? place3 : void 0;
}
function startInlineEdit(deps, id, row) {
  const state = deps.getState();
  const located = findById(state.doc.screen.elements, id);
  const abs = absoluteRect(state, id, deps.view.scrolls);
  const stage = deps.canvas.querySelector(".wf-stage");
  if (!located || !abs || !stage) return;
  if (row !== void 0 && located.el.locked === true) return;
  const z = deps.view.zoom;
  const multi = row === void 0 && located.el.props.multiline === true;
  const input = multi ? el("textarea", {
    class: "wf-inline"
  }) : el("input", {
    class: "wf-inline",
    type: "text"
  });
  const written3 = row === void 0 ? located.el.text ?? "" : rowsOf(located.el)[row]?.text ?? "";
  input.value = written3;
  if (row === void 0) {
    input.style.left = `${abs.x * z}px`;
    input.style.top = `${abs.y * z}px`;
    input.style.width = `${Math.max(80, abs.w * z)}px`;
    if (multi) input.style.height = `${abs.h * z}px`;
  } else {
    const shape = filledRows(located.el)[row];
    const rowHeight = rowHeightOf(located.el);
    const lead = shape.leading === "none" ? 0 : (shape.leading === "avatar" ? 32 : 24) + 12;
    const trail = shape.trailing === "none" ? 0 : 40;
    const top = abs.y + row * rowHeight - scrollOf(deps.view.scrolls, id).y;
    input.style.left = `${(abs.x + 16 + lead) * z}px`;
    input.style.top = `${top * z + Math.max(0, (rowHeight * z - 26) / 2)}px`;
    input.style.width = `${Math.max(80, (abs.w - 32 - lead - trail) * z)}px`;
    deps.view.row = {
      list: id,
      index: row
    };
  }
  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    input.remove();
    if (!commit || input.value === written3) return;
    if (row === void 0) {
      deps.setState(setText(beginEdit(deps.getState()), id, input.value));
      return;
    }
    const text18 = input.value;
    deps.setState(editRows(beginEdit(deps.getState()), id, (rows2, el2) => patchRow(rows2.length ? rows2 : placeholderRows(el2), row, {
      text: text18
    })));
  };
  input.addEventListener("keydown", (e) => {
    const ke = e;
    if (ke.isComposing) return;
    if (matchKey(ke) === "save") {
      e.preventDefault();
      finish(true);
      return;
    }
    e.stopPropagation();
    if (ke.key === "Enter" && !(multi && ke.shiftKey)) {
      e.preventDefault();
      finish(true);
    } else if (ke.key === "Escape") {
      e.preventDefault();
      finish(false);
    }
  });
  input.addEventListener("blur", () => finish(true));
  stage.appendChild(input);
  input.focus();
  input.select();
}

// src/editor/clipboard.ts
var sameScreen = (a, b) => a.proposal === b.proposal && a.screen === b.screen;
function copySelection(s, source) {
  const elements = s.doc.screen.elements;
  const items = topmostIds(elements, s.selection).filter((id) => s.editing === void 0 || !isHidden(elements, id)).map((id) => ({
    el: structuredClone(sourceOf2(s, id)),
    abs: absoluteOffset(elements, id)
  }));
  return items.length > 0 ? {
    items,
    source,
    pastes: 0
  } : void 0;
}
function cutSelection(s, source) {
  if (s.selection.some((id) => isLocked(s.doc.screen.elements, id))) return void 0;
  const clip = copySelection(s, source);
  if (!clip) return void 0;
  const state = removeElements(s, clip.items.map((i) => i.el.id));
  return state === s ? void 0 : {
    state,
    clip
  };
}
function pastePositions(clip, here, device, at) {
  const left = Math.min(...clip.items.map((i) => i.abs.x));
  const top = Math.min(...clip.items.map((i) => i.abs.y));
  const right = Math.max(...clip.items.map((i) => i.abs.x + i.el.w));
  const bottom = Math.max(...clip.items.map((i) => i.abs.y + i.el.h));
  const step2 = sameScreen(clip.source, here) ? DUPLICATE_OFFSET * (clip.pastes + 1) : 0;
  const wanted = at ? {
    x: snap2(at.x),
    y: snap2(at.y)
  } : {
    x: left + step2,
    y: top + step2
  };
  const x = Math.max(0, Math.min(wanted.x, device.w - (right - left)));
  const y = Math.max(0, Math.min(wanted.y, device.h - (bottom - top)));
  return clip.items.map((i) => ({
    x: x + i.abs.x - left,
    y: y + i.abs.y - top
  }));
}
function pasteClip(s, clip, here, at, slot) {
  const places = pastePositions(clip, here, deviceSize(s.doc.screen.device), at);
  const taken = new Set(allIds(s.doc.screen.elements));
  const renamed = /* @__PURE__ */ new Map();
  const copies = remapCopies(clip.items.map((item, i) => {
    const { locked: _locked, ...rest } = item.el;
    return renameTree({
      ...rest,
      ...places[i]
    }, taken, renamed);
  }), renamed);
  const stepped2 = !at && sameScreen(clip.source, here);
  return {
    state: slot ? appendAtSlot(s, copies, slot.box, slot.index) : appendRoot(s, copies.map((c) => dropFill(c))),
    clip: stepped2 ? {
      ...clip,
      pastes: clip.pastes + 1
    } : clip
  };
}

// src/editor/header.ts
var DUPLICATE = "__duplicate__";
function connection(on) {
  return el("span", {
    class: "hdr-conn"
  }, el("span", {
    class: "dot" + (on ? " is-on" : "")
  }), on ? "\u63A5\u7D9A\u4E2D" : "\u5207\u65AD");
}
function guideButton(p) {
  if (!p.guide) return [];
  return [
    tagged(el("button", {
      class: "btn guide-btn",
      title: p.guide.title,
      onclick: p.guide.onClick
    }, p.guide.text), guideTag.header("guide"))
  ];
}
function renderHeader(container, p) {
  clear(container);
  const home = tagged(el("button", {
    class: "btn",
    disabled: p.mode === "start",
    onclick: p.onHome
  }, "Home"), guideTag.header("home"));
  if (p.mode === "start") {
    container.append(home, el("span", {
      class: "muted hdr-project"
    }, p.projectName), ...guideButton(p), el("span", {
      class: "spacer"
    }), connection(p.connected));
    return;
  }
  const proposalSel = tagged(el("select", {
    class: "hdr-select",
    title: "\u6848"
  }, ...p.proposals.map((x) => el("option", {
    value: x.id,
    ...x.id === p.proposalId ? {
      selected: true
    } : {}
  }, x.name)), el("option", {
    value: DUPLICATE
  }, "\uFF0B \u4ECA\u306E\u6848\u3092\u8907\u88FD")), guideTag.header("proposal"));
  proposalSel.addEventListener("change", () => {
    const v = proposalSel.value;
    if (v === DUPLICATE) {
      proposalSel.value = p.proposalId;
      p.onDuplicateProposal();
    } else p.onSelectProposal(v);
  });
  const screenSel = tagged(el("select", {
    class: "hdr-select hdr-screen",
    title: "\u753B\u9762"
  }, ...p.screens.map((s) => el("option", {
    value: s.id,
    ...s.id === p.screenId ? {
      selected: true
    } : {},
    ...s.error ? {
      disabled: true
    } : {}
  }, s.id === p.screenId && p.screenLabel ? p.screenLabel : `${s.title}  (${s.id})`))), guideTag.header("screen"));
  screenSel.addEventListener("change", () => p.onSelectScreen(screenSel.value));
  const playing = p.playing === true;
  container.append(home, tagged(el("button", {
    class: "btn btn-primary",
    disabled: playing,
    onclick: p.onSave,
    title: "Ctrl+S"
  }, p.dirty ? "\u4FDD\u5B58 \u25CF" : "\u4FDD\u5B58"), guideTag.header("save")), tagged(el("button", {
    class: "btn",
    disabled: playing || !p.canUndo,
    onclick: p.onUndo,
    title: "\u5143\u306B\u623B\u3059"
  }, "\u21B6"), guideTag.header("undo")), tagged(el("button", {
    class: "btn",
    disabled: playing || !p.canRedo,
    onclick: p.onRedo,
    title: "\u3084\u308A\u76F4\u3059"
  }, "\u21B7"), guideTag.header("redo")), el("span", {
    class: "hdr-mode",
    role: "group",
    "aria-label": "\u7DE8\u96C6\u3068\u518D\u751F"
  }, tagged(el("button", {
    class: "btn hdr-mode-btn" + (playing ? "" : " is-on"),
    "data-mode": "edit",
    onclick: p.onEdit
  }, "\u7DE8\u96C6"), guideTag.header("edit")), tagged(el("button", {
    class: "btn hdr-mode-btn" + (playing ? " is-on" : ""),
    "data-mode": "play",
    onclick: p.onPlay
  }, "\u25B6 \u518D\u751F"), guideTag.header("play"))), el("span", {
    class: "spacer"
  }), proposalSel, screenSel, ...guideButton(p), el("span", {
    class: "spacer"
  }), el("span", {
    class: "muted"
  }, `${Math.round((p.zoom ?? 1) * 100)}%`), tagged(el("button", {
    class: "btn",
    onclick: p.onZoomFit
  }, "\u5168\u4F53"), guideTag.header("zoom-fit")), tagged(el("button", {
    class: "btn",
    onclick: p.onZoom100
  }, "100%"), guideTag.header("zoom-100")), connection(p.connected));
}

// src/editor/guide.ts
var END_TEXT = "\u304A\u308F\u308A\u3002OK \u306A\u3089\u7AEF\u672B\u3067\u300COK\u300D\u3001\u6C17\u306B\u306A\u308B\u6240\u306F\u4E00\u8A00";
function nextStep(run, n) {
  return {
    ...run,
    step: Math.min(run.step + 1, n + 1)
  };
}
function prevStep(run) {
  return {
    ...run,
    step: Math.max(run.step - 1, 1)
  };
}
function progressFor(stored, hash) {
  return stored !== void 0 && stored.hash === hash ? stored : void 0;
}
var fresh = (n, stored) => stored === void 0 || stored.step === 0 || stored.step === n + 1 && stored.done;
function guideButtonText(n, stored) {
  return fresh(n, stored) ? `\u6848\u5185 \u25B6 ${n} \u624B\u9806` : `\u6848\u5185 ${Math.min(stored.step, n)} / ${n}`;
}
function isNewGuide(hash, stored) {
  return stored !== void 0 && stored.hash !== hash;
}
function guideBannerText(title, n, isNew) {
  return `${isNew ? "\u6848\u5185\u304C\u65B0\u3057\u304F\u306A\u308A\u307E\u3057\u305F" : "\u6848\u5185\u304C\u3042\u308A\u307E\u3059"}: ${title}(${n} \u624B\u9806)`;
}
function startStep(n, stored) {
  return fresh(n, stored) ? 1 : Math.min(stored.step, n + 1);
}
function stepFrames(step2, here, titles) {
  const proposalDiffers = step2.proposal !== void 0 && step2.proposal !== here.proposalId;
  const screenDiffers = step2.screen !== void 0 && step2.screen !== here.screenId;
  if (!proposalDiffers && !screenDiffers) {
    const f2 = {
      looks: step2.look ?? []
    };
    if (step2.press !== void 0) f2.press = step2.press;
    return f2;
  }
  const pid = step2.proposal ?? here.proposalId;
  const f = {
    looks: []
  };
  if (!here.start) {
    f.press = proposalDiffers ? guideTag.header("proposal") : guideTag.header("screen");
  }
  if (step2.screen === void 0) {
    f.pre = `\u3053\u306E\u624B\u9806\u306F\u6848\u300C${titles.proposalName(pid) ?? pid}\u300D\u3067`;
  } else {
    const title = titles.screenTitle(pid, step2.screen) ?? `${step2.screen}(\u3042\u308A\u307E\u305B\u3093)`;
    f.pre = proposalDiffers ? `\u3053\u306E\u624B\u9806\u306F\u6848\u300C${titles.proposalName(pid) ?? pid}\u300D\u306E\u753B\u9762\u300C${title}\u300D\u3067` : `\u3053\u306E\u624B\u9806\u306F\u753B\u9762\u300C${title}\u300D\u3067`;
  }
  return f;
}
function bubbleText(step2, k, n) {
  return {
    counter: `${k} / ${n}`,
    do: step2.do,
    see: step2.see
  };
}
function placeBubble(press, size, win, looks, opts) {
  const clamp = (c) => ({
    x: Math.max(0, Math.min(c.x, win.w - size.w)),
    y: Math.max(0, Math.min(c.y, win.h - size.h))
  });
  const fits = (c) => c.x >= 0 && c.y >= 0 && c.x + size.w <= win.w && c.y + size.h <= win.h;
  const overlaps = (c) => looks.some((r) => c.x < r.x + r.w && r.x < c.x + size.w && c.y < r.y + r.h && r.y < c.y + size.h);
  if (press === void 0) {
    const f = opts.fallback;
    const left2 = f.x + 16, right2 = f.x + f.w - 16 - size.w;
    const top = f.y + 16, bottom = f.y + f.h - 16 - size.h;
    const corners = [
      {
        x: left2,
        y: top
      },
      {
        x: right2,
        y: top
      },
      {
        x: left2,
        y: bottom
      },
      {
        x: right2,
        y: bottom
      }
    ];
    return corners.find((c) => fits(c) && !overlaps(c)) ?? clamp(corners[0]);
  }
  const p = press;
  const right = {
    x: p.x + p.w + 12,
    y: p.y
  };
  const left = {
    x: p.x - 12 - size.w,
    y: p.y
  };
  const below = {
    x: p.x,
    y: p.y + p.h + 12
  };
  const cands = opts.inHeader ? [
    below
  ] : [
    right,
    left,
    below
  ];
  return cands.find((c) => fits(c) && !overlaps(c)) ?? cands.find(fits) ?? clamp(cands[0]);
}
function pickByText(items, text18) {
  return items.filter((i) => i.visible && i.text.trim() === text18).sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x)[0];
}
function bannerChoice(i) {
  if (i.themeMissing) return "theme";
  if (i.defaultsError) return "defaults";
  if (i.guideError) return "guide-error";
  if (i.guideNotice && !i.otherShowing) return "guide-notice";
  return void 0;
}
function classifyAnswer(prev, next) {
  if (next.hash === prev.hash && next.error === prev.error) return "none";
  if (next.error !== void 0) return "broken";
  if (next.hash === null && next.guide === null) return "removed";
  return "changed";
}

// src/editor/guide-store.ts
var storageKey = (projectName) => `wf-guide:${projectName}`;
function isStored(v) {
  if (typeof v !== "object" || v === null) return false;
  const o = v;
  return typeof o.hash === "string" && typeof o.step === "number" && Number.isInteger(o.step) && o.step >= 0 && typeof o.done === "boolean";
}
function readStored(s, projectName) {
  try {
    const raw = s.getItem(storageKey(projectName));
    if (raw === null) return void 0;
    const v = JSON.parse(raw);
    return isStored(v) ? {
      hash: v.hash,
      step: v.step,
      done: v.done
    } : void 0;
  } catch {
    return void 0;
  }
}
function writeStored(s, projectName, v) {
  try {
    s.setItem(storageKey(projectName), JSON.stringify(v));
  } catch {
  }
}
function clearStored(s, projectName) {
  try {
    s.removeItem(storageKey(projectName));
  } catch {
  }
}

// src/editor/guide-layer.ts
var PAD = 4;
var rectOf = (e) => {
  const r = e.getBoundingClientRect();
  return {
    x: r.left,
    y: r.top,
    w: r.width,
    h: r.height
  };
};
var padded = (r) => ({
  x: r.x - PAD,
  y: r.y - PAD,
  w: r.w + 2 * PAD,
  h: r.h + 2 * PAD
});
var visibleOnly = (e) => {
  if (!e) return void 0;
  const r = e.getBoundingClientRect();
  return r.width === 0 || r.height === 0 ? void 0 : e;
};
function resolveTarget(root, key) {
  const t = parseTarget(key);
  if (!t) return void 0;
  if (t.kind === "canvas") {
    return visibleOnly(root.querySelector(`#canvas .wf-frame:not(.wf-under) .wf-el[data-id="${CSS.escape(t.name)}"]`));
  }
  if (t.kind === "button" || t.kind === "menu") {
    const nodes = t.kind === "button" ? [
      ...root.querySelectorAll("button, .btn")
    ].filter((e) => !e.closest("#guide-layer")) : [
      ...document.querySelectorAll(".ctx-menu .ctx-item")
    ];
    const items = nodes.map((e) => {
      const rect2 = rectOf(e);
      const text18 = t.kind === "menu" ? e.querySelector(".ctx-label")?.textContent ?? "" : e.textContent ?? "";
      return {
        el: e,
        text: text18,
        rect: rect2,
        visible: rect2.w > 0 && rect2.h > 0
      };
    });
    return pickByText(items, t.name)?.el;
  }
  return visibleOnly(root.querySelector(`[data-guide="${CSS.escape(key)}"]`));
}
var GuideLayer = class {
  root;
  layer;
  bubble;
  frames;
  props;
  timer;
  raf;
  constructor(root) {
    this.root = root;
    this.frames = [];
    this.layer = el("div", {
      id: "guide-layer",
      hidden: true
    });
    this.bubble = el("div", {
      class: "guide-bubble"
    });
    this.layer.append(this.bubble);
    root.append(this.layer);
    const stop = (e) => {
      if (e.target?.closest?.("#guide-layer")) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    globalThis.addEventListener("pointerdown", stop, true);
    globalThis.addEventListener("mousedown", stop, true);
    globalThis.addEventListener("resize", () => this.reposition());
    globalThis.addEventListener("scroll", () => this.reposition(), true);
  }
  show(p) {
    this.props = p;
    this.layer.hidden = false;
    this.renderBubble(p);
    if (this.timer === void 0) this.timer = setInterval(() => this.reposition(), 300);
    this.place();
  }
  hide() {
    this.props = void 0;
    this.layer.hidden = true;
    for (const f of this.frames) f.remove();
    this.frames = [];
    if (this.timer !== void 0) {
      clearInterval(this.timer);
      this.timer = void 0;
    }
  }
  setStopped(stopped) {
    this.layer.classList.toggle("is-stopped", stopped);
    this.reposition();
  }
  reposition() {
    if (this.raf !== void 0 || !this.props) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = void 0;
      this.place();
    });
  }
  renderBubble(p) {
    clear(this.bubble);
    const b = p.bubble;
    const head = el("div", {
      class: "guide-head"
    }, el("span", {
      class: "guide-step muted"
    }, b.counter), el("button", {
      class: "guide-close",
      title: "\u9589\u3058\u308B",
      onclick: b.end ? p.onFinish : p.onClose
    }, "\u2715"));
    if (b.end) {
      this.bubble.append(head, el("div", {
        class: "guide-do"
      }, END_TEXT), el("div", {
        class: "guide-actions"
      }, el("button", {
        class: "btn",
        onclick: p.onRestart
      }, "\u6700\u521D\u304B\u3089"), el("button", {
        class: "btn btn-primary",
        onclick: p.onFinish
      }, "\u9589\u3058\u308B")));
      return;
    }
    this.bubble.append(head);
    if (b.pre) this.bubble.append(el("div", {
      class: "guide-pre"
    }, b.pre));
    this.bubble.append(el("div", {
      class: "guide-label"
    }, "\u3084\u308B\u3053\u3068"), el("div", {
      class: "guide-do"
    }, b.do ?? ""), el("div", {
      class: "guide-label"
    }, "\u898B\u3048\u308B\u306F\u305A"), el("div", {
      class: "guide-see"
    }, b.see ?? ""), el("div", {
      class: "guide-actions"
    }, el("button", {
      class: "btn",
      disabled: b.backDisabled,
      onclick: p.onBack
    }, "\u623B\u308B"), el("button", {
      class: "btn btn-primary",
      onclick: p.onNext
    }, "\u6B21\u3078")));
  }
  place() {
    const p = this.props;
    if (!p) return;
    for (const f of this.frames) f.remove();
    this.frames = [];
    const pressEl = p.frames.press ? resolveTarget(this.root, p.frames.press) : void 0;
    const pressRect = pressEl ? padded(rectOf(pressEl)) : void 0;
    const lookRects = [];
    for (const key of p.frames.looks) {
      const e = resolveTarget(this.root, key);
      if (e) lookRects.push(padded(rectOf(e)));
    }
    const frame = (r, kind) => {
      const f = el("div", {
        class: `guide-frame ${kind}`,
        style: `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`
      });
      this.layer.append(f);
      this.frames.push(f);
    };
    if (pressRect) frame(pressRect, "press");
    for (const r of lookRects) frame(r, "look");
    const size = {
      w: this.bubble.offsetWidth,
      h: this.bubble.offsetHeight
    };
    const at = placeBubble(pressRect, size, {
      w: innerWidth,
      h: innerHeight
    }, lookRects, {
      inHeader: pressEl?.closest("#header") !== null && pressEl !== void 0,
      fallback: rectOf(p.fallback)
    });
    this.bubble.style.left = `${at.x}px`;
    this.bubble.style.top = `${at.y}px`;
  }
};

// src/editor/thumbnail.ts
function renderThumbnail(screen, projectDevice, theme, registry2, maxWidth, defaults = NO_DEFAULTS) {
  const filled = fillScreen(screen, projectDevice, registry2, defaults);
  const size = deviceSize(filled.device);
  const scale = Math.min(LAYOUT.galleryThumbScale, maxWidth / size.w);
  const vars = Object.entries(themeCssVars(theme)).map(([k, v]) => `${k}:${v}`).join(";");
  const frame = el("div", {
    class: "wf-frame wf-thumb-frame",
    style: `width:${size.w}px;height:${size.h}px;transform:scale(${scale});${vars};`
  });
  for (const e of drawn(filled.elements)) frame.appendChild(renderElement(e, registry2));
  return el("div", {
    class: "wf-thumb",
    style: `width:${Math.round(size.w * scale)}px;height:${Math.round(size.h * scale)}px;`
  }, frame);
}

// src/editor/dropzone.ts
async function imageProblem(file) {
  if (file.size > IMAGE_MAX_BYTES) return IMAGE_LIMIT_TEXT;
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return detectImage(head) ? void 0 : IMAGE_LIMIT_TEXT;
}
function firstFile(data) {
  if (!data) return void 0;
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return data.files?.[0];
}
function renderDropzone(onFile) {
  const input = el("input", {
    type: "file",
    accept: "image/png,image/jpeg,image/webp",
    hidden: true
  });
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    input.value = "";
    if (file) onFile(file);
  });
  const zone = el("div", {
    class: "dropzone"
  }, el("span", {
    class: "dropzone-text"
  }, `\u3053\u3053\u306B\u4ED6\u306E\u30A2\u30D7\u30EA\u306E\u753B\u9762\u306E\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u3092\u843D\u3068\u3059\u3001\u307E\u305F\u306F Ctrl+V \u3067\u8CBC\u308A\u4ED8\u3051(${IMAGE_LIMIT_TEXT})`), el("button", {
    class: "btn",
    onclick: () => input.click()
  }, "\u753B\u50CF\u3092\u9078\u3076"), input);
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("is-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("is-over");
    const file = firstFile(e.dataTransfer);
    if (file) onFile(file);
  });
  return zone;
}
function isEditableTarget(target) {
  const n = target;
  return n?.tagName === "INPUT" || n?.tagName === "TEXTAREA" || n?.isContentEditable === true;
}
function takesPastedImage(p) {
  if (!p.hasFile) return false;
  return !(p.editableTarget && p.types.includes("text/plain"));
}
function onPasteImage(enabled, onFile) {
  const handler = (e) => {
    if (!enabled()) return;
    const file = firstFile(e.clipboardData);
    if (!file || !takesPastedImage({
      editableTarget: isEditableTarget(e.target),
      types: Array.from(e.clipboardData?.types ?? []),
      hasFile: true
    })) return;
    e.preventDefault();
    onFile(file);
  };
  document.addEventListener("paste", handler);
  return () => document.removeEventListener("paste", handler);
}

// src/editor/start.ts
function defaultImportScreenId(taken) {
  const set = new Set(taken);
  for (let n = 1; ; n++) {
    if (!set.has(`import-${n}`)) return `import-${n}`;
  }
}
function referenceImageUrl(file) {
  return API_BASE + "/api/" + file.split("/").map(encodeURIComponent).join("/");
}
function lastEdited(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
var TABS = [
  {
    id: "blank",
    label: "Blank"
  },
  {
    id: "builtin",
    label: "Built-in"
  },
  {
    id: "custom",
    label: "Custom"
  },
  {
    id: "ai",
    label: "AI"
  }
];
function renderStart(nav, main, p) {
  clear(nav);
  clear(main);
  nav.append(tagged(el("button", {
    class: "btn nav-btn" + (p.tab === "recent" ? " is-active" : ""),
    onclick: () => p.onTab("recent")
  }, "Recent"), guideTag.start("recent")), tagged(el("button", {
    class: "btn nav-btn" + (p.tab === "templates" ? " is-active" : ""),
    onclick: () => p.onTab("templates")
  }, "Templates"), guideTag.start("templates")));
  if (p.tab === "recent") renderRecent(main, p);
  else renderTemplates(main, p);
}
function themeFor(p, id) {
  return themeOrDefault(p.themes, id);
}
function card(children, onClick) {
  return el("div", {
    class: "card" + (onClick ? " is-clickable" : ""),
    style: `width:${LAYOUT.galleryCardWidth}px`,
    ...onClick ? {
      onclick: onClick
    } : {}
  }, ...children);
}
function thumbOrBox(screen, device, theme, registry2, defaults) {
  const width = LAYOUT.galleryCardWidth - 32;
  if (!screen) {
    return el("div", {
      class: "thumb-empty",
      style: `width:${width}px;height:${Math.round(width * 0.75)}px`
    });
  }
  return renderThumbnail(screen, device, theme, registry2, width, defaults);
}
function renderRecent(main, p) {
  main.append(el("h1", {
    class: "start-title"
  }, "Recent"), el("div", {
    class: "muted"
  }, "\u6700\u5F8C\u306B\u7DE8\u96C6\u3057\u305F\u9806\u3002\u62BC\u3059\u3068\u7DE8\u96C6\u753B\u9762\u3067\u958B\u304D\u307E\u3059"));
  const sorted = [
    ...p.proposals
  ].sort((a, b) => a.modifiedAt < b.modifiedAt ? 1 : -1);
  for (const pr of sorted) {
    main.append(el("div", {
      class: "section-head"
    }, el("span", {
      class: "section-name"
    }, pr.name), el("span", {
      class: "muted"
    }, `(Last Edited ${lastEdited(pr.modifiedAt)})`), pr.note ? el("span", {
      class: "muted"
    }, pr.note) : null, el("span", {
      class: "spacer"
    }), el("button", {
      class: "btn",
      onclick: () => p.onDuplicateProposal(pr.id)
    }, "\u8907\u88FD"), el("button", {
      class: "btn",
      disabled: p.proposals.length <= 1,
      onclick: () => p.onDeleteProposal(pr.id)
    }, "\u524A\u9664")));
    if (pr.screens.length === 0) {
      main.append(el("div", {
        class: "muted section-empty"
      }, "\u307E\u3060\u753B\u9762\u304C\u3042\u308A\u307E\u305B\u3093\u3002Templates \u304B\u3089\u4F5C\u308C\u307E\u3059"));
      continue;
    }
    const row = el("div", {
      class: "card-row"
    });
    const theme = themeFor(p, pr.theme);
    for (const s of pr.screens) {
      row.append(tagged(card([
        thumbOrBox(p.contents.get(`${pr.id}/${s.id}`), p.project.device, theme, p.registry, p.defaults),
        el("div", {
          class: "card-title" + (s.error ? " has-error" : "")
        }, s.title),
        el("div", {
          class: "muted"
        }, s.error ? `${s.id}  !` : s.id),
        el("div", {
          class: "muted"
        }, `Last Edited ${lastEdited(s.modifiedAt ?? "")}`)
      ], () => p.onOpenScreen(pr.id, s.id)), guideTag.startScreen(pr.id, s.id)));
    }
    main.append(row);
  }
}
function renderTemplates(main, p) {
  main.append(el("h1", {
    class: "start-title"
  }, "Templates"));
  main.append(el("div", {
    class: "tabs"
  }, ...TABS.map((t) => tagged(el("button", {
    class: "btn tab-btn" + (t.id === p.templatesTab ? " is-active" : ""),
    onclick: () => p.onTemplatesTab(t.id)
  }, t.label), guideTag.startTemplates(t.id)))));
  const body = el("div", {
    class: "templates-body"
  });
  const grid = el("div", {
    class: "card-grid"
  });
  const theme = themeFor(p, p.project.theme);
  const sizeLabel = (d) => {
    const s = deviceSize(d ?? p.project.device);
    return `${s.w}x${s.h}`;
  };
  if (p.templatesTab === "blank") {
    const blank = {
      version: 1,
      id: "blank",
      title: "\u767D\u7D19",
      elements: []
    };
    grid.append(card([
      thumbOrBox(blank, p.project.device, theme, p.registry, p.defaults),
      el("div", {
        class: "card-title"
      }, "\u767D\u7D19"),
      el("div", {
        class: "muted"
      }, sizeLabel(void 0))
    ], () => p.onPick("blank", "\u767D\u7D19", void 0)));
  } else if (p.templatesTab === "ai") {
    main.append(renderDropzone(p.onImage));
    if (p.importForm) main.append(renderImportForm(p, p.importForm));
    if (p.references.length === 0) {
      body.append(el("div", {
        class: "muted"
      }, "\u307E\u3060\u53C2\u8003\u753B\u50CF\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u4E0A\u306B\u753B\u50CF\u3092\u843D\u3068\u3059\u3068\u767B\u9332\u3067\u304D\u307E\u3059"));
    }
    for (const r of p.references) grid.append(referenceCard(p, r));
  } else {
    const source = p.templatesTab === "builtin" ? "builtin" : "project";
    const list = p.templates.filter((t) => t.source === source);
    if (list.length === 0) {
      body.append(el("div", {
        class: "muted"
      }, source === "project" ? "\u307E\u3060 Custom \u306E\u3072\u306A\u5F62\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u7DE8\u96C6\u753B\u9762\u306E Save \u3067\u4FDD\u5B58\u3067\u304D\u307E\u3059" : "\u3072\u306A\u5F62\u304C\u3042\u308A\u307E\u305B\u3093"));
    }
    for (const t of list) {
      if (t.error || !t.template) {
        grid.append(card([
          el("div", {
            class: "thumb-empty"
          }),
          el("div", {
            class: "card-title has-error"
          }, `\u8AAD\u3081\u307E\u305B\u3093: ${t.id}.json`),
          el("div", {
            class: "muted"
          }, (t.error ?? "").split("\n")[0])
        ]));
        continue;
      }
      const c = card([
        thumbOrBox(t.template, p.project.device, theme, p.registry, p.defaults),
        el("div", {
          class: "card-title"
        }, t.title),
        el("div", {
          class: "muted"
        }, sizeLabel(t.device))
      ], () => p.onPick(`${source}:${t.id}`, t.title, t.device));
      if (source === "project") {
        c.append(el("button", {
          class: "card-del",
          title: "\u6D88\u3059",
          onclick: (e) => {
            e.stopPropagation();
            p.onDeleteTemplate(t.id);
          }
        }, "\xD7"));
      }
      grid.append(c);
    }
  }
  body.append(grid);
  if (p.form) body.append(renderForm(p, p.form));
  main.append(body);
  if (p.templatesTab === "ai" && p.references.some((r) => r.state === "created")) {
    main.append(el("div", {
      class: "muted"
    }, "Claude \u304C\u4F5C\u3063\u305F\u753B\u9762\u306E\u672D\u3092\u62BC\u3059\u3068\u3001\u305D\u306E\u753B\u9762\u3092\u5143\u306B\u65B0\u3057\u3044\u753B\u9762\u3092\u4F5C\u308C\u307E\u3059(\u4F5C\u308B\u6B04\u304C\u51FA\u307E\u3059)"));
  }
}
function referenceCard(p, r) {
  const width = LAYOUT.galleryCardWidth - 32;
  const proposal = p.proposals.find((x) => x.id === r.proposal);
  const made = r.state === "created" && r.proposal !== void 0 && r.screen !== void 0 ? p.contents.get(`${r.proposal}/${r.screen}`) : void 0;
  const image = r.fileExists ? el("img", {
    class: "ref-img",
    src: referenceImageUrl(r.file),
    alt: r.title,
    style: `width:${width}px`
  }) : el("div", {
    class: "thumb-empty ref-missing",
    style: `width:${width}px;height:${Math.round(width * 0.75)}px`
  }, "\u753B\u50CF\u304C\u3042\u308A\u307E\u305B\u3093");
  const lines = [
    made ? thumbOrBox(made, p.project.device, themeFor(p, proposal?.theme ?? p.project.theme), p.registry, p.defaults) : image,
    el("div", {
      class: "card-title"
    }, r.title)
  ];
  if (r.state === "pending") {
    lines.push(el("div", {
      class: "ref-pending"
    }, "Claude \u5F85\u3061"), el("div", {
      class: "muted"
    }, `\u2192 ${proposal?.name ?? r.proposal} \u306E ${r.screen}`));
  } else if (r.state === "created") {
    const open = el("a", {
      href: "#",
      class: "card-link"
    }, "\u958B\u304F");
    open.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      p.onOpenScreen(r.proposal, r.screen);
    });
    const original = r.fileExists ? el("a", {
      href: referenceImageUrl(r.file),
      target: "_blank",
      rel: "noopener",
      class: "card-link"
    }, "\u5143\u753B\u50CF\u3092\u898B\u308B") : null;
    original?.addEventListener("click", (e) => e.stopPropagation());
    lines.push(el("div", {}, `\u753B\u9762 ${r.screen}`), el("div", {
      class: "card-links"
    }, open, original ? " \uFF0F " : null, original));
  } else {
    lines.push(el("div", {
      class: "muted"
    }, "\u53C2\u8003\u306E\u307F"));
  }
  if (r.note) lines.push(el("div", {
    class: "muted ref-note",
    title: r.note
  }, r.note));
  const c = card(lines, made ? () => p.onPick(`ai:${r.screen}`, made.title, made.device, r.proposal) : void 0);
  c.append(el("button", {
    class: "card-del",
    title: "\u6D88\u3059",
    onclick: (e) => {
      e.stopPropagation();
      p.onDeleteReference(r.id);
    }
  }, "\xD7"));
  return c;
}
function renderImportForm(p, f) {
  const text18 = (value, placeholder, key) => {
    const input = el("input", {
      type: "text",
      value,
      placeholder
    });
    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
      p.onImportChange({
        [key]: input.value,
        error: void 0
      });
    });
    return input;
  };
  const ask = el("input", {
    type: "checkbox",
    ...f.ask ? {
      checked: true
    } : {}
  });
  ask.addEventListener("change", () => p.onImportChange({
    ask: ask.checked
  }));
  const proposalSel = el("select", {}, ...p.proposals.map((pr) => el("option", {
    value: pr.id,
    ...pr.id === f.proposalId ? {
      selected: true
    } : {}
  }, pr.name)));
  proposalSel.addEventListener("change", () => p.onImportChange({
    proposalId: proposalSel.value
  }));
  const screenId = text18(f.screenId, "import-1", "screenId");
  if (f.error) screenId.classList.add("is-invalid");
  return el("div", {
    class: "import-form"
  }, el("div", {
    class: "form-title"
  }, `${f.fileName} \u3092\u53C2\u8003\u753B\u50CF\u3068\u3057\u3066\u767B\u9332`), el("div", {
    class: "import-body"
  }, el("img", {
    class: "import-preview",
    src: f.previewUrl,
    alt: f.fileName
  }), el("div", {
    class: "import-fields"
  }, el("div", {
    class: "import-pair"
  }, el("label", {}, "\u540D\u524D", text18(f.name, f.fileName, "name")), el("label", {}, "\u4E00\u8A00(\u7A7A\u3067\u3082\u3088\u3044)", text18(f.note, "\u91D1\u984D\u6B04\u306F\u3046\u3061\u306E\u9805\u76EE\u540D\u306B\u7F6E\u304D\u63DB\u3048\u3066", "note"))), el("label", {
    class: "import-check"
  }, ask, "Claude \u306B\u753B\u9762\u3092\u4F5C\u3063\u3066\u3082\u3089\u3046"), el("div", {
    class: "import-row"
  }, f.ask ? el("div", {
    class: "import-target"
  }, el("label", {}, "\u6848", proposalSel), el("label", {}, "\u753B\u9762 ID", screenId), el("label", {}, "\u984C", text18(f.screenTitle, f.name, "screenTitle"))) : null, el("div", {
    class: "form-actions"
  }, el("button", {
    class: "btn btn-primary",
    onclick: p.onImport
  }, "\u767B\u9332"), el("button", {
    class: "btn",
    onclick: p.onCancelImport
  }, "\u3084\u3081\u308B"))), f.error ? el("div", {
    class: "form-error"
  }, f.error) : null)));
}
function renderForm(p, f) {
  const projectSize = deviceSize(p.project.device);
  const srcSize = deviceSize(f.fromDevice ?? p.project.device);
  const differs = srcSize.w !== projectSize.w || srcSize.h !== projectSize.h;
  const proposalSel = el("select", {}, ...p.proposals.map((pr) => el("option", {
    value: pr.id,
    ...pr.id === f.proposalId ? {
      selected: true
    } : {}
  }, pr.name)));
  proposalSel.addEventListener("change", () => p.onFormChange({
    proposalId: proposalSel.value
  }));
  if (f.lockProposal) proposalSel.setAttribute("disabled", "");
  const idInput = el("input", {
    type: "text",
    value: f.id,
    class: f.error ? "is-invalid" : ""
  });
  idInput.addEventListener("input", () => {
    idInput.classList.remove("is-invalid");
    p.onFormChange({
      id: idInput.value,
      error: void 0
    });
  });
  const titleInput = el("input", {
    type: "text",
    value: f.title
  });
  titleInput.addEventListener("input", () => p.onFormChange({
    title: titleInput.value
  }));
  return el("div", {
    class: "create-form"
  }, el("div", {
    class: "form-title"
  }, `\u300C${f.fromTitle}\u300D\u304B\u3089\u65B0\u3057\u3044\u753B\u9762\u3092\u4F5C\u308B`), el("label", {}, "\u6848", proposalSel), el("label", {}, "ID", idInput), f.error ? el("div", {
    class: "form-error"
  }, f.error) : null, el("label", {}, "\u984C", titleInput), differs ? el("div", {
    class: "muted"
  }, `\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306F ${projectSize.w}x${projectSize.h}\u3001\u3053\u306E\u3072\u306A\u5F62\u306F ${srcSize.w}x${srcSize.h}\u3002\u753B\u9762\u306F\u3072\u306A\u5F62\u306E\u5927\u304D\u3055\u3067\u4F5C\u3089\u308C\u307E\u3059`) : null, el("div", {
    class: "form-actions"
  }, el("button", {
    class: "btn btn-primary",
    onclick: p.onCreate
  }, "\u4F5C\u308B"), el("button", {
    class: "btn",
    onclick: p.onCancelForm
  }, "\u3084\u3081\u308B")));
}

// src/editor/panels/elements.ts
function hovering(p, what, add) {
  return {
    onclick: () => {
      p.onHover(what, void 0, true);
      add();
    },
    onmouseenter: (e) => p.onHover(what, e.currentTarget),
    onmouseleave: () => p.onHover(what, void 0)
  };
}
function elementTypes(registry2, components) {
  const types = [
    ...registry2.keys()
  ].filter((t) => t !== GROUP_TYPE2);
  if (components.some((c) => c.type === GROUP_TYPE2)) types.push(GROUP_TYPE2);
  return types;
}
function presetRow(p, entry) {
  const broken = entry.component === void 0;
  const row = el("div", {
    class: "tree-row tree-leaf" + (broken ? " is-broken" : ""),
    style: `padding-left:${8 + LAYOUT.treeIndent}px`,
    "data-guide": guideTag.elementsMyset(entry.type, entry.name),
    // No title on a row that adds: the sample beside it says what it is (PR-17).
    ...broken ? {
      title: (entry.error ?? "\u8AAD\u3081\u307E\u305B\u3093").split("\n")[0]
    } : {
      ...hovering(p, {
        entry
      }, () => p.onAddPreset(entry)),
      oncontextmenu: (e) => {
        e.preventDefault();
        p.onHover({
          entry
        }, void 0, true);
        p.onMenuPreset(entry, {
          x: e.clientX,
          y: e.clientY
        });
      }
    }
  }, el("span", {
    class: "tree-toggle is-empty"
  }), el("span", {
    class: "tree-label"
  }, broken ? `\u8AAD\u3081\u307E\u305B\u3093: ${entry.name}` : entry.name));
  row.append(el("button", {
    class: "tree-del",
    title: "\u6D88\u3059",
    onclick: (e) => {
      e.stopPropagation();
      p.onDeletePreset(entry);
    }
  }, "\xD7"));
  return row;
}
function renderElements(container, p) {
  clear(container);
  for (const type of elementTypes(p.registry, p.components)) {
    const spec25 = p.registry.get(type);
    const open = p.expanded.has(type);
    container.append(el("div", {
      class: "tree-row",
      style: "padding-left:8px",
      "data-guide": guideTag.elementsType(type),
      title: spec25?.label ?? "\u8907\u6570\u306E\u90E8\u54C1\u306E\u307E\u3068\u307E\u308A",
      onclick: () => p.onToggle(type)
    }, el("span", {
      class: "tree-toggle"
    }, open ? OPEN : CLOSED), el("span", {
      class: "tree-label"
    }, type)));
    if (!open) continue;
    if (spec25 && type !== GROUP_TYPE2) {
      container.append(el("div", {
        class: "tree-row tree-leaf",
        style: `padding-left:${8 + LAYOUT.treeIndent}px`,
        "data-guide": guideTag.elementsDefault(type),
        ...hovering(p, {
          type
        }, () => p.onAdd(type)),
        oncontextmenu: (e) => {
          e.preventDefault();
          p.onHover({
            type
          }, void 0, true);
          p.onMenuDefault(type, {
            x: e.clientX,
            y: e.clientY
          });
        }
      }, el("span", {
        class: "tree-toggle is-empty"
      }), el("span", {
        class: "tree-label"
      }, "Default")));
      if (p.defaults[type] !== void 0) {
        container.append(el("div", {
          class: "tree-row tree-leaf tree-hint",
          style: `padding-left:${8 + LAYOUT.treeIndent}px`
        }, el("span", {
          class: "tree-toggle is-empty"
        }), el("span", {
          class: "tree-label muted"
        }, "(\u53F3\u30AF\u30EA\u30C3\u30AF \u2192 \u76F4\u3059)")));
      }
    }
    for (const entry of p.components) {
      if (entry.type === type) container.append(presetRow(p, entry));
    }
  }
}
function renderDynamic(container, p) {
  clear(container);
  for (const item of p.stated) {
    container.append(el("div", {
      class: "tree-row tree-leaf",
      style: "padding-left:8px",
      // No title: the sample beside the row says what it is (PR-13).
      "data-stated": item.id,
      "data-guide": guideTag.dynamic(item.id),
      onclick: () => {
        p.onHover(item.id, void 0, true);
        p.onAddStated(item.id);
      },
      onmouseenter: (e) => p.onHover(item.id, e.currentTarget),
      onmouseleave: () => p.onHover(item.id, void 0)
    }, el("span", {
      class: "tree-toggle is-empty"
    }), el("span", {
      class: "tree-label"
    }, item.label)));
  }
}

// src/editor/myset.ts
function linkedOf(el2, screen, components, registry2) {
  if (el2.set === void 0) return void 0;
  const entry = components.find((c) => c.type === el2.type && c.name === el2.set && c.component);
  if (!entry?.component) return {
    name: el2.set,
    diff: {
      own: [],
      shape: true
    }
  };
  const box7 = inLayout(screen.elements, el2.id);
  const filled = filledPreset(entry.component, frameOf(screen, el2.id), registry2, box7 ? layoutOf(box7) : void 0);
  return {
    name: el2.set,
    entry,
    filled,
    diff: setDiff(el2, filled)
  };
}
function itemLabel(item) {
  const child = /^\[(\d+)\]\.(.+)$/.exec(item);
  if (child) return `\u4E2D\u8EAB ${Number(child[1]) + 1} \u306E ${itemLabel(child[2])}`;
  return item.replace(/^(props|style)\./, "");
}
function diffText(diff) {
  const head = diff.own.length ? `\u3053\u306E\u90E8\u54C1\u3060\u3051\u306E\u5909\u66F4: ${diff.own.length} \u3064(${diff.own.map(itemLabel).join("\u3001")})` : "MySet \u3068\u540C\u3058";
  return diff.shape ? head : `${head}\u3002\u4E2D\u8EAB\u306E\u5F62\u304C MySet \u3068\u9055\u3046`;
}
var where = (c, folders) => folders ? `${c.screens} \u753B\u9762\u30FB${c.proposals} \u6848` : `${c.screens} \u753B\u9762`;
function countsText(c, folders) {
  const base = `\u3064\u306A\u304C\u308A\u306E\u3042\u308B\u90E8\u54C1 ${c.parts} \u500B(${where(c, folders)})\u304C\u5BFE\u8C61\u3067\u3059\u3002\u90E8\u54C1\u3054\u3068\u306B\u5909\u3048\u3066\u3042\u308B\u9805\u76EE\u306F\u305D\u306E\u307E\u307E\u3067\u3059`;
  return c.mismatched ? `${base}\u3002\u3046\u3061 ${c.mismatched} \u500B\u306F\u4E2D\u8EAB\u306E\u5F62\u304C\u9055\u3046\u306E\u3067\u4E2D\u8EAB\u306F\u305D\u306E\u307E\u307E\u3067\u3059` : base;
}
function pushConfirmText(partLabel2, diff, name, c, folders) {
  return `\u300C${partLabel2}\u300D\u306E\u5909\u66F4(${diff.own.map(itemLabel).join("\u3001")})\u3092 MySet\u300C${name}\u300D\u306B\u53CD\u6620\u3057\u307E\u3059\u3002${countsText(c, folders)}`;
}
function overwriteConfirmText(name, c, folders) {
  return `MySet\u300C${name}\u300D\u3092\u3053\u306E\u90E8\u54C1\u306E\u5F62\u3067\u4E0A\u66F8\u304D\u3057\u307E\u3059\u3002${countsText(c, folders)}`;
}
function applyConfirmText(name, c, folders) {
  return `MySet\u300C${name}\u300D\u306E\u5909\u66F4\u3092\u53CD\u6620\u3057\u307E\u3059\u3002${countsText(c, folders)}`;
}
function deleteConfirmText(name, parts) {
  return parts === void 0 ? `MySet\u300C${name}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002\u3064\u306A\u304C\u308A\u306E\u3042\u308B\u90E8\u54C1\u306F\u6B8B\u308A\u3001\u3064\u306A\u304C\u308A\u3060\u3051\u5916\u308C\u307E\u3059` : `MySet\u300C${name}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002\u3064\u306A\u304C\u308A\u306E\u3042\u308B ${parts} \u500B\u306E\u90E8\u54C1\u306F\u6B8B\u308A\u3001\u3064\u306A\u304C\u308A\u3060\u3051\u5916\u308C\u307E\u3059`;
}
var withFailed = (head, failed) => failed.length ? `${head}\u3002${failed.length} \u753B\u9762\u306B\u66F8\u3051\u307E\u305B\u3093\u3067\u3057\u305F: ${failed.join(" ")}` : head;
function appliedBanner(name, parts, failed) {
  return withFailed(`MySet\u300C${name}\u300D\u306B\u53CD\u6620\u3057\u307E\u3057\u305F(${parts} \u500B\u306E\u90E8\u54C1)`, failed);
}
var defaultTarget2 = (type, c, folders) => `\u3064\u306A\u304C\u308A\u306E\u7121\u3044 ${type} ${c.parts} \u500B(${where(c, folders)})\u304C\u5BFE\u8C61\u3067\u3059\u3002\u90E8\u54C1\u3054\u3068\u306B\u5909\u3048\u3066\u3042\u308B\u9805\u76EE\u306F\u305D\u306E\u307E\u307E\u3067\u3059`;
function defaultApplyConfirmText(type, c, folders) {
  return `${type} \u306E Default \u306E\u5909\u66F4\u3092\u53CD\u6620\u3057\u307E\u3059\u3002${defaultTarget2(type, c, folders)}`;
}
function defaultResetConfirmText(type, c, folders) {
  return `${type} \u306E Default \u3092\u6D88\u3057\u3001\u7A2E\u985E\u306E\u5143\u306E\u5F62\u306B\u623B\u3057\u307E\u3059\u3002${defaultTarget2(type, c, folders)}`;
}
function defaultAppliedBanner(type, parts, failed) {
  return withFailed(`${type} \u306E Default \u3092\u53CD\u6620\u3057\u307E\u3057\u305F(${parts} \u500B\u306E\u90E8\u54C1)`, failed);
}
function defaultResetBanner(type, parts, failed) {
  return withFailed(`${type} \u306E Default \u3092\u6D88\u3057\u307E\u3057\u305F(${parts} \u500B\u306E\u90E8\u54C1)`, failed);
}
var VIA_DOING = {
  set: "\u53CD\u6620",
  "set-rename": "\u540D\u524D\u306E\u5909\u66F4",
  "set-delete": "\u524A\u9664"
};
function updatedBanner(via) {
  if (!via) return "Claude \u304C\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002";
  if (via.kind === "default") return `${via.name} \u306E Default \u306E\u53CD\u6620\u3067\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F`;
  return `MySet\u300C${via.name}\u300D\u306E${VIA_DOING[via.kind]}\u3067\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F`;
}

// src/editor/panels/props.ts
function invalidFields(errors, elementId) {
  const set = /* @__PURE__ */ new Set();
  const prefix = `${elementId}.`;
  for (const e of errors ?? []) {
    if (e.path.startsWith(prefix)) set.add(e.path.slice(prefix.length));
  }
  return set;
}
function markInvalid(node, invalid) {
  if (invalid && node instanceof HTMLElement) node.classList.add("is-invalid");
  return node;
}
function markOf(handlers, item, control) {
  const ui = handlers.myset;
  if (!ui || !ui.linked.filled) return control;
  if (ui.linked.diff.own.includes(item)) {
    const x = el("span", {
      class: "mark-x",
      title: "MySet \u306E\u5024\u306B\u623B\u3059",
      onclick: () => ui.onReset(item)
    }, "\xD7");
    return el("span", {
      class: "field-with-mark"
    }, control, el("span", {
      class: "field-mark is-own"
    }, "\u3053\u306E\u90E8\u54C1\u3060\u3051", x));
  }
  if (control instanceof HTMLElement) control.classList.add("from-set");
  return el("span", {
    class: "field-with-mark"
  }, control, el("span", {
    class: "field-mark"
  }, "MySet"));
}
var COLOR_CHOICES = [
  "$bg",
  "$surface",
  "$primary",
  "$onPrimary",
  "$text",
  "$muted",
  "$border",
  "none"
];
function field(label, control) {
  return el("div", {
    class: "field"
  }, el("label", {}, label), control);
}
function labelWithNote(name, note) {
  const label = document.createDocumentFragment();
  label.append(name, document.createElement("br"), note);
  return label;
}
function pair(a, b) {
  return el("div", {
    class: "pair"
  }, a, b);
}
function onChange(input, fn) {
  input.addEventListener("change", () => {
    const ok = fn(input.value);
    input.classList.toggle("is-invalid", ok === false);
  });
}
function numberInput(value, apply, min, decimal) {
  const input = el("input", {
    type: "number",
    value: String(value),
    step: decimal ? "any" : "1",
    ...min !== void 0 ? {
      min: String(min)
    } : {}
  });
  onChange(input, (v) => {
    const n = Number(v);
    if (!(decimal ? Number.isFinite(n) : Number.isInteger(n)) || min !== void 0 && n < min) {
      return false;
    }
    apply(n);
  });
  return input;
}
function textInput(value, apply, multiline = false) {
  const input = multiline ? el("textarea", {
    rows: "3"
  }) : el("input", {
    type: "text"
  });
  input.value = value;
  onChange(input, (v) => apply(v));
  return input;
}
function withPlaceholder(input, text18) {
  input.setAttribute("placeholder", text18);
  return input;
}
function selectInput(options, value, apply) {
  const sel = el("select", {}, ...options.map((o) => el("option", {
    value: o.value,
    ...o.value === value ? {
      selected: true
    } : {}
  }, o.label ?? o.value)));
  onChange(sel, (v) => apply(v));
  return sel;
}
function groupedSelect(groups, value, apply) {
  const option3 = (o) => el("option", {
    value: o.value,
    ...o.value === value ? {
      selected: true
    } : {}
  }, o.label);
  const sel = el("select", {}, ...groups.flatMap((g) => g.label === void 0 ? g.options.map(option3) : g.options.length ? [
    el("optgroup", {
      label: g.label
    }, ...g.options.map(option3))
  ] : []));
  onChange(sel, (v) => apply(v));
  return sel;
}
function fromSelect(e, elements, kept, apply) {
  const here = flatten(elements).filter((l) => valueKind(l.el) !== void 0 && l.el.id !== e.id).map((l) => ({
    value: refKey({
      part: l.el.id
    }),
    label: partLabel(l.el)
  }));
  const there = kept.map((k) => ({
    value: refKey({
      screen: k.screen,
      part: k.part
    }),
    label: `${k.title} \u203A ${partLabel(k.el)}`
  }));
  const current = e.from ? refKey(e.from) : "";
  const known = current === "" || [
    ...here,
    ...there
  ].some((o) => o.value === current);
  const stray = known || !e.from ? [] : [
    {
      value: current,
      label: e.from.screen ? `${e.from.screen} \u203A ${e.from.part}` : e.from.part
    }
  ];
  return groupedSelect([
    {
      options: [
        {
          value: "",
          label: "\u306A\u3057"
        },
        ...stray
      ]
    },
    {
      label: "\u3053\u306E\u753B\u9762",
      options: here
    },
    {
      label: "\u4ED6\u306E\u753B\u9762",
      options: there
    }
  ], current, apply);
}
function colorDatalist() {
  return el("datalist", {
    id: "wf-colors"
  }, ...COLOR_CHOICES.map((c) => el("option", {
    value: c
  })));
}
function stringListEditor(spec25, value) {
  const items = Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
  const cut = (text18, at) => text18.split(at).map((s) => s.trim()).filter(Boolean);
  if (spec25.lines) {
    return {
      multiline: true,
      text: items.join("\n"),
      placeholder: "1 \u884C\u306B 1 \u3064",
      // As many lines as there are items, 3 to 8.
      rows: Math.min(8, Math.max(3, items.length)),
      parse: (text18) => cut(text18, /\r?\n/)
    };
  }
  return {
    multiline: false,
    text: items.join(", "),
    placeholder: "\u30AB\u30F3\u30DE\u533A\u5207\u308A",
    rows: 1,
    parse: (text18) => cut(text18, ",")
  };
}
function propInput(spec25, value, apply) {
  switch (spec25.kind) {
    case "boolean": {
      const box7 = el("input", {
        type: "checkbox",
        ...value === true ? {
          checked: true
        } : {}
      });
      box7.addEventListener("change", () => apply(box7.checked));
      return spec25.check ? el("label", {
        class: "prop-check"
      }, box7, " " + spec25.check) : box7;
    }
    case "number":
      return numberInput(typeof value === "number" ? value : spec25.default, apply, spec25.min, spec25.decimal === true);
    case "string":
      if (spec25.oneOf) {
        return selectInput(spec25.oneOf.map((v) => ({
          value: v
        })), String(value ?? spec25.default), apply);
      }
      return textInput(String(value ?? spec25.default), apply);
    case "string[]": {
      const ed = stringListEditor(spec25, value);
      const input = textInput(ed.text, (v) => apply(ed.parse(v)), ed.multiline);
      input.setAttribute("placeholder", ed.placeholder);
      if (ed.multiline) input.setAttribute("rows", String(ed.rows));
      return input;
    }
    case "rows":
      return el("span", {
        class: "muted"
      }, "(\u884C\u306E\u8868)");
  }
}
function styleInput(key, value, apply) {
  const current = value === void 0 ? "" : String(value);
  switch (key) {
    case "fill":
    case "color":
    case "border": {
      const input = el("input", {
        type: "text",
        list: "wf-colors",
        value: current,
        placeholder: "$primary / #RRGGBB / none"
      });
      onChange(input, (v) => {
        if (v === "") return apply(void 0);
        if (!(COLOR_CHOICES.includes(v) || /^#[0-9A-Fa-f]{6}$/.test(v))) return false;
        apply(v);
      });
      return input;
    }
    case "radius":
    case "size": {
      const input = el("input", {
        type: "text",
        value: current,
        placeholder: "sm / md / lg / \u6570\u5024"
      });
      onChange(input, (v) => {
        if (v === "") return apply(void 0);
        if (SIZE_TOKENS.includes(v)) return apply(v);
        const n = Number(v);
        if (!Number.isInteger(n) || n < 0) return false;
        apply(n);
      });
      return input;
    }
    case "weight":
      return selectInput([
        {
          value: "",
          label: "(\u30C6\u30FC\u30DE\u901A\u308A)"
        },
        {
          value: "normal"
        },
        {
          value: "bold"
        }
      ], current, (v) => apply(v === "" ? void 0 : v));
    case "align":
      return selectInput([
        {
          value: "",
          label: "(\u30C6\u30FC\u30DE\u901A\u308A)"
        },
        {
          value: "left"
        },
        {
          value: "center"
        },
        {
          value: "right"
        }
      ], current, (v) => apply(v === "" ? void 0 : v));
    case "opacity": {
      const input = el("input", {
        type: "number",
        min: "0",
        max: "1",
        step: "0.1",
        value: current
      });
      onChange(input, (v) => {
        if (v === "") return apply(void 0);
        const n = Number(v);
        if (Number.isNaN(n) || n < 0 || n > 1) return false;
        apply(n);
      });
      return input;
    }
  }
}
function renderScreenProps(container, state, registry2, handlers) {
  const d = state.doc.screen.device;
  const name = typeof d === "string" ? d : "custom";
  container.append(el("div", {
    class: "muted"
  }, "\u753B\u9762\u306E\u8A2D\u5B9A(Root)"), field("\u984C", tagged(textInput(state.doc.screen.title, (v) => handlers.edit((s) => setTitle(s, v))), guideTag.props("title"))), field("\u7AEF\u672B\u67A0", tagged(selectInput([
    ...Object.keys(DEVICES).map((v) => ({
      value: v
    })),
    {
      value: "custom",
      label: "\u76F4\u66F8\u304D(w \xD7 h)"
    }
  ], name, (v) => {
    if (v === "custom") handlers.edit((s) => setDevice(s, deviceSize(s.doc.screen.device)));
    else handlers.edit((s) => setDevice(s, v));
  }), guideTag.props("device"))));
  if (typeof d !== "string") {
    container.append(field("w / h", pair(numberInput(d.w, (v) => handlers.edit((s) => setDevice(s, {
      w: v,
      h: s.doc.screen.device.h
    })), 1), numberInput(d.h, (v) => handlers.edit((s) => setDevice(s, {
      w: s.doc.screen.device.w,
      h: v
    })), 1))));
  }
  container.append(el("div", {
    class: "muted"
  }, state.doc.deviceExplicit ? "\u3053\u306E\u753B\u9762\u3067\u7AEF\u672B\u67A0\u3092\u6307\u5B9A\u3057\u3066\u3044\u307E\u3059" : "\u7AEF\u672B\u67A0\u306F project.json \u306E\u65E2\u5B9A\u5024\u3067\u3059"));
  container.append(animationSection(state, void 0, handlers, registry2));
  if (handlers.onSaveTemplate) {
    container.append(el("button", {
      class: "btn btn-block",
      onclick: handlers.onSaveTemplate
    }, "Save"), el("div", {
      class: "muted"
    }, "\u4ECA\u306E\u753B\u9762\u3092 Custom \u306E\u3072\u306A\u5F62\u3068\u3057\u3066\u4FDD\u5B58"));
  }
  if (handlers.onDeleteScreen) {
    container.append(el("button", {
      class: "btn btn-block btn-danger",
      onclick: handlers.onDeleteScreen
    }, "\u3053\u306E\u753B\u9762\u3092\u524A\u9664"));
  }
}
function renderProps(container, state, registry2, handlers) {
  clear(container);
  container.appendChild(colorDatalist());
  const els = selectedElements(state);
  if (els.length === 0) return renderScreenProps(container, state, registry2, handlers);
  if (els.length > 1) {
    container.appendChild(el("div", {
      class: "muted"
    }, `${els.length} \u500B\u3092\u9078\u629E\u4E2D(\u307E\u3068\u3081\u3066\u52D5\u304B\u305B\u307E\u3059)`));
    appendSavePreset(container, handlers, `\u9078\u3093\u3060 ${els.length} \u500B\u3092 1 \u3064\u306E MySet(group)\u3068\u3057\u3066\u767B\u9332`);
    return;
  }
  const e = els[0];
  const spec25 = registry2.get(e.type);
  const invalid = invalidFields(handlers.errors, e.id);
  const isGroup = e.type === GROUP_TYPE2;
  const locked = e.locked === true;
  const frozen = (input, yes) => {
    if (yes) input.disabled = true;
    return input;
  };
  const rectOf2 = (s) => {
    const cur = findById(s.doc.screen.elements, e.id)?.el ?? e;
    return {
      x: cur.x,
      y: cur.y,
      w: cur.w,
      h: cur.h
    };
  };
  const at = framePosition(state, e.id) ?? {
    x: e.x,
    y: e.y
  };
  container.append(...handlers.myset ? [] : [
    el("div", {
      class: "muted"
    }, `${e.type}  ${partLabel(e)}${locked ? "(\u30ED\u30C3\u30AF\u4E2D)" : ""}`)
  ]);
  const ui = handlers.myset;
  const setBox = () => {
    if (!ui) return [];
    const { linked } = ui;
    const head = el("div", {
      class: "set-head"
    }, el("span", {
      class: "set-name"
    }, linked.name + (locked ? "(\u30ED\u30C3\u30AF\u4E2D)" : "")), el("span", {
      class: "set-type"
    }, `Type: ${e.type}`));
    if (!linked.filled) {
      return [
        el("div", {
          class: "set-box"
        }, head, el("div", {
          class: "muted"
        }, `MySet\u300C${linked.name}\u300D\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`), el("button", {
          class: "btn btn-ghost set-detach",
          onclick: ui.onDetach
        }, "\u5207\u308A\u96E2\u3059"))
      ];
    }
    const push = el("button", {
      class: "btn btn-primary",
      onclick: ui.onPush
    }, "MySet \u306B\u53CD\u6620");
    if (linked.diff.own.length === 0) push.disabled = true;
    return [
      el("div", {
        class: "set-box"
      }, head, el("div", {
        class: "set-actions"
      }, push, el("button", {
        class: "btn",
        onclick: ui.onEdit
      }, "MySet \u3092\u76F4\u3059")), el("button", {
        class: "btn btn-ghost set-detach",
        onclick: ui.onDetach
      }, "MySet \u304B\u3089\u5207\u308A\u96E2\u3059")),
      el("div", {
        class: "muted set-diff"
      }, diffText(linked.diff))
    ];
  };
  const noSize = locked || isGroup;
  container.append(field("\u540D\u524D", markInvalid(withPlaceholder(tagged(textInput(e.name ?? "", (v) => handlers.edit((s) => setName(s, e.id, v))), guideTag.props("name")), "(Select \u306B\u51FA\u3059\u547C\u3073\u540D\u3002\u7A7A\u3067\u3082\u3088\u3044)"), invalid.has("name"))));
  container.append(el("div", {
    class: "muted id-line"
  }, `id: ${e.id}`));
  if (!isGroup) {
    container.append(field("text", markOf(handlers, "text", markInvalid(tagged(textInput(e.text ?? "", (v) => handlers.edit((s) => setText(s, e.id, v)), e.props.multiline === true), guideTag.props("text")), invalid.has("text")))));
    if (isMirrorType(e.type)) {
      const badFrom = [
        ...invalid
      ].some((k) => k === "from" || k.startsWith("from."));
      container.append(field("\u6587\u5B57\u306E\u5143", markInvalid(frozen(fromSelect(e, state.doc.screen.elements, handlers.kept ?? [], (v) => handlers.edit((s) => setFrom(s, e.id, v === "" ? void 0 : parseRefKey(v)))), locked), badFrom)));
    }
    if (spec25?.variants) {
      const variants = spec25.variants;
      container.append(field("variant", markOf(handlers, "variant", markInvalid(tagged(selectInput(variants.map((v) => ({
        value: v
      })), e.variant ?? variants[0], (v) => handlers.edit((s) => setVariant(s, e.id, v))), guideTag.props("variant")), invalid.has("variant")))));
    }
  }
  const L = layoutOf(e);
  const sized = (axis, control) => {
    const filled = handlers.myset?.linked.filled;
    if (filled && followsAxis(e, axis) && !handlers.myset.linked.diff.own.includes(axis)) {
      if (control instanceof HTMLElement) control.classList.add("from-set");
    }
    return control;
  };
  const geoMark = (control, axes) => {
    const ui2 = handlers.myset;
    if (!ui2?.linked.filled) return control;
    const own = axes.filter((a) => followsAxis(e, a) && ui2.linked.diff.own.includes(a));
    if (own.length === 0) return control;
    return el("span", {
      class: "field-with-mark"
    }, control, ...own.map((a) => el("span", {
      class: "field-mark is-own"
    }, locked ? a : `${a} `, ...locked ? [] : [
      el("span", {
        class: "mark-x",
        title: "MySet \u306E\u5024\u306B\u623B\u3059",
        onclick: () => ui2.onReset(a)
      }, "\xD7")
    ])));
  };
  if (spec25?.allowsChildren) {
    container.append(el("div", {
      class: "sub-title"
    }, "\u4E26\u3079\u65B9"));
    const chips2 = (options, current, apply, disabled = false, key = "dir") => el("div", {
      class: "chips",
      "data-guide": guideTag.props(`layout.${key}`)
    }, ...options.map((o) => el("button", {
      type: "button",
      class: "chip-btn" + (o.value === current ? " is-on" : ""),
      ...disabled || locked ? {
        disabled: true
      } : {},
      onclick: () => apply(o.value)
    }, o.label)));
    container.append(markOf(handlers, "layout", chips2([
      {
        value: "none",
        label: "\u81EA\u7531"
      },
      {
        value: "column",
        label: "\u7E26 \u2193"
      },
      {
        value: "row",
        label: "\u6A2A \u2192"
      }
    ], L?.dir ?? "none", (v) => {
      const dropped = !L && v !== "none" ? positionRowsInside(written2(state.doc), e.id) : 0;
      handlers.edit((s) => setLayout(s, e.id, v));
      if (dropped > 0) {
        handlers.notice?.(positionRowsNotice(e));
      }
    })));
    if (L) {
      const padText = L.pad[0] === L.pad[1] ? String(L.pad[0]) : `${L.pad[0]} ${L.pad[1]}`;
      const padInput = tagged(el("input", {
        type: "text",
        value: padText
      }), guideTag.props("layout.pad"));
      onChange(padInput, (v) => {
        const nums = v.trim() === "" ? [] : v.trim().split(/\s+/).map(Number);
        if (nums.length < 1 || nums.length > 2 || nums.some((n) => !Number.isInteger(n) || n < 0)) {
          padInput.value = padText;
          return false;
        }
        const pad = nums.length === 1 ? nums[0] : [
          nums[0],
          nums[1]
        ];
        handlers.edit((s) => setLayoutDetail(s, e.id, {
          pad: pad === 0 ? void 0 : pad
        }));
      });
      container.append(field("\u9593\u9694 / \u4F59\u767D", pair(frozen(tagged(numberInput(L.gap, (v) => handlers.edit((s) => setLayoutDetail(s, e.id, {
        gap: v === 8 ? void 0 : v
      })), 0), guideTag.props("layout.gap")), locked), frozen(padInput, locked))));
      const alignWords = L.dir === "column" ? [
        "\u5DE6",
        "\u4E2D\u592E",
        "\u53F3",
        "\u5168\u5E45"
      ] : [
        "\u4E0A",
        "\u4E2D\u592E",
        "\u4E0B",
        "\u5168\u9AD8"
      ];
      container.append(field("\u63C3\u3048", chips2(LAYOUT_ALIGNS.map((a, i) => ({
        value: a,
        label: alignWords[i]
      })), L.align, (v) => handlers.edit((s) => setLayoutDetail(s, e.id, {
        align: v === "start" ? void 0 : v
      })), false, "align")));
      const fitMain = e.sizing?.[mainAxis(L.dir)] === "fit";
      container.append(field("\u8A70\u3081\u65B9", chips2(LAYOUT_JUSTIFIES.map((j, i) => ({
        value: j,
        label: [
          "\u524D",
          "\u4E2D\u592E",
          "\u5F8C\u308D",
          "\u4E21\u7AEF"
        ][i]
      })), L.justify, (v) => handlers.edit((s) => setLayoutDetail(s, e.id, {
        justify: v === "start" ? void 0 : v
      })), fitMain, "justify")));
    }
  }
  const box7 = inLayout(state.doc.screen.elements, e.id);
  if (box7) {
    const order = (box7.children ?? []).findIndex((c) => c.id === e.id) + 1;
    container.append(el("div", {
      class: "muted"
    }, `\u4E26\u3073: ${treeLabel(box7, false)} \u306E ${order} \u756A\u76EE(\u30C9\u30E9\u30C3\u30B0\u3067\u5165\u308C\u66FF\u3048)`));
    const BL = layoutOf(box7);
    const sizeField = (axis) => {
      const mode = e.sizing?.[axis];
      const stretched = axis === crossAxis(BL.dir) && BL.align === "stretch";
      const shown2 = stretched ? "fill" : mode ?? "fixed";
      const select2 = selectInput([
        {
          value: "fixed",
          label: "\u6C7A\u3081\u6253\u3061"
        },
        {
          value: "fit",
          label: "\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u308B"
        },
        {
          value: "fill",
          label: "\u3044\u3063\u3071\u3044"
        }
      ], shown2, (v) => handlers.edit((s) => setSizing(s, e.id, axis, v === "fixed" ? e[axis] : v)));
      if (!canFit(e)) {
        select2.querySelector('option[value="fit"]').disabled = true;
      }
      if (isGroup) {
        select2.querySelector('option[value="fixed"]').disabled = true;
      }
      markInvalid(frozen(select2, locked || stretched), invalid.has(axis));
      if (shown2 !== "fixed") return tagged(select2, guideTag.props(axis));
      const number = tagged(numberInput(e[axis], (v) => handlers.edit((s) => setSizing(s, e.id, axis, v)), 1), guideTag.props(axis));
      const both = pair(select2, markInvalid(frozen(number, locked || isGroup), invalid.has(axis)));
      return stretched ? both : geoMark(sized(axis, both), [
        axis
      ]);
    };
    container.append(field("\u5E45", sizeField("w")), field("\u9AD8\u3055", sizeField("h")));
  } else {
    const xy = pair(frozen(markInvalid(tagged(numberInput(at.x, (v) => handlers.edit((s) => setFramePosition(s, e.id, {
      x: v
    }))), guideTag.props("x")), invalid.has("x")), locked), frozen(markInvalid(tagged(numberInput(at.y, (v) => handlers.edit((s) => setFramePosition(s, e.id, {
      y: v
    }))), guideTag.props("y")), invalid.has("y")), locked));
    if (L) {
      const main = mainAxis(L.dir);
      const scrolls = scrollAxis(e);
      const sizeInput = (axis) => {
        const fit = e.sizing?.[axis] === "fit";
        const input = tagged(el("input", {
          type: "number",
          value: fit ? "" : String(e[axis]),
          placeholder: fit ? String(e[axis]) : "",
          step: "1",
          min: "1"
        }), guideTag.props(axis));
        onChange(input, (v) => {
          if (v.trim() === "") {
            const refused = axis !== main && !isGroup || scrolls === (axis === "h" ? "y" : "x");
            if (refused) {
              input.value = fit ? "" : String(e[axis]);
              return false;
            }
            handlers.edit((s) => setBoxSize(s, e.id, axis, "fit"));
            return;
          }
          const n = Number(v);
          if (!Number.isInteger(n) || n < 1) return false;
          handlers.edit((s) => setBoxSize(s, e.id, axis, n));
        });
        if (fit) input.classList.add("is-fit");
        const framed = frozen(markInvalid(input, invalid.has(axis)), locked);
        return sized(axis, framed);
      };
      container.append(field(e.sizing?.[main] === "fit" ? labelWithNote("x y w h", main === "h" ? "(h \u306F\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u308B\u3002\u6570\u5B57\u3067\u6C7A\u3081\u6253\u3061)" : "(w \u306F\u4E2D\u8EAB\u306B\u5408\u308F\u305B\u308B\u3002\u6570\u5B57\u3067\u6C7A\u3081\u6253\u3061)") : "x y w h", el("div", {
        class: "quad"
      }, xy, geoMark(pair(sizeInput("w"), sizeInput("h")), [
        "w",
        "h"
      ]))));
    } else {
      container.append(field(noSize || locked ? labelWithNote("x y w h", "(\u5909\u66F4\u4E0D\u53EF)") : "x y w h", el("div", {
        class: "quad"
      }, xy, geoMark(pair(sized("w", frozen(markInvalid(tagged(numberInput(e.w, (v) => handlers.edit((s) => setRect(s, e.id, {
        ...rectOf2(s),
        w: v
      })), 1), guideTag.props("w")), invalid.has("w")), noSize)), sized("h", frozen(markInvalid(tagged(numberInput(e.h, (v) => handlers.edit((s) => setRect(s, e.id, {
        ...rectOf2(s),
        h: v
      })), 1), guideTag.props("h")), invalid.has("h")), noSize))), [
        "w",
        "h"
      ]))));
    }
  }
  const lockBox = el("input", {
    type: "checkbox",
    ...e.locked === true ? {
      checked: true
    } : {}
  });
  lockBox.addEventListener("change", () => handlers.edit((s) => setLocked(s, [
    e.id
  ], lockBox.checked)));
  container.append(field("\u30ED\u30C3\u30AF", lockBox));
  if (keepable(e)) {
    const keepBox = el("input", {
      type: "checkbox",
      ...e.keep === true ? {
        checked: true
      } : {}
    });
    keepBox.addEventListener("change", () => handlers.edit((s) => setKeep(s, e.id, keepBox.checked)));
    container.append(field("\u5024\u3092\u6301\u3061\u8D8A\u3059", markInvalid(frozen(keepBox, locked), invalid.has("keep"))));
  }
  if (isGroup) {
    container.append(animationSection(state, e.id, handlers, registry2));
    appendSavePreset(container, handlers, "\u3053\u306E\u30B0\u30EB\u30FC\u30D7\u3092 MySet(group)\u3068\u3057\u3066\u767B\u9332");
    return;
  }
  if (spec25 && Object.keys(spec25.props).length) {
    container.append(el("div", {
      class: "sub-title"
    }, "props"));
    const rowed = spec25.name === "list" && hasRows(e);
    for (const [key, ps] of Object.entries(spec25.props)) {
      if (ps.kind === "rows") continue;
      const input = tagged(propInput(ps, e.props[key], (v) => {
        const h2 = e.sizing?.h ? void 0 : radioHeightAfter(e, key, v) ?? tableHeightAfter(e, key, v);
        handlers.edit((s) => h2 === void 0 ? setProp(s, e.id, key, v) : setSizing(setProp(s, e.id, key, v), e.id, "h", h2));
      }), guideTag.props(`props.${key}`));
      if (key === "rows" && rowed && input instanceof HTMLInputElement) {
        container.append(field(labelWithNote("rows", "(\u884C\u3067\u6C7A\u307E\u308B)"), frozen(input, true)));
        continue;
      }
      container.append(field(ps.label ?? key, markOf(handlers, `props.${key}`, markInvalid(input, invalid.has(`props.${key}`)))));
    }
    if (spec25.name === "list") rowsSection(container, e, handlers, invalid, locked);
  }
  container.append(el("div", {
    class: "sub-title"
  }, "style"), ...setBox());
  for (const key of STYLE_KEYS) {
    container.append(field(key, markOf(handlers, `style.${key}`, markInvalid(tagged(styleInput(key, e.style?.[key], (v) => handlers.edit((s) => setStyle(s, e.id, key, v))), guideTag.props(`style.${key}`)), invalid.has(`style.${key}`)))));
  }
  if (handlers.myset?.linked.filled) {
    container.append(el("div", {
      class: "muted own-hint"
    }, "\u8584\u3044\u5024\u306F MySet \u304B\u3089\u6765\u305F\u5024\u3002\u6253\u3061\u8FBC\u3080\u3068\u3053\u306E\u90E8\u54C1\u3060\u3051\u306E\u5024\u306B\u306A\u308A\u3001\xD7 \u3067 MySet \u306E\u5024\u306B\u623B\u308B"));
  }
  if (e.type === "rect") container.append(animationSection(state, e.id, handlers, registry2));
  else if (handlers.blocks) {
    container.append(animationSection(state, e.id, handlers, registry2, false));
  }
  appendSavePreset(container, handlers, "\u3053\u306E\u90E8\u54C1\u3092 MySet \u3068\u3057\u3066\u767B\u9332");
}
function firstInvalidRow(invalid) {
  let first;
  for (const path of invalid) {
    const m = /^props\.items\.(\d+)\./.exec(path);
    if (m) first = first === void 0 ? Number(m[1]) : Math.min(first, Number(m[1]));
  }
  return first;
}
function rowsSection(container, e, handlers, invalid, locked) {
  const rows2 = rowsOf(e);
  const change = (fn) => handlers.edit((s) => editRows(s, e.id, fn));
  const patch = (i, p) => change((rs) => patchRow(rs, i, p));
  const open = firstInvalidRow(invalid) ?? (handlers.row?.list === e.id ? handlers.row.index : void 0);
  const lock = (n) => {
    if (locked) n.disabled = true;
    return n;
  };
  const section = el("div", {
    class: "rows"
  }, el("div", {
    class: "sub-title"
  }, "\u884C"));
  let focusMe;
  rows2.forEach((row, i) => {
    const isOpen = i === open;
    const text18 = lock(markInvalid(textInput(row.text ?? "", (v) => patch(i, {
      text: v
    })), invalid.has(`props.items.${i}.text`)));
    text18.classList.add("row-text");
    text18.setAttribute("placeholder", "(\u7DDA)");
    text18.addEventListener("focus", () => {
      if (!isOpen) handlers.onFocusRow?.(e.id, i, true);
    });
    if (isOpen && handlers.row?.focusText) focusMe = text18;
    const line = el("div", {
      class: "row-line" + (isOpen ? " is-open" : "")
    }, el("span", {
      class: "row-no",
      title: "\u3053\u306E\u884C\u3092\u898B\u308B",
      onclick: () => handlers.onFocusRow?.(e.id, i)
    }, String(i + 1)), text18);
    if (!locked) {
      line.append(el("button", {
        class: "row-btn row-del",
        title: "\u3053\u306E\u884C\u3092\u524A\u9664",
        onclick: () => change((rs) => removeRow(rs, i))
      }, "\u2715"));
    }
    section.append(line);
    if (!isOpen) return;
    const choice = (field2, values) => lock(markInvalid(selectInput([
      {
        value: "",
        label: "\u4E00\u89A7\u3069\u304A\u308A"
      },
      ...values.map((v) => ({
        value: v
      }))
    ], row[field2] ?? "", (v) => patch(i, {
      [field2]: v === "" ? void 0 : v
    })), invalid.has(`props.items.${i}.${field2}`)));
    const selected = lock(el("input", {
      type: "checkbox",
      ...row.selected === true ? {
        checked: true
      } : {}
    }));
    selected.addEventListener("change", () => patch(i, {
      selected: selected.checked
    }));
    const shape = filledRows(e)[i];
    const checked = lock(el("input", {
      type: "checkbox",
      ...row.checked === true ? {
        checked: true
      } : {}
    }));
    checked.addEventListener("change", () => patch(i, {
      checked: checked.checked
    }));
    const detail = el("div", {
      class: "row-detail"
    }, field("\u526F\u6587", lock(markInvalid(textInput(row.sub ?? "", (v) => patch(i, {
      sub: v
    })), invalid.has(`props.items.${i}.sub`)))), field("\u53F3\u7AEF", lock(markInvalid(textInput(row.meta ?? "", (v) => patch(i, {
      meta: v
    })), invalid.has(`props.items.${i}.meta`)))), field("\u5148\u982D", choice("leading", LIST_LEADINGS)), field("\u672B\u5C3E", choice("trailing", LIST_TRAILINGS)), field("\u9078\u629E", markInvalid(selected, invalid.has(`props.items.${i}.selected`))), ...shape?.trailing === "toggle" ? [
      field("\u30AA\u30F3", markInvalid(checked, invalid.has(`props.items.${i}.checked`)))
    ] : []);
    if (!locked) {
      const move = (by) => el("button", {
        class: "row-btn",
        title: by < 0 ? "\u4E0A\u3078" : "\u4E0B\u3078",
        ...i + by < 0 || i + by >= rows2.length ? {
          disabled: true
        } : {},
        onclick: () => {
          change((rs) => moveRow(rs, i, by));
          handlers.onFocusRow?.(e.id, i + by);
        }
      }, by < 0 ? "\u2191" : "\u2193");
      detail.append(el("div", {
        class: "row-actions"
      }, move(-1), move(1)));
    }
    section.append(detail);
  });
  if (!locked) {
    section.append(el("button", {
      class: "btn btn-block",
      onclick: () => {
        change((rs) => addRow(rs));
        handlers.onFocusRow?.(e.id, rows2.length, true);
      }
    }, "+ \u884C"));
  }
  container.append(section);
  if (focusMe) {
    const input = focusMe;
    queueMicrotask(() => input.focus());
  }
}
function appendSavePreset(container, handlers, hint) {
  if (!handlers.onSavePreset) return;
  container.append(el("button", {
    class: "btn btn-block",
    onclick: handlers.onSavePreset
  }, "Save"), el("div", {
    class: "muted"
  }, hint));
}

// src/editor/preset-edit.ts
function beginPresetEdit(entry) {
  if (!entry.component) return void 0;
  return {
    entry,
    preset: entry.component,
    draft: structuredClone(entry.component.element)
  };
}
function setDraftItem(pe, item, value) {
  const draft = structuredClone(pe.draft);
  const bag = draft;
  const put2 = (o, k, v) => {
    if (v === void 0 || v === "") delete o[k];
    else o[k] = v;
  };
  if (item === "w" || item === "h") put2(bag, item, value);
  else if (item === "text" || item === "variant") put2(bag, item, value);
  else if (item.startsWith("props.")) {
    draft.props = {
      ...draft.props ?? {}
    };
    const was = typeof draft.h !== "number" ? void 0 : {
      type: pe.preset.type,
      props: draft.props,
      h: draft.h
    };
    const grown = was && (radioHeightAfter(was, item.slice(6), value) ?? tableHeightAfter(was, item.slice(6), value));
    put2(draft.props, item.slice(6), value);
    if (!Object.keys(draft.props).length) delete draft.props;
    if (grown !== void 0) bag.h = grown;
  } else if (item.startsWith("style.")) {
    const style = {
      ...draft.style ?? {}
    };
    put2(style, item.slice(6), value);
    if (Object.keys(style).length) draft.style = style;
    else delete draft.style;
  }
  return {
    ...pe,
    draft
  };
}
function draftDirty(pe) {
  return JSON.stringify(pe.draft) !== JSON.stringify(pe.preset.element);
}
function hasOwnFields(pe) {
  return !pe.preset.element.children?.length;
}
function editFields(pe) {
  if (hasOwnFields(pe)) return {
    own: true,
    size: true,
    style: true
  };
  const rect2 = pe.preset.element.type === "rect";
  return {
    own: false,
    size: rect2,
    style: rect2
  };
}
function draftFilled(pe, registry2, device = {
  w: 390,
  h: 844
}) {
  return filledPreset({
    ...pe.preset,
    element: pe.draft
  }, device, registry2);
}
function linkedHere(screen, pe) {
  return flatten(screen.elements).filter(({ el: el2 }) => el2.type === pe.preset.type && el2.set === pe.preset.name).map(({ el: el2 }) => el2.id);
}
function previewScreen(screen, pe, registry2) {
  const next = {
    ...pe.preset,
    element: pe.draft
  };
  let elements = screen.elements;
  for (const id of linkedHere(screen, pe)) {
    const box7 = inLayout(screen.elements, id);
    const parent = box7 ? layoutOf(box7) : void 0;
    const frame = frameOf(screen, id);
    const oldF = filledPreset(pe.preset, frame, registry2, parent);
    const newF = filledPreset(next, frame, registry2, parent);
    elements = mapElement(elements, id, (el2) => followPreset(el2, oldF, newF, parent !== void 0).el);
  }
  return {
    ...screen,
    elements
  };
}
function presetBadgeText(pe) {
  return `MySet\u300C${pe.preset.name}\u300D\u3092\u7DE8\u96C6\u4E2D\u3002\u30AD\u30E3\u30F3\u30D0\u30B9\u306E\u300C${pe.preset.name}\u300D\u306E\u672D\u304C\u4ED8\u3044\u305F\u90E8\u54C1\u304C\u5148\u306B\u5909\u308F\u3063\u3066\u898B\u3048\u308B`;
}
function presetCountText(pe, here, folders) {
  const c = pe.counts;
  const total = c ? `${c.parts} \u500B(${folders ? `${c.screens} \u753B\u9762\u30FB${c.proposals} \u6848` : `${c.screens} \u753B\u9762`})` : "\u6570\u3048\u3066\u3044\u307E\u3059\u2026";
  return `\u3064\u306A\u304C\u308A\u306E\u3042\u308B\u90E8\u54C1: ${total}\u3002\u3053\u306E\u753B\u9762\u306B ${here} \u500B`;
}

// src/editor/panels/preset-edit.ts
function renderPresetEdit(container, pe, here, folders, registry2, device, ui) {
  clear(container);
  const { type, name } = pe.preset;
  const spec25 = registry2.get(type);
  container.append(el("div", {
    class: "panel-title is-name"
  }, "MySet \u3092\u76F4\u3059"), el("div", {
    class: "set-head"
  }, el("span", {
    class: "set-name"
  }, name), el("span", {
    class: "set-type"
  }, `Type: ${type}`)), el("div", {
    class: "muted"
  }, presetCountText(pe, here, folders)));
  const d = draftFilled(pe, registry2, device);
  const size = (axis) => tagged(numberInput(d[axis], (v) => ui.onItem(axis, v), 1), guideTag.props(axis));
  const shown2 = editFields(pe);
  if (shown2.own) {
    container.append(field("text", tagged(textInput(d.text ?? "", (v) => ui.onItem("text", v), false), guideTag.props("text"))));
    if (spec25?.variants) {
      container.append(field("variant", tagged(selectInput(spec25.variants.map((v) => ({
        value: v
      })), d.variant ?? spec25.variants[0], (v) => ui.onItem("variant", v)), guideTag.props("variant"))));
    }
  }
  if (shown2.size) container.append(field("w / h", pair(size("w"), size("h"))));
  if (shown2.own && spec25 && Object.keys(spec25.props).length) {
    container.append(el("div", {
      class: "sub-title"
    }, "props"));
    for (const [key, ps] of Object.entries(spec25.props)) {
      if (ps.kind === "rows") continue;
      container.append(field(ps.label ?? key, tagged(propInput(ps, d.props[key], (v) => ui.onItem(`props.${key}`, v)), guideTag.props(`props.${key}`))));
    }
  }
  if (shown2.style) {
    container.append(el("div", {
      class: "sub-title"
    }, "style"));
    for (const key of STYLE_KEYS) {
      container.append(field(key, tagged(styleInput(key, d.style?.[key], (v) => ui.onItem(`style.${key}`, v)), guideTag.props(`style.${key}`))));
    }
  }
  if (!shown2.own) {
    container.append(el("div", {
      class: "muted"
    }, "\u4E2D\u8EAB\u306F\u3001\u7F6E\u3044\u305F\u90E8\u54C1\u3092\u76F4\u3057\u3066\u300CMySet \u306B\u53CD\u6620\u300D\u3067"));
  }
  container.append(el("div", {
    class: "muted"
  }, "\u53CD\u6620\u3059\u308B\u3068\u3001\u3064\u306A\u304C\u308A\u306E\u3042\u308B\u90E8\u54C1\u304C\u5168\u90E8\u3044\u3063\u3057\u3087\u306B\u5909\u308F\u308B(\u307B\u304B\u306E\u753B\u9762\u3068\u6848\u3082)\u3002\u90E8\u54C1\u3054\u3068\u306B\u5909\u3048\u3066\u3042\u308B\u9805\u76EE\u306F\u305D\u306E\u307E\u307E"), el("div", {
    class: "set-actions"
  }, Object.assign(el("button", {
    class: "btn btn-primary",
    onclick: ui.onApply
  }, "\u53CD\u6620"), {
    disabled: !draftDirty(pe)
  }), el("button", {
    class: "btn",
    onclick: ui.onCancel
  }, "\u3084\u3081\u308B")), el("div", {
    class: "set-actions"
  }, el("button", {
    class: "btn btn-ghost",
    onclick: ui.onRename
  }, "\u540D\u524D\u3092\u5909\u3048\u308B"), el("button", {
    class: "btn btn-ghost is-danger",
    onclick: ui.onDelete
  }, "\u3053\u306E MySet \u3092\u6D88\u3059")), el("div", {
    class: "muted"
  }, "\u6D88\u3057\u3066\u3082\u90E8\u54C1\u306F\u6B8B\u308A\u3001\u3064\u306A\u304C\u308A\u3060\u3051\u5916\u308C\u308B"));
}

// src/editor/default-edit.ts
function beginDefaultEdit(type, defaults) {
  const file = defaults[type];
  return {
    type,
    file: structuredClone(file ?? {}),
    exists: file !== void 0,
    draft: structuredClone(file ?? {})
  };
}
function setDefaultItem(de, item, value) {
  const draft = structuredClone(de.draft);
  const gone = value === void 0 || value === "";
  if (item === "w" || item === "h") {
    if (gone) delete draft[item];
    else draft[item] = value;
  } else {
    const style = {
      ...draft.style ?? {}
    };
    if (gone) delete style[item.slice(6)];
    else style[item.slice(6)] = value;
    if (Object.keys(style).length) draft.style = style;
    else delete draft.style;
  }
  return {
    ...de,
    draft: normalizeDefaultPart(draft)
  };
}
function defaultDirty(de) {
  return JSON.stringify(normalizeDefaultPart(de.draft)) !== JSON.stringify(normalizeDefaultPart(de.file));
}
function defaultEmpty(p) {
  return p.w === void 0 && p.h === void 0 && !(p.style && Object.keys(p.style).length);
}
function previewDefaults(defaults, de) {
  const { [de.type]: _old, ...rest } = defaults;
  return defaultEmpty(de.draft) ? rest : {
    ...rest,
    [de.type]: de.draft
  };
}
function defaultHere(screen, type) {
  return defaultTargets(screen.elements, type).map((e) => e.id);
}
function previewDefaultScreen(screen, de, registry2, defaults) {
  const next = previewDefaults(defaults, de);
  const style = next[de.type]?.style;
  let elements = screen.elements;
  for (const t of defaultTargets(screen.elements, de.type)) {
    const frame = frameOf(screen, t.id);
    const oldEff = effectiveDefault(t, frame, registry2, defaults);
    const newEff = effectiveDefault(t, frame, registry2, next);
    elements = mapElement(elements, t.id, (el2) => {
      const out = followDefault(el2, oldEff, newEff);
      if (style && Object.keys(style).length) out.base = {
        ...style
      };
      else delete out.base;
      return out;
    });
  }
  return {
    ...screen,
    elements
  };
}
function defaultBadgeText(type) {
  return `${type} \u306E Default \u3092\u7DE8\u96C6\u4E2D\u3002\u3053\u306E\u7A2E\u985E\u306E\u90E8\u54C1\u304C\u5148\u306B\u5909\u308F\u3063\u3066\u898B\u3048\u308B`;
}
function defaultCountText(de, here) {
  const total = de.counts ? `${de.counts.parts} \u500B` : "\u6570\u3048\u3066\u3044\u307E\u3059\u2026";
  return `\u3053\u306E\u7A2E\u985E\u306E\u90E8\u54C1: ${total}(MySet \u304B\u3089\u6765\u305F\u3082\u306E\u306F\u9664\u304F)\u3002\u3053\u306E\u753B\u9762\u306B ${here} \u500B`;
}
function defaultPlaceholders(type, device, registry2) {
  const spec25 = registry2.get(type);
  const size = spec25 ? spec25.defaults(device, {
    id: "_",
    type,
    x: 0,
    y: 0
  }) : {
    w: 200,
    h: 120
  };
  return {
    w: String(size.w),
    h: String(size.h)
  };
}

// src/editor/panels/default-edit.ts
function optionalNumber(value, placeholder, apply) {
  const input = el("input", {
    type: "number",
    value: value === void 0 ? "" : String(value),
    step: "1",
    min: "1",
    placeholder
  });
  input.addEventListener("change", () => {
    const v = input.value.trim();
    if (v === "") {
      input.classList.remove("is-invalid");
      apply(void 0);
      return;
    }
    const n = Number(v);
    const ok = Number.isInteger(n) && n >= 1;
    input.classList.toggle("is-invalid", !ok);
    if (ok) apply(n);
  });
  return input;
}
function renderDefaultEdit(container, de, here, registry2, device, ui) {
  clear(container);
  const ph = defaultPlaceholders(de.type, device, registry2);
  container.append(el("div", {
    class: "panel-title is-name"
  }, "Default \u3092\u76F4\u3059"), el("div", {
    class: "muted"
  }, `${de.type} \u306E Default(\u7A2E\u985E\u306E\u57FA\u672C\u306E\u5F62)`), el("div", {
    class: "muted"
  }, defaultCountText(de, here)), field("w / h", pair(tagged(optionalNumber(de.draft.w, ph.w, (v) => ui.onItem("w", v)), guideTag.props("w")), tagged(optionalNumber(de.draft.h, ph.h, (v) => ui.onItem("h", v)), guideTag.props("h")))), el("div", {
    class: "sub-title"
  }, "style"));
  for (const key of STYLE_KEYS) {
    container.append(field(key, tagged(styleInput(key, de.draft.style?.[key], (v) => ui.onItem(`style.${key}`, v)), guideTag.props(`style.${key}`))));
  }
  container.append(el("div", {
    class: "muted"
  }, "\u53CD\u6620\u3059\u308B\u3068\u3001\u3053\u306E\u7A2E\u985E\u306E\u90E8\u54C1\u304C\u5168\u90E8\u3044\u3063\u3057\u3087\u306B\u5909\u308F\u308A\u3001\u65B0\u3057\u304F\u7F6E\u304F\u90E8\u54C1\u3082\u3053\u306E\u5F62\u306B\u306A\u308B\u3002\u90E8\u54C1\u3054\u3068\u306B\u5909\u3048\u3066\u3042\u308B\u9805\u76EE\u306F\u305D\u306E\u307E\u307E\u3002\u300C\u2014\u300D\u306F\u898B\u672C\u5E33(\u30C6\u30FC\u30DE)\u306E\u5024\u306E\u307E\u307E"), el("div", {
    class: "set-actions"
  }, Object.assign(el("button", {
    class: "btn btn-primary",
    onclick: ui.onApply
  }, "\u53CD\u6620"), {
    disabled: !defaultDirty(de) || defaultEmpty(de.draft)
  }), el("button", {
    class: "btn",
    onclick: ui.onCancel
  }, "\u3084\u3081\u308B")), el("div", {
    class: "set-actions"
  }, Object.assign(el("button", {
    class: "btn btn-ghost",
    onclick: ui.onReset
  }, "\u5143\u306E\u5F62\u306B\u623B\u3059"), {
    disabled: !de.exists
  })));
}

// src/editor/panels/movement.ts
var USES = [
  "appear",
  "value",
  "effect"
];
var PLACEHOLDER = {
  appear: "\u3075\u308F\u3063\u3068\u51FA\u308B",
  value: "\u884C\u304D\u904E\u304E\u3066\u623B\u308B",
  effect: "\u3077\u308B\u3063\u3068\u63FA\u308C\u308B"
};
var COLOR_ITEMS = [
  "fill",
  "border",
  "color"
];
var UNIT = {
  progress: "%",
  scale: "%",
  opacity: "%",
  dx: "px",
  dy: "px"
};
function option2(value, label, selected) {
  return el("option", {
    value,
    ...selected ? {
      selected: true
    } : {}
  }, label);
}
function ownKeys(node) {
  node.addEventListener("keydown", (e) => e.stopPropagation());
  return node;
}
function renderMovement(container, ui) {
  clear(container);
  const b = ui.builder;
  const root = el("div", {
    class: "movement"
  });
  container.append(root);
  const back = el("button", {
    class: "btn movement-back"
  }, "\u2190 \u623B\u308B");
  back.addEventListener("click", () => ui.close());
  root.append(el("div", {
    class: "movement-head"
  }, back, el("span", {
    class: "movement-title"
  }, "\u52D5\u304D\u3092\u4F5C\u308B")));
  const name = ownKeys(el("input", {
    type: "text",
    class: "movement-name",
    maxlength: "40",
    placeholder: PLACEHOLDER[b.use],
    value: b.name
  }));
  root.append(el("label", {
    class: "movement-field"
  }, el("span", {}, "\u540D\u524D"), name));
  root.append(el("div", {
    class: "movement-use"
  }, el("span", {}, "\u4F7F\u3044\u65B9"), useControl(ui)));
  root.append(el("hr", {
    class: "movement-divider"
  }));
  root.append(el("div", {
    class: "movement-section"
  }, "\u6BB5  \u4E0A\u304B\u3089\u9806\u306B\u52D5\u304F"));
  const rows2 = chips(b);
  b.motion.steps.forEach((step2, i) => root.append(stepCard(ui, step2, i, rows2[i])));
  const more = el("button", {
    class: "btn btn-block movement-add-step",
    ...b.motion.steps.length >= STEPS_MAX ? {
      disabled: true
    } : {}
  }, "+ \u6BB5\u3092\u8DB3\u3059");
  more.addEventListener("click", () => ui.change(addStep(b)));
  root.append(more);
  root.append(el("div", {
    class: "movement-section"
  }, "\u5168\u4F53"));
  root.append(delayField(ui));
  if (b.use === "effect") root.append(roundsField(ui));
  root.append(el("hr", {
    class: "movement-divider"
  }));
  const fit = fitText(b);
  const anchor = el("div", {
    class: "movement-fit"
  });
  anchor.append(el("div", {
    class: "movement-fit-label"
  }, "\u4ED8\u3051\u3089\u308C\u308B\u90E8\u54C1"), el("div", {
    class: "movement-fit-types"
  }, fit.fits), el("div", {
    class: "movement-fit-why"
  }, fit.why));
  root.append(anchor);
  const why = el("div", {
    class: "movement-why"
  });
  const save = el("button", {
    class: "btn btn-primary movement-save"
  }, "\u4FDD\u5B58");
  save.addEventListener("click", () => ui.save());
  const cancel = el("button", {
    class: "btn movement-cancel"
  }, "\u3084\u3081\u308B");
  cancel.addEventListener("click", () => ui.close());
  root.append(why, el("div", {
    class: "movement-foot"
  }, save, cancel));
  const refresh2 = () => {
    const lines = ui.problems();
    why.replaceChildren(...lines.map((t) => el("div", {
      class: "movement-why-line"
    }, t)));
    save.disabled = lines.length > 0 || ui.saving;
  };
  name.addEventListener("input", () => {
    ui.setName(name.value);
    refresh2();
  });
  refresh2();
  return anchor;
}
function useControl(ui) {
  const b = ui.builder;
  if (b.useFixed) {
    const from = b.origin.kind === "block" ? "\u30D6\u30ED\u30C3\u30AF\u304B\u3089" : "\u884C\u3067\u6C7A\u307E\u308B";
    return el("span", {
      class: "movement-use-text"
    }, `${USE_TEXT[b.use]}(${from})`);
  }
  const uses = USES.includes(b.use) ? USES : [
    ...USES,
    b.use
  ];
  const select2 = ownKeys(el("select", {
    class: "movement-use-select"
  }, ...uses.map((u) => option2(u, USE_TEXT[u], u === b.use))));
  select2.addEventListener("change", () => ui.change(setUse(b, select2.value)));
  return select2;
}
function stepCard(ui, step2, i, row) {
  const b = ui.builder;
  const card2 = el("div", {
    class: "movement-step",
    "data-step": String(i)
  });
  const head = el("div", {
    class: "movement-step-head"
  }, el("span", {}, `\u6BB5 ${i + 1}`));
  if (b.motion.steps.length > 1) {
    const x = el("button", {
      class: "btn movement-x movement-step-x",
      title: "\u6BB5\u3092\u6D88\u3059"
    }, "\xD7");
    x.addEventListener("click", () => ui.change(removeStep(b, i)));
    head.append(x);
  }
  card2.append(head);
  for (const chip2 of row) card2.append(chipRow(ui, chip2));
  const add = el("button", {
    class: "btn movement-add-item"
  }, "+ \u9805\u76EE");
  add.addEventListener("click", () => togglePicker(ui, card2, add, step2, i));
  card2.append(add);
  card2.append(timing(ui, step2, i));
  return card2;
}
function chipRow(ui, chip2) {
  const line = el("div", {
    class: "movement-chip-row",
    "data-item": chip2.item
  });
  const button2 = el("button", {
    class: "btn movement-chip"
  }, chip2.text);
  button2.addEventListener("click", () => editChip(ui, line, chip2));
  line.append(button2);
  if (chip2.removable) {
    const x = el("button", {
      class: "btn movement-x",
      title: "\u9805\u76EE\u3092\u6D88\u3059"
    }, "\xD7");
    x.addEventListener("click", () => ui.change(removeItem(ui.builder, chip2.step, chip2.item)));
    line.append(x);
  }
  return line;
}
function valueField(item, v, onKey) {
  if (COLOR_ITEMS.includes(item)) return colorField(item, v, onKey);
  const input = el("input", {
    type: "text",
    class: "movement-value",
    value: inputText(item, v)
  });
  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    onKey(e);
  });
  const unit = UNIT[item];
  return {
    nodes: [
      input,
      ...unit ? [
        el("span", {
          class: "movement-unit"
        }, unit)
      ] : []
    ],
    read() {
      const out = parseValue(item, input.value);
      input.classList.toggle("is-invalid", out === void 0);
      return out;
    },
    focus: () => {
      input.focus();
      input.select();
    }
  };
}
function colorField(item, v, onKey) {
  const tokens = COLOR_NAMES.map((c) => `$${c}`);
  const hex = typeof v === "string" && v.startsWith("#");
  const other = typeof v === "string" && !hex && !tokens.includes(v) ? [
    v
  ] : [];
  const select2 = el("select", {
    class: "movement-color"
  }, option2("", "\u305D\u306E\u307E\u307E", v === null), ...[
    ...tokens,
    ...other
  ].map((t) => option2(t, t, v === t)), option2("#", "#", hex));
  const input = el("input", {
    type: "text",
    class: "movement-value movement-hex",
    placeholder: "#RRGGBB",
    value: hex ? String(v) : "",
    ...hex ? {} : {
      hidden: true
    }
  });
  select2.addEventListener("change", () => {
    input.hidden = select2.value !== "#";
    if (!input.hidden) input.focus();
  });
  for (const node of [
    select2,
    input
  ]) {
    node.addEventListener("keydown", (e) => {
      e.stopPropagation();
      onKey(e);
    });
  }
  return {
    nodes: [
      select2,
      input
    ],
    read() {
      const out = select2.value === "#" ? parseValue(item, input.value) : parseValue(item, select2.value);
      input.classList.toggle("is-invalid", out === void 0);
      return out;
    },
    focus: () => select2.focus()
  };
}
function editChip(ui, line, chip2) {
  const b = ui.builder;
  const step2 = b.motion.steps[chip2.step];
  const first = chip2.step === 0;
  const keys = (e) => {
    if (e.isComposing) return;
    if (e.key === "Enter") apply();
    else if (e.key === "Escape") line.replaceWith(chipRow(ui, chip2));
  };
  const start = {
    ...b.motion.start ?? {}
  };
  const from = first ? valueField(chip2.item, chip2.item in start ? start[chip2.item] : START_VALUE[chip2.item], keys) : void 0;
  const to = valueField(chip2.item, step2.to[chip2.item], keys);
  const ok = el("button", {
    class: "btn btn-primary movement-ok"
  }, "\u2713");
  const apply = () => {
    const f = from?.read();
    const t = to.read();
    if (from && f === void 0 || t === void 0) return;
    let next = setValue(b, chip2.step, chip2.item, "to", t);
    if (from) next = setValue(next, chip2.step, chip2.item, "from", f);
    ui.change(next);
  };
  ok.addEventListener("click", apply);
  const edit = el("div", {
    class: "movement-chip-edit",
    "data-item": chip2.item
  }, el("span", {
    class: "movement-chip-label"
  }, ITEM_LABEL[chip2.item]), ...from ? [
    ...from.nodes,
    el("span", {
      class: "movement-arrow"
    }, "\u2192")
  ] : [], ...to.nodes, ok);
  line.replaceWith(edit);
  (from ?? to).focus();
}
function togglePicker(ui, card2, button2, step2, i) {
  const open = card2.querySelector(".movement-picker");
  if (open) return void open.remove();
  const b = ui.builder;
  const picker2 = el("div", {
    class: "movement-picker"
  });
  for (const item of STEP_ITEMS) {
    const off = item in step2.to || item === "progress" && b.use === "effect";
    const node = el("button", {
      class: "movement-pick",
      "data-item": item,
      ...off ? {
        disabled: true
      } : {}
    }, el("span", {
      class: "movement-pick-label"
    }, ITEM_LABEL[item]), el("span", {
      class: "movement-pick-note"
    }, itemTypesText(item)));
    node.addEventListener("click", () => ui.change(addItem(b, i, item)));
    picker2.append(node);
  }
  button2.after(picker2);
  const outside2 = (e) => {
    const target = e.target;
    if (!picker2.isConnected) return document.removeEventListener("pointerdown", outside2, true);
    if (picker2.contains(target) || button2.contains(target)) return;
    picker2.remove();
    document.removeEventListener("pointerdown", outside2, true);
  };
  document.addEventListener("pointerdown", outside2, true);
}
function timing(ui, step2, i) {
  const b = ui.builder;
  const ms = step2.ms ?? "normal";
  const custom = typeof ms === "number";
  const speed = ownKeys(el("select", {
    class: "movement-speed"
  }, ...MOTION_SPEEDS.map((v) => option2(v, SPEED_LABEL[v], ms === v)), option2("custom", "\u6570\u5024", custom)));
  speed.addEventListener("change", () => {
    const v = speed.value;
    const next = v === "custom" ? custom ? ms : ui.tone.speed[ms] : v;
    ui.change(setTiming(b, i, next === "normal" ? void 0 : next, step2.easing));
  });
  const easing = ownKeys(el("select", {
    class: "movement-easing"
  }, option2("", "\u30C6\u30FC\u30DE\u306E\u307E\u307E", step2.easing === void 0), ...MOTION_EASINGS.map((v) => option2(v, EASING_LABEL[v], step2.easing === v))));
  easing.addEventListener("change", () => {
    const v = easing.value;
    ui.change(setTiming(b, i, step2.ms, v === "" ? void 0 : v));
  });
  const line = el("div", {
    class: "movement-timing"
  }, el("label", {}, "\u9577\u3055"), speed);
  if (custom) {
    const input = ownKeys(el("input", {
      type: "number",
      class: "movement-ms",
      min: "0",
      max: String(MOTION_SPEED_MAX),
      step: "10",
      value: String(ms)
    }));
    input.addEventListener("change", () => {
      const v = Math.round(Number(input.value));
      if (input.value.trim() === "" || !Number.isFinite(v) || v < 0 || v > MOTION_SPEED_MAX) {
        input.value = String(ms);
        return;
      }
      ui.change(setTiming(b, i, v, step2.easing));
    });
    line.append(input, el("span", {
      class: "movement-unit"
    }, "ms"));
  }
  line.append(el("label", {}, "\u7DE9\u6025"), easing);
  return line;
}
function delayField(ui) {
  const b = ui.builder;
  const input = ownKeys(el("input", {
    type: "number",
    class: "movement-delay",
    min: "0",
    max: String(DELAY_MAX),
    step: "10",
    placeholder: "0",
    value: b.motion.delay ? String(b.motion.delay) : ""
  }));
  input.addEventListener("change", () => {
    const v = input.value.trim() === "" ? 0 : Math.round(Number(input.value));
    if (!Number.isFinite(v) || v < 0 || v > DELAY_MAX) {
      input.value = b.motion.delay ? String(b.motion.delay) : "";
      return;
    }
    ui.change(setDelay(b, v));
  });
  return el("div", {
    class: "movement-timing movement-delay-line"
  }, el("label", {}, "\u9045\u308C"), input, el("span", {
    class: "movement-unit"
  }, "ms"));
}
function roundsField(ui) {
  const b = ui.builder;
  const repeat = b.motion.repeat ?? 1;
  const alternate = b.motion.alternate === true;
  const input = ownKeys(el("input", {
    type: "number",
    class: "movement-repeat",
    min: "1",
    max: String(REPEAT_MAX),
    step: "1",
    placeholder: "1",
    value: repeat !== 1 ? String(repeat) : ""
  }));
  input.addEventListener("change", () => {
    const v = input.value.trim() === "" ? 1 : Math.round(Number(input.value));
    if (!Number.isFinite(v) || v < 1 || v > REPEAT_MAX) {
      input.value = repeat !== 1 ? String(repeat) : "";
      return;
    }
    ui.change(setRounds(b, v, alternate));
  });
  const box7 = ownKeys(el("input", {
    type: "checkbox",
    class: "movement-alt-box",
    ...alternate ? {
      checked: true
    } : {}
  }));
  box7.addEventListener("change", () => ui.change(setRounds(b, repeat, box7.checked)));
  return el("div", {
    class: "movement-timing movement-repeat-line"
  }, el("label", {}, "\u7E70\u308A\u8FD4\u3057"), input, el("span", {
    class: "movement-unit"
  }, "\u56DE"), el("label", {
    class: "movement-alt"
  }, box7, "\u5F80\u5FA9"));
}

// src/editor/panels/themes.ts
function renderThemes(container, themes, currentId, onPick) {
  clear(container);
  for (const t of themes) {
    const colors = el("span", {
      class: "swatch-colors"
    }, ...[
      "bg",
      "surface",
      "primary",
      "text"
    ].map((c) => el("span", {
      style: `background:${t.colors[c]}`
    })));
    container.appendChild(el("div", {
      class: "item" + (t.id === currentId ? " is-current" : ""),
      "data-guide": guideTag.theme(t.id),
      onclick: () => onPick(t.id)
    }, el("span", {
      class: "swatch"
    }, colors, `${t.name} (${t.id})`)));
  }
}

// src/editor/panels/banner.ts
function showBanner(container, message, actions = [], kind = "info") {
  delete container.dataset.owner;
  clear(container);
  container.hidden = false;
  container.classList.toggle("is-error", kind === "error");
  container.append(typeof message === "string" ? el("span", {}, message) : message, ...actions.map((a) => el("button", {
    class: "btn",
    onclick: a.onClick
  }, a.label)));
}
function hideBanner(container) {
  clear(container);
  container.hidden = true;
}

// src/editor/press-commit.ts
var COMMITS_AT_ONCE = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "button",
  "submit",
  "reset",
  "image"
]);
function typingField(f) {
  if (!f) return false;
  if (f.tag === "textarea") return true;
  return f.tag === "input" && !COMMITS_AT_ONCE.has((f.type ?? "text").toLowerCase());
}
function holdsPress(s) {
  return s.primary && !s.inGuide && s.button !== null && !s.button.disabled && typingField(s.focused);
}
function focusedOf(doc) {
  const a = doc.activeElement;
  if (!a || a === doc.body) return null;
  return {
    tag: a.tagName.toLowerCase(),
    type: a.getAttribute("type") ?? void 0
  };
}
function installPressCommit() {
  const win = globalThis;
  const doc = win.document;
  let held;
  win.addEventListener("mousedown", (e) => {
    held = void 0;
    const target = e.target;
    const button2 = target?.closest?.("button") ?? null;
    const side = {
      focused: focusedOf(doc),
      button: button2 ? {
        disabled: button2.disabled
      } : null,
      inGuide: target?.closest?.("#guide-layer") != null,
      primary: e.button === 0
    };
    if (!button2 || !holdsPress(side)) return;
    e.preventDefault();
    held = button2;
  }, true);
  win.addEventListener("click", (e) => {
    const button2 = held;
    held = void 0;
    if (!button2 || !button2.contains(e.target)) return;
    const a = doc.activeElement;
    if (a instanceof HTMLElement && a !== doc.body) a.blur();
  }, true);
}

// src/editor/main.ts
var $ = (id) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} \u304C\u3042\u308A\u307E\u305B\u3093`);
  return node;
};
var NUDGE = {
  "nudge-left": [
    -1,
    0
  ],
  "nudge-right": [
    1,
    0
  ],
  "nudge-up": [
    0,
    -1
  ],
  "nudge-down": [
    0,
    1
  ]
};
var TYPING_TAGS = /* @__PURE__ */ new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT"
]);
var UNSAVED_LEAVE = "\u4FDD\u5B58\u3057\u3066\u3044\u306A\u3044\u7DE8\u96C6\u304C\u3042\u308A\u307E\u3059\u3002\u6368\u3066\u3066\u79FB\u308A\u307E\u3059\u304B?";
var errText = (e) => e instanceof Error ? e.message : String(e);
function failText2(r, fallback) {
  const errors = r.body.errors;
  if (typeof r.body.error === "string") return r.body.error;
  if (errors?.[0]?.message) return errors[0].message;
  return `${fallback}(HTTP ${r.status})`;
}
var linkedTo = (preset) => (els) => flatten(els).some(({ el: el2 }) => el2.type === preset.type && el2.set === preset.name);
async function call(p) {
  try {
    return await p;
  } catch (e) {
    return {
      ok: false,
      status: 0,
      body: {
        error: `\u30B5\u30FC\u30D0\u30FC\u306B\u5C4A\u304D\u307E\u305B\u3093: ${errText(e)}`
      }
    };
  }
}
async function callSave(p) {
  try {
    return await p;
  } catch (e) {
    return {
      ok: false,
      status: 0,
      body: {
        error: `\u30B5\u30FC\u30D0\u30FC\u306B\u5C4A\u304D\u307E\u305B\u3093: ${errText(e)}`
      }
    };
  }
}
var App = class {
  mode = "start";
  state;
  view = {
    zoom: 1,
    outlines: [],
    dragged: [],
    scrolls: {}
  };
  /** The canvas gestures (set up in start()). */
  gestures;
  themes = [];
  screens = [];
  proposals = [];
  proposalId = "a";
  project;
  projectHash = "";
  currentId;
  /** The proposal the open screen was read from. */
  currentProposal;
  templates = [];
  templatesLoaded = false;
  startTab = "recent";
  templatesTab = "builtin";
  form;
  references = [];
  importForm;
  /** The image the 登録の欄 is about (the form itself only carries its name and preview). */
  importFile;
  /** Registered part presets (MySet) for the Elements list. */
  components = [];
  componentsLoaded = false;
  /** The saved motions (MySet in a motion's candidates), fetched whenever a motion editor opens. */
  savedMotions = [];
  /** What Copy / Cut took (spec §5.3). Lives in this tab only; survives screen and proposal switches. */
  clip;
  /** Screen contents fetched for Recent thumbnails, keyed "<proposal>/<screen>". */
  contents = /* @__PURE__ */ new Map();
  /**
   * The other screens of the open proposal, as written, read when a screen is opened (values spec
   * §5.4): what 「文字の元」, Select and the blocks panel know of the kept parts elsewhere. A screen
   * that could not be read is not here.
   */
  others = {};
  /** Select: rects whose children are hidden. Elements: types whose Default row is shown. */
  collapsed = /* @__PURE__ */ new Set();
  /** Select: lists whose rows are shown (list items spec §5.2). */
  openLists = /* @__PURE__ */ new Set();
  /** The next render of the rows table puts the focus into the looked-at row's text field. */
  rowFocus = false;
  expandedTypes = /* @__PURE__ */ new Set();
  leftSections = {
    ...LAYOUT.leftSections
  };
  connected = false;
  /** True while #stopped is actually showing (distinguishes the first connect from a real drop). */
  stoppedShown = false;
  /** True while the "配信サーバーが止まりました" banner (from a `shutdown` message) is showing. */
  shutdownBannerShown = false;
  /** Guards against a second save() starting while one is still in flight. */
  saving = false;
  /** Field paths from the last 422, for panels/props.ts to flag with a red border. */
  invalidFields;
  /**
   * Navigation counter. begin() bumps it at the start of every flow that replaces the view (open,
   * switch, create, delete, reload). Each flow captures its token and drops its result — no state
   * assignment, no render, no URL update — when a newer flow has begun while it was awaiting.
   */
  nav = 0;
  /** Banner text for a fallback to the default proposal, shown once the flow that caused it ends. */
  notice;
  /** The "outside the owner" notice was shown since the shown state last changed (spec §5.3). */
  outsideTold = false;
  /** 「MySet を直す」 (live-myset spec §5.2): the MySet being edited and its draft; undefined otherwise. */
  presetEdit;
  /** The type Defaults as the server has them (live-myset spec §3.4) and why they could not be read. */
  defaults = emptyDefaults();
  defaultsError;
  /** library/guide.json as the server answers it (guide spec §4). */
  guide = {
    guide: null,
    hash: null
  };
  /** Where the user is in the guide (guide spec §5.0); the progress itself is kept in localStorage. */
  guideRun = {
    step: 1,
    open: false
  };
  /** The overlay with the frames and the bubble (guide spec §5.2). */
  guideLayer = new GuideLayer($("app"));
  /** The played screen the guide was last drawn for (play transitions do not pass through doRenderAll). */
  guideScreen;
  /** 「Default を直す」 (spec §5.3): the type being edited and its draft; undefined otherwise. */
  defaultEdit;
  /** A MySet or a Default is being edited in the right panel: the canvas only shows the draft. */
  get libraryEdit() {
    return this.presetEdit !== void 0 || this.defaultEdit !== void 0;
  }
  /** A MySet apply, rename or delete is under way: a second press, or another of them, does nothing. */
  applying = false;
  /** The sample right of a Dynamic Elements row while the mouse is on it (PR-13). */
  dynamicHover = new DynamicHover(browserClock, registry);
  /** A Dynamic Elements row was pressed and the mouse has not left it since: no sample. */
  hoverPressed = false;
  /** The Animation section's ▶, samples and motions (animation-ui.ts). */
  anim = new AnimationUi(browserClock, {
    state: () => this.state,
    edit: (fn) => this.edit(fn),
    theme: () => this.theme(),
    show: (playing) => this.showPlaying(playing),
    renderAll: () => this.renderAll(),
    renderBadge: () => this.renderBadge(),
    abandon: () => this.gestures?.abandon(),
    panels: () => [
      this.els.header,
      $("left"),
      $("right")
    ],
    screens: () => this.screens.filter((x) => !x.error).map((x) => ({
      id: x.id,
      title: x.title
    })),
    kept: () => this.kept(),
    readScreens: () => this.readScreens(),
    replaying: () => this.play.running,
    failed: (error) => {
      console.error(error);
      showBanner(this.els.banner, "\u30D6\u30ED\u30C3\u30AF\u306E \u25B6 \u3092\u7D9A\u3051\u3089\u308C\u306A\u304F\u306A\u308A\u307E\u3057\u305F\u3002", [], "error");
    },
    scrolls: () => this.view.scrolls,
    saved: () => this.savedMotions,
    refreshSaved: () => void this.refreshSavedMotions(),
    // 「動きを作る」 takes the right panel in place of the properties (saved-motions spec §5.2).
    openBuilder: (request2) => {
      if (this.anim.startBuilder(request2)) this.renderAll();
    },
    notice: (text18, error) => showBanner(this.els.banner, text18, [], error ? "error" : "info")
  });
  /** 再生 (triggers spec §4, §5.2): the run on the canvas while the header's ▶ 再生 is on. */
  play = new Play(browserClock, {
    registry,
    theme: () => this.theme(),
    draw: (shot) => this.drawPlay(shot),
    changed: () => {
      this.renderPlayPanel();
      if (this.play.run?.current !== this.badgeScreen) this.renderBadge();
      if (this.guideRun.open && this.play.run?.current !== this.guideScreen) {
        this.guideScreen = this.play.run?.current;
        this.drawGuide();
      }
    },
    counting: () => this.countPlayPanel(),
    failed: (error) => this.playFailed(error)
  });
  /** The screen the strip over the canvas was drawn for while 再生 runs. */
  badgeScreen;
  /** Guards renderAll against re-entrancy (see renderAll's comment). */
  rendering = false;
  renderPending = false;
  els = {
    header: $("header"),
    banner: $("banner"),
    start: $("start"),
    startNav: $("start-nav"),
    startMain: $("start-main"),
    editor: $("editor"),
    treeSection: $("tree-section"),
    elementsSection: $("elements-section"),
    dynamicSection: $("dynamic-section"),
    canvas: $("canvas"),
    canvasWrap: $("canvas-wrap"),
    badge: $("state-badge"),
    stopped: $("stopped"),
    props: $("props"),
    themes: $("themes")
  };
  /** Typing into an input while 再生 runs (triggers spec §4.7): a field laid over the drawn one. */
  typing = new Typing(this.els.canvasWrap, {
    field: (id) => this.els.canvas.querySelector(`.wf-frame:not(.wf-under) .wf-el[data-id="${CSS.escape(id)}"] .wf-field`) ?? void 0,
    typed: (id, text18) => this.play.type(id, text18),
    key: (key) => this.play.key(key)
  });
  async start() {
    const root = document.documentElement.style;
    root.setProperty("--left", `${LAYOUT.leftWidth}px`);
    root.setProperty("--right", `${LAYOUT.rightWidth}px`);
    root.setProperty("--header", `${LAYOUT.headerHeight}px`);
    this.els.canvasWrap.addEventListener("pointerdown", (e) => {
      if (this.libraryEdit && !e.target.closest("#state-badge")) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      if (this.play.running) {
        if (e.target.closest(".play-typing")) return;
        if (!e.target.closest("#state-badge")) this.playDown(e);
        return;
      }
      this.anim.canvasDown(e);
    }, true);
    this.els.canvasWrap.addEventListener("pointermove", (e) => {
      if (this.play.running) this.playMove(e);
    }, true);
    for (const type of [
      "pointerup",
      "pointercancel"
    ]) {
      document.addEventListener(type, (e) => {
        if (this.play.running) this.playUp(e, type === "pointerup");
        this.play.release();
        this.anim.released(e);
      }, true);
    }
    this.els.canvasWrap.addEventListener("wheel", (e) => {
      if (!this.play.running || e.ctrlKey) return;
      e.stopImmediatePropagation();
      this.playWheel(e);
    }, {
      capture: true,
      passive: false
    });
    this.els.canvasWrap.addEventListener("pointerleave", (e) => {
      if (e.target === this.els.canvasWrap && this.play.running && leaveClearsHover(e.pointerType)) this.play.hoverAt(void 0);
    }, true);
    this.els.canvasWrap.addEventListener("contextmenu", (e) => {
      if (this.play.running) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      this.anim.canvasMenu(e);
    }, true);
    document.addEventListener("keydown", (e) => {
      if (this.play.running) {
        if (e.target instanceof HTMLElement && e.target.classList.contains("play-typing")) {
          if (matchKey(e) === "save") {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
          return;
        }
        if (e.key === "Enter" || e.key === "Escape") {
          if (!(e.target instanceof HTMLElement && TYPING_TAGS.has(e.target.tagName))) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.play.key(e.key === "Enter" ? "enter" : "escape");
          }
        } else if (matchKey(e)) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        return;
      }
      if (e.key === "Escape" || matchKey(e)) this.anim.stopOn(e, e.key === "Escape");
    }, true);
    this.gestures = attachInteractions({
      canvas: this.els.canvasWrap,
      view: this.view,
      registry,
      getState: () => this.state,
      setState: (s) => this.setState(s),
      onAction: (a, e) => this.onAction(a, e),
      onMenu: (client, at) => this.openMenuAt(client, at),
      notice: (text18) => showBanner(this.els.banner, text18)
    });
    const params = new URL(location.href).searchParams;
    const t = this.begin();
    await this.loadWithFallback(params.get("proposal") ?? void 0, t);
    const wanted = params.get("screen");
    const target = wanted ? this.screens.find((s) => s.id === wanted && !s.error) : void 0;
    if (target) await this.enterEditor(target.id, t);
    else await this.showStart(t);
    this.flushNotice(t);
    connectWs((m) => this.onWs(m), (c) => this.onConnection(c));
    onPasteImage(() => this.aiTabShowing(), (file) => this.receiveImage(file));
    globalThis.addEventListener("dragover", (e) => e.preventDefault());
    globalThis.addEventListener("drop", (e) => e.preventDefault());
    globalThis.addEventListener("beforeunload", (e) => {
      if (this.state && isDirty(this.state)) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }
  // ---------- loading ----------
  begin() {
    closeMenu();
    this.anim.stop();
    closeFloat();
    this.notice = void 0;
    this.presetEdit = void 0;
    this.defaultEdit = void 0;
    return ++this.nav;
  }
  stale(t) {
    return t !== this.nav;
  }
  /** Shows the pending fallback notice and makes the URL truthful, unless a newer flow began. */
  flushNotice(t) {
    if (this.stale(t) || this.notice === void 0) return;
    showBanner(this.els.banner, this.notice);
    this.notice = void 0;
    this.updateUrl();
  }
  /** Fetches proposal `pid` and applies it; returns false (applying nothing) if `t` went stale. */
  async loadProject(pid, t) {
    const p = await getProject(pid);
    if (this.stale(t)) return false;
    this.applyProject(p);
    return true;
  }
  applyProject(p) {
    if (p.proposal !== this.proposalId) {
      this.state = void 0;
      this.currentId = void 0;
    }
    const waiting = new Set(this.references.filter((r) => r.state === "pending").map((r) => r.id));
    const drawn2 = (p.references ?? []).filter((r) => r.state === "created" && waiting.has(r.id));
    if (drawn2.length && this.notice === void 0) {
      this.notice = drawn2.map((r) => `${r.id} \u304B\u3089 ${r.screen} \u304C\u4F5C\u3089\u308C\u307E\u3057\u305F`).join("\u3001");
    }
    this.project = p.project;
    this.projectHash = p.hash;
    this.screens = p.screens;
    this.themes = p.themes;
    this.proposals = p.proposals;
    this.proposalId = p.proposal;
    this.references = p.references ?? [];
    this.defaults = p.defaults ?? emptyDefaults();
    this.defaultsError = p.defaultsError;
    this.setGuide(p.guide ?? {
      guide: null,
      hash: null
    });
  }
  /** Falls back to the default proposal only when the server says `pid` does not exist (404). */
  async loadWithFallback(pid, t) {
    try {
      return await this.loadProject(pid, t);
    } catch (e) {
      if (pid === void 0 || !(e instanceof HttpError) || e.status !== 404) throw e;
      if (!await this.loadProject(void 0, t)) return false;
      const name = this.proposals.find((x) => x.id === this.proposalId)?.name ?? this.proposalId;
      this.notice = `\u6848 ${pid} \u304C\u898B\u3064\u304B\u3089\u306A\u3044\u306E\u3067 ${name} \u3092\u958B\u304D\u307E\u3057\u305F`;
      return true;
    }
  }
  /**
   * Loads proposal `pid` for flow `t`. False means "stop this flow": it went stale (silently) or
   * the load failed (reason in the banner).
   */
  async tryLoad(pid, what, t) {
    try {
      return await this.loadProject(pid, t);
    } catch (e) {
      if (!this.stale(t)) showBanner(this.els.banner, `${what}: ${errText(e)}`, [], "error");
      return false;
    }
  }
  /** Reloads the current proposal for flow `t`; an unknown one falls back to the default. */
  async loadCurrentProject(t) {
    try {
      return await this.loadWithFallback(this.proposalId, t);
    } catch (e) {
      if (!this.stale(t)) {
        showBanner(this.els.banner, `project.json \u3092\u8AAD\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
      }
      return false;
    }
  }
  /** The kept parts of the other screens of the proposal, in its order, as far as they were read. */
  kept() {
    return keptParts(this.screens.filter((x) => !x.error && x.id !== this.currentId && this.others[x.id] !== void 0).map((x) => ({
      id: x.id,
      title: x.title,
      screen: this.others[x.id]
    })));
  }
  /** What the panels show of the kept parts: when this changes after a read, they are drawn again. */
  keptSignature() {
    return this.kept().map((k) => `${k.screen}/${k.part}/${k.type}/${partLabel(k.el)}/${k.title}`).join("\n");
  }
  /**
   * Reads the other screens of the open proposal (values spec §5.4) for flow `t`; one that cannot
   * be read is left out. The panels are drawn again only when what they show of the kept parts
   * changed, so a read never disturbs an edit in progress.
   */
  async loadOthers(t) {
    const pid = this.proposalId;
    const before = this.keptSignature();
    const read = {};
    await Promise.all(this.screens.filter((x) => !x.error && x.id !== this.currentId).map(async (x) => {
      try {
        const { screen } = await getScreen(x.id, pid);
        read[x.id] = fillScreen(screen, this.project.device, registry, this.defaults.parts);
      } catch (error) {
        if (!(error instanceof Error)) throw error;
      }
    }));
    if (this.stale(t) || this.proposalId !== pid) return;
    this.others = read;
    if (this.keptSignature() !== before && this.mode === "editor") this.renderAll();
  }
  /** List-only refresh (after a save or a change elsewhere): never cancels a navigation, but loses to one. */
  async refreshScreens() {
    const t = this.nav;
    const pid = this.proposalId;
    try {
      const p = await getProject(pid);
      if (!this.stale(t) && this.proposalId === pid) {
        this.applyProject(p);
        void this.loadOthers(t);
      }
    } catch (e) {
      if (!this.stale(t)) {
        showBanner(this.els.banner, `\u753B\u9762\u4E00\u89A7\u3092\u8AAD\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
      }
    }
  }
  async loadScreen(id, t) {
    this.leavePlay(false);
    try {
      const { screen, hash } = await getScreen(id, this.proposalId);
      if (this.stale(t)) return "stale";
      const filled = fillScreen(screen, this.project.device, registry, this.defaults.parts);
      const keep = keptEditing({
        proposal: this.currentProposal,
        screen: this.currentId
      }, {
        proposal: this.proposalId,
        screen: id
      }, this.state?.editing);
      const sameScreen2 = this.currentProposal === this.proposalId && this.currentId === id;
      this.currentId = id;
      this.currentProposal = this.proposalId;
      this.invalidFields = void 0;
      this.collapsed.clear();
      if (!keep) this.anim.forget();
      this.view.entered = void 0;
      if (!sameScreen2) {
        this.view.scrolls = {};
        this.view.row = void 0;
        this.openLists.clear();
      }
      this.gestures?.abandon();
      this.state = createState({
        screen: filled,
        deviceExplicit: screen.device !== void 0,
        project: this.project
      }, hash, this.projectHash);
      if (keep) this.state = setEditing(this.state, keep);
      this.outsideTold = false;
      this.els.start.hidden = true;
      this.els.editor.hidden = false;
      this.view.zoom = fitZoom(this.els.canvasWrap, deviceSize(filled.device));
      hideBanner(this.els.banner);
      this.refreshSystemBanner();
      const unreadable = [
        ...new Set(unreadableMotions(filled))
      ];
      if (unreadable.length > 0 && (this.els.banner.hidden || this.els.banner.dataset.owner === "guide")) {
        showBanner(this.els.banner, `${unreadable.join("\u3001")} \u306E\u52D5\u304D\u304C\u8AAD\u3081\u306A\u3044\u306E\u3067\u65E2\u5B9A\u306E\u52D5\u304D\u3067\u52D5\u304B\u3057\u307E\u3059`);
      }
      this.renderAll();
      void this.loadComponents().then((changed) => changed && this.renderAll());
      void this.loadOthers(t);
      return "ok";
    } catch (e) {
      if (this.stale(t)) return "stale";
      showBanner(this.els.banner, `\u753B\u9762 ${id} \u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
      this.renderAll();
      return "failed";
    }
  }
  async loadStartData() {
    if (!this.templatesLoaded) {
      try {
        this.templates = await getTemplates();
        this.templatesLoaded = true;
      } catch (e) {
        showBanner(this.els.banner, `\u3072\u306A\u5F62\u3092\u8AAD\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
      }
    }
    const wanted = [];
    for (const p of this.proposals) {
      for (const s of p.screens) {
        if (!s.error && !this.contents.has(`${p.id}/${s.id}`)) wanted.push({
          pid: p.id,
          id: s.id
        });
      }
    }
    await Promise.all(wanted.map(async ({ pid, id }) => {
      try {
        this.contents.set(`${pid}/${id}`, (await getScreen(id, pid)).screen);
      } catch {
      }
    }));
  }
  /** Fetches the preset list once (again after `componentsLoaded` was reset). True when it changed. */
  async loadComponents() {
    if (this.componentsLoaded) return false;
    try {
      this.components = await getComponents();
      this.componentsLoaded = true;
      return true;
    } catch (e) {
      showBanner(this.els.banner, `MySet \u3092\u8AAD\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
      return false;
    }
  }
  /** Fetches the saved motions again; the panels are drawn again only when they differ. */
  async refreshSavedMotions() {
    try {
      const motions = await getMotions();
      if (JSON.stringify(motions) === JSON.stringify(this.savedMotions)) return;
      this.savedMotions = motions;
      this.renderAll();
    } catch (e) {
      showBanner(this.els.banner, `\u4FDD\u5B58\u3057\u305F\u52D5\u304D\u3092\u8AAD\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
    }
  }
  async showStart(t = this.begin()) {
    this.leavePlay(false);
    this.mode = "start";
    this.state = void 0;
    this.currentId = void 0;
    this.form = void 0;
    await this.loadStartData();
    if (this.stale(t)) return;
    this.updateUrl();
    this.renderAll();
  }
  /** Re-reads everything the Start page shows (after a create/delete or an external change). */
  async refreshStart(t = this.begin()) {
    this.contents.clear();
    this.templatesLoaded = false;
    if (!await this.loadCurrentProject(t)) return;
    await this.loadStartData();
    if (this.stale(t)) return;
    this.renderAll();
    this.flushNotice(t);
  }
  async enterEditor(id, t = this.begin()) {
    this.mode = "editor";
    this.form = void 0;
    const r = await this.loadScreen(id, t);
    if (r === "stale") return;
    if (r === "failed") {
      await this.showStart(t);
      return;
    }
    this.updateUrl();
  }
  async reload(t = this.begin()) {
    await this.reloadFlow(t);
    this.flushNotice(t);
  }
  async reloadFlow(t) {
    if (!await this.loadCurrentProject(t)) return;
    if (this.mode === "start") {
      await this.refreshStart(t);
      return;
    }
    const gone = this.currentId;
    if (gone && this.screens.some((s) => s.id === gone)) {
      await this.loadScreen(gone, t);
      return;
    }
    const next = this.screens.find((s) => !s.error);
    if (next) {
      if (gone && this.notice === void 0) {
        this.notice = `\u753B\u9762 ${gone} \u306F\u6D88\u3055\u308C\u305F\u306E\u3067 ${next.id} \u3092\u958B\u304D\u307E\u3057\u305F`;
      }
      await this.enterEditor(next.id, t);
    } else {
      this.notice = "\u3053\u306E\u6848\u306B\u306F\u753B\u9762\u304C\u7121\u304F\u306A\u3063\u305F\u306E\u3067 Start \u30DA\u30FC\u30B8\u306B\u623B\u308A\u307E\u3057\u305F\u3002";
      await this.showStart(t);
    }
  }
  updateUrl() {
    const u = new URL(location.href);
    u.searchParams.set("proposal", this.proposalId);
    if (this.mode === "editor" && this.currentId) u.searchParams.set("screen", this.currentId);
    else u.searchParams.delete("screen");
    history.replaceState(null, "", u.toString());
  }
  // ---------- state ----------
  setState(next) {
    if (next !== this.state) {
      closeMenu();
      this.anim.unsample();
      closeFloat();
    }
    const prev = this.state;
    this.state = next;
    if (prev) this.tellOutside(prev, next);
    const row = this.view.row;
    if (row) {
      const list = findById(next.doc.screen.elements, row.list)?.el;
      if (!list || next.selection.length !== 1 || next.selection[0] !== row.list || row.index >= rowCount(list)) this.view.row = void 0;
    }
    if (prev && next !== prev) {
      const added = next.selection.filter((id) => !prev.selection.includes(id));
      if (added.length) {
        this.view.scrolls = revealIn(next.doc.screen.elements, this.view.scrolls, added[added.length - 1], performance.now());
      }
    }
    this.renderAll();
  }
  edit(fn) {
    if (!this.state) return;
    this.setState(fn(beginEdit(this.state)));
  }
  /**
   * Looks at row `index` of the list `list` (list items spec §5.2, §5.3): the list becomes the one
   * part selected, the list (and the boxes around it) is sent so that the row shows, the row is
   * framed and opened in the rows table (`focusText`: with its text field focused).
   */
  focusRow(list, index, focusText = false) {
    if (!this.state) return;
    this.view.row = {
      list,
      index
    };
    this.view.scrolls = revealRow(this.state.doc.screen.elements, this.view.scrolls, list, index, performance.now());
    this.rowFocus = focusText;
    const sole = this.state.selection.length === 1 && this.state.selection[0] === list;
    if (sole) this.renderAll();
    else this.setState(select(this.state, [
      list
    ]));
    this.rowFocus = false;
  }
  /** Ctrl+Z / Ctrl+Y and the header's buttons: the open block folds (its place may hold another). */
  undoRedo(fn) {
    if (!this.state || this.libraryEdit) return;
    this.anim.foldBlocks();
    this.setState(fn(this.state));
  }
  /**
   * Spec §5.3: the first edit of a part outside the owner after a state was shown says once that it
   * goes into every state.
   */
  tellOutside(prev, next) {
    if (JSON.stringify(prev.editing) !== JSON.stringify(next.editing)) this.outsideTold = false;
    if (this.outsideTold || !editedOutside(prev, next)) return;
    this.outsideTold = true;
    const owner = findById(next.doc.screen.elements, next.editing?.owner ?? "")?.el;
    showBanner(this.els.banner, `${owner ? treeLabel(owner, false) : "\u7BB1"} \u306E\u5916\u306E\u90E8\u54C1\u3067\u3059\u3002\u5168\u90E8\u306E State \u306B\u5165\u308A\u307E\u3059`);
  }
  /**
   * The strip over the canvas: the state that is shown for editing (spec §5.2), or, while ▶ runs,
   * the state that is playing, with 止める (motion spec §5.2).
   */
  renderBadge() {
    const node = this.els.badge;
    clear(node);
    const s = this.state;
    const run = this.play.run;
    node.classList.toggle("is-run", run !== void 0);
    this.badgeScreen = run?.current;
    if (run && this.mode === "editor") {
      node.hidden = false;
      node.classList.remove("is-playing");
      const title = this.screens.find((x) => x.id === run.current)?.title ?? run.current;
      node.append(el("span", {
        class: "badge-text"
      }, `\u518D\u751F\u4E2D \xB7 ${title}`), el("button", {
        class: "btn",
        onclick: () => this.leavePlay()
      }, "\u7DE8\u96C6\u306B\u623B\u308B"));
      return;
    }
    if (this.libraryEdit) {
      node.hidden = false;
      node.classList.remove("is-playing");
      if (this.presetEdit) {
        node.append(el("span", {
          class: "badge-text"
        }, presetBadgeText(this.presetEdit)));
      } else if (this.defaultEdit) {
        node.append(el("span", {
          class: "badge-text"
        }, defaultBadgeText(this.defaultEdit.type)));
      }
      return;
    }
    const strip = this.anim.strip();
    const shown2 = s?.editing;
    node.hidden = !s || !strip && !shown2 || this.mode !== "editor";
    node.classList.toggle("is-playing", strip !== void 0);
    if (strip) {
      node.append(el("span", {
        class: "badge-text"
      }, strip.text), el("button", {
        class: "btn",
        onclick: () => strip.stop()
      }, "\u6B62\u3081\u308B"));
      return;
    }
    if (!s || !shown2) return;
    node.append(el("span", {
      class: "badge-text"
    }, `${stateText(s, shown2.owner, shown2.state)}\u3092\u7DE8\u96C6\u4E2D`), el("button", {
      class: "btn",
      onclick: () => this.state && this.setState(setEditing(this.state, void 0))
    }, "\u6700\u521D\u306E State \u3078"));
  }
  // ---------- motion (motion spec §5.2, §5.3) ----------
  /** The theme the canvas is drawn in: its tone is the tone of every motion. */
  theme() {
    return themeOrDefault(this.themes, this.state?.doc.project.theme ?? "");
  }
  /** The canvas with `playing` in place of the document's parts (undefined = the document). */
  showPlaying(playing) {
    this.view.playing = playing;
    if (this.state && this.mode === "editor") {
      renderCanvas(this.els.canvas, this.shown(this.state), this.view, registry, this.themes);
    }
    this.placeTyping();
  }
  typingScreen;
  placeTyping() {
    if (this.typing.id === void 0) return;
    if (this.play.run?.current !== this.typingScreen) this.typing.close();
    else this.typing.place();
  }
  // ---------- 再生 (triggers spec §4, §5.2) ----------
  /**
   * ▶ 再生: every screen of the proposal as written (the open one with its unsaved edits), the run
   * begins on the open screen in its first look. Screens that cannot be read are left out (a go to
   * them does nothing).
   */
  async enterPlay() {
    if (!this.state || this.play.running || !this.currentId) return;
    const screens = await this.readScreens();
    if (!screens || !this.currentId) return;
    this.gestures?.abandon();
    closeMenu();
    closeFloat();
    this.anim.stop();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    try {
      this.play.start(screens, this.currentId);
    } catch (error) {
      this.playFailed(error);
    }
    if (!this.play.running) return;
    document.body.classList.add("is-run");
    $("play-note").hidden = false;
    for (const node of this.leftPanels()) node.inert = true;
    this.renderAll();
  }
  /**
   * Every screen of the proposal as written, the open one with its unsaved edits; screens that cannot
   * be read are left out (a go to them does nothing). Undefined when another flow began meanwhile.
   */
  async readScreens() {
    const t = this.nav;
    const screens = {};
    const device = this.project.device;
    await Promise.all(this.screens.filter((x) => !x.error).map(async (x) => {
      if (x.id === this.currentId) return;
      try {
        const { screen } = await getScreen(x.id, this.proposalId);
        screens[x.id] = fillScreen(screen, device, registry, this.defaults.parts);
      } catch (error) {
        if (!(error instanceof Error)) throw error;
      }
    }));
    if (this.stale(t) || !this.state || !this.currentId) return void 0;
    screens[this.currentId] = written2(this.state.doc);
    return screens;
  }
  /** The sections of the left panel, which take no input while 再生 runs. */
  leftPanels() {
    return [
      this.els.treeSection,
      this.els.elementsSection,
      this.els.dynamicSection
    ];
  }
  /** 編集: the run ends and every screen is its first look again; nothing of it remains. */
  leavePlay(render = true) {
    if (!this.play.running) return;
    this.endPlay();
    if (render) this.renderAll();
  }
  /** A frame or the start threw: back to editing, with a one-line notice. */
  playFailed(error) {
    console.error(error);
    this.endPlay();
    this.renderAll();
    showBanner(this.els.banner, "\u518D\u751F\u3092\u7D9A\u3051\u3089\u308C\u306A\u304F\u306A\u3063\u305F\u306E\u3067\u3001\u7DE8\u96C6\u306B\u623B\u308A\u307E\u3057\u305F\u3002", [], "error");
  }
  /** Stops the run and takes back what it put on the page (also after a frame threw). */
  endPlay() {
    this.typing.close();
    this.play.stop();
    this.pressing = void 0;
    this.sliding = void 0;
    this.pressSeq++;
    document.body.classList.remove("is-run");
    $("play-note").hidden = true;
    for (const node of this.leftPanels()) node.inert = false;
  }
  /** One moment of the run onto the canvas; `undefined` = the document is drawn again. */
  drawPlay(shot) {
    this.showPlaying(shot ? playingOf(shot) : void 0);
  }
  /** The part under the pointer in the run's frame, and the pointer's place inside it. */
  /** The device point under the pointer on the top screen's frame; undefined with no frame drawn. */
  playPoint(e) {
    const fr = this.els.canvas.querySelector(".wf-frame:not(.wf-under)")?.getBoundingClientRect();
    return fr ? clientToFrame({
      x: e.clientX,
      y: e.clientY
    }, fr, this.view.zoom) : void 0;
  }
  playHit(e) {
    const point = this.playPoint(e);
    if (!point) return void 0;
    const elements = this.play.elements();
    const scrolls = this.play.scrollsOf();
    const id = partsAt(elements, point, scrolls)[0];
    if (id === void 0) return void 0;
    const el2 = findById(elements, id)?.el;
    if (!el2) return void 0;
    const at = absoluteOffset(elements, id, scrolls);
    const place3 = placeIn(el2, point.x - at.x, point.y - at.y, scrollOf(scrolls, id));
    const check = checkIn(el2, point.x - at.x, point.y - at.y, scrollOf(scrolls, id));
    return {
      id,
      point,
      ...place3 !== void 0 ? {
        place: place3
      } : {},
      ...check !== void 0 ? {
        check
      } : {}
    };
  }
  /** The press going on during 再生 (scroll spec §4.2), from the pointer down to its release. */
  pressing;
  /** Bumped on every down and up: a hold timer of an earlier press does nothing (gesture spec §4.1). */
  pressSeq = 0;
  /** The screen the run was on at the down: a gesture outlived by its screen (a timer went) does nothing. */
  pressScreen;
  /** The distance that is all the way for the swipe going on (gesture spec §4.4). */
  swipeDistance = 0;
  /**
   * A drag on a slider going on (spec §4): its id, the value it held at the down, its left edge on
   * the screen, whether the pointer went past the slop, and where it went down.
   */
  sliding;
  /** Down: the part looks pressed; the press itself waits for the release; hold lengths start counting (gesture spec §4.1). */
  playDown(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.button !== 0 || this.pressing) return;
    const now = performance.now();
    const seq = ++this.pressSeq;
    this.pressScreen = this.play.run?.current;
    const hit = this.playHit(e);
    if (!hit) {
      const point = this.playPoint(e);
      const played = this.play.run;
      const device = played ? deviceSize(played.screens[played.current].device) : void 0;
      const inside = point && device && point.x >= 0 && point.y >= 0 && point.x < device.w && point.y < device.h;
      this.pressing = inside ? beginPress(void 0, point, now) : void 0;
      this.typing.close();
      return;
    }
    const holds2 = this.play.holdTimes(hit.id);
    this.pressing = beginPress(hit, hit.point, now, holds2);
    for (const ms of holds2) setTimeout(() => seq === this.pressSeq && this.playHeld(ms), ms);
    this.play.pressDown(hit.id);
    const el2 = findById(this.play.elements(), hit.id)?.el;
    if (el2?.type === "slider" && this.play.running) {
      const left = absoluteOffset(this.play.elements(), hit.id, this.play.scrollsOf()).x;
      const before = Number(this.play.valueOf(hit.id));
      this.sliding = {
        id: hit.id,
        before,
        left,
        moved: false,
        start: hit.point
      };
      this.play.slideAt(hit.id, sliderValueAt(el2, hit.point.x - left));
      this.typing.close();
      return;
    }
    if (el2?.type !== "input" || el2.id !== this.typing.id) this.typing.close();
  }
  /** A hold length passed (gesture spec §4.1): the hold blocks of that length fire; the press is off. */
  playHeld(ms) {
    const g = this.pressing;
    if (!g || !this.play.running || g.mode !== "pending" && g.mode !== "held") return;
    if (this.play.run?.current !== this.pressScreen) {
      this.pressing = {
        mode: "moved"
      };
      return;
    }
    const r = holdsDue(g, Math.max(performance.now(), g.since + ms));
    this.pressing = r.gesture;
    if (r.gesture.mode !== "held") return;
    for (const ms2 of r.fire) this.play.holdAt(r.gesture.id, r.gesture.place, ms2);
  }
  /** Move: past the slop the press becomes a scroll, a swipe (gesture spec §4.3) or nothing. */
  playMove(e) {
    const sl = this.sliding;
    if (sl) {
      const point2 = this.playPoint(e);
      if (!point2 || this.play.run?.current !== this.pressScreen) return;
      if (!sl.moved && Math.hypot(point2.x - sl.start.x, point2.y - sl.start.y) >= DRAG_SLOP) {
        sl.moved = true;
        this.pressing = {
          mode: "moved"
        };
        this.play.release();
      }
      const el2 = findById(this.play.elements(), sl.id)?.el;
      if (el2?.type === "slider") this.play.slideAt(sl.id, sliderValueAt(el2, point2.x - sl.left));
      return;
    }
    const g = this.pressing;
    if (!g) {
      this.play.hoverAt(this.playHit(e)?.id, e.pointerType !== "touch");
      return;
    }
    const point = this.playPoint(e);
    if (!point) return;
    if (g.mode === "swipe" && !this.play.following) {
      this.pressing = {
        mode: "moved"
      };
      return;
    }
    const from = g.mode === "pending" ? g : void 0;
    const r = movePress(g, point, this.play.elements(), this.play.scrollsOf(), performance.now(), (owner, dir) => this.play.swipeTakes(owner, dir, from?.id, from?.place));
    this.pressing = r.gesture;
    if (r.gesture.mode !== "pending" && g.mode === "pending") {
      this.play.release();
      if (this.play.run?.current !== this.pressScreen) {
        this.pressing = {
          mode: "moved"
        };
        return;
      }
    }
    if (r.gesture.mode === "swipe" && r.swipe) {
      if (g.mode === "pending") {
        const s = r.gesture;
        this.swipeDistance = this.play.swipeBegin(s.owner, s.dir, s.hit, s.place);
      }
      this.play.swipeTo(swipeProgress(r.swipe.along, this.swipeDistance));
    }
    if (r.scroll) {
      this.playScrolled(r.scroll.box, () => this.play.scrollTo(r.scroll.box, r.scroll.axis, r.scroll.to));
    }
    if (r.gesture.mode === "pending" || r.gesture.mode === "swipe") {
      this.play.hoverAt(this.playHit(e)?.id, e.pointerType !== "touch");
    }
  }
  /** Up: a swipe goes all the way or back; a press that never moved is 「押す」 (an input takes the keyboard); hover catches up. */
  playUp(e, released) {
    this.pressSeq++;
    const g = this.pressing;
    this.pressing = void 0;
    const sl = this.sliding;
    this.sliding = void 0;
    if (sl) {
      if (this.play.run?.current === this.pressScreen) {
        const tap = released && !sl.moved && g?.mode === "pending";
        if (!tap) this.play.release();
        this.play.slideEnd(sl.id, sl.before, tap);
      } else this.play.release();
      this.catchUpHover(e);
      return;
    }
    if (!g) {
      this.catchUpHover(e);
      return;
    }
    if (g.mode === "swipe") {
      if (this.play.following) {
        this.play.swipeEnd(released && swipeEnds(g, performance.now(), this.swipeDistance) === "complete");
      }
    } else {
      const press = released ? endPress(g) : void 0;
      if (press) {
        if (press.check !== void 0) this.play.checkAt(press.id, press.check);
        else this.play.pressAt(press.id, press.place);
        const input = this.play.running && press.check === void 0 ? findById(this.play.elements(), press.id)?.el : void 0;
        if (input && takesTyping(input)) {
          const text18 = typeof input.props.value === "string" ? input.props.value : "";
          this.typingScreen = this.play.run?.current;
          this.typing.open(input.id, text18, input.props.multiline === true);
        }
      }
    }
    this.catchUpHover(e);
  }
  /** After an up, hover catches up with what is under the pointer (nothing off the canvas). */
  catchUpHover(e) {
    if (!this.play.running) return;
    const over = e.target?.closest?.("#canvas-wrap") ? this.playHit(e) : void 0;
    this.play.hoverAt(over?.id, e.pointerType !== "touch");
  }
  /**
   * A wheel during 再生 (scroll spec §4.1): the innermost box under the pointer that can still move
   * that way takes it. Over the device frame the wheel is the design's alone, taken or not: the
   * canvas around it scrolls only from the grey margin outside the frame.
   */
  playWheel(e) {
    const point = this.playPoint(e);
    if (!point || !this.state) return;
    const device = deviceSize(this.state.doc.screen.device);
    if (point.x >= 0 && point.y >= 0 && point.x < device.w && point.y < device.h) {
      e.preventDefault();
    }
    const hit = this.playHit(e);
    if (!hit) return;
    const elements = this.play.elements();
    const step2 = wheelStep(e, this.view.zoom, device);
    const target = pickScrollTarget(elements, this.play.scrollsOf(), hit.id, step2.dx, step2.dy);
    if (!target) return;
    this.playScrolled(target.id, () => this.play.scrollBy(target.id, step2));
  }
  /** A box is sent (`send`); typing into an input inside it ends first (scroll spec §4.7). */
  playScrolled(box7, send) {
    const typed = this.typing.id;
    if (typed !== void 0 && pathTo(this.play.elements(), typed).some((el2) => el2.id === box7)) {
      this.typing.close();
    }
    send();
  }
  playRowsNow() {
    const run = this.play.run;
    if (!run || this.mode !== "editor") return void 0;
    return playRows(run, (id) => this.screens.find((x) => x.id === id)?.title ?? id, this.play.changedAt, browserClock.now(), {
      registry,
      changedAt: this.play.valueChangedAt,
      order: this.screens.map((x) => x.id)
    });
  }
  /** What waits counts down: only the times change, the panel is not rebuilt. */
  countPlayPanel() {
    const rows2 = this.playRowsNow();
    if (rows2 && !updateLeft(this.els.props, rows2)) this.renderPlayPanel();
  }
  /** The right panel while the run goes: drawn on its own when the run moves on. */
  renderPlayPanel() {
    const rows2 = this.playRowsNow();
    if (!rows2) return;
    renderPlayPanel(this.els.props, rows2, () => {
      this.typing.close();
      this.play.restart();
    });
    clear(this.els.themes);
  }
  /**
   * renderCanvas clears and rebuilds #canvas on every call, which can remove a focused
   * .wf-inline input still open from interact.ts's inline editor. Removing a focused element
   * fires "blur" synchronously, and that handler commits the edit through setState — i.e. a
   * *nested* renderAll call while this one is still on the stack. Running that nested render
   * immediately would let it finish (with the commit applied) only for the still-executing outer
   * call to then overwrite the canvas again with the state it captured before the commit. Instead,
   * a nested call just records that another pass is needed; it runs once the outer one returns, so
   * only the final, consistent state ever reaches the screen.
   */
  renderAll() {
    if (this.rendering) {
      this.renderPending = true;
      return;
    }
    this.rendering = true;
    try {
      this.doRenderAll();
    } finally {
      this.rendering = false;
    }
    if (this.renderPending) {
      this.renderPending = false;
      this.renderAll();
    }
  }
  doRenderAll() {
    this.dynamicHover.close();
    this.renderHeaderBar();
    const start = this.mode === "start";
    this.els.start.hidden = !start;
    this.els.editor.hidden = start;
    if (start) {
      renderStart(this.els.startNav, this.els.startMain, {
        tab: this.startTab,
        templatesTab: this.templatesTab,
        project: this.project,
        proposals: this.proposals,
        themes: this.themes,
        registry,
        defaults: this.defaults.parts,
        templates: this.templates,
        contents: this.contents,
        form: this.form,
        references: this.references,
        importForm: this.importForm,
        onTab: (tab) => {
          this.startTab = tab;
          this.renderAll();
        },
        onTemplatesTab: (tab) => {
          this.templatesTab = tab;
          this.form = void 0;
          this.closeImportForm();
          this.renderAll();
        },
        onOpenScreen: (pid, id) => this.openScreen(pid, id),
        onDuplicateProposal: (pid) => this.duplicateProposal(pid),
        onDeleteProposal: (pid) => this.deleteProposal(pid),
        onPick: (from, fromTitle, fromDevice, proposalId) => this.pickTemplate(from, fromTitle, fromDevice, proposalId),
        onFormChange: (patch) => this.changeForm(patch),
        onCreate: () => this.createFromForm(),
        onCancelForm: () => {
          this.form = void 0;
          this.renderAll();
        },
        onDeleteTemplate: (id) => this.deleteCustomTemplate(id),
        onImage: (file) => this.receiveImage(file),
        onImportChange: (patch) => this.changeImportForm(patch),
        onImport: () => this.submitImport(),
        onCancelImport: () => {
          this.closeImportForm();
          this.renderAll();
        },
        onDeleteReference: (id) => this.deleteReferenceCard(id)
      });
      this.afterRender();
      return;
    }
    this.anim.unsample();
    document.body.classList.toggle("is-building", this.state !== void 0 && !this.play.running && this.anim.builderOpen);
    this.renderLeft();
    this.renderBadge();
    if (this.state && this.play.running) {
      renderCanvas(this.els.canvas, this.shown(this.state), this.view, registry, this.themes);
      this.placeTyping();
      this.renderPlayPanel();
    } else if (this.state && this.presetEdit) {
      this.renderPresetEdit(this.state, this.presetEdit);
    } else if (this.state && this.defaultEdit) {
      this.renderDefaultEdit(this.state, this.defaultEdit);
    } else if (this.state && this.anim.builderOpen) {
      renderCanvas(this.els.canvas, this.shown(this.state), this.view, registry, this.themes);
      const anchor = renderMovement(this.els.props, this.anim.builderUi());
      clear(this.els.themes);
      this.anim.sampleBuilder(anchor);
    } else if (this.state) {
      renderCanvas(this.els.canvas, this.shown(this.state), this.view, registry, this.themes);
      const picked = selectedElements(this.state);
      const one = picked.length === 1 ? picked[0] : void 0;
      const linked = one ? linkedOf(one, written2(this.state.doc), this.components, registry) : void 0;
      renderProps(this.els.props, this.state, registry, {
        myset: one && linked ? {
          linked,
          onPush: () => this.pushPreset(one.id),
          onEdit: () => linked.entry && this.editPreset(linked.entry),
          onDetach: () => this.edit((s) => detachPreset(s, one.id, this.defaults.parts, registry)),
          onReset: (item) => linked.filled && this.edit((s) => resetItem(s, one.id, item, linked.filled))
        } : void 0,
        edit: (fn) => this.edit(fn),
        show: (fn) => this.state && this.setState(fn(this.state)),
        motion: this.anim.motionUi(),
        blocks: (owner) => this.anim.blockUi(owner),
        onStateMenu: (owner, state, client) => openMenu(client, [
          {
            action: "delete",
            label: "\u524A\u9664",
            enabled: true
          }
        ], () => this.edit((s) => this.withoutStrayBlocks(removeStateFrom(s, owner, state), true))),
        errors: this.invalidFields,
        kept: this.kept(),
        row: this.view.row ? {
          ...this.view.row,
          focusText: this.rowFocus
        } : void 0,
        onFocusRow: (list, index, focusText) => this.focusRow(list, index, focusText),
        onSaveTemplate: () => this.saveAsTemplate(),
        onDeleteScreen: () => this.deleteCurrentScreen(),
        onSavePreset: () => this.savePreset(),
        notice: (text18) => showBanner(this.els.banner, text18)
      });
      renderThemes(this.els.themes, this.themes, this.state.doc.project.theme, (id) => {
        this.edit((s) => setTheme(s, id));
        hideBanner(this.els.banner);
        this.refreshSystemBanner();
      });
    } else {
      clear(this.els.canvas);
      clear(this.els.props);
      clear(this.els.themes);
    }
    this.afterRender();
  }
  /** Both views: the notice comes back once another banner has gone; a screen switch re-decides the guide's frames. */
  afterRender() {
    if (this.els.banner.hidden && this.guide.guide !== null) this.refreshSystemBanner();
    if (this.guideRun.open) this.drawGuide();
    else this.guideLayer.reposition();
  }
  renderHeaderBar() {
    const device = this.state?.doc.screen.device;
    let screenLabel;
    if (this.state && device !== void 0) {
      const size = deviceSize(device);
      const label = typeof device === "string" ? `${device} ${size.w}\xD7${size.h}` : `${size.w}\xD7${size.h}`;
      screenLabel = `${this.state.doc.screen.title} [${label}]`;
    }
    renderHeader(this.els.header, {
      mode: this.mode,
      projectName: this.project?.name ?? "",
      connected: this.connected,
      dirty: this.state !== void 0 && isDirty(this.state),
      canUndo: (this.state?.history.length ?? 0) > 0,
      canRedo: (this.state?.future.length ?? 0) > 0,
      zoom: this.view.zoom,
      proposals: this.proposals,
      proposalId: this.proposalId,
      screens: this.screens,
      screenId: this.currentId,
      screenLabel,
      playing: this.play.running,
      onPlay: () => void this.enterPlay(),
      onEdit: () => this.leavePlay(),
      onHome: () => this.goHome(),
      onSave: () => this.save(),
      onUndo: () => this.undoRedo(undo),
      onRedo: () => this.undoRedo(redo),
      onZoomFit: () => this.zoom("fit"),
      onZoom100: () => this.zoom(1),
      onSelectProposal: (id) => this.switchProposal(id),
      onDuplicateProposal: () => this.duplicateProposal(this.proposalId),
      onSelectScreen: (id) => this.switchScreen(id),
      guide: this.guide.guide ? {
        text: guideButtonText(this.guideN, this.progress()),
        title: this.guide.guide.title,
        onClick: () => this.guideRun.open ? this.closeGuide() : this.openGuide(startStep(this.guideN, this.progress()))
      } : void 0
    });
  }
  /** Left column: the collapsible Select, Elements and Dynamic Elements sections. */
  renderLeft() {
    const section = (container, key, label, body) => {
      clear(container);
      const open = this.leftSections[key];
      container.append(tagged(el("div", {
        class: "panel-title tree-section-title",
        onclick: () => {
          this.leftSections[key] = !open;
          this.renderAll();
        }
      }, `${open ? OPEN : CLOSED} ${label}`), guideTag.section(key)));
      if (!open) return;
      const inner = el("div");
      container.append(inner);
      body(inner);
    };
    section(this.els.treeSection, "select", "Select", (c) => {
      if (!this.state) return;
      const state = this.state;
      const elements = state.doc.screen.elements;
      const holds2 = (type) => registry.get(type)?.allowsChildren === true;
      renderTree(c, {
        screen: state.doc.screen,
        selection: state.selection,
        collapsed: this.collapsed,
        isContainer: holds2,
        onSelect: (id, additive) => this.setState(additive ? toggleSelect(state, id) : select(state, [
          id
        ])),
        onRoot: () => this.setState(select(state, [])),
        onToggle: (id) => {
          if (this.collapsed.has(id)) this.collapsed.delete(id);
          else this.collapsed.add(id);
          this.renderAll();
        },
        onToggleLock: (id) => {
          const on = findById(elements, id)?.el.locked === true;
          this.edit((st) => setLocked(st, [
            id
          ], !on));
        },
        stateOnly: stateOnlyIds(state),
        onToggleHidden: (id) => {
          const on = findById(elements, id)?.el.hidden === true;
          this.edit((st) => setHidden(st, [
            id
          ], !on));
        },
        // A selected row takes the whole selection with it (outermost parts only); any other row
        // moves alone. With a locked part in what would move, nothing drags.
        dragIds: (id) => rowDragIds(elements, state.selection, id),
        canDrop: (ids, parent) => canDrop(elements, ids, parent, holds2),
        onMove: (ids, parent, index) => {
          if (parent !== void 0) this.collapsed.delete(parent);
          const into = parent === void 0 ? void 0 : findById(elements, parent)?.el;
          const dropped = into && layoutOf(into) ? positionRowsOf(written2(state.doc), ids) : 0;
          this.edit((st) => moveInTree(st, ids, parent, index, registry));
          if (into && dropped > 0) showBanner(this.els.banner, positionRowsNotice(into));
        },
        openLists: this.openLists,
        kept: this.kept(),
        focusedRow: this.view.row,
        onToggleList: (id) => {
          if (this.openLists.has(id)) this.openLists.delete(id);
          else this.openLists.add(id);
          this.renderAll();
        },
        onSelectRow: (id, index) => this.focusRow(id, index),
        // Right click on a row: select it first unless it is already selected; Root clears. Not
        // in the middle of a canvas gesture: nothing runs until it ends.
        onMenu: (id, client) => {
          if (this.gestures?.busy()) return;
          if (id === void 0) this.setState(select(state, []));
          else if (!state.selection.includes(id)) this.setState(select(state, [
            id
          ]));
          this.openMenuAt(client);
        }
      });
    });
    section(this.els.elementsSection, "elements", "Elements", (c) => renderElements(c, {
      registry,
      expanded: this.expandedTypes,
      components: this.components,
      defaults: this.defaults.parts,
      onToggle: (type) => {
        if (this.expandedTypes.has(type)) this.expandedTypes.delete(type);
        else this.expandedTypes.add(type);
        this.renderAll();
      },
      onAdd: (type) => this.addAtVisibleCenter(type),
      onAddPreset: (entry) => this.addPresetAtVisibleCenter(entry),
      onDeletePreset: (entry) => this.deletePreset(entry),
      onMenuPreset: (entry, client) => openMenu(client, [
        {
          label: "\u76F4\u3059",
          action: "preset-edit",
          enabled: true
        },
        {
          label: "\u540D\u524D\u3092\u5909\u3048\u308B",
          action: "preset-rename",
          enabled: true
        },
        {
          label: "\u6D88\u3059",
          action: "preset-delete",
          enabled: true
        }
      ], (a) => {
        if (a === "preset-edit") this.editPreset(entry);
        else if (a === "preset-rename") void this.renamePreset(entry);
        else if (a === "preset-delete") void this.deletePreset(entry);
      }),
      onHover: (what, row, pressed) => this.hoverElement(what, row, pressed),
      onMenuDefault: (type, client) => openMenu(client, defaultMenu(this.defaults.parts[type] !== void 0), (a) => {
        if (a === "default-edit") this.editDefault(type);
        else if (a === "default-reset") void this.resetDefault(type);
      })
    }));
    section(this.els.dynamicSection, "dynamic", "Boxes with States", (c) => renderDynamic(c, {
      stated: this.state ? builtinPresets(deviceSize(this.state.doc.screen.device)) : [],
      onAddStated: (id) => this.addStated(id),
      onHover: (id, row, pressed) => this.hoverDynamic(id, row, pressed)
    }));
  }
  /**
   * The system banners in one chain (guide spec §5.1): theme → defaults → guide error → guide
   * notice. Other banners (saves, 反映, edit modes) own the slot while they show; the notice yields
   * to them and comes back when they hide. §8: an unknown project theme draws as clean but warns.
   */
  refreshSystemBanner() {
    const b = this.els.banner;
    const owner = b.dataset.owner;
    const otherShowing = !b.hidden && owner !== "system" && owner !== "guide";
    const theme = this.state?.doc.project.theme ?? this.project?.theme;
    const stored = this.storedGuide();
    const pick2 = bannerChoice({
      themeMissing: theme !== void 0 && !findTheme(this.themes, theme),
      defaultsError: this.defaultsError !== void 0,
      guideError: this.guide.error !== void 0,
      guideNotice: this.guide.guide !== null && stored?.hash !== this.guide.hash,
      otherShowing
    });
    if (pick2 === "theme") {
      showBanner(b, `\u30C6\u30FC\u30DE "${theme}" \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002"clean" \u3067\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002`);
    } else if (pick2 === "defaults") {
      showBanner(b, "library/defaults.json \u304C\u8AAD\u3081\u307E\u305B\u3093", [], "error");
    } else if (pick2 === "guide-error") {
      showBanner(b, "library/guide.json \u304C\u8AAD\u3081\u307E\u305B\u3093", [], "error");
    } else if (pick2 === "guide-notice") {
      const g = this.guide.guide, hash = this.guide.hash, n = g.steps.length;
      showBanner(b, guideBannerText(g.title, n, isNewGuide(hash, stored)), [
        {
          label: "\u59CB\u3081\u308B",
          onClick: () => {
            writeStored(localStorage, this.guideName, {
              hash,
              step: 1,
              done: false
            });
            this.openGuide(1);
          }
        },
        {
          label: "\u3042\u3068\u3067",
          onClick: () => {
            writeStored(localStorage, this.guideName, {
              hash,
              step: 0,
              done: false
            });
            this.renderHeaderBar();
            this.refreshSystemBanner();
          }
        }
      ]);
    } else if (otherShowing) {
      return;
    } else {
      hideBanner(b);
    }
    if (pick2 !== void 0) b.dataset.owner = pick2 === "guide-notice" ? "guide" : "system";
  }
  /** After a guide change: refresh only when the slot is free or ours, so a 反映しました / 409 banner is not overwritten. */
  refreshGuideBanner() {
    const b = this.els.banner;
    if (b.hidden || b.dataset.owner === "system" || b.dataset.owner === "guide") {
      this.refreshSystemBanner();
    }
  }
  // ---------- the guide (guide spec §5) ----------
  get guideName() {
    return this.project?.name ?? "";
  }
  get guideN() {
    return this.guide.guide?.steps.length ?? 0;
  }
  storedGuide() {
    return readStored(localStorage, this.guideName);
  }
  progress() {
    return progressFor(this.storedGuide(), this.guide.hash);
  }
  /** A new answer from the server: a guide that changed or broke closes the run; a removed one forgets its progress. */
  setGuide(next) {
    const change = classifyAnswer(this.guide, next);
    this.guide = next;
    if (change === "none") return;
    if (this.guideRun.open) this.closeGuide();
    if (change === "removed") clearStored(localStorage, this.guideName);
    this.renderHeaderBar();
    this.refreshGuideBanner();
  }
  openGuide(k) {
    this.guideRun = {
      step: k,
      open: true
    };
    this.guideScreen = this.play.run?.current;
    writeStored(localStorage, this.guideName, {
      hash: this.guide.hash,
      step: k,
      done: false
    });
    this.renderHeaderBar();
    this.refreshGuideBanner();
    this.drawGuide();
  }
  closeGuide() {
    this.guideRun = {
      ...this.guideRun,
      open: false
    };
    this.guideLayer.hide();
    this.renderHeaderBar();
  }
  saveGuideStep() {
    writeStored(localStorage, this.guideName, {
      hash: this.guide.hash,
      step: this.guideRun.step,
      done: false
    });
  }
  guideNext() {
    this.guideRun = nextStep(this.guideRun, this.guideN);
    this.saveGuideStep();
    this.renderHeaderBar();
    this.drawGuide();
  }
  guidePrev() {
    this.guideRun = prevStep(this.guideRun);
    this.saveGuideStep();
    this.renderHeaderBar();
    this.drawGuide();
  }
  guideRestart() {
    this.openGuide(1);
  }
  guideFinish() {
    writeStored(localStorage, this.guideName, {
      hash: this.guide.hash,
      step: this.guideN + 1,
      done: true
    });
    this.closeGuide();
  }
  guideTitles() {
    return {
      proposalName: (id) => this.proposals.find((p) => p.id === id)?.name,
      screenTitle: (pid, id) => this.proposals.find((p) => p.id === pid)?.screens.find((x) => x.id === id)?.title
    };
  }
  /** The guide only reads the screen: no screen switch, selection, play or undo step comes from here. */
  drawGuide() {
    const g = this.guide.guide;
    if (!this.guideRun.open || !g) {
      this.guideLayer.hide();
      return;
    }
    const n = this.guideN, k = this.guideRun.step;
    const fallback = this.mode === "start" ? this.els.startMain : this.els.canvasWrap;
    const common = {
      onBack: () => this.guidePrev(),
      onNext: () => this.guideNext(),
      onClose: () => this.closeGuide(),
      onRestart: () => this.guideRestart(),
      onFinish: () => this.guideFinish(),
      fallback
    };
    if (k === n + 1) {
      this.guideLayer.show({
        frames: {
          looks: []
        },
        bubble: {
          counter: `${n} / ${n}`,
          end: true,
          backDisabled: false
        },
        ...common
      });
      return;
    }
    const step2 = g.steps[k - 1];
    const here = {
      start: this.mode === "start",
      proposalId: this.proposalId,
      screenId: this.mode === "start" ? void 0 : this.play.run?.current ?? this.currentId
    };
    const f = stepFrames(step2, here, this.guideTitles());
    const t = bubbleText(step2, k, n);
    this.guideLayer.show({
      frames: f,
      bubble: {
        counter: t.counter,
        pre: f.pre,
        do: t.do,
        see: t.see,
        end: false,
        backDisabled: k === 1
      },
      ...common
    });
  }
  zoom(z) {
    if (!this.state) return;
    this.view.zoom = z === "fit" ? fitZoom(this.els.canvasWrap, deviceSize(this.state.doc.screen.device)) : z;
    this.renderAll();
  }
  /** §5.2 "追加": places the new part at the centre of the visible canvas, not the device centre. */
  addAtVisibleCenter(type) {
    if (this.state) this.edit((s) => this.addedAtVisibleCenter(s, type));
  }
  /** `s` with a part of `type` added at the centre of the visible canvas (a fab: bottom-right; a side nav: top-left). */
  addedAtVisibleCenter(s, type) {
    const device = deviceSize(s.doc.screen.device);
    const layer = this.defaults.parts;
    const base = fillElement({
      id: "_probe",
      type,
      x: 0,
      y: 0
    }, device, registry, void 0, layer);
    const center = this.visibleCenter() ?? {
      x: device.w / 2,
      y: device.h / 2
    };
    const at = {
      x: center.x - base.w / 2,
      y: center.y - base.h / 2
    };
    return addElement(s, type, registry, at, layer);
  }
  /** Adds a registered part (MySet) at the centre of the visible canvas, with fresh ids. */
  addPresetAtVisibleCenter(entry) {
    const preset = entry.component;
    if (!this.state || !preset) return;
    this.edit((s) => this.withoutStrayBlocks(this.presetAtVisibleCenter(s, preset)));
  }
  /** `s` with the MySet `preset` added at the centre of the visible canvas. */
  presetAtVisibleCenter(s, preset) {
    const device = deviceSize(s.doc.screen.device);
    const size = presetSize(preset, s, registry);
    const center = this.visibleCenter() ?? {
      x: device.w / 2,
      y: device.h / 2
    };
    const at = {
      x: center.x - size.w / 2,
      y: center.y - size.h / 2
    };
    return addPreset(s, preset, registry, at);
  }
  /** Adds a built-in box with states where its table says (spec §6), at the front of Root (Pager and Refresh behind the closed overlays). */
  addStated(id) {
    if (!this.state) return;
    const found = findBuiltinPreset(id, deviceSize(this.state.doc.screen.device));
    if (!found) return;
    this.edit((s) => addPreset(s, found.preset, registry, statedAt(s, found), found.content ? "content" : true, false));
  }
  /**
   * The mouse on a Dynamic Elements row (PR-13, Design I): the box as 押して足す would put it on
   * the screen as written, in a small window beside the row. `row` undefined: the mouse left.
   */
  hoverDynamic(id, row, pressed = false) {
    if (pressed) this.hoverPressed = true;
    if (!row) {
      if (!pressed) this.hoverPressed = false;
      return this.dynamicHover.close();
    }
    const found = this.state && !this.hoverPressed && findBuiltinPreset(id, deviceSize(this.state.doc.screen.device));
    if (!this.state || !found) return this.dynamicHover.close();
    const theme = this.theme();
    const screen = written2(this.state.doc);
    this.dynamicHover.show(row, {
      title: found.label,
      note: `${found.note}\u3002\u62BC\u3059\u3068\u753B\u9762\u306B\u8DB3\u3059`,
      device: deviceSize(screen.device),
      theme,
      look: hoverLook(screen, found, registry, themeTone(theme))
    });
  }
  /**
   * The mouse on an Elements row (PR-17), in the same window as a Dynamic Elements row: a Default
   * row shows its type in a typical use (the part framed), a MySet row the part a press would add,
   * alone. Both as the canvas would draw them.
   */
  hoverElement(what, row, pressed = false) {
    if (pressed) this.hoverPressed = true;
    if (!row) {
      if (!pressed) this.hoverPressed = false;
      return this.dynamicHover.close();
    }
    if (!this.state || this.hoverPressed) return this.dynamicHover.close();
    const theme = this.theme();
    if ("type" in what) {
      const ex = exampleLook(what.type, this.defaults.parts, registry);
      if (!ex) return this.dynamicHover.close();
      return this.dynamicHover.show(row, {
        title: registry.get(what.type)?.label ?? what.type,
        note: `\u4F8B: ${DEFAULT_EXAMPLES[what.type].note}\u3002\u62BC\u3059\u3068\u753B\u9762\u306B\u8DB3\u3059`,
        device: ex.size,
        theme,
        look: ex.look,
        kind: "example"
      });
    }
    const preset = what.entry.component;
    if (!preset) return this.dynamicHover.close();
    const { look, size } = partLook(this.presetAtVisibleCenter(this.state, preset), this.defaults.parts);
    this.dynamicHover.show(row, {
      title: what.entry.name,
      note: "\u62BC\u3059\u3068\u753B\u9762\u306B\u8DB3\u3059",
      device: size,
      theme,
      look,
      kind: "part"
    });
  }
  /** Centre of the part of the device frame currently visible in #canvas-wrap, in device px. */
  visibleCenter() {
    const frame = this.els.canvas.querySelector(".wf-frame");
    if (!frame) return void 0;
    const wrap = this.els.canvasWrap.getBoundingClientRect();
    const box7 = frame.getBoundingClientRect();
    const left = Math.max(wrap.left, box7.left);
    const right = Math.min(wrap.right, box7.right);
    const top = Math.max(wrap.top, box7.top);
    const bottom = Math.min(wrap.bottom, box7.bottom);
    if (right <= left || bottom <= top) return void 0;
    const zoom = this.view.zoom;
    return {
      x: ((left + right) / 2 - box7.left) / zoom,
      y: ((top + bottom) / 2 - box7.top) / zoom
    };
  }
  // ---------- navigation ----------
  leaveOk() {
    return !(this.state && isDirty(this.state)) || confirm(UNSAVED_LEAVE);
  }
  async goHome() {
    if (this.mode === "start" || !this.leaveOk()) return;
    hideBanner(this.els.banner);
    await this.showStart();
  }
  async switchScreen(id) {
    if (id === this.currentId) return;
    if (!this.leaveOk()) {
      this.renderHeaderBar();
      return;
    }
    await this.enterEditor(id);
  }
  /** Same screen id in the other proposal when it exists, else that proposal's first screen. */
  async switchProposal(pid) {
    if (pid === this.proposalId) return;
    if (!this.leaveOk()) {
      this.renderHeaderBar();
      return;
    }
    const t = this.begin();
    const keep = this.currentId;
    if (!await this.tryLoad(pid, `\u6848 ${pid} \u3092\u958B\u3051\u307E\u305B\u3093`, t)) {
      if (!this.stale(t)) this.renderHeaderBar();
      return;
    }
    const same3 = keep ? this.screens.find((s) => s.id === keep && !s.error) : void 0;
    const target = same3 ?? this.screens.find((s) => !s.error);
    if (target) await this.enterEditor(target.id, t);
    else {
      showBanner(this.els.banner, "\u3053\u306E\u6848\u306B\u306F\u307E\u3060\u753B\u9762\u304C\u3042\u308A\u307E\u305B\u3093\u3002Templates \u304B\u3089\u4F5C\u308C\u307E\u3059\u3002");
      await this.showStart(t);
    }
  }
  async openScreen(pid, id) {
    const t = this.begin();
    if (pid !== this.proposalId && !await this.tryLoad(pid, `\u6848 ${pid} \u3092\u958B\u3051\u307E\u305B\u3093`, t)) return;
    await this.enterEditor(id, t);
  }
  // ---------- proposals ----------
  async duplicateProposal(from) {
    const name = prompt("\u65B0\u3057\u3044\u6848\u306E\u540D\u524D(\u7A7A\u306A\u3089 Design <\u6B21\u306E\u6587\u5B57>)", "");
    if (name === null) return;
    const r = await call(addProposal({
      from,
      name: name.trim() || void 0
    }));
    if (!r.ok) {
      showBanner(this.els.banner, `\u6848\u3092\u8907\u88FD\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
      return;
    }
    const nid = r.proposal.id;
    if (this.mode === "editor") {
      if (!this.leaveOk()) {
        await this.refreshScreens();
        this.renderAll();
        return;
      }
      const t = this.begin();
      const keep = this.currentId;
      if (!await this.tryLoad(nid, `\u6848 ${nid} \u3092\u958B\u3051\u307E\u305B\u3093`, t)) {
        if (!this.stale(t)) this.renderHeaderBar();
        return;
      }
      const target = this.screens.find((s) => s.id === keep && !s.error) ?? this.screens.find((s) => !s.error);
      if (target) await this.enterEditor(target.id, t);
      else await this.showStart(t);
    } else {
      await this.refreshStart();
    }
  }
  async deleteProposal(pid) {
    const p = this.proposals.find((x) => x.id === pid);
    if (!p) return;
    if (!confirm(`\u6848\u300C${p.name}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002\u3053\u306E\u6848\u306E\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u3082\u6D88\u3048\u307E\u3059(Git \u306E\u5C65\u6B74\u306B\u306F\u6B8B\u308A\u307E\u3059)\u3002`)) return;
    const r = await call(removeProposal(pid));
    if (!r.ok) {
      showBanner(this.els.banner, `\u6848\u3092\u6D88\u305B\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
      return;
    }
    const t = this.begin();
    if (pid === this.proposalId && !await this.tryLoad(void 0, "project.json \u3092\u8AAD\u3081\u307E\u305B\u3093", t)) return;
    await this.refreshStart(t);
  }
  // ---------- creating screens ----------
  lastEditedProposalId() {
    const sorted = [
      ...this.proposals
    ].sort((a, b) => a.modifiedAt < b.modifiedAt ? 1 : -1);
    return sorted[0]?.id ?? this.proposalId;
  }
  uniqueScreenId(base, pid) {
    const taken = new Set((this.proposals.find((p) => p.id === pid)?.screens ?? []).map((s) => s.id));
    if (!taken.has(base)) return base;
    for (let n = 2; ; n++) {
      if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
    }
  }
  pickTemplate(from, fromTitle, fromDevice, proposalId) {
    const pid = proposalId ?? this.lastEditedProposalId();
    const base = from === "blank" ? "screen" : from.slice(from.indexOf(":") + 1);
    this.form = {
      from,
      fromTitle,
      fromDevice,
      proposalId: pid,
      id: this.uniqueScreenId(base, pid),
      title: fromTitle,
      ...proposalId !== void 0 ? {
        lockProposal: true
      } : {}
    };
    this.renderAll();
  }
  changeForm(patch) {
    if (!this.form) return;
    this.form = {
      ...this.form,
      ...patch
    };
    if (patch.proposalId !== void 0) {
      this.form.id = this.uniqueScreenId(this.form.id.replace(/-\d+$/, ""), patch.proposalId);
      this.renderAll();
    }
  }
  async createFromForm() {
    const f = this.form;
    if (!f) return;
    const id = f.id.trim();
    const title = f.title.trim();
    if (!ID_PATTERN.test(id)) {
      this.form = {
        ...f,
        error: "ID \u306F\u5C0F\u6587\u5B57\u306E\u82F1\u6570\u5B57\u3068\u30CF\u30A4\u30D5\u30F3\u3060\u3051\u3067\u3059"
      };
      this.renderAll();
      return;
    }
    if (!title) {
      this.form = {
        ...f,
        error: "\u984C\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044"
      };
      this.renderAll();
      return;
    }
    const r = await call(createScreen(f.proposalId, {
      id,
      title,
      from: f.from
    }));
    if (!r.ok) {
      this.form = {
        ...f,
        error: failText2(r, "\u4F5C\u308C\u307E\u305B\u3093")
      };
      this.renderAll();
      return;
    }
    this.form = void 0;
    this.contents.clear();
    const t = this.begin();
    if (!await this.tryLoad(f.proposalId, "\u4F5C\u6210\u5F8C\u306E\u8AAD\u307F\u76F4\u3057\u306B\u5931\u6557\u3057\u307E\u3057\u305F", t)) {
      if (!this.stale(t)) this.renderAll();
      return;
    }
    await this.enterEditor(id, t);
  }
  async deleteCustomTemplate(id) {
    if (!confirm(`Custom \u306E\u3072\u306A\u5F62\u300C${id}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002`)) return;
    const r = await call(deleteTemplate(id));
    if (!r.ok) showBanner(this.els.banner, `\u3072\u306A\u5F62\u3092\u6D88\u305B\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
    this.templatesLoaded = false;
    await this.loadStartData();
    this.renderAll();
  }
  // ---------- reference images (Templates → AI) ----------
  aiTabShowing() {
    return this.mode === "start" && this.startTab === "templates" && this.templatesTab === "ai";
  }
  /** Screen ids that cannot be asked for in proposal `pid`: its screens and what other images wait for. */
  takenImportIds(pid) {
    return [
      ...(this.proposals.find((p) => p.id === pid)?.screens ?? []).map((s) => s.id),
      ...this.references.filter((r) => r.state === "pending" && r.proposal === pid).map((r) => r.screen)
    ];
  }
  /** An image arrived (drop, paste or pick): check it here too, then open the 登録の欄. */
  async receiveImage(file) {
    if (!this.aiTabShowing()) return;
    const problem = await imageProblem(file);
    if (!this.aiTabShowing()) return;
    if (problem) {
      showBanner(this.els.banner, problem, [], "error");
      return;
    }
    this.closeImportForm();
    const pid = this.lastEditedProposalId();
    this.importFile = file;
    this.importForm = {
      fileName: file.name || "image",
      previewUrl: URL.createObjectURL(file),
      name: fileStem(file.name) || "image",
      note: "",
      ask: true,
      proposalId: pid,
      screenId: defaultImportScreenId(this.takenImportIds(pid)),
      screenTitle: ""
    };
    hideBanner(this.els.banner);
    this.renderAll();
  }
  closeImportForm() {
    if (this.importForm) URL.revokeObjectURL(this.importForm.previewUrl);
    this.importForm = void 0;
    this.importFile = void 0;
  }
  changeImportForm(patch) {
    if (!this.importForm) return;
    this.importForm = {
      ...this.importForm,
      ...patch
    };
    if (patch.proposalId !== void 0) {
      this.importForm.screenId = defaultImportScreenId(this.takenImportIds(patch.proposalId));
    }
    if (patch.proposalId !== void 0 || patch.ask !== void 0) this.renderAll();
  }
  async submitImport() {
    const f = this.importForm;
    const file = this.importFile;
    if (!f || !file) return;
    const name = f.name.trim();
    const screenId = f.screenId.trim();
    if (!name) {
      this.importForm = {
        ...f,
        error: "\u540D\u524D\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044"
      };
      this.renderAll();
      return;
    }
    if (f.ask && !ID_PATTERN.test(screenId)) {
      this.importForm = {
        ...f,
        error: "\u753B\u9762 ID \u306F\u5C0F\u6587\u5B57\u306E\u82F1\u6570\u5B57\u3068\u30CF\u30A4\u30D5\u30F3\u3060\u3051\u3067\u3059"
      };
      this.renderAll();
      return;
    }
    const r = await call(importReference({
      file,
      fileName: f.fileName,
      title: name,
      note: f.note.trim(),
      ...f.ask ? {
        screen: screenId,
        proposal: f.proposalId,
        screenTitle: f.screenTitle.trim() || name
      } : {}
    }));
    if (!r.ok) {
      if (r.status === 413 || r.status === 415) {
        this.closeImportForm();
        showBanner(this.els.banner, IMAGE_LIMIT_TEXT, [], "error");
      } else if (this.importForm) {
        this.importForm = {
          ...this.importForm,
          error: failText2(r, "\u767B\u9332\u3067\u304D\u307E\u305B\u3093")
        };
      }
      this.renderAll();
      return;
    }
    this.closeImportForm();
    await this.refreshStart();
  }
  async deleteReferenceCard(id) {
    const ref = this.references.find((r2) => r2.id === id);
    if (!ref) return;
    if (!confirm(`\u53C2\u8003\u753B\u50CF\u300C${ref.title}\u300D\u3092\u6D88\u3057\u307E\u3059\u304B\u3002\u753B\u50CF\u3068\u8A18\u9332\u304C\u6D88\u3048\u307E\u3059(\u4F5C\u3089\u308C\u305F\u753B\u9762\u306F\u6B8B\u308A\u307E\u3059)\u3002`)) return;
    const r = await call(deleteReference(id));
    if (!r.ok) {
      showBanner(this.els.banner, `\u53C2\u8003\u753B\u50CF\u3092\u6D88\u305B\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
    }
    await this.refreshStart();
  }
  // ---------- part presets (MySet) ----------
  /** Registers the selection as a preset: one part as it is, several as one `group`. */
  async savePreset() {
    if (!this.state) return;
    const state = this.state;
    const elements = state.doc.screen.elements;
    const items = topmostIds(elements, state.selection).map((id) => sourceWithOffset(state, id));
    if (items.length === 0) return;
    const layer = this.defaults.parts;
    const { type, element } = presetFromSelection(items.map((it) => ({
      ...it,
      el: bakeLinked(it.el, layer)
    })));
    const first = items[0].el;
    const suggested = items.length === 1 ? first.name ?? first.text ?? first.type : "";
    const answer = prompt("MySet \u306E\u540D\u524D(Elements \u306B\u51FA\u307E\u3059\u300240 \u5B57\u307E\u3067)", suggested);
    if (answer === null || answer.trim() === "") return;
    const name = answer.trim();
    const r = await call(saveComponent(type, name, element, false));
    if (r.ok) {
      if (items.length === 1) {
        this.edit((s) => linkPreset(updateElement(s, first.id, (el2) => bakeLinked(el2, layer)), first.id, name));
        await this.save();
      }
      this.componentsLoaded = false;
      this.expandedTypes.add(type);
      await this.loadComponents();
      showBanner(this.els.banner, `MySet \u306B\u767B\u9332\u3057\u307E\u3057\u305F: ${name}(Elements \u306E ${type})`);
      this.renderAll();
      return;
    }
    if (r.status !== 409) {
      showBanner(this.els.banner, `\u767B\u9332\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
      return;
    }
    await this.confirmAndApply("\u4E0A\u66F8\u304D", linkedTo({
      type,
      name
    }), async () => {
      const uses = await call(componentUses(type, name));
      if (!uses.ok) {
        showBanner(this.els.banner, `\u6570\u3048\u3089\u308C\u307E\u305B\u3093: ${failText2(uses, "")}`, [], "error");
        return;
      }
      if (!confirm(overwriteConfirmText(name, uses, this.folders))) return;
      if (items.length === 1) {
        this.edit((s) => linkPreset(updateElement(s, first.id, (el2) => bakeLinked(el2, layer)), first.id, name));
        await this.save();
        if (!this.state || isDirty(this.state)) {
          showBanner(this.els.banner, "\u5148\u306B\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u4E0A\u66F8\u304D\u3092\u4E2D\u6B62\u3057\u307E\u3059", [], "error");
          return;
        }
      }
      const applied = await call(applyComponent(type, name, element));
      if (!applied.ok) {
        showBanner(this.els.banner, `\u4E0A\u66F8\u304D\u3067\u304D\u307E\u305B\u3093: ${failText2(applied, "")}`, [], "error");
        return;
      }
      this.expandedTypes.add(type);
      return {
        banner: appliedBanner(name, applied.parts, applied.failed),
        error: applied.failed.length > 0
      };
    });
  }
  get folders() {
    return this.project?.proposals !== void 0;
  }
  /** 「MySet を直す」 (live-myset spec §5.2): the draft in the right panel, previewed on this screen. */
  editPreset(entry) {
    const pe = beginPresetEdit(entry);
    if (!pe || !this.state) {
      showBanner(this.els.banner, `MySet\u300C${entry.name}\u300D\u304C\u8AAD\u3081\u307E\u305B\u3093`, [], "error");
      return;
    }
    this.presetEdit = pe;
    this.defaultEdit = void 0;
    this.setState(select(this.state, []));
    this.renderAll();
    void call(componentUses(entry.type, entry.name)).then((r) => {
      if (this.presetEdit?.entry === entry && r.ok) {
        this.presetEdit = {
          ...this.presetEdit,
          counts: r
        };
        this.renderAll();
      }
    });
  }
  closePresetEdit() {
    if (this.presetEdit) {
      this.presetEdit = void 0;
      this.renderAll();
    }
  }
  /** The canvas drawn from the draft, and the panel that edits it. */
  renderPresetEdit(state, pe) {
    clear(this.els.themes);
    const ids = linkedHere(written2(state.doc), pe);
    const base = this.shown(state);
    renderCanvas(this.els.canvas, {
      ...base,
      doc: {
        ...base.doc,
        screen: previewScreen(base.doc.screen, pe, registry)
      },
      selection: []
    }, {
      ...this.view,
      linked: {
        ids,
        name: pe.preset.name
      }
    }, registry, this.themes);
    renderPresetEdit(this.els.props, pe, ids.length, this.folders, registry, deviceSize(state.doc.screen.device), {
      onItem: (item, v) => {
        this.presetEdit = setDraftItem(pe, item, v);
        this.renderAll();
      },
      onApply: () => void this.applyPresetEdit(),
      onCancel: () => this.closePresetEdit(),
      // A cancelled prompt or confirm keeps the mode and its draft; only a done rename / delete closes it.
      onRename: () => void this.renamePreset(pe.entry).then((done) => done && this.closePresetEdit()),
      onDelete: () => void this.deletePreset(pe.entry).then((done) => done && this.closePresetEdit())
    });
  }
  /** 反映: save first (the apply moves the file's hash), count, confirm, apply. */
  async applyPresetEdit() {
    const pe = this.presetEdit;
    if (!pe || !this.state) return;
    await this.confirmAndApply("\u53CD\u6620", linkedTo(pe.preset), async () => {
      const counts = this.presetEdit?.counts ?? pe.counts ?? await call(componentUses(pe.preset.type, pe.preset.name)).then((r2) => r2.ok ? r2 : void 0);
      if (!counts) {
        showBanner(this.els.banner, "\u6570\u3048\u3089\u308C\u307E\u305B\u3093\u3002\u53CD\u6620\u3092\u4E2D\u6B62\u3057\u307E\u3059", [], "error");
        return;
      }
      if (!confirm(applyConfirmText(pe.preset.name, counts, this.folders))) return;
      const r = await call(applyComponent(pe.preset.type, pe.preset.name, pe.draft));
      if (!r.ok) {
        showBanner(this.els.banner, `\u53CD\u6620\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
        return;
      }
      return {
        banner: appliedBanner(pe.preset.name, r.parts, r.failed),
        error: r.failed.length > 0
      };
    });
  }
  /** 「MySet に反映」 (live-myset spec §5.1): save, count, confirm, apply. */
  async pushPreset(id) {
    if (!this.state) return;
    const part = findById(this.state.doc.screen.elements, id)?.el;
    if (part?.set === void 0) return;
    await this.confirmAndApply("\u53CD\u6620", linkedTo({
      type: part.type,
      name: part.set
    }), async () => {
      if (!this.state) return;
      const screen = written2(this.state.doc);
      const part2 = findById(screen.elements, id)?.el;
      const linked = part2 && linkedOf(part2, screen, this.components, registry);
      if (!part2 || !linked?.entry?.component || !linked.filled) return;
      const uses = await call(componentUses(part2.type, linked.name));
      if (!uses.ok) {
        showBanner(this.els.banner, `\u6570\u3048\u3089\u308C\u307E\u305B\u3093: ${failText2(uses, "")}`, [], "error");
        return;
      }
      if (!confirm(pushConfirmText(partLabel(part2), linked.diff, linked.name, uses, this.folders))) return;
      const element = pushToPreset(part2, linked.entry.component.element, linked.filled);
      const r = await call(applyComponent(part2.type, linked.name, element));
      if (!r.ok) {
        showBanner(this.els.banner, `\u53CD\u6620\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
        return;
      }
      return {
        banner: appliedBanner(linked.name, r.parts, r.failed),
        error: r.failed.length > 0
      };
    });
  }
  /**
   * One MySet or Default change that rewrites screens (apply, overwrite, rename, delete, reset),
   * one at a time: save first (the change moves the open file's hash; abort if it stays unsaved),
   * then `flow` (count, confirm, the server call; undefined when cancelled or failed, after its own
   * banner), then `afterApply`. `touches` says whether the open screen's parts, as they were before
   * the change, hold one the change reaches. True when the change happened.
   */
  async confirmAndApply(what, touches, flow) {
    if (this.applying) return false;
    this.applying = true;
    try {
      if (this.state && isDirty(this.state)) {
        await this.save();
        if (!this.state || isDirty(this.state)) {
          showBanner(this.els.banner, `\u5148\u306B\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002${what}\u3092\u4E2D\u6B62\u3057\u307E\u3059`, [], "error");
          return false;
        }
      }
      const done = await flow();
      if (!done) return false;
      const here = this.state !== void 0 && touches(this.state.doc.screen.elements);
      await this.afterApply(done.banner, done.error === true, here);
      return true;
    } finally {
      this.applying = false;
    }
  }
  /**
   * After a MySet or Default change this tab asked for: read the type Defaults (a Default change
   * must not leave the screen read with the old layer), then the open screen when the change can have
   * rewritten it (`here`; the `screen-changed` it sent is left to this, see `onWs`), keep the
   * selection that still exists, then say what happened (spec §5.1 帯) so no reload hides it.
   */
  async afterApply(text18, error, here) {
    this.componentsLoaded = false;
    await this.loadDefaults();
    const keep = this.state?.selection ?? [];
    if (here && this.mode === "editor" && this.state && !isDirty(this.state)) {
      const t = this.begin();
      await this.reloadFlow(t);
      if (this.stale(t)) return;
      await this.loadComponents();
      if (this.stale(t)) return;
      this.flushNotice(t);
      if (this.state) {
        const still = keep.filter((id) => findById(this.state.doc.screen.elements, id));
        if (still.length) this.state = select(this.state, still);
      }
    } else {
      this.presetEdit = void 0;
      this.defaultEdit = void 0;
      await this.loadComponents();
    }
    if (text18 !== void 0) showBanner(this.els.banner, text18, [], error ? "error" : "info");
    this.renderAll();
  }
  /** 「名前を変える」: true when the MySet was renamed. */
  renamePreset(entry) {
    return this.confirmAndApply("\u540D\u524D\u306E\u5909\u66F4", linkedTo(entry), async () => {
      const answer = prompt("MySet \u306E\u65B0\u3057\u3044\u540D\u524D(40 \u5B57\u307E\u3067)", entry.name);
      if (answer === null || answer.trim() === "" || answer.trim() === entry.name) return;
      const r = await call(renameComponent(entry.type, entry.name, answer.trim()));
      if (!r.ok) {
        showBanner(this.els.banner, r.status === 409 ? `MySet\u300C${answer.trim()}\u300D\u306F\u65E2\u306B\u3042\u308A\u307E\u3059` : `\u540D\u524D\u3092\u5909\u3048\u3089\u308C\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
        return;
      }
      return {};
    });
  }
  /** 「この MySet を消す」 / the row's ×: true when the MySet was deleted. */
  deletePreset(entry) {
    return this.confirmAndApply("\u524A\u9664", linkedTo(entry), async () => {
      const uses = await call(componentUses(entry.type, entry.name));
      if (!confirm(deleteConfirmText(entry.name, uses.ok ? uses.parts : void 0))) return;
      const r = await call(deleteComponent(entry.type, entry.name));
      if (!r.ok) {
        showBanner(this.els.banner, `MySet \u3092\u6D88\u305B\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
        return;
      }
      return {};
    });
  }
  // ---------- type Defaults (live-myset spec §5.3) ----------
  /** GET /api/defaults → this tab's layer (spec §4 `defaults-changed`); true when it was read. */
  async loadDefaults() {
    try {
      const d = await getDefaults();
      this.defaults = d.defaults;
      this.defaultsError = d.error;
      return true;
    } catch (e) {
      showBanner(this.els.banner, `Default \u3092\u8AAD\u3081\u307E\u305B\u3093: ${errText(e)}`, [], "error");
      return false;
    }
  }
  /** The state as the canvas shows it: the type Defaults laid under every part by the set-boundary rule. */
  shown(state) {
    const screen = state.doc.screen;
    return {
      ...state,
      doc: {
        ...state.doc,
        screen: {
          ...screen,
          elements: layerDefaults(screen.elements, this.defaults.parts)
        }
      }
    };
  }
  /** 「Default を直す」 (spec §5.3): the draft in the right panel, previewed on this screen's parts of the type. */
  editDefault(type) {
    if (!this.state) return;
    if (this.defaultsError !== void 0) {
      showBanner(this.els.banner, "library/defaults.json \u304C\u8AAD\u3081\u307E\u305B\u3093", [], "error");
      return;
    }
    this.defaultEdit = beginDefaultEdit(type, this.defaults.parts);
    this.presetEdit = void 0;
    this.setState(select(this.state, []));
    this.renderAll();
    void call(defaultUses(type)).then((r) => {
      if (this.defaultEdit?.type === type && r.ok) {
        this.defaultEdit = {
          ...this.defaultEdit,
          counts: r
        };
        this.renderAll();
      }
    });
  }
  closeDefaultEdit() {
    if (this.defaultEdit) {
      this.defaultEdit = void 0;
      this.renderAll();
    }
  }
  /** The canvas drawn with the draft in the type's place, and the panel that edits it. */
  renderDefaultEdit(state, de) {
    clear(this.els.themes);
    const ids = defaultHere(written2(state.doc), de.type);
    const base = this.shown(state);
    renderCanvas(this.els.canvas, {
      ...base,
      doc: {
        ...base.doc,
        screen: previewDefaultScreen(base.doc.screen, de, registry, this.defaults.parts)
      },
      selection: []
    }, {
      ...this.view,
      linked: {
        ids
      }
    }, registry, this.themes);
    renderDefaultEdit(this.els.props, de, ids.length, registry, deviceSize(state.doc.screen.device), {
      onItem: (item, v) => {
        this.defaultEdit = setDefaultItem(de, item, v);
        this.renderAll();
      },
      onApply: () => void this.applyDefaultEdit(),
      onCancel: () => this.closeDefaultEdit(),
      // A cancelled confirm keeps the mode and its draft; only a done reset closes it.
      onReset: () => void this.resetDefault(de.type).then((done) => done && this.closeDefaultEdit())
    });
  }
  /** 反映: save first, count, confirm, PUT. */
  async applyDefaultEdit() {
    const de = this.defaultEdit;
    if (!de || !this.state) return;
    await this.confirmAndApply("\u53CD\u6620", (els) => defaultTargets(els, de.type).length > 0, async () => {
      const counts = this.defaultEdit?.counts ?? de.counts ?? await call(defaultUses(de.type)).then((r2) => r2.ok ? r2 : void 0);
      if (!counts) {
        showBanner(this.els.banner, "\u6570\u3048\u3089\u308C\u307E\u305B\u3093\u3002\u53CD\u6620\u3092\u4E2D\u6B62\u3057\u307E\u3059", [], "error");
        return;
      }
      if (!confirm(defaultApplyConfirmText(de.type, counts, this.folders))) return;
      const r = await call(putDefault(de.type, de.draft));
      if (!r.ok) {
        showBanner(this.els.banner, `\u53CD\u6620\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
        return;
      }
      return {
        banner: defaultAppliedBanner(de.type, r.parts, r.failed),
        error: r.failed.length > 0
      };
    });
  }
  /** 「元の形に戻す」: true when the Default was removed. */
  resetDefault(type) {
    return this.confirmAndApply("\u5143\u306E\u5F62\u306B\u623B\u3059", (els) => defaultTargets(els, type).length > 0, async () => {
      const uses = await call(defaultUses(type));
      if (!uses.ok) {
        showBanner(this.els.banner, `\u6570\u3048\u3089\u308C\u307E\u305B\u3093: ${failText2(uses, "")}`, [], "error");
        return;
      }
      if (!confirm(defaultResetConfirmText(type, uses, this.folders))) return;
      const r = await call(deleteDefault(type));
      if (!r.ok) {
        showBanner(this.els.banner, `\u5143\u306B\u623B\u305B\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
        return;
      }
      return {
        banner: defaultResetBanner(type, r.parts, r.failed),
        error: r.failed.length > 0
      };
    });
  }
  // ---------- screen settings ----------
  async saveAsTemplate() {
    if (!this.state || !this.currentId) return;
    const name = prompt("\u3072\u306A\u5F62\u306E\u540D\u524D", this.state.doc.screen.title);
    if (name === null || name.trim() === "") return;
    const id = this.currentId;
    const screen = {
      ...toSaveBody(this.state).screen,
      id,
      title: name.trim(),
      device: this.state.doc.screen.device
    };
    let r = await call(saveTemplate(id, screen, false));
    if (!r.ok && r.status === 409) {
      if (!confirm(`Custom \u306E\u3072\u306A\u5F62\u300C${id}\u300D\u306F\u65E2\u306B\u3042\u308A\u307E\u3059\u3002\u4E0A\u66F8\u304D\u3057\u307E\u3059\u304B?`)) return;
      r = await call(saveTemplate(id, screen, true));
    }
    if (r.ok) {
      this.templatesLoaded = false;
      showBanner(this.els.banner, `Custom \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F: ${name.trim()}(ID ${id})`);
    } else {
      showBanner(this.els.banner, `\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
    }
  }
  async deleteCurrentScreen() {
    if (!this.state || !this.currentId) return;
    const dirty = isDirty(this.state);
    const msg = dirty ? "\u3053\u306E\u753B\u9762\u3092\u524A\u9664\u3057\u307E\u3059\u304B\u3002\u672A\u4FDD\u5B58\u306E\u7DE8\u96C6\u306F\u5931\u308F\u308C\u307E\u3059\u3002" : "\u3053\u306E\u753B\u9762\u3092\u524A\u9664\u3057\u307E\u3059\u304B\u3002";
    if (!confirm(msg)) return;
    const id = this.currentId;
    const r = await call(deleteScreen(id, this.proposalId));
    if (!r.ok) {
      showBanner(this.els.banner, `\u524A\u9664\u3067\u304D\u307E\u305B\u3093: ${failText2(r, "")}`, [], "error");
      return;
    }
    const t = this.begin();
    this.state = void 0;
    this.currentId = void 0;
    this.contents.delete(`${this.proposalId}/${id}`);
    if (!await this.tryLoad(this.proposalId, "\u524A\u9664\u5F8C\u306E\u8AAD\u307F\u76F4\u3057\u306B\u5931\u6557\u3057\u307E\u3057\u305F", t)) {
      if (!this.stale(t)) await this.showStart(t);
      return;
    }
    const next = this.screens.find((s) => !s.error);
    if (next) await this.enterEditor(next.id, t);
    else {
      showBanner(this.els.banner, "\u753B\u9762\u304C\u7121\u304F\u306A\u3063\u305F\u306E\u3067 Start \u30DA\u30FC\u30B8\u306B\u623B\u308A\u307E\u3057\u305F\u3002Templates \u304B\u3089\u4F5C\u308C\u307E\u3059\u3002");
      await this.showStart(t);
    }
  }
  // ---------- saving ----------
  async save(force = false) {
    if (!this.state || !this.currentId || this.saving) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && (TYPING_TAGS.has(active.tagName) || active.isContentEditable)) {
      active.blur();
    }
    if (!this.state || !this.currentId) return;
    this.saving = true;
    const screenId = this.currentId;
    const proposalId = this.proposalId;
    const t = this.nav;
    const stillHere = () => this.nav === t && this.currentId === screenId && this.proposalId === proposalId;
    const sentDoc = this.state.doc;
    try {
      const res = await callSave(saveScreen(screenId, {
        ...toSaveBody(this.state),
        force
      }, proposalId));
      if (!stillHere() || !this.state) return;
      if (res.ok) {
        this.state = markSaved(this.state, res.hash, res.projectHash ?? this.state.projectBaseHash, sentDoc);
        if (res.projectHash) {
          this.project = sentDoc.project;
          this.projectHash = res.projectHash;
        }
        this.invalidFields = void 0;
        this.contents.delete(`${proposalId}/${screenId}`);
        await this.refreshScreens();
        if (stillHere()) {
          hideBanner(this.els.banner);
          this.refreshSystemBanner();
          this.renderAll();
        }
        return;
      }
      if (res.status === 409) {
        showBanner(this.els.banner, "Claude \u304C\u66F8\u304D\u63DB\u3048\u305F\u7248\u304C\u3042\u308A\u307E\u3059\u3002\u8AAD\u307F\u76F4\u3059\u304B\u3001\u81EA\u5206\u306E\u7DE8\u96C6\u3092\u512A\u5148\u3057\u3066\u304F\u3060\u3055\u3044\u3002", [
          {
            label: "\u8AAD\u307F\u76F4\u3059(\u81EA\u5206\u306E\u7DE8\u96C6\u306F\u6368\u3066\u308B)",
            onClick: () => this.reload()
          },
          {
            label: "\u81EA\u5206\u306E\u7DE8\u96C6\u3092\u512A\u5148",
            onClick: () => this.save(true)
          }
        ], "error");
      } else if (res.status === 422) {
        const errors = res.body.errors ?? [];
        this.invalidFields = errors;
        if (errors.length === 0) {
          showBanner(this.els.banner, `\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093: ${failText2(res, "")}`, [], "error");
        } else {
          const list = el("ul", {}, ...errors.map((i) => el("li", {}, `${i.path}: ${i.message}`)));
          showBanner(this.els.banner, el("span", {}, "\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093(\u5F62\u306E\u8AA4\u308A)", list), [], "error");
        }
        this.renderAll();
      } else if (res.status === 404) {
        showBanner(this.els.banner, "\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308A\u307E\u305B\u3093(Claude \u304C\u6D88\u3057\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059)\u3002", [
          {
            label: "\u8AAD\u307F\u76F4\u3059(\u81EA\u5206\u306E\u7DE8\u96C6\u306F\u6368\u3066\u308B)",
            onClick: () => {
              if (this.leaveOk()) this.reload();
            }
          }
        ], "error");
      } else {
        showBanner(this.els.banner, `\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${failText2(res, "")}`, [], "error");
      }
    } finally {
      this.saving = false;
    }
  }
  // ---------- server events ----------
  onWs(m) {
    if (m.type === "screen-changed") {
      const pid = m.proposal ?? this.proposalId;
      this.contents.delete(`${pid}/${m.id}`);
      if (this.mode === "start") {
        this.refreshStart();
      } else if (pid === this.proposalId && m.id === this.currentId) {
        if (this.applying && m.via) return;
        this.anim.stop();
        if (this.state && isDirty(this.state)) {
          this.leavePlay();
          const deleted = m.hash === null;
          showBanner(this.els.banner, deleted ? "\u3053\u306E\u753B\u9762\u306F\u6D88\u3055\u308C\u307E\u3057\u305F\u3002\u7DE8\u96C6\u4E2D\u306E\u5185\u5BB9\u306F\u3053\u306E\u753B\u9762\u306B\u6B8B\u3063\u3066\u3044\u307E\u3059(Save \u3067\u3072\u306A\u5F62\u306B\u3067\u304D\u307E\u3059)\u3002" : updatedBanner(m.via), [
            {
              label: "\u8AAD\u307F\u76F4\u3059(\u81EA\u5206\u306E\u7DE8\u96C6\u306F\u6368\u3066\u308B)",
              onClick: () => {
                if (!deleted || this.leaveOk()) this.reload();
              }
            }
          ], deleted ? "error" : "info");
        } else {
          this.leavePlay(false);
          this.reload();
        }
      } else {
        this.refreshScreens().then(() => {
          this.renderAll();
          this.flushNotice(this.nav);
        });
      }
    } else if (m.type === "guide-changed") {
      void getGuide().then((a) => this.setGuide(a)).catch(() => {
      });
    } else if (m.type === "defaults-changed") {
      if (this.applying) return;
      void this.loadDefaults().then((ok) => {
        if (!ok) return;
        hideBanner(this.els.banner);
        this.refreshSystemBanner();
        if (this.mode === "start") {
          this.renderAll();
        } else if (this.state && isDirty(this.state)) {
          showBanner(this.els.banner, "Default \u304C\u5909\u308F\u308A\u307E\u3057\u305F", [
            {
              label: "\u8AAD\u307F\u76F4\u3059(\u81EA\u5206\u306E\u7DE8\u96C6\u306F\u6368\u3066\u308B)",
              onClick: () => this.reload()
            }
          ]);
        } else if (this.state) {
          this.leavePlay(false);
          this.reload();
        }
      });
    } else if (m.type === "project-changed") {
      if (m.hash !== null && m.hash === this.projectHash) {
        this.templatesLoaded = false;
        this.componentsLoaded = false;
        if (this.mode === "start") {
          void this.loadStartData().then(() => this.mode === "start" && this.renderAll());
        } else {
          void this.loadComponents().then((changed) => changed && this.renderAll());
        }
        return;
      }
      if (this.mode === "editor" && this.state && isDirty(this.state)) {
        showBanner(this.els.banner, "project.json \u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F(\u6848\u30FB\u753B\u9762\u30FB\u3072\u306A\u5F62\u304C\u5909\u308F\u3063\u305F\u304B\u3082\u3057\u308C\u307E\u305B\u3093)\u3002", [
          {
            label: "\u8AAD\u307F\u76F4\u3059(\u81EA\u5206\u306E\u7DE8\u96C6\u306F\u6368\u3066\u308B)",
            onClick: () => this.reload()
          }
        ]);
      } else {
        this.reload();
      }
    } else if (m.type === "shutdown") {
      this.shutdownBannerShown = true;
      showBanner(this.els.banner, "\u914D\u4FE1\u30B5\u30FC\u30D0\u30FC\u304C\u6B62\u307E\u308A\u307E\u3057\u305F\u3002\u3064\u306A\u304E\u76F4\u3057\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u2026", [], "error");
    }
  }
  /** §8 "配信サーバーが止まった": show/hide the 停止中 overlay and resync once it comes back. */
  onConnection(connected) {
    this.connected = connected;
    if (connected) {
      if (this.stoppedShown) {
        this.stoppedShown = false;
        this.els.stopped.hidden = true;
        this.guideLayer.setStopped(false);
        this.onReconnect();
      }
    } else {
      this.stoppedShown = true;
      this.els.stopped.hidden = false;
      this.guideLayer.setStopped(true);
    }
    this.renderHeaderBar();
  }
  async onReconnect() {
    const hadShutdownBanner = this.shutdownBannerShown;
    this.shutdownBannerShown = false;
    void getGuide().then((a) => this.setGuide(a)).catch(() => {
    });
    if (!this.state || !this.currentId || !isDirty(this.state)) {
      await this.reload();
      return;
    }
    if (hadShutdownBanner) hideBanner(this.els.banner);
    try {
      const { hash } = await getScreen(this.currentId, this.proposalId);
      if (hash !== this.state.baseHash) {
        showBanner(this.els.banner, "Claude \u304C\u753B\u9762\u30D5\u30A1\u30A4\u30EB\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002", [
          {
            label: "\u8AAD\u307F\u76F4\u3059(\u81EA\u5206\u306E\u7DE8\u96C6\u306F\u6368\u3066\u308B)",
            onClick: () => this.reload()
          }
        ]);
      }
    } catch {
    }
  }
  // ---------- editing operations (keys and the right-click list) ----------
  /** The screen the editor is showing, for the clip's "same screen or not". */
  here() {
    return {
      proposal: this.proposalId,
      screen: this.currentId ?? ""
    };
  }
  copy() {
    if (!this.state) return;
    const clip = copySelection(this.state, this.here());
    if (clip) this.clip = clip;
  }
  cut() {
    if (!this.state) return;
    const r = cutSelection(beginEdit(this.state), this.here());
    if (!r) return;
    this.clip = r.clip;
    this.setState(this.withoutStrayBlocks(r.state, true));
  }
  /**
   * `at` (device px) only from the canvas's right-click list; keys and Select rows paste in place. A
   * paste at a point over a laid-out box goes in at the place there (layout spec §3.5).
   */
  paste(at) {
    if (!this.state || !this.clip) return;
    const { screen } = this.state.doc;
    const slot = at ? dropPlaceAt(screen.elements, at, [], deviceSize(screen.device), this.view.scrolls).slot : void 0;
    const r = pasteClip(beginEdit(this.state), this.clip, this.here(), at, slot);
    this.clip = r.clip;
    this.setState(this.withoutStrayBlocks(r.state));
  }
  /**
   * Triggers spec §3.1: a part brought from elsewhere (a paste, a preset) may carry blocks that name
   * a box, part, state or screen that is not here. With `whole`, after a part or a state was taken
   * away (spec §5.3), any block on the screen may name it; the screens a `go` names are not looked
   * at then (a go to a screen that is gone stays, plan decision 1). Those conditions and actions go,
   * and the strip says so once. Called inside the edit, so that one undo brings them back.
   */
  withoutStrayBlocks(s, whole = false) {
    const ids = this.screens.map((x) => x.id);
    const blocks = whole ? pruneBlocksIn(s) : pruneBlocksIn(s, ids, s.selection);
    const mirrors = whole ? pruneMirrorsIn(blocks.state) : pruneMirrorsIn(blocks.state, ids, s.selection);
    const state = mirrors.state;
    const name = (id) => {
      if (id === SCREEN) return "\u753B\u9762";
      const el2 = findById(state.doc.screen.elements, id)?.el;
      return el2 ? treeLabel(el2, false) : id;
    };
    const lost = [];
    if (mirrors.dropped.length) lost.push(`${mirrors.dropped.map(name).join("\u3001")} \u306E\u6587\u5B57\u306E\u5143`);
    if (blocks.dropped.length) lost.push(`${blocks.dropped.map(name).join("\u3001")} \u306E\u30D6\u30ED\u30C3\u30AF\u306E\u4E00\u90E8`);
    if (lost.length) {
      showBanner(this.els.banner, `${lost.join("\u3068\u3001")}\u3092\u843D\u3068\u3057\u307E\u3057\u305F(\u76F8\u624B\u304C\u3042\u308A\u307E\u305B\u3093)`);
    }
    return state;
  }
  /** Delete / Backspace and the list's Delete: nothing happens while a selected part is locked. */
  removeSelected() {
    const s = this.state;
    if (!s || s.selection.length === 0) return;
    const sel = s.selection;
    if (sel.some((id) => isLocked(s.doc.screen.elements, id))) return;
    this.edit((st) => this.withoutStrayBlocks(removeElements(st, sel), true));
  }
  runMenu(action, at) {
    if (!this.state || this.gestures?.busy()) return;
    if (!menuAllows(this.state, this.clip !== void 0, action)) return;
    const sel = this.state.selection;
    switch (action) {
      case "copy":
        return this.copy();
      case "cut":
        return this.cut();
      case "paste":
        return this.paste(at);
      case "duplicate":
        return this.edit((st) => duplicate(st, sel));
      case "delete":
        return this.removeSelected();
      case "group":
        return this.edit(groupSelection);
      case "ungroup":
        return this.edit((st) => this.withoutStrayBlocks(ungroupSelection(st), true));
      case "lock":
        return this.edit((st) => setLocked(st, sel, true));
      case "unlock":
        return this.edit((st) => setLocked(st, sel, false));
      case "hide":
        return this.edit((st) => setHidden(st, sel, true));
      case "show":
        return this.edit((st) => setHidden(st, sel, false));
      case "column":
      case "row":
        return this.stack(action);
      case "unlayout":
        return this.edit((st) => unstackSelection(st));
    }
  }
  /**
   * 縦に並べる / 横に並べる (layout spec §5.4): the selection laid out (one box) or wrapped in 「並び」;
   * the strip says so when x / y rows of the states had to go (spec §5.1).
   */
  stack(dir) {
    const s = this.state;
    if (!s) return;
    const sel = s.selection;
    const one = sel.length === 1 ? findById(s.doc.screen.elements, sel[0])?.el : void 0;
    const box7 = one && (one.type === "rect" || one.type === GROUP_TYPE2) ? one : void 0;
    const dropped = box7 ? layoutOf(box7) ? 0 : positionRowsInside(written2(s.doc), box7.id) : positionRowsOf(written2(s.doc), sel);
    this.edit((st) => stackSelection(st, dir));
    const made = this.state && findById(this.state.doc.screen.elements, this.state.selection[0])?.el;
    const named = box7 ?? (made?.type === GROUP_TYPE2 && !sel.includes(made.id) ? made : void 0);
    if (dropped > 0 && named) showBanner(this.els.banner, positionRowsNotice(named));
  }
  /** Opens the right-click list for the selection as it is now. */
  openMenuAt(client, at) {
    if (this.mode !== "editor" || !this.state || this.gestures?.busy() || this.libraryEdit) return;
    openMenu(client, fullMenu(this.state, this.clip !== void 0), (action) => this.runMenu(action, at));
  }
  // ---------- keyboard ----------
  onAction(action, e) {
    if (this.mode !== "editor" || !this.state) return;
    if (this.libraryEdit && ![
      "save",
      "deselect",
      "zoom-fit",
      "zoom-100"
    ].includes(action)) return;
    const s = this.state;
    const sel = s.selection;
    switch (action) {
      case "undo":
        return this.undoRedo(undo);
      case "redo":
        return this.undoRedo(redo);
      case "save":
        this.save();
        return;
      case "delete":
        this.removeSelected();
        return;
      case "duplicate":
        if (sel.length) this.edit((st) => duplicate(st, sel));
        return;
      case "copy":
        return this.copy();
      case "cut":
        return this.cut();
      case "paste":
        return this.paste();
      case "forward":
        if (sel.length === 1) this.edit((st) => reorder(st, sel[0], 1));
        return;
      case "backward":
        if (sel.length === 1) this.edit((st) => reorder(st, sel[0], -1));
        return;
      case "deselect":
        this.view.entered = void 0;
        return this.setState(select(s, []));
      case "zoom-fit":
        return this.zoom("fit");
      case "zoom-100":
        return this.zoom(1);
      default: {
        const step2 = e.shiftKey ? LAYOUT.nudgeLarge : LAYOUT.nudge;
        const [dx, dy] = NUDGE[action];
        if (sel.length) this.edit((st) => moveBy(st, sel, dx * step2, dy * step2));
      }
    }
  }
};
installPressCommit();
new App().start().catch((e) => {
  showBanner($("banner"), `\u8D77\u52D5\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${errText(e)}`, [], "error");
});

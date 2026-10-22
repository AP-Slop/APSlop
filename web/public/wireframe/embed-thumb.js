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
var MOTION_EASINGS = [
  "standard",
  "decelerate",
  "accelerate",
  "linear"
];
var SWIPE_DIRS = [
  "up",
  "down",
  "left",
  "right"
];
var BLOCK_MS_MAX = 6e4;

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
  const written2 = rowsOf(el2);
  const rows = written2.length > 0 ? written2 : placeholderRows(el2);
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
function placeholderRows(el2) {
  return Array.from({
    length: rowCount(el2)
  }, () => ({}));
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
function choiceItems(el2) {
  const v = el2.props.items;
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}
var radioHeight = (items, rowHeight) => Math.max(1, items) * rowHeight;

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
function stepDecimals(step) {
  const [m, e] = String(step).split("e-");
  const d = (m.split(".")[1]?.length ?? 0) + (e ? Number(e) : 0);
  return Math.min(10, d);
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
var tableHeight = (columns, rows) => (columns > 0 ? TABLE_HEAD_H : 0) + TABLE_ROW_H * Math.max(1, rows);
var written = (v) => Array.isArray(v) ? v.length : 3;
var tableHeightOf = (props) => tableHeight(written(props?.columns), written(props?.rows));
var NUMBER_CELL = /^[-+]?[¥￥$€]?[-+]?[0-9][0-9,]*(\.[0-9]+)?(%|円)?$/;
var isNumberCell = (cell) => NUMBER_CELL.test(cell.trim());
function numberColumns(el2) {
  const rows = tableRows(el2);
  return Array.from({
    length: tableColumnCount(el2)
  }, (_v, j) => {
    const cells = rows.map((r) => r[j] ?? "").filter((c) => c !== "");
    return cells.length > 0 && cells.every(isNumberCell);
  });
}
function tableRowTops(el2) {
  const head = tableHeadH(el2);
  return tableRows(el2).map((_r, i) => head + i * TABLE_ROW_H).filter((y) => y < el2.h);
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
    const rows = tableRows(el2);
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
      }, (_v, j) => cell(rows[i][j] ?? "", j, look))));
      const line = top + TABLE_ROW_H - 1;
      if (i < rows.length - 1 && line < el2.h) {
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
function groupSize(children) {
  return {
    w: Math.max(1, ...children.map((c) => c.x + c.w)),
    h: Math.max(1, ...children.map((c) => c.y + c.h))
  };
}

// src/core/defaults-file.ts
var NO_DEFAULTS = {};
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
    const written2 = el2[axis];
    if (written2 === "fit" && el2.type === "group" && !own) continue;
    if (written2 === "fit" || written2 === "fill") sizing[axis] = written2;
    else if (written2 === void 0) {
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

// src/editor/config.ts
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

// src/core/vnode.ts
var h = (tag, attrs = {}, ...children) => ({
  tag,
  attrs,
  children
});

// src/core/steps.ts
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
var COLOR_TEXT = `\u8272\u306F ${COLOR_NAMES.map((c) => "$" + c).join(" ")} \u304B #RRGGBB \u304B none \u304B null`;

// src/core/validate.ts
var COLOR_REFS = new Set(COLOR_NAMES.map((n) => `$${n}`));
var EASING_TEXT = `\u7DE9\u6025\u306F ${MOTION_EASINGS.join(" / ")} \u306E\u3069\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
var MS_TEXT = `0\u301C${BLOCK_MS_MAX} \u306E\u6574\u6570(\u30DF\u30EA\u79D2)\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;

// src/core/scroll.ts
var NO_SCROLL = Object.freeze({
  x: 0,
  y: 0
});
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
function scrollOf(scrolls, id) {
  return scrolls?.[id] ?? NO_SCROLL;
}

// src/core/block-text.ts
var SWIPE_ARROWS = {
  up: "\u2191",
  down: "\u2193",
  left: "\u2190",
  right: "\u2192"
};

// src/core/block-edit.ts
var DIRS = SWIPE_DIRS.map((d) => ({
  value: d,
  label: SWIPE_ARROWS[d]
}));

// src/editor/render.ts
function scrollBar(elm, axis, sent, bar) {
  if (sent.at === void 0) return void 0;
  const elapsed = bar.now - sent.at;
  if (elapsed >= SCROLLBAR_HOLD + bar.fade) return void 0;
  const span = axis === "y" ? elm.h : elm.w;
  const reach = Math.max(span, contentExtent(elm, axis));
  if (reach <= span) return void 0;
  const length = Math.max(24, Math.round(span * span / reach));
  const start = Math.round((span - length) * (sent[axis] / (reach - span)));
  const place = axis === "y" ? `top:${start}px;height:${length}px;` : `left:${start}px;width:${length}px;`;
  return el("div", {
    class: `wf-scrollbar wf-scrollbar-${axis}`,
    style: `${place}animation-duration:${bar.fade}ms;animation-delay:${SCROLLBAR_HOLD - elapsed}ms;`
  });
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
export {
  BUILTIN_THEMES,
  registry,
  renderThumbnail,
  themeOrDefault
};

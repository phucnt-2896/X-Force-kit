#!/usr/bin/env python3
"""Extract a structured "spec graph" from a Laravel codebase.

Walks the route files, reconstructs full URIs / controller actions / middleware
through nested ``Route::group`` scopes, captures the trailing screen-ID comment
(e.g. ``// Ad_JF_006``), then groups everything into *screens* and enriches each
controller with the Form Requests (validation = business rules), Eloquent models
and Blade views it touches.

Output is a single JSON document on stdout (or ``--out FILE``) consumed by the
spec-regenerator skill, which turns it into human-readable per-screen specs.

This is deterministic extraction only. It writes no specs and changes no files.

Usage:
    python3 extract_spec_graph.py --root /path/to/laravel [--area admin] \
            [--screen Ad_JF_006] [--out graph.json]
"""
import argparse
import json
import re
import sys
from pathlib import Path

VERBS = {"get", "post", "put", "patch", "delete", "options", "any", "match", "redirect"}

# ---------------------------------------------------------------------------
# Low-level, string/comment-aware scanning helpers
# ---------------------------------------------------------------------------


def skip_string(text, i):
    """Return index just past the PHP string literal starting at text[i]."""
    quote = text[i]
    i += 1
    n = len(text)
    while i < n:
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == quote:
            return i + 1
        i += 1
    return i


def read_balanced(text, start, open_ch, close_ch):
    """text[start] must be open_ch. Return (inner_text, index_after_close)."""
    depth = 0
    i = start
    n = len(text)
    begin = start + 1
    while i < n:
        c = text[i]
        if c in "'\"":
            i = skip_string(text, i)
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            j = text.find("\n", i)
            i = n if j == -1 else j
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "*":
            j = text.find("*/", i)
            i = n if j == -1 else j + 2
            continue
        if c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return text[begin:i], i + 1
        i += 1
    return text[begin:i], i


def read_statement(text, start):
    """Read a ``Route::...;`` statement. Return (stmt_text, index_after_semicolon)."""
    i = start
    n = len(text)
    paren = 0
    while i < n:
        c = text[i]
        if c in "'\"":
            i = skip_string(text, i)
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            j = text.find("\n", i)
            i = n if j == -1 else j
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "*":
            j = text.find("*/", i)
            i = n if j == -1 else j + 2
            continue
        if c == "(":
            paren += 1
        elif c == ")":
            paren -= 1
        elif c == ";" and paren == 0:
            return text[start : i + 1], i + 1
        i += 1
    return text[start:i], i


def split_top_level_args(inner):
    """Split a call-argument string on top-level commas (string/bracket aware)."""
    args = []
    depth = 0
    buf = []
    i = 0
    n = len(inner)
    while i < n:
        c = inner[i]
        if c in "'\"":
            j = skip_string(inner, i)
            buf.append(inner[i:j])
            i = j
            continue
        if c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
        if c == "," and depth == 0:
            args.append("".join(buf).strip())
            buf = []
            i += 1
            continue
        buf.append(c)
        i += 1
    if "".join(buf).strip():
        args.append("".join(buf).strip())
    return args


def first_php_string(fragment):
    m = re.search(r"""(['"])(.*?)(?<!\\)\1""", fragment, re.DOTALL)
    return m.group(2) if m else None


# ---------------------------------------------------------------------------
# Route file parsing
# ---------------------------------------------------------------------------


def parse_group_attrs(args):
    """Parse the attribute array of a Route::group(...) call."""
    attrs = {"prefix": "", "namespace": "", "as": "", "domain": "", "middleware": []}
    for key in ("prefix", "namespace", "as"):
        m = re.search(r"['\"]%s['\"]\s*=>\s*['\"]([^'\"]*)['\"]" % key, args)
        if m:
            attrs[key] = m.group(1)
    dom = re.search(r"['\"]domain['\"]\s*=>\s*config\(\s*['\"]([^'\"]+)['\"]", args)
    if dom:
        attrs["domain"] = dom.group(1)
    else:
        dom = re.search(r"['\"]domain['\"]\s*=>\s*['\"]([^'\"]+)['\"]", args)
        if dom:
            attrs["domain"] = dom.group(1)
    mw = re.search(r"['\"]middleware['\"]\s*=>\s*(\[[^\]]*\]|['\"][^'\"]+['\"])", args)
    if mw:
        attrs["middleware"] = re.findall(r"['\"]([^'\"]+)['\"]", mw.group(1))
    return attrs


def parse_route_statement(stmt, trailing_comment, group_stack, area):
    """Turn a single Route::verb(...) statement into a route dict."""
    m = re.match(r"Route::(\w+)\s*\(", stmt)
    if not m:
        return None
    verb = m.group(1).lower()
    if verb not in VERBS:
        return None
    paren_idx = stmt.index("(", m.start())
    inner, _ = read_balanced(stmt, paren_idx, "(", ")")
    parts = split_top_level_args(inner)
    if not parts:
        return None

    if verb == "match":
        # Route::match(['get','post'], 'uri', action)
        methods = re.findall(r"['\"]([a-zA-Z]+)['\"]", parts[0])
        uri = first_php_string(parts[1]) if len(parts) > 1 else ""
        action_raw = parts[2] if len(parts) > 2 else ""
        method = "|".join(s.upper() for s in methods) or "ANY"
    elif verb == "redirect":
        uri = first_php_string(parts[0]) if parts else ""
        action_raw = "redirect"
        method = "GET"
    else:
        uri = first_php_string(parts[0]) if parts else ""
        action_raw = parts[1] if len(parts) > 1 else ""
        method = "ANY" if verb == "any" else verb.upper()

    if uri is None:
        uri = ""

    # Resolve action -> controller@method (string or [Class::class,'method'] or closure)
    controller, controller_method, action_kind = resolve_action(action_raw, group_stack)

    # Compose URI with group prefixes
    prefixes = [g["prefix"].strip("/") for g in group_stack if g.get("prefix")]
    full_segments = [p for p in prefixes if p] + ([uri.strip("/")] if uri.strip("/") else [])
    full_uri = "/".join(full_segments)
    if uri == "/" and not full_uri:
        full_uri = "/"

    # Compose route name
    as_parts = [g["as"] for g in group_stack if g.get("as")]
    name_m = re.search(r"->name\(\s*['\"]([^'\"]+)['\"]", stmt)
    # A route with no ->name() is unnamed even inside an `as` group.
    route_name = ("".join(as_parts) + name_m.group(1)) if name_m else None

    # Middleware (group + inline)
    middleware = []
    for g in group_stack:
        middleware.extend(g.get("middleware", []))
    for mm in re.finditer(r"->middleware\(\s*(\[[^\]]*\]|['\"][^'\"]+['\"])", stmt):
        middleware.extend(re.findall(r"['\"]([^'\"]+)['\"]", mm.group(1)))
    # de-dup preserving order
    seen = set()
    middleware = [m for m in middleware if not (m in seen or seen.add(m))]

    domain = ""
    for g in group_stack:
        if g.get("domain"):
            domain = g["domain"]

    screen_code = None
    if trailing_comment:
        cm = re.match(r"([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+)", trailing_comment.strip())
        if cm:
            screen_code = cm.group(1)

    return {
        "method": method,
        "uri": "/" + full_uri if full_uri and not full_uri.startswith("/") else (full_uri or "/"),
        "name": route_name or None,
        "controller": controller,
        "controller_method": controller_method,
        "action_kind": action_kind,
        "middleware": middleware,
        "domain": domain,
        "area": area,
        "screen_code": screen_code,
        "comment": trailing_comment.strip() if trailing_comment else None,
    }


def resolve_action(action_raw, group_stack):
    """Return (controller_class, method, kind)."""
    action_raw = action_raw.strip()
    if not action_raw or action_raw.startswith("function") or action_raw.startswith("fn"):
        return (None, None, "closure")
    ns_parts = [g["namespace"] for g in group_stack if g.get("namespace")]
    namespace = "\\".join(ns_parts)

    # String form: 'Admin\Foo\BarController@method'
    s = first_php_string(action_raw)
    if s and "@" in s:
        ctrl, meth = s.split("@", 1)
        ctrl = ctrl.strip("\\")
        full = ctrl if (action_raw.strip().startswith("'\\") or ctrl.startswith("App\\")) else (
            (namespace + "\\" + ctrl) if namespace else ctrl)
        return (full, meth.strip(), "string")
    # Array form: [BarController::class, 'method']
    arr = re.search(r"\[\s*([A-Za-z0-9_\\]+)::class\s*,\s*['\"]([^'\"]+)['\"]", action_raw)
    if arr:
        ctrl = arr.group(1).strip("\\")
        full = (namespace + "\\" + ctrl) if (namespace and not ctrl.startswith("App\\")) else ctrl
        return (full, arr.group(2), "array")
    # Single-action controller string 'FooController'
    if s and re.match(r"^[A-Za-z0-9_\\]+Controller$", s):
        ctrl = s.strip("\\")
        full = (namespace + "\\" + ctrl) if namespace else ctrl
        return (full, "__invoke", "invokable")
    return (None, None, "unknown")


def parse_route_file(path, area):
    text = path.read_text(encoding="utf-8", errors="replace")
    routes = []
    i = 0
    n = len(text)
    depth = 0
    group_stack = []
    pending_group = None

    while i < n:
        c = text[i]
        if c in "'\"":
            i = skip_string(text, i)
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            j = text.find("\n", i)
            i = n if j == -1 else j
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "*":
            j = text.find("*/", i)
            i = n if j == -1 else j + 2
            continue
        if c == "{":
            depth += 1
            if pending_group is not None:
                pending_group["depth"] = depth
                group_stack.append(pending_group)
                pending_group = None
            i += 1
            continue
        if c == "}":
            if group_stack and group_stack[-1].get("depth") == depth:
                group_stack.pop()
            depth -= 1
            i += 1
            continue
        if text.startswith("Route::", i):
            m = re.match(r"Route::(\w+)\s*\(", text[i:])
            if m:
                kw = m.group(1)
                paren_idx = i + text[i:].index("(", m.start(), m.end())
                if kw == "group":
                    # Parse ONLY the first argument (the attribute array). Reading
                    # the whole call would absorb attributes from nested groups
                    # inside the closure body.
                    args, _ = read_balanced(text, paren_idx, "(", ")")
                    gparts = split_top_level_args(args)
                    attr_str = gparts[0] if gparts else ""
                    pending_group = parse_group_attrs(attr_str)
                    i = paren_idx + 1
                    continue
                if kw.lower() in VERBS:
                    stmt, end = read_statement(text, i)
                    # trailing line comment after the statement
                    line_end = text.find("\n", end)
                    line_end = n if line_end == -1 else line_end
                    tail = text[end:line_end]
                    cm = re.search(r"//\s*(.*)$", tail)
                    trailing = cm.group(1) if cm else None
                    route = parse_route_statement(stmt, trailing, group_stack, area)
                    if route:
                        routes.append(route)
                    i = end
                    continue
            i += 7
            continue
        i += 1
    return routes


# ---------------------------------------------------------------------------
# Controller / Form Request / Model enrichment
# ---------------------------------------------------------------------------


def class_to_path(root, fqcn):
    """Map App\\... FQCN to a file under app/."""
    if not fqcn:
        return None
    rel = fqcn
    if rel.startswith("App\\"):
        rel = rel[len("App\\"):]
        candidate = root / "app" / Path(rel.replace("\\", "/") + ".php")
    else:
        candidate = root / "app" / "Http" / "Controllers" / Path(rel.replace("\\", "/") + ".php")
    return candidate if candidate.exists() else None


_file_cache = {}


def read_file(path):
    if path in _file_cache:
        return _file_cache[path]
    try:
        txt = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        txt = ""
    _file_cache[path] = txt
    return txt


def extract_rules(request_path):
    text = read_file(request_path)
    rules = {}
    m = re.search(r"function\s+rules\s*\([^)]*\)\s*(?::\s*\w+\s*)?\{", text)
    if not m:
        return rules
    body, _ = read_balanced(text, text.index("{", m.start()), "{", "}")
    # 'field' => 'rule|rule'  OR  'field' => ['a','b']
    for fm in re.finditer(
        r"['\"]([A-Za-z0-9_.*]+)['\"]\s*=>\s*(\[[^\]]*\]|['\"][^'\"]*['\"])", body
    ):
        field = fm.group(1)
        val = fm.group(2)
        if val.startswith("["):
            parts = re.findall(r"['\"]([^'\"]+)['\"]", val)
            rules[field] = "|".join(parts)
        else:
            rules[field] = val.strip("'\"")
    # custom withValidator presence
    return rules


def enrich_controller(root, fqcn):
    path = class_to_path(root, fqcn)
    if not path:
        return {"file": None, "requests": [], "models": [], "views": []}
    text = read_file(path)
    requests = sorted(set(re.findall(r"use\s+(App\\Http\\Requests\\[A-Za-z0-9_\\]+)\s*;", text)))
    models = sorted(set(re.findall(r"use\s+(App\\Models\\[A-Za-z0-9_\\]+)\s*;", text)))
    views = sorted(set(re.findall(r"""view\(\s*['\"]([A-Za-z0-9_.\-/]+)['\"]""", text)))
    rel = str(path.relative_to(root))
    return {"file": rel, "requests": requests, "models": models, "views": views}


# ---------------------------------------------------------------------------
# Screen grouping
# ---------------------------------------------------------------------------


def short_class(fqcn):
    if not fqcn:
        return "Unknown"
    return fqcn.split("\\")[-1]


def synth_screen_id(route, area_prefix):
    """For routes without an explicit screen code, group by controller."""
    ctrl = short_class(route.get("controller")).replace("Controller", "") or "General"
    return "%s-%s" % (area_prefix, ctrl)


AREA_PREFIX = {"admin": "Ad", "agent": "Ag", "candidate": "Ca", "api": "Api", "web": "Web"}


def build_graph(root, routes):
    screens = {}
    for r in routes:
        area = r["area"]
        code = r.get("screen_code")
        if code:
            sid = code
            explicit = True
        else:
            sid = synth_screen_id(r, AREA_PREFIX.get(area, area[:2].title()))
            explicit = False
        s = screens.setdefault(
            sid,
            {
                "screen_id": sid,
                "area": area,
                "explicit_code": explicit,
                "routes": [],
                "controllers": set(),
                "form_requests": {},
                "models": set(),
                "views": set(),
            },
        )
        s["routes"].append(
            {
                "method": r["method"],
                "uri": r["uri"],
                "name": r["name"],
                "action": (r["controller"] + "@" + (r["controller_method"] or "")) if r["controller"] else r["action_kind"],
                "middleware": r["middleware"],
            }
        )
        if r["controller"]:
            s["controllers"].add(r["controller"])

    # Enrich each screen's controllers
    for s in screens.values():
        for ctrl in s["controllers"]:
            info = enrich_controller(root, ctrl)
            for req in info["requests"]:
                if req not in s["form_requests"]:
                    rp = class_to_path(root, req)
                    s["form_requests"][req] = {
                        "class": req,
                        "file": str(rp.relative_to(root)) if rp else None,
                        "rules": extract_rules(rp) if rp else {},
                    }
            s["models"].update(info["models"])
            s["views"].update(info["views"])

    # Finalize (sets -> sorted lists)
    out = []
    for s in sorted(screens.values(), key=lambda x: (x["area"], x["screen_id"])):
        out.append(
            {
                "screen_id": s["screen_id"],
                "area": s["area"],
                "explicit_code": s["explicit_code"],
                "controllers": sorted(s["controllers"]),
                "routes": s["routes"],
                "form_requests": list(s["form_requests"].values()),
                "models": sorted(s["models"]),
                "views": sorted(s["views"]),
            }
        )
    return out


# ---------------------------------------------------------------------------
# Lang label index (optional human-readable names)
# ---------------------------------------------------------------------------


def collect_route_files(root):
    """Find HTTP route files under routes/ for any Laravel layout.

    Scans routes/*.php and any nested routes/**/*.php, skipping non-HTTP
    definitions. The area name is the file stem (web, api, admin, agent, ...).
    """
    routes_dir = root / "routes"
    if not routes_dir.is_dir():
        return []
    skip = {"console.php", "channels.php"}
    files = []
    for f in sorted(routes_dir.rglob("*.php")):
        if f.name in skip:
            continue
        files.append((f, f.stem))
    return files


def screen_search_blob(s):
    """Lowercase searchable text for a screen, for --match keyword filtering."""
    parts = [s["screen_id"], s["area"]]
    parts += [short_class(c) for c in s["controllers"]]
    for r in s["routes"]:
        parts.append(r["uri"])
        if r.get("name"):
            parts.append(r["name"])
    parts += [short_class(fr["class"]) for fr in s["form_requests"]]
    parts += [short_class(m) for m in s["models"]]
    # split camelCase / separators so "job fair" matches JobFairController, job-fairs
    text = " ".join(parts)
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", text)
    text = re.sub(r"[\\/_.\-]", " ", text)
    return text.lower()


def match_screens(screens, query):
    """Rank screens by how many query tokens appear in their searchable text."""
    tokens = [t for t in re.split(r"\s+", query.lower().strip()) if t]
    ranked = []
    for s in screens:
        blob = screen_search_blob(s)
        score = sum(1 for t in set(tokens) if t in blob)
        if score:
            s = dict(s, match_score=score)
            ranked.append(s)
    ranked.sort(key=lambda x: (-x["match_score"], x["area"], x["screen_id"]))
    return ranked


def main(argv=None):
    ap = argparse.ArgumentParser(description="Extract a Laravel spec graph as JSON.")
    ap.add_argument("--root", default=".", help="Laravel project root")
    ap.add_argument("--area", help="Filter to one area (admin|agent|candidate|api|web)")
    ap.add_argument("--screen", help="Filter to one screen id / code (e.g. Ad_JF_006)")
    ap.add_argument(
        "--match",
        help="Filter by feature keywords; ranks screens by relevance "
        "(e.g. --match 'job fair create'). Use when you know the feature, not the ID.",
    )
    ap.add_argument("--out", help="Write JSON here instead of stdout")
    args = ap.parse_args(argv)

    root = Path(args.root).resolve()
    if not (root / "routes").exists():
        ap.error("No routes/ directory under %s — is this a Laravel project root?" % root)

    all_routes = []
    for path, area in collect_route_files(root):
        all_routes.extend(parse_route_file(path, area))

    if args.area:
        all_routes = [r for r in all_routes if r["area"] == args.area]

    screens = build_graph(root, all_routes)

    if args.screen:
        screens = [s for s in screens if s["screen_id"] == args.screen]

    if args.match:
        screens = match_screens(screens, args.match)

    areas = {}
    for s in screens:
        a = areas.setdefault(s["area"], {"screen_count": 0, "explicit_codes": 0})
        a["screen_count"] += 1
        if s["explicit_code"]:
            a["explicit_codes"] += 1

    doc = {
        "root": str(root),
        "filters": {"area": args.area, "screen": args.screen, "match": args.match},
        "areas": areas,
        "screen_total": len(screens),
        "route_total": sum(len(s["routes"]) for s in screens),
        "screens": screens,
    }

    payload = json.dumps(doc, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(payload, encoding="utf-8")
        print("Wrote %d screens (%d routes) -> %s" % (doc["screen_total"], doc["route_total"], args.out))
        if args.match:
            print("Top matches for %r:" % args.match)
            for s in screens[:10]:
                ctrls = ", ".join(short_class(c) for c in s["controllers"][:3]) or "—"
                print("  [%d] %-22s %s" % (s["match_score"], s["screen_id"], ctrls))
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())

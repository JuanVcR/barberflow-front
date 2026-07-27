import { Project, SyntaxKind, IfStatement } from "ts-morph";
import path from "node:path";

export interface RouteInfo {
  path: string;
  protected: boolean;
  role?: "customer" | "professional" | "admin" | "public" | "auth";
}

const APP_PATH = path.resolve(process.cwd(), "src/App.tsx");

function normalize(pathname: string) {
  return pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function add(
  routes: Map<string, RouteInfo>,
  pathname: string,
  role: RouteInfo["role"],
  protectedRoute: boolean
) {
  pathname = normalize(pathname);

  if (!routes.has(pathname)) {
    routes.set(pathname, {
      path: pathname,
      role,
      protected: protectedRoute,
    });
  }
}

function getIfStatements(project: Project) {
  const source = project.getSourceFileOrThrow(APP_PATH);
  return source.getDescendantsOfKind(SyntaxKind.IfStatement);
}

function getText(node: IfStatement) {
  return node.getExpression().getText();
}

function readSegmentEqualsZero(text: string) {
  const m = text.match(/segments\[0\]\s*===\s*['"`](.*?)['"`]/);
  return m?.[1];
}

function readSegmentEqualsOne(text: string) {
  const m = text.match(/segments\[1\]\s*===\s*['"`](.*?)['"`]/);
  return m?.[1];
}

export function discoverRoutes(): RouteInfo[] {
  const project = new Project({
    skipAddingFilesFromTsConfig: false,
    tsConfigFilePath: "tsconfig.json",
  });

  project.addSourceFileAtPath(APP_PATH);

  const routes = new Map<string, RouteInfo>();
  add(routes, "/", "public", false);

  const ifs = getIfStatements(project);

  for (const stmt of ifs) {
    const text = getText(stmt);
    const s0 = readSegmentEqualsZero(text);
    const s1 = readSegmentEqualsOne(text);

    if (!s0) continue;

    switch (s0) {
      case "auth": {
        if (s1) {
          add(routes, `/auth/${s1}`, "auth", false);
        }
        break;
      }

      case "public": {
        if (s1 === "barbershops") add(routes, "/public/barbershops", "public", false);
        if (s1 === "barbershop") add(routes, "/public/barbershop/:slug", "public", false);
        break;
      }

      case "customer": {
        if (s1 === "explore") add(routes, "/customer/explore", "customer", true);
        if (s1 === "appointments") add(routes, "/customer/appointments", "customer", true);
        if (s1 === "booking") add(routes, "/customer/booking/:barbershopId", "customer", true);
        if (s1 === "profile") add(routes, "/customer/profile", "customer", true);
        break;
      }

      default:
        break;
    }
  }

  return Array.from(routes.values());
}

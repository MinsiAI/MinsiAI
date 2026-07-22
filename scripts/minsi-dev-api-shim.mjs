import http from "node:http";

const port = Number(process.env.PORT ?? 8080);
const allowedOrigins = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);

function corsHeaders(origin) {
  const headers = {
    "Vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type, Origin, X-Request-Id, X-Requested-With",
    "Access-Control-Expose-Headers": "X-Request-Id",
    "Access-Control-Allow-Credentials": "true"
  };

  if (allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    ...corsHeaders(origin),
    "Content-Type": "application/json;charset=UTF-8",
    "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate"
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  const origin = request.headers.origin ?? "";
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders(origin));
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    sendJson(response, 401, {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "请先登录。"
      }
    }, origin);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      data: {
        status: "ok",
        service: "minsi-dev-api-shim"
      }
    }, origin);
    return;
  }

  sendJson(response, 404, {
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: "接口不存在。"
    }
  }, origin);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Minsi dev API shim listening on http://127.0.0.1:${port}`);
});

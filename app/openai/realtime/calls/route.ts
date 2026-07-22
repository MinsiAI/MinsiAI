import { Buffer } from "node:buffer";
import https from "node:https";
import net from "node:net";
import type { Duplex } from "node:stream";
import tls from "node:tls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_REALTIME_CALLS_HOST = "api.openai.com";
const OPENAI_REALTIME_CALLS_PATH = "/v1/realtime/calls";
const DEFAULT_LOCAL_HTTP_PROXY = "http://127.0.0.1:15236";
const REQUEST_TIMEOUT_MS = 20000;
const REALTIME_PROXY_ENABLED = process.env.NODE_ENV === "development"
  || process.env.MINSI_ENABLE_REALTIME_PROXY === "true";

interface UpstreamResponse {
  status: number;
  contentType: string;
  body: Buffer;
}

export async function POST(request: Request) {
  if (!REALTIME_PROXY_ENABLED) {
    return new Response("Not Found", { status: 404 });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sdpOffer = await request.text();
  if (!sdpOffer.trim()) {
    return new Response("Missing SDP offer", { status: 400 });
  }

  try {
    const upstream = await postRealtimeSdp(sdpOffer, authorization);
    return new Response(upstream.body.toString("utf8"), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return new Response("Realtime proxy unavailable", {
      status: 502,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "Cache-Control": "no-store"
      }
    });
  }
}

function postRealtimeSdp(sdpOffer: string, authorization: string) {
  const body = Buffer.from(sdpOffer);
  const proxyUrl = getProxyUrl();
  const agent = proxyUrl ? new LocalHttpsProxyAgent(proxyUrl) : undefined;

  return new Promise<UpstreamResponse>((resolve, reject) => {
    const upstreamRequest = https.request({
      agent: agent as https.Agent | undefined,
      host: OPENAI_REALTIME_CALLS_HOST,
      path: OPENAI_REALTIME_CALLS_PATH,
      method: "POST",
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Authorization: authorization,
        "Content-Type": "application/sdp",
        Accept: "application/sdp",
        "Content-Length": body.byteLength
      }
    }, (upstreamResponse) => {
      const chunks: Buffer[] = [];
      upstreamResponse.on("data", (chunk: Buffer) => chunks.push(chunk));
      upstreamResponse.on("end", () => {
        resolve({
          status: upstreamResponse.statusCode ?? 502,
          contentType: upstreamResponse.headers["content-type"]?.toString() || "application/sdp",
          body: Buffer.concat(chunks)
        });
      });
    });

    upstreamRequest.on("timeout", () => {
      upstreamRequest.destroy(new Error("Realtime request timed out."));
    });
    upstreamRequest.on("error", reject);
    upstreamRequest.end(body);
  });
}

function getProxyUrl() {
  const configuredProxy = process.env.MINSI_OPENAI_HTTP_PROXY
    || process.env.HTTPS_PROXY
    || process.env.HTTP_PROXY
    || (process.env.NODE_ENV === "development" ? DEFAULT_LOCAL_HTTP_PROXY : "");

  if (!configuredProxy) {
    return null;
  }

  try {
    const proxyUrl = new URL(configuredProxy);
    if (proxyUrl.protocol !== "http:") {
      return null;
    }
    return proxyUrl;
  } catch {
    return null;
  }
}

class LocalHttpsProxyAgent extends https.Agent {
  constructor(private readonly proxyUrl: URL) {
    super({ keepAlive: false });
  }

  override createConnection(options: https.RequestOptions, callback?: (error: Error | null, socket: Duplex) => void) {
    if (!callback) {
      return super.createConnection(options);
    }

    const targetHost = String(options.host || options.hostname || OPENAI_REALTIME_CALLS_HOST);
    const targetPort = Number(options.port || 443);
    const proxySocket = net.connect(Number(this.proxyUrl.port || 80), this.proxyUrl.hostname);
    let settled = false;

    const settle = (error: Error | null, socket?: Duplex) => {
      if (settled) {
        if (socket) {
          socket.destroy();
        }
        return;
      }
      settled = true;
      if (socket) {
        callback(error, socket);
      } else {
        callback(error, proxySocket);
      }
    };

    proxySocket.setTimeout(REQUEST_TIMEOUT_MS);
    proxySocket.once("connect", () => {
      proxySocket.write(
        `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\n`
          + `Host: ${targetHost}:${targetPort}\r\n`
          + "Connection: close\r\n\r\n"
      );
    });
    proxySocket.once("timeout", () => {
      proxySocket.destroy(new Error("Proxy connection timed out."));
    });
    proxySocket.once("error", (error) => settle(error));

    let headerBuffer = Buffer.alloc(0);
    const handleProxyResponse = (chunk: Buffer) => {
      headerBuffer = Buffer.concat([headerBuffer, chunk]);
      const headerEnd = headerBuffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return;
      }

      proxySocket.off("data", handleProxyResponse);
      const headerText = headerBuffer.subarray(0, headerEnd).toString("latin1");
      if (!/^HTTP\/1\.[01] 2\d\d/.test(headerText)) {
        proxySocket.destroy();
        settle(new Error("Proxy CONNECT failed."));
        return;
      }

      const remaining = headerBuffer.subarray(headerEnd + 4);
      const tlsSocket = tls.connect({
        socket: proxySocket,
        servername: targetHost
      });
      tlsSocket.once("secureConnect", () => {
        if (remaining.length > 0) {
          tlsSocket.unshift(remaining);
        }
        settle(null, tlsSocket);
      });
      tlsSocket.once("error", (error) => settle(error));
    };

    proxySocket.on("data", handleProxyResponse);
    return undefined;
  }
}

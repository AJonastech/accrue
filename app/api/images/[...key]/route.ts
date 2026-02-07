import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getObjectStream } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { key: keyParts } = await context.params;
  const key = keyParts?.join("/") ?? "";
  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  const expectedPrefix = `profiles/${session.user.id}/`;
  if (!key.startsWith(expectedPrefix)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const object = await getObjectStream(key);
    if (!object.body) {
      return new Response("Not found", { status: 404 });
    }

    let body: BodyInit | null = null;
    if (object.body instanceof Readable) {
      body = Readable.toWeb(object.body) as ReadableStream;
    } else {
      body = object.body as BodyInit;
    }

    const headers = new Headers();
    if (object.contentType) {
      headers.set("Content-Type", object.contentType);
    }
    if (object.contentLength) {
      headers.set("Content-Length", object.contentLength.toString());
    }
    headers.set("Cache-Control", "private, max-age=300");

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      return new Response(
        `Storage error. Check bucket env vars. ${String(error)}`,
        { status: 500 },
      );
    }
    return new Response("Not found", { status: 404 });
  }
}

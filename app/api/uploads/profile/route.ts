import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createPresignedUploadUrl } from "@/lib/storage";

const getExtension = (filename: string, contentType: string) => {
  const byType = contentType.split("/")[1];
  if (byType) return byType.toLowerCase();
  const byName = filename.split(".").pop();
  return byName ? byName.toLowerCase() : "bin";
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const filename = String(body.filename ?? "upload");
  const contentType = String(body.contentType ?? "application/octet-stream");
  const extension = getExtension(filename, contentType);

  const key = `profiles/${session.user.id}/${Date.now()}.${extension}`;
  const uploadUrl = await createPresignedUploadUrl(key, contentType);

  return new Response(JSON.stringify({ uploadUrl, key }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

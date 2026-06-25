import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions); //로그인 되어있지 않으면 NULL반환

  if (!session?.user?.admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

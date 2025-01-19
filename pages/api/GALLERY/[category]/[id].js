import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(request, respond) {
  const { category, id } = request.query;
  const client = await connectDB;
  const db = client.db("Yu");

  if (request.method === "GET") {
    try {

      const data = await db.collection(category.toLowerCase()).findOne({_id : new ObjectId(id)});
    console.log(data)
    respond.status(200).json(data);
  } catch (error) {
    console.error("Database error:", error);
    respond.status(500).json({ message: "Internal server error" });
  }
}

  else {
  respond.setHeader("Allow", ["GET"]);
  respond.status(405).end(`Method ${request.method} Not Allowed`);
}
}
import { ObjectId } from "mongodb";

export default function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

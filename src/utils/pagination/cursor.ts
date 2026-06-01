import { Types, type FilterQuery } from "mongoose";
import ErrorHandler from "../errorHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";
import type {
  CursorSource,
  DecodedCursor,
} from "../../types/pagination.types.js";

const CURSOR_SEPARATOR = "_";

/**
 * Encode cursor as base64url(ISO createdAt + "_" + ObjectId).
 */
export const encodeCursor = (doc: CursorSource): string => {
  const payload = `${doc.createdAt.toISOString()}${CURSOR_SEPARATOR}${doc._id.toString()}`;
  return Buffer.from(payload, "utf8").toString("base64url");
};

export const decodeCursor = (cursor: string): DecodedCursor => {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const separatorIndex = decoded.lastIndexOf(CURSOR_SEPARATOR);
    if (separatorIndex === -1) {
      throw new Error("Invalid cursor format");
    }

    const createdAtIso = decoded.slice(0, separatorIndex);
    const id = decoded.slice(separatorIndex + 1);
    const createdAt = new Date(createdAtIso);

    if (Number.isNaN(createdAt.getTime()) || !Types.ObjectId.isValid(id)) {
      throw new Error("Invalid cursor payload");
    }

    return { createdAt, id };
  } catch (err) {
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(
      "Invalid pagination cursor",
      HTTP_STATUS.BAD_REQUEST
    );
  }
};

/**
 * Range filter for stable sort: createdAt DESC, _id DESC (no skip).
 */
export const buildCursorRangeFilter = (
  cursor: DecodedCursor
): FilterQuery<unknown> => {
  const objectId = new Types.ObjectId(cursor.id);
  return {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: objectId } },
    ],
  };
};

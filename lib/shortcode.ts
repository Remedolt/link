import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/1/l/I) for clean, readable, shareable codes.
const alphabet = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

export const generateShortCode = customAlphabet(alphabet, 6);

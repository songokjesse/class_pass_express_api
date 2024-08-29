import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
require("dotenv").config();


const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(turso);
module.exports = { db };
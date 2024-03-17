import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

export const enableEnv = (envPath) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return dotenv.config({ path: `${__dirname}${envPath}`});
}

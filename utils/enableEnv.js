import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export const enableEnv = (envPath) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const fullPath = join(__dirname, envPath);
  
    dotenv.config({ path: fullPath });
  
    return true;
  } catch(error) {
    console.error(`Error loading environment variables: ${error}`);

    return false;
  }
}

// Railway project configuration
import { defineConfig } from "@railway/cli/config";

export default defineConfig({
  services: {
    "medibook-api": {
      build: {
        installCmd: "npm install",
        buildCmd: "cd frontend && npm install && npm run build",
      },
      deploy: {
        startCmd: "node index.js",
        healthcheckPath: "/",
      },
    },
  },
});

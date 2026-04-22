import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// app.listen(env.PORT, () => {
//   console.log(`BACKEND-PORTFOLIO running on http://localhost:${env.PORT}`);
// });


app.listen(env.PORT, "127.0.0.1", () => {
  console.log(`Server BACKEND-PORTFOLIO-API running on http://127.0.0.1:${env.PORT}`);
});
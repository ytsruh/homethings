import { Hono } from "hono";
import { renderToString } from "react-dom/server";
import api from "./api";

type Env = {
  Bindings: {};
};

const app = new Hono<Env>();

app.route("/api", api);

app.get("*", (c) => {
  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
          {import.meta.env.PROD ? (
            <>
              <link rel="stylesheet" href="/assets/client.css" />
              <script type="module" src="/static/client.js"></script>
            </>
          ) : (
            <script type="module" src="/src/client.tsx"></script>
          )}
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    )
  );
});

export default app;

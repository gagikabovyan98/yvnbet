import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import Site from "./Site.jsx";
import { ADMIN_PATH } from "./routes.mjs";
import "./style.css";
const Admin = lazy(() => import("./Admin.jsx"));
const root = createRoot(document.getElementById("root"));
if (location.pathname.replace(/\/$/, "") === ADMIN_PATH)
  root.render(
    <Suspense fallback={<p className="empty">Загрузка…</p>}>
      <Admin />
    </Suspense>,
  );
else {
  const data = JSON.parse(document.getElementById("site-data").textContent);
  root.render(<Site content={data} path={location.pathname} />);
}

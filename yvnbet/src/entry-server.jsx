import React from "react";
import { renderToString } from "react-dom/server";
import Site from "./Site.jsx";
export function render(content, path) {
  return renderToString(<Site content={content} path={path} />);
}

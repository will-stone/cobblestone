import { React } from "../deps.ts";

export const Page = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>Page Title</title>
    </head>
    <body className="container">{children}</body>
  </html>
);

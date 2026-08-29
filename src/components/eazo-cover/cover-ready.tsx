"use client";

import { useEffect } from "react";

/**
 * 标记封面预览已就绪（替换掉模板起始页后再包裹）。
 * 在挂载后设置一个稳定的 data 标记，供封面捕获服务识别。
 */
export function EazoCoverReady({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.setAttribute("data-eazo-cover-ready", "1");
    return () => {
      document.body.removeAttribute("data-eazo-cover-ready");
    };
  }, []);
  return <div data-eazo-cover-ready-root="">{children}</div>;
}

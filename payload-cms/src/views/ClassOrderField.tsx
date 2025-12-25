"use client";

import React from "react";
import { useField } from "@payloadcms/ui";
import ClassOrderList from "./ClassOrderList";

export default function ClassOrderField() {
  const { value: titleValue } = useField<string>({ path: "title" });
  const { setValue: setOrderValue, value: orderValue } = useField<number>({
    path: "order",
  });

  const pendingTitle =
    typeof titleValue === "string" && titleValue.trim().length > 0
      ? titleValue.trim()
      : "Untitled class";

  return (
    <div style={{ margin: "6px 0 20px" }}>
      <ClassOrderList
        title="Reorder classes"
        showEditLinks
        pendingTitle={pendingTitle}
        pendingOrder={typeof orderValue === "number" ? orderValue : null}
        onPendingOrderChange={(order) => {
          if (orderValue !== order) {
            setOrderValue(order);
          }
        }}
      />
    </div>
  );
}

import React, { useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
export default function Modal({
  title,
  children,
  onClose,
  closeLabel = "Закрыть",
  wide = false,
}) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const d = ref.current;
    const x = window.scrollX, y = window.scrollY;
    const active = document.activeElement;
    const keys = ["overflow", "position", "top", "left", "right", "width"];
    const previous = Object.fromEntries(keys.map(key => [key, document.body.style[key]]));
    Object.assign(document.body.style, { overflow: "hidden", position: "fixed", top: `-${y}px`, left: `-${x}px`, right: "0", width: "100%" });
    d.showModal();
    return () => {
      d.close();
      Object.assign(document.body.style, previous);
      if (active?.isConnected) active.focus?.({ preventScroll: true });
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        {onClose && (
          <button
            className="icon-button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X />
          </button>
        )}
      </div>
      {children}
    </dialog>
  );
}

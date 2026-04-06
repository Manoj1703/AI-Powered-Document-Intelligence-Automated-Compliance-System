import React, { useEffect, useState } from "react";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "[role='button']",
  "[data-cursor='interactive']",
].join(", ");

function supportsFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

function CustomCursor() {
  const [enabled, setEnabled] = useState(() => supportsFinePointer());
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(pointer: fine)");
    const syncEnabled = () => setEnabled(media.matches);
    syncEnabled();

    if (media.addEventListener) {
      media.addEventListener("change", syncEnabled);
      return () => media.removeEventListener("change", syncEnabled);
    }

    media.addListener(syncEnabled);
    return () => media.removeListener(syncEnabled);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.body.classList.toggle("has-custom-cursor", enabled);
    return () => document.body.classList.remove("has-custom-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    function handlePointerMove(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;

      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
      setInteractive(Boolean(event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)));
    }

    function handlePointerDown(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      setPressed(true);
    }

    function handlePointerUp(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      setPressed(false);
    }

    function handlePointerLeave() {
      setVisible(false);
      setPressed(false);
      setInteractive(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={[
        "custom-cursor",
        visible ? "is-visible" : "",
        pressed ? "is-pressed" : "",
        interactive ? "is-interactive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      aria-hidden="true"
    >
      <span className="custom-cursor-ring" />
      <span className="custom-cursor-dot" />
    </div>
  );
}

export default CustomCursor;

import "@testing-library/jest-dom/vitest";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: () => ({
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    createRadialGradient() {
      return { addColorStop() {} };
    },
    fillRect() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
  }),
});

// globals.d.ts
export {};

declare global {
  interface Window {
    initAiBotWidget: (args: { userId: string; agentId: string }) => void;
  }
}

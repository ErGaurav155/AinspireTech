// globals.d.ts
export {};

declare global {
  interface Window {
    initAiBotWidget: ({
      userId,
      agentId,
    }: {
      userId: string;
      agentId: string;
    }) => void;
    paypal?: any;
  }
}

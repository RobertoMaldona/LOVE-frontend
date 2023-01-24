export const Bypasser = (App) => {
  const { actx } = App;
  const bypasserNode = new AudioWorkletNode(actx, 'bypassProcessor');
  const oscillator = actx.createOscillator();
  oscillator.connect(bypasserNode).connect(actx.destination);
  oscillator.start();
  return bypasserNode;
};

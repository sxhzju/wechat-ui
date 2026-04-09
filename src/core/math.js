(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const easeOutBack = (value) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
  };

  const getFrameProgress = (currentFrame, startFrame, durationFrames) => {
    if (durationFrames <= 0) {
      return currentFrame >= startFrame ? 1 : 0;
    }

    return clamp((currentFrame - startFrame) / durationFrames, 0, 1);
  };

  WechatUI.math = {
    clamp,
    easeOutBack,
    getFrameProgress
  };
})();

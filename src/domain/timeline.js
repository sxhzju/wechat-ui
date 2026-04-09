(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants, messageMotion } = WechatUI;

  const buildTimeline = (items, fps) => {
    let cursorFrame = 0;
    const messageTimeline = new Map();
    const messageIndices = [];

    items.forEach((item, index) => {
      if (item.type === 'timestamp') {
        return;
      }

      const motionFrames = messageMotion.getMotionSeconds(item) * fps;
      const startFrame = cursorFrame;
      const endFrame = startFrame + motionFrames;

      messageTimeline.set(index, {
        startFrame,
        endFrame,
        motionFrames
      });
      messageIndices.push(index);
      cursorFrame = endFrame + constants.MESSAGE_GAP_SECONDS * fps;
    });

    const lastMessageIndex = messageIndices[messageIndices.length - 1];
    const totalFrames =
      lastMessageIndex === undefined
        ? 0
        : messageTimeline.get(lastMessageIndex).endFrame;

    return {
      messageTimeline,
      totalFrames
    };
  };

  WechatUI.timeline = {
    buildTimeline
  };
})();

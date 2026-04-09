(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants, math } = WechatUI;

  const isSelfMessage = (item) => item.from === constants.ROLE_SELF;

  const usesStreamingTextMotion = (item) =>
    item.from === constants.ROLE_CHAT_PARTNER && item.type === 'text';

  const getMotionSeconds = (item) => {
    if (usesStreamingTextMotion(item)) {
      const charCount = Array.from(item.text || '').length;
      const baseStreamSeconds = math.clamp(
        charCount * constants.STREAM_CHAR_SECONDS,
        constants.STREAM_MIN_SECONDS,
        constants.STREAM_MAX_SECONDS
      );
      return baseStreamSeconds / constants.STREAM_SPEED_MULTIPLIER;
    }

    return constants.POP_MOTION_SECONDS;
  };

  const getPopStyle = (item, slot, currentFrame, fps) => {
    const progress = math.getFrameProgress(
      currentFrame,
      slot.startFrame,
      constants.POP_MOTION_SECONDS * fps
    );
    const eased = math.easeOutBack(progress);
    const baseScale = 0.86;
    const scale = baseScale + (1 - baseScale) * eased;
    const isSelf = isSelfMessage(item);

    return {
      opacity: progress,
      transform: `scale(${scale})`,
      transformOrigin: isSelf ? 'right center' : 'left center'
    };
  };

  const getStreamingTextState = (item, slot, currentFrame, fps) => {
    const progress = math.getFrameProgress(currentFrame, slot.startFrame, slot.motionFrames);
    const textChars = Array.from(item.text || '');
    const visibleCount = Math.floor(progress * textChars.length);
    const visibleText = textChars.slice(0, visibleCount).join('');
    const revealProgress = math.getFrameProgress(
      currentFrame,
      slot.startFrame,
      (constants.STREAM_REVEAL_SECONDS / constants.STREAM_SPEED_MULTIPLIER) * fps
    );

    return {
      visibleText,
      revealProgress
    };
  };

  WechatUI.messageMotion = {
    isSelfMessage,
    usesStreamingTextMotion,
    getMotionSeconds,
    getPopStyle,
    getStreamingTextState
  };
})();

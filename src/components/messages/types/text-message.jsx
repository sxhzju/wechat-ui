(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { messageMotion } = WechatUI;

  const TextMessage = ({ item, slot, currentFrame, fps, mode = 'pop' }) => {
    const isSelf = messageMotion.isSelfMessage(item);
    const TextBubble = WechatUI.components.messages.base.TextBubble;
    const BaseMessage = WechatUI.components.messages.base.BaseMessage;

    if (mode === 'stream') {
      const streamState = messageMotion.getStreamingTextState(item, slot, currentFrame, fps);

      return (
        <div
          style={{
            opacity: streamState.revealProgress,
            transform: `translateY(${(1 - streamState.revealProgress) * 8}px)`
          }}
        >
          <BaseMessage item={item}>
            <TextBubble isSelf={isSelf}>
              <span>{streamState.visibleText}</span>
            </TextBubble>
          </BaseMessage>
        </div>
      );
    }

    return (
      <div style={messageMotion.getPopStyle(item, slot, currentFrame, fps)}>
        <BaseMessage item={item}>
          <TextBubble text={item.text} isSelf={isSelf} />
        </BaseMessage>
      </div>
    );
  };

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.types = WechatUI.components.messages.types || {};
  WechatUI.components.messages.types.TextMessage = TextMessage;
})();

(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { messageMotion } = WechatUI;

  const renderers = {
    timestamp: ({ item }) => (
      <WechatUI.components.messages.types.TimeStampMessage label={item.label} />
    ),
    text: ({ item, slot, currentFrame, fps }) => {
      const mode = messageMotion.usesStreamingTextMotion(item) ? 'stream' : 'pop';
      return (
        <WechatUI.components.messages.types.TextMessage
          item={item}
          slot={slot}
          currentFrame={currentFrame}
          fps={fps}
          mode={mode}
        />
      );
    },
    video: ({ item, slot, currentFrame, fps }) => (
      <WechatUI.components.messages.types.VideoMessage
        item={item}
        slot={slot}
        currentFrame={currentFrame}
        fps={fps}
      />
    )
  };

  const renderChatItem = ({ item, slot, currentFrame, fps }) => {
    const renderer = renderers[item.type];
    if (!renderer) {
      return null;
    }

    if (item.type !== 'timestamp' && !slot) {
      return null;
    }

    return renderer({ item, slot, currentFrame, fps });
  };

  WechatUI.renderChatItem = renderChatItem;
})();

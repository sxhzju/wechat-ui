(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { messageMotion } = WechatUI;

  const MessageRow = ({ item, children }) => {
    const chatConfig = WechatUI.getChatConfig();
    const profile = chatConfig.participants[item.from];
    if (!profile) {
      throw new Error(`Missing participant profile for role: ${item.from}`);
    }
    const isSelf = messageMotion.isSelfMessage(item);
    const directionClass = isSelf ? 'flex-row-reverse' : '';
    const alignClass = isSelf ? 'items-end' : '';

    return (
      <div className={`flex gap-3 max-w-full ${directionClass}`}>
        <WechatUI.components.messages.base.Avatar profile={profile} />
        <div className={`flex flex-col gap-1 ${alignClass}`}>{children}</div>
      </div>
    );
  };

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.base = WechatUI.components.messages.base || {};
  WechatUI.components.messages.base.MessageRow = MessageRow;
})();

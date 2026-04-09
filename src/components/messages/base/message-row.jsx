(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants, messageMotion } = WechatUI;

  const MessageRow = ({ item, children }) => {
    const fallbackProfile = {
      name: 'Unknown',
      avatar: '',
      avatarClass: 'bg-gray-200'
    };
    const chatConfig = WechatUI.getChatConfig ? WechatUI.getChatConfig() : WechatUI.chatConfig;
    const profile =
      chatConfig?.participants?.[item.from] ||
      chatConfig?.participants?.[constants.ROLE_CHAT_PARTNER] ||
      chatConfig?.participants?.[constants.ROLE_SELF] ||
      fallbackProfile;
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

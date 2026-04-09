(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const BaseMessage = ({ item, children }) => (
    <WechatUI.components.messages.base.MessageRow item={item}>
      {children}
    </WechatUI.components.messages.base.MessageRow>
  );

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.base = WechatUI.components.messages.base || {};
  WechatUI.components.messages.base.BaseMessage = BaseMessage;
})();

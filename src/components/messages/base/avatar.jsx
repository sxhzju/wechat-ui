(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const Avatar = ({ profile }) => (
    <img
      src={profile.avatar}
      alt={profile.name}
      className={`w-10 h-10 rounded shrink-0 ${profile.avatarClass}`}
    />
  );

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.base = WechatUI.components.messages.base || {};
  WechatUI.components.messages.base.Avatar = Avatar;
})();

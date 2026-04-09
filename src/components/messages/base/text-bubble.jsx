(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const TextBubble = ({ text, isSelf = false, children = null }) => {
    const bubbleClass = isSelf ? 'bg-[#95ec69]' : 'bg-white';
    const tailClass = isSelf ? 'right-[-4px] bg-[#95ec69]' : 'left-[-4px] bg-white';
    const paddingClass = isSelf ? 'px-[10px]' : 'pl-[10px] pr-[9px]';

    return (
      <div
        className={`relative max-w-[250px] rounded-lg ${paddingClass} py-2 text-[14.5px] leading-6 text-gray-800 shadow-sm ${bubbleClass}`}
      >
        {children || text}
        <span className={`absolute top-3 h-2 w-2 rotate-45 ${tailClass}`} />
      </div>
    );
  };

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.base = WechatUI.components.messages.base || {};
  WechatUI.components.messages.base.TextBubble = TextBubble;
})();

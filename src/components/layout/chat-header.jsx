(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const ChatHeader = ({ chatPartnerName }) => {
    const backButton = (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
    );

    const moreActionsButton = (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    );

    return (
      <div className="bg-[#ededed] border-b border-gray-300 px-4 py-3 flex items-center justify-between relative">
        {backButton}
        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-medium">{chatPartnerName}</span>
        {moreActionsButton}
      </div>
    );
  };

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.layout = WechatUI.components.layout || {};
  WechatUI.components.layout.ChatHeader = ChatHeader;
})();

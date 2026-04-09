(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const TimeStampMessage = ({ label }) => (
    <div className="text-center -mb-[6px]">
      <span className="text-[13px] leading-[18px] text-[#9b9b9b] px-2 py-[3px] rounded">{label}</span>
    </div>
  );

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.types = WechatUI.components.messages.types || {};
  WechatUI.components.messages.types.TimeStampMessage = TimeStampMessage;
})();

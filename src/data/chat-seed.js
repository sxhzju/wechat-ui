(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants } = WechatUI;

  const defaultChatItems = [
    {
      type: 'timestamp',
      label: '14:30'
    },
    {
      type: 'text',
      from: constants.ROLE_SELF,
      text: '生成视频：在claude code中打入提示词"vibe motion真好玩!"'
    },
    {
      type: 'text',
      from: constants.ROLE_CHAT_PARTNER,
      text: '我会用claude-typer这个技能来生成视频'
    },
    {
      type: 'video',
      from: constants.ROLE_CHAT_PARTNER,
      coverUrl: './assets/lobster-video-cover.jpg',
      duration: '0:02',
      orientation: 'square'
    },
    {
      type: 'text',
      from: constants.ROLE_CHAT_PARTNER,
      text: '视频已生成好，利用默认的720p渲染，如果你要，我可以再生成一个1080p的'
    },
    {
      type: 'text',
      from: constants.ROLE_SELF,
      text: '先不用加滚动，我先看一下超出聊天区域会怎么表现'
    },
    {
      type: 'text',
      from: constants.ROLE_SELF,
      text: '这里继续补一条消息做长度测试'
    },
    {
      type: 'text',
      from: constants.ROLE_SELF,
      text: '再补一条，观察底部输入框和消息区是否会重叠'
    },
    {
      type: 'text',
      from: constants.ROLE_SELF,
      text: '如果内容继续变长，应该能看到当前容器的极限状态'
    },
    {
      type: 'text',
      from: constants.ROLE_SELF,
      text: '最后再来一条，方便你确认没有 scroll 特性时的表现'
    }
  ];

  const cloneChatItems = (items) => items.map((item) => ({ ...item }));

  const resolveChatItems = (incomingItems) => {
    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      return cloneChatItems(defaultChatItems);
    }

    return cloneChatItems(incomingItems);
  };

  WechatUI.defaultChatItems = defaultChatItems;
  WechatUI.resolveChatItems = resolveChatItems;
  WechatUI.setChatItems = (items) => {
    WechatUI.chatItems = resolveChatItems(items);
    return WechatUI.chatItems;
  };
  WechatUI.getChatItems = () => cloneChatItems(WechatUI.chatItems || defaultChatItems);
  WechatUI.chatItems = resolveChatItems(root.CHAT_UI_ITEMS);

  // Backward compatibility for older modules.
  WechatUI.chatSeed = WechatUI.chatSeed || {};
  Object.defineProperty(WechatUI.chatSeed, 'chatItems', {
    configurable: true,
    enumerable: true,
    get: () => WechatUI.getChatItems(),
    set: (items) => {
      WechatUI.setChatItems(items);
    }
  });
})();

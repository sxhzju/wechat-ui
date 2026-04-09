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

  const defaultChatConfig = {
    participants: {
      [constants.ROLE_SELF]: {
        name: '猫学长',
        avatar: './assets/mxz-avatar.jpg',
        avatarClass: 'shadow-sm object-cover'
      },
      [constants.ROLE_CHAT_PARTNER]: {
        name: '龙虾',
        avatar: './assets/lobster-avatar.svg',
        avatarClass: 'bg-white shadow-sm'
      }
    },
    chatPartnerName: '猫学长的龙虾',
    items: defaultChatItems
  };

  const cloneChatItems = (items) => items.map((item) => ({ ...item }));

  const normalizeParticipant = (incoming, fallback) => {
    if (!incoming || typeof incoming !== 'object') {
      return { ...fallback };
    }

    return {
      name: typeof incoming.name === 'string' && incoming.name ? incoming.name : fallback.name,
      avatar: typeof incoming.avatar === 'string' && incoming.avatar ? incoming.avatar : fallback.avatar,
      avatarClass:
        typeof incoming.avatarClass === 'string' && incoming.avatarClass
          ? incoming.avatarClass
          : fallback.avatarClass
    };
  };

  const resolveChatItems = (incomingItems) => {
    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      return cloneChatItems(defaultChatItems);
    }

    return cloneChatItems(incomingItems);
  };

  const resolveChatConfig = (overrides) => {
    const safeOverrides = overrides && typeof overrides === 'object' ? overrides : {};
    const incomingParticipants =
      safeOverrides.participants && typeof safeOverrides.participants === 'object'
        ? safeOverrides.participants
        : {};

    const participants = {
      [constants.ROLE_SELF]: normalizeParticipant(
        incomingParticipants[constants.ROLE_SELF],
        defaultChatConfig.participants[constants.ROLE_SELF]
      ),
      [constants.ROLE_CHAT_PARTNER]: normalizeParticipant(
        incomingParticipants[constants.ROLE_CHAT_PARTNER],
        defaultChatConfig.participants[constants.ROLE_CHAT_PARTNER]
      )
    };

    const chatPartnerName =
      typeof safeOverrides.chatPartnerName === 'string' && safeOverrides.chatPartnerName
        ? safeOverrides.chatPartnerName
        : defaultChatConfig.chatPartnerName;

    return {
      participants,
      chatPartnerName,
      items: resolveChatItems(safeOverrides.items)
    };
  };

  const cloneChatConfig = (chatConfig) => ({
    participants: {
      [constants.ROLE_SELF]: { ...chatConfig.participants[constants.ROLE_SELF] },
      [constants.ROLE_CHAT_PARTNER]: { ...chatConfig.participants[constants.ROLE_CHAT_PARTNER] }
    },
    chatPartnerName: chatConfig.chatPartnerName,
    items: cloneChatItems(chatConfig.items)
  });

  WechatUI.defaultChatConfig = cloneChatConfig(defaultChatConfig);
  WechatUI.defaultChatItems = cloneChatItems(defaultChatItems);
  WechatUI.resolveChatItems = resolveChatItems;
  WechatUI.resolveChatConfig = resolveChatConfig;

  WechatUI.setChatConfig = (overrides) => {
    const currentConfig = WechatUI.chatConfig || defaultChatConfig;
    const safeOverrides = overrides && typeof overrides === 'object' ? overrides : {};
    const incomingParticipants =
      safeOverrides.participants && typeof safeOverrides.participants === 'object'
        ? safeOverrides.participants
        : {};

    WechatUI.chatConfig = resolveChatConfig({
      ...cloneChatConfig(currentConfig),
      ...safeOverrides,
      participants: {
        [constants.ROLE_SELF]: {
          ...currentConfig.participants[constants.ROLE_SELF],
          ...(incomingParticipants[constants.ROLE_SELF] || {})
        },
        [constants.ROLE_CHAT_PARTNER]: {
          ...currentConfig.participants[constants.ROLE_CHAT_PARTNER],
          ...(incomingParticipants[constants.ROLE_CHAT_PARTNER] || {})
        }
      },
      items: Array.isArray(safeOverrides.items) ? safeOverrides.items : currentConfig.items
    });

    return WechatUI.getChatConfig();
  };

  WechatUI.getChatConfig = () => cloneChatConfig(WechatUI.chatConfig || defaultChatConfig);

  WechatUI.setChatItems = (items) => {
    WechatUI.setChatConfig({ items });
    return WechatUI.getChatItems();
  };

  WechatUI.getChatItems = () => {
    const chatConfig = WechatUI.getChatConfig();
    return cloneChatItems(chatConfig.items);
  };

  const runtimeChatConfig =
    root.CHAT_UI_CONFIG && typeof root.CHAT_UI_CONFIG === 'object' ? root.CHAT_UI_CONFIG : {};

  const runtimeItems =
    Array.isArray(runtimeChatConfig.items) && runtimeChatConfig.items.length > 0
      ? runtimeChatConfig.items
      : root.CHAT_UI_ITEMS;

  WechatUI.chatConfig = resolveChatConfig({
    ...runtimeChatConfig,
    items: runtimeItems
  });
})();

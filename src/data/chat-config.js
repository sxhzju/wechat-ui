(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants } = WechatUI;

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
    chatPartnerName: '猫学长的龙虾'
  };

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
      chatPartnerName
    };
  };

  WechatUI.defaultChatConfig = defaultChatConfig;
  WechatUI.resolveChatConfig = resolveChatConfig;
  WechatUI.setChatConfig = (overrides) => {
    WechatUI.chatConfig = resolveChatConfig(overrides);
    return WechatUI.chatConfig;
  };
  WechatUI.getChatConfig = () => WechatUI.chatConfig || defaultChatConfig;
  WechatUI.chatConfig = resolveChatConfig(root.CHAT_UI_CONFIG);
})();

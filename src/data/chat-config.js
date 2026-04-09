(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants } = WechatUI;

  const ensureObject = (value, message) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(message);
    }
    return value;
  };

  const ensureString = (value, message) => {
    if (typeof value !== 'string') {
      throw new Error(message);
    }
    return value;
  };

  const cloneChatItems = (items) => items.map((item) => ({ ...item }));

  const normalizeParticipant = (participant, role) => {
    const safeParticipant = ensureObject(participant, `Invalid participant config for role: ${role}`);

    return {
      name: ensureString(
        safeParticipant.name,
        `Missing participant.${role}.name in CHAT_UI_CONFIG`
      ),
      avatar: ensureString(
        safeParticipant.avatar,
        `Missing participant.${role}.avatar in CHAT_UI_CONFIG`
      ),
      avatarClass: ensureString(
        safeParticipant.avatarClass,
        `Missing participant.${role}.avatarClass in CHAT_UI_CONFIG`
      )
    };
  };

  const resolveChatItems = (incomingItems) => {
    if (!Array.isArray(incomingItems)) {
      throw new Error('CHAT_UI_CONFIG.items must be an array.');
    }

    return cloneChatItems(incomingItems);
  };

  const cloneChatConfig = (chatConfig) => ({
    participants: {
      [constants.ROLE_SELF]: { ...chatConfig.participants[constants.ROLE_SELF] },
      [constants.ROLE_CHAT_PARTNER]: { ...chatConfig.participants[constants.ROLE_CHAT_PARTNER] }
    },
    chatPartnerName: chatConfig.chatPartnerName,
    items: cloneChatItems(chatConfig.items)
  });

  const resolveInitialChatConfig = (config) => {
    const safeConfig = ensureObject(config, 'Missing CHAT_UI_CONFIG object.');
    const participants = ensureObject(
      safeConfig.participants,
      'Missing CHAT_UI_CONFIG.participants object.'
    );

    return {
      participants: {
        [constants.ROLE_SELF]: normalizeParticipant(participants[constants.ROLE_SELF], constants.ROLE_SELF),
        [constants.ROLE_CHAT_PARTNER]: normalizeParticipant(
          participants[constants.ROLE_CHAT_PARTNER],
          constants.ROLE_CHAT_PARTNER
        )
      },
      chatPartnerName: ensureString(
        safeConfig.chatPartnerName,
        'Missing CHAT_UI_CONFIG.chatPartnerName string.'
      ),
      items: resolveChatItems(safeConfig.items)
    };
  };

  const resolveChatConfigPatch = (baseConfig, overrides) => {
    const safeOverrides = overrides && typeof overrides === 'object' ? overrides : {};
    const incomingParticipants =
      safeOverrides.participants && typeof safeOverrides.participants === 'object'
        ? safeOverrides.participants
        : {};

    const participants = {
      [constants.ROLE_SELF]: incomingParticipants[constants.ROLE_SELF]
        ? normalizeParticipant(incomingParticipants[constants.ROLE_SELF], constants.ROLE_SELF)
        : { ...baseConfig.participants[constants.ROLE_SELF] },
      [constants.ROLE_CHAT_PARTNER]: incomingParticipants[constants.ROLE_CHAT_PARTNER]
        ? normalizeParticipant(
            incomingParticipants[constants.ROLE_CHAT_PARTNER],
            constants.ROLE_CHAT_PARTNER
          )
        : { ...baseConfig.participants[constants.ROLE_CHAT_PARTNER] }
    };

    return {
      participants,
      chatPartnerName:
        typeof safeOverrides.chatPartnerName === 'string'
          ? safeOverrides.chatPartnerName
          : baseConfig.chatPartnerName,
      items: Array.isArray(safeOverrides.items)
        ? resolveChatItems(safeOverrides.items)
        : cloneChatItems(baseConfig.items)
    };
  };

  WechatUI.resolveChatItems = resolveChatItems;
  WechatUI.resolveChatConfig = (overrides) => {
    const currentConfig = WechatUI.getChatConfig();
    return resolveChatConfigPatch(currentConfig, overrides);
  };

  WechatUI.getChatConfig = () => {
    if (!WechatUI.chatConfig) {
      throw new Error('Chat config is not initialized.');
    }
    return cloneChatConfig(WechatUI.chatConfig);
  };

  WechatUI.setChatConfig = (overrides) => {
    const currentConfig = WechatUI.getChatConfig();
    WechatUI.chatConfig = resolveChatConfigPatch(currentConfig, overrides);
    return WechatUI.getChatConfig();
  };

  WechatUI.setChatItems = (items) => {
    WechatUI.setChatConfig({ items });
    return WechatUI.getChatItems();
  };

  WechatUI.getChatItems = () => {
    const chatConfig = WechatUI.getChatConfig();
    return cloneChatItems(chatConfig.items);
  };

  const runtimeChatConfig =
    root.CHAT_UI_CONFIG && typeof root.CHAT_UI_CONFIG === 'object' ? root.CHAT_UI_CONFIG : null;

  if (!runtimeChatConfig) {
    throw new Error('Missing CHAT_UI_CONFIG. Define it before loading src/data/chat-config.js.');
  }

  WechatUI.chatConfig = resolveInitialChatConfig(runtimeChatConfig);
})();

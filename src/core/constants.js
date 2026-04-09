(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});

  const ROLE_SELF = 'self';
  const ROLE_CHAT_PARTNER = 'chatPartner';

  WechatUI.constants = {
    DEFAULT_FPS: 30,
    MESSAGE_GAP_SECONDS: 0.5,
    POP_MOTION_SECONDS: 0.32,
    STREAM_CHAR_SECONDS: 0.045,
    STREAM_MIN_SECONDS: 0.4,
    STREAM_MAX_SECONDS: 0.9,
    STREAM_REVEAL_SECONDS: 0.14,
    STREAM_SPEED_MULTIPLIER: 1.5,
    ROLE_SELF,
    ROLE_CHAT_PARTNER,
    SCREEN_WIDTH: 390,
    HEADER_HEIGHT: 49,
    COMPOSER_HEIGHT: 82,
    MESSAGE_VIEWPORT_HEIGHT: 660,
    DEFAULT_VOICE_WAVE_STROKE_WIDTH: 0.55,
    DEFAULT_VOICE_WAVE_SPACING: 1.03,
    WECHAT_MEDIA_WIDTH_RULE: {
      min: 0.2778,
      square: 0.3731,
      max: 0.4991
    },
    ORIENTATION_ASPECT_RATIO: {
      portrait: 9 / 16,
      square: 1,
      landscape: 16 / 9
    }
  };

  WechatUI.constants.SCREEN_HEIGHT =
    WechatUI.constants.HEADER_HEIGHT +
    WechatUI.constants.MESSAGE_VIEWPORT_HEIGHT +
    WechatUI.constants.COMPOSER_HEIGHT;
})();

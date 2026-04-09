(() => {
  if (typeof require === 'function') {
    require('./src/core/constants.js');
    require('./src/core/math.js');
    require('./src/domain/message-motion.js');
    require('./src/domain/timeline.js');
    require('./src/domain/media.js');
    require('./src/data/chat-config.js');

    require('./src/components/layout/chat-header.jsx');
    require('./src/components/layout/chat-composer.jsx');

    require('./src/components/messages/base/avatar.jsx');
    require('./src/components/messages/base/text-bubble.jsx');
    require('./src/components/messages/base/message-row.jsx');
    require('./src/components/messages/base/base-message.jsx');

    require('./src/components/messages/types/timestamp-message.jsx');
    require('./src/components/messages/types/text-message.jsx');
    require('./src/components/messages/types/video-message.jsx');
    require('./src/components/messages/registry.jsx');
    require('./src/app.jsx');
  }

  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const App = WechatUI.ChatApp;

  if (typeof App !== 'function') {
    throw new Error('ChatApp is not initialized. Check module loading order.');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
    module.exports.default = App;
  }

  if (typeof window !== 'undefined') {
    window.ChatApp = App;
  }
})();

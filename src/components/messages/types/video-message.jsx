(() => {
  const ReactRuntime = typeof React !== 'undefined' ? React : require('react');
  const { useRef } = ReactRuntime;

  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants, media, messageMotion } = WechatUI;
  const PLAY_BUTTON_DIAMETER = 30;
  const PLAY_ICON_SIZE = 20;
  const PLAY_ICON_OFFSET_X = 0;

  const WeChatVideoCard = ({ coverUrl, duration, aspectRatio, orientation }) => {
    const safeAspectRatio = media.getFallbackAspectRatio({ aspectRatio, orientation });

    const widthRatio = media.getMediaWidthRatio(safeAspectRatio);
    const cardWidth = Math.round(constants.SCREEN_WIDTH * widthRatio);
    const cardRef = useRef(null);
    const playButtonRef = useRef(null);
    const flashRef = useRef(null);

    const runClickFeedback = () => {
      const cardElement = cardRef.current;
      const playButtonElement = playButtonRef.current;
      const flashElement = flashRef.current;

      if (cardElement?.animate) {
        cardElement.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(0.965)', offset: 0.35 },
            { transform: 'scale(1.015)', offset: 0.72 },
            { transform: 'scale(1)' }
          ],
          {
            duration: 260,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          }
        );
      }

      if (playButtonElement?.animate) {
        playButtonElement.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.86)', opacity: 0.85, offset: 0.35 },
            { transform: 'scale(1.12)', opacity: 1, offset: 0.72 },
            { transform: 'scale(1)', opacity: 1 }
          ],
          {
            duration: 280,
            easing: 'ease-out'
          }
        );
      }

      if (flashElement?.animate) {
        flashElement.animate(
          [
            { opacity: 0 },
            { opacity: 0.22, offset: 0.36 },
            { opacity: 0 }
          ],
          {
            duration: 240,
            easing: 'ease-out'
          }
        );
      }
    };

    const handleClick = (event) => {
      event.preventDefault();
      runClickFeedback();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        runClickFeedback();
      }
    };

    return (
      <div
        ref={cardRef}
        className="relative rounded overflow-hidden cursor-pointer select-none active:scale-[0.98] transition-transform duration-100"
        style={{
          width: cardWidth,
          aspectRatio: safeAspectRatio
        }}
        role="button"
        tabIndex={0}
        aria-label="视频消息"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <img
          src={coverUrl}
          alt="Video thumbnail"
          className="w-full h-full object-contain bg-transparent"
          draggable={false}
        />

        <div ref={flashRef} className="absolute inset-0 bg-white/70 opacity-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={playButtonRef}
            className="rounded-full flex items-center justify-center border-[1px] border-white bg-transparent"
            style={{
              width: PLAY_BUTTON_DIAMETER,
              height: PLAY_BUTTON_DIAMETER,
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
            }}
          >
            <svg
              className="text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{
                width: PLAY_ICON_SIZE,
                height: PLAY_ICON_SIZE,
                transform: `translateX(${PLAY_ICON_OFFSET_X}px)`,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'
              }}
            >
              <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" />
            </svg>
          </div>
        </div>

        <div
          className="absolute bottom-1.5 right-2 text-white text-xs font-medium tracking-wide"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {duration}
        </div>
      </div>
    );
  };

  const VideoMessage = ({ item, slot, currentFrame, fps }) => {
    const BaseMessage = WechatUI.components.messages.base.BaseMessage;

    return (
      <div style={messageMotion.getPopStyle(item, slot, currentFrame, fps)}>
        <BaseMessage item={item}>
          <WeChatVideoCard
            coverUrl={item.coverUrl}
            duration={item.duration}
            aspectRatio={item.aspectRatio}
            orientation={item.orientation}
          />
        </BaseMessage>
      </div>
    );
  };

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.messages = WechatUI.components.messages || {};
  WechatUI.components.messages.types = WechatUI.components.messages.types || {};
  WechatUI.components.messages.types.VideoMessage = VideoMessage;
})();

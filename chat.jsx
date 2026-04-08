const ReactRuntime = typeof React !== 'undefined' ? React : require('react');
const { useEffect, useMemo, useRef, useState } = ReactRuntime;

const remotionApi = (() => {
  if (typeof require !== 'function') {
    return null;
  }

  try {
    return require('remotion');
  } catch (error) {
    return null;
  }
})();

const DEFAULT_FPS = 30;
const MESSAGE_GAP_SECONDS = 0.5;
const POP_MOTION_SECONDS = 0.32;
const STREAM_CHAR_SECONDS = 0.045;
const STREAM_MIN_SECONDS = 0.4;
const STREAM_MAX_SECONDS = 0.9;
const STREAM_REVEAL_SECONDS = 0.14;
const STREAM_SPEED_MULTIPLIER = 1.5;
const ROLE_SELF = 'self';
const ROLE_CHAT_PARTNER = 'chatPartner';
const SCREEN_WIDTH = 390;
const SCREEN_HEIGHT = 845;
const COMPOSER_HEIGHT = 82;
const DEFAULT_VOICE_WAVE_STROKE_WIDTH = 0.55;
const DEFAULT_VOICE_WAVE_SPACING = 1.03;

const CHAT_PARTICIPANTS = {
  [ROLE_SELF]: {
    name: '猫学长',
    avatar: './assets/mxz-avatar.jpg',
    avatarClass: 'shadow-sm object-cover'
  },
  [ROLE_CHAT_PARTNER]: {
    name: '龙虾',
    avatar: './assets/lobster-avatar.svg',
    avatarClass: 'bg-white shadow-sm'
  }
};

const CHAT_ITEMS = [
  {
    type: 'timestamp',
    label: '14:30'
  },
  {
    type: 'text',
    from: ROLE_SELF,
    text: '生成视频：在claude code中打入提示词"vibe motion真好玩!"'
  },
  {
    type: 'text',
    from: ROLE_CHAT_PARTNER,
    text: '我会用claude-typer这个技能来生成视频'
  },
  {
    type: 'video',
    from: ROLE_CHAT_PARTNER,
    coverUrl: './assets/lobster-video-cover.jpg',
    duration: '0:02',
    orientation: 'square'
  },
  {
    type: 'text',
    from: ROLE_CHAT_PARTNER,
    text: '视频已生成好，利用默认的720p渲染，如果你要，我可以再生成一个1080p的'
  },
  {
    type: 'text',
    from: ROLE_SELF,
    text: '先不用加滚动，我先看一下超出聊天区域会怎么表现'
  },
  {
    type: 'text',
    from: ROLE_SELF,
    text: '这里继续补一条消息做长度测试'
  },
  {
    type: 'text',
    from: ROLE_SELF,
    text: '再补一条，观察底部输入框和消息区是否会重叠'
  },
  {
    type: 'text',
    from: ROLE_SELF,
    text: '如果内容继续变长，应该能看到当前容器的极限状态'
  },
  {
    type: 'text',
    from: ROLE_SELF,
    text: '最后再来一条，方便你确认没有 scroll 特性时的表现'
  }
];

const CHAT_PARTNER_NAME = '猫学长的龙虾';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const easeOutBack = (value) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
};

const isSelfMessage = (item) => item.from === ROLE_SELF;

const usesStreamingTextMotion = (item) => item.from === ROLE_CHAT_PARTNER && item.type === 'text';

const getMotionSeconds = (item) => {
  if (usesStreamingTextMotion(item)) {
    const charCount = Array.from(item.text || '').length;
    const baseStreamSeconds = clamp(charCount * STREAM_CHAR_SECONDS, STREAM_MIN_SECONDS, STREAM_MAX_SECONDS);
    return baseStreamSeconds / STREAM_SPEED_MULTIPLIER;
  }

  return POP_MOTION_SECONDS;
};

const buildTimeline = (items, fps) => {
  let cursorFrame = 0;
  const messageTimeline = new Map();
  const messageIndices = [];

  items.forEach((item, index) => {
    if (item.type === 'timestamp') {
      return;
    }

    const motionFrames = getMotionSeconds(item) * fps;
    const startFrame = cursorFrame;
    const endFrame = startFrame + motionFrames;

    messageTimeline.set(index, {
      startFrame,
      endFrame,
      motionFrames
    });
    messageIndices.push(index);
    cursorFrame = endFrame + MESSAGE_GAP_SECONDS * fps;
  });

  const lastMessageIndex = messageIndices[messageIndices.length - 1];
  const totalFrames = lastMessageIndex === undefined
    ? 0
    : messageTimeline.get(lastMessageIndex).endFrame;

  return {
    messageTimeline,
    totalFrames
  };
};

const getFrameProgress = (currentFrame, startFrame, durationFrames) => {
  if (durationFrames <= 0) {
    return currentFrame >= startFrame ? 1 : 0;
  }

  return clamp((currentFrame - startFrame) / durationFrames, 0, 1);
};

const VIDEO_DIMENSION_STRATEGY = {
  square: 'w-[175px] aspect-square',
  portrait: 'w-[175px] aspect-[9/16]',
  landscape: 'w-[175px] aspect-video'
};

const WeChatVideoMessage = ({ coverUrl, duration, orientation = 'square' }) => {
  const dimensions = VIDEO_DIMENSION_STRATEGY[orientation] || VIDEO_DIMENSION_STRATEGY.portrait;
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
      className={`relative rounded overflow-hidden cursor-pointer select-none active:scale-[0.98] transition-transform duration-100 ${dimensions}`}
      style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}
      role="button"
      tabIndex={0}
      aria-label="视频消息"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <img
        src={coverUrl}
        alt="Video thumbnail"
        className="w-full h-full object-contain bg-black"
        draggable={false}
      />

      <div ref={flashRef} className="absolute inset-0 bg-white/70 opacity-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={playButtonRef}
          className={`
            w-9 h-9 rounded-full flex items-center justify-center
            border-[1px] border-white bg-transparent
          `}
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
        >
          <svg className="w-5 h-5 text-white translate-x-[0.5px]" fill="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}>
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
    <div className="bg-[#ededed] border-b border-gray-300 px-4 py-3 flex items-center justify-between sticky top-0 z-10 relative">
      {backButton}
      <span className="absolute left-1/2 -translate-x-1/2 text-lg font-medium">{chatPartnerName}</span>
      {moreActionsButton}
    </div>
  );
};

const ChatComposer = () => {
  const offset1 = (94 - 110.85) * DEFAULT_VOICE_WAVE_SPACING + 110.85;
  const offset2 = 118.4;
  const offset3 = (135.4 - 110.85) * DEFAULT_VOICE_WAVE_SPACING + 110.85;
  
  const microphoneButton = (
    <svg className="w-7 h-7 text-[#2f2f2f]" fill="none" viewBox="0 0 24 24" aria-hidden="true" style={{ shapeRendering: 'geometricPrecision' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m86.31 121.6 15.67-15.4c4.84 3.96 5.45 10.65 5.45 15.4 0 6.28-2.72 11.13-5.45 14.5l-15.67-14.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={DEFAULT_VOICE_WAVE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${offset1 - 94}, 0) scale(0.096)`}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="m118.4 89.46-7.13 7.6c7.63 8.02 10.51 16.19 10.51 24.68 0 10.03-4.84 19.14-10.51 25.17l7.5 7.34c9.95-10.28 13.1-21.51 13.1-32.51 0-12.89-5.92-25.13-13.47-32.28z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={DEFAULT_VOICE_WAVE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${offset2 - 118.4}, 0) scale(0.096)`}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="m135.4 71.21-7.54 7.9c11.83 12.62 18.09 25.51 18.09 42.5 0 15.55-7.01 31.37-17.89 43.71l7.54 6.4c13.49-13.96 20.9-30.11 20.9-50.11 0-18.7-7.62-36.59-21.1-50.4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={DEFAULT_VOICE_WAVE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${offset3 - 135.4}, 0) scale(0.096)`}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );

  const emojiButton = (
    <svg className="w-7 h-7 text-[#2f2f2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
        d="M8.5 8.5v.01M15.5 8.5v.01"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        d="M7 12.5h10a5 5 0 0 1-10 0z"
      />
    </svg>
  );

  const plusButton = (
    <svg className="w-7 h-7 text-[#2f2f2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth="1.7" />
      <path strokeLinecap="round" strokeWidth="1.7" d="M12 8v8M8 12h8" />
    </svg>
  );

  return (
    <div
      className="shrink-0 bg-[#f7f7f7] px-3 pt-2.5 pb-4 flex items-start gap-2"
      style={{ height: COMPOSER_HEIGHT }}
    >
      <button type="button" className="mt-[5px] shrink-0" aria-label="语音输入">
        {microphoneButton}
      </button>
      <div className="mt-[-1px] h-10 flex-1 rounded-md bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]" />
      <button type="button" className="mt-[5px] shrink-0" aria-label="表情">
        {emojiButton}
      </button>
      <button type="button" className="mt-[5px] shrink-0" aria-label="更多功能">
        {plusButton}
      </button>
    </div>
  );
};

const TimeStamp = ({ label }) => (
  <div className="text-center -mb-[6px]">
    <span className="text-[13px] leading-[18px] text-[#9b9b9b] px-2 py-[3px] rounded">
      {label}
    </span>
  </div>
);

const Avatar = ({ profile }) => (
  <img
    src={profile.avatar}
    alt={profile.name}
    className={`w-10 h-10 rounded shrink-0 ${profile.avatarClass}`}
  />
);

const TextBubble = ({ text, isSelf = false, children = null }) => {
  const bubbleClass = isSelf ? 'bg-[#95ec69]' : 'bg-white';
  const tailClass = isSelf ? 'right-[-4px] bg-[#95ec69]' : 'left-[-4px] bg-white';
  const paddingClass = isSelf ? 'px-[10px]' : 'pl-[10px] pr-[9px]';

  return (
    <div className={`relative max-w-[250px] rounded-lg ${paddingClass} py-2 text-[14.5px] leading-6 text-gray-800 shadow-sm ${bubbleClass}`}>
      {children || text}
      <span className={`absolute top-3 h-2 w-2 rotate-45 ${tailClass}`} />
    </div>
  );
};

const MessageRow = ({ item, children }) => {
  const profile = CHAT_PARTICIPANTS[item.from];
  const isSelf = isSelfMessage(item);
  const directionClass = isSelf ? 'flex-row-reverse' : '';
  const alignClass = isSelf ? 'items-end' : '';

  return (
    <div className={`flex gap-3 max-w-full ${directionClass}`}>
      <Avatar profile={profile} />
      <div className={`flex flex-col gap-1 ${alignClass}`}>{children}</div>
    </div>
  );
};

const getPopStyle = (item, slot, currentFrame, fps) => {
  const progress = getFrameProgress(currentFrame, slot.startFrame, POP_MOTION_SECONDS * fps);
  const eased = easeOutBack(progress);
  const baseScale = 0.86;
  const scale = baseScale + (1 - baseScale) * eased;
  const isSelf = isSelfMessage(item);

  return {
    opacity: progress,
    transform: `scale(${scale})`,
    transformOrigin: isSelf ? 'right center' : 'left center'
  };
};

const ChatItem = ({ item, slot, currentFrame, fps }) => {
  if (item.type === 'timestamp') {
    return <TimeStamp label={item.label} />;
  }

  if (!slot) {
    return null;
  }

  if (usesStreamingTextMotion(item)) {
    const progress = getFrameProgress(currentFrame, slot.startFrame, slot.motionFrames);
    const textChars = Array.from(item.text || '');
    const visibleCount = Math.floor(progress * textChars.length);
    const visibleText = textChars.slice(0, visibleCount).join('');
    const revealProgress = getFrameProgress(
      currentFrame,
      slot.startFrame,
      (STREAM_REVEAL_SECONDS / STREAM_SPEED_MULTIPLIER) * fps
    );

    return (
      <div
        style={{
          opacity: revealProgress,
          transform: `translateY(${(1 - revealProgress) * 8}px)`
        }}
      >
        <MessageRow item={item}>
          <TextBubble isSelf={isSelfMessage(item)}>
            <span>{visibleText}</span>
          </TextBubble>
        </MessageRow>
      </div>
    );
  }

  if (item.type === 'text') {
    return (
      <div style={getPopStyle(item, slot, currentFrame, fps)}>
        <MessageRow item={item}>
          <TextBubble text={item.text} isSelf={isSelfMessage(item)} />
        </MessageRow>
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div style={getPopStyle(item, slot, currentFrame, fps)}>
        <MessageRow item={item}>
          <WeChatVideoMessage
            coverUrl={item.coverUrl}
            duration={item.duration}
            orientation={item.orientation}
          />
        </MessageRow>
      </div>
    );
  }

  return null;
};

function App() {
  const remotionFrame = remotionApi?.useCurrentFrame ? remotionApi.useCurrentFrame() : null;
  const videoConfig = remotionApi?.useVideoConfig ? remotionApi.useVideoConfig() : null;
  const fps = videoConfig?.fps || DEFAULT_FPS;

  const CHAT_TIMELINE = useMemo(() => buildTimeline(CHAT_ITEMS, fps), [fps]);
  const [previewFrame, setPreviewFrame] = useState(0);

  useEffect(() => {
    if (remotionFrame !== null || typeof window === 'undefined') {
      return undefined;
    }
    if (previewFrame >= CHAT_TIMELINE.totalFrames) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviewFrame((prev) => Math.min(prev + 1, CHAT_TIMELINE.totalFrames));
    }, 1000 / fps);

    return () => window.clearTimeout(timeoutId);
  }, [remotionFrame, previewFrame, CHAT_TIMELINE.totalFrames, fps]);

  const currentFrame = remotionFrame !== null
    ? Math.min(remotionFrame, CHAT_TIMELINE.totalFrames)
    : previewFrame;

  const visibleItems = CHAT_ITEMS
    .map((item, index) => ({ item, originalIndex: index }))
    .filter((entry) => {
      if (entry.item.type === 'timestamp') {
        return true;
      }

      const slot = CHAT_TIMELINE.messageTimeline.get(entry.originalIndex);
      return slot ? currentFrame >= slot.startFrame : false;
    });

  return (
    <div
      className="mx-auto relative"
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
    >
      <div
        className="ml-auto bg-[#ededed] font-sans text-gray-800 flex flex-col relative shadow-sm border-x border-gray-200 overflow-hidden"
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      >
        <ChatHeader chatPartnerName={CHAT_PARTNER_NAME} />

        <div className="flex-1">
          <div className="h-full p-4 space-y-6 overflow-y-auto">
            {visibleItems.map((entry) => (
              <ChatItem
                key={`${entry.item.type}-${entry.originalIndex}`}
                item={entry.item}
                slot={CHAT_TIMELINE.messageTimeline.get(entry.originalIndex)}
                currentFrame={currentFrame}
                fps={fps}
              />
            ))}
          </div>
        </div>

        <ChatComposer />
      </div>
    </div>
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
  module.exports.default = App;
}

if (typeof window !== 'undefined') {
  window.ChatApp = App;
}

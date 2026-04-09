(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants } = WechatUI;

  const ChatComposer = () => {
    const offset1 = (94 - 110.85) * constants.DEFAULT_VOICE_WAVE_SPACING + 110.85;
    const offset2 = 118.4;
    const offset3 = (135.4 - 110.85) * constants.DEFAULT_VOICE_WAVE_SPACING + 110.85;

    const microphoneButton = (
      <svg
        className="w-7 h-7 text-[#2f2f2f]"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="m86.31 121.6 15.67-15.4c4.84 3.96 5.45 10.65 5.45 15.4 0 6.28-2.72 11.13-5.45 14.5l-15.67-14.5z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={constants.DEFAULT_VOICE_WAVE_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(${offset1 - 94}, 0) scale(0.096)`}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="m118.4 89.46-7.13 7.6c7.63 8.02 10.51 16.19 10.51 24.68 0 10.03-4.84 19.14-10.51 25.17l7.5 7.34c9.95-10.28 13.1-21.51 13.1-32.51 0-12.89-5.92-25.13-13.47-32.28z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={constants.DEFAULT_VOICE_WAVE_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(${offset2 - 118.4}, 0) scale(0.096)`}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="m135.4 71.21-7.54 7.9c11.83 12.62 18.09 25.51 18.09 42.5 0 15.55-7.01 31.37-17.89 43.71l7.54 6.4c13.49-13.96 20.9-30.11 20.9-50.11 0-18.7-7.62-36.59-21.1-50.4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={constants.DEFAULT_VOICE_WAVE_STROKE_WIDTH}
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
        style={{ height: constants.COMPOSER_HEIGHT }}
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

  WechatUI.components = WechatUI.components || {};
  WechatUI.components.layout = WechatUI.components.layout || {};
  WechatUI.components.layout.ChatComposer = ChatComposer;
})();

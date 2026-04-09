(() => {
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

  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const { constants } = WechatUI;
  const getConfiguredChatItems = () =>
    (WechatUI.getChatItems ? WechatUI.getChatItems() : WechatUI.chatSeed?.chatItems) || [];

  function App() {
    const chatConfig =
      (WechatUI.getChatConfig ? WechatUI.getChatConfig() : WechatUI.chatConfig) || {
        chatPartnerName: ''
      };
    const remotionFrame = remotionApi?.useCurrentFrame ? remotionApi.useCurrentFrame() : null;
    const videoConfig = remotionApi?.useVideoConfig ? remotionApi.useVideoConfig() : null;
    const fps = videoConfig?.fps || constants.DEFAULT_FPS;
    const messageListRef = useRef(null);
    const delayRenderHandleRef = useRef(null);

    if (delayRenderHandleRef.current === null && remotionApi?.delayRender) {
      delayRenderHandleRef.current = remotionApi.delayRender('Resolve chat media metadata');
    }

    const [chatItems, setChatItems] = useState(() =>
      WechatUI.media.applyMediaAspectRatioFallback(getConfiguredChatItems())
    );
    const [mediaReady, setMediaReady] = useState(false);
    const [previewFrame, setPreviewFrame] = useState(0);

    useEffect(() => {
      let canceled = false;
      const sourceChatItems = getConfiguredChatItems();

      WechatUI.media
        .resolveChatItemsMedia(sourceChatItems)
        .then((resolvedItems) => {
          if (canceled) {
            return;
          }

          setChatItems(resolvedItems);
          setMediaReady(true);

          const handle = delayRenderHandleRef.current;
          if (handle !== null && remotionApi?.continueRender) {
            remotionApi.continueRender(handle);
          }
          delayRenderHandleRef.current = null;
        })
        .catch((error) => {
          if (canceled) {
            return;
          }

          setMediaReady(true);

          const handle = delayRenderHandleRef.current;
          if (handle !== null && remotionApi?.cancelRender) {
            remotionApi.cancelRender(error);
          } else if (typeof console !== 'undefined' && console.error) {
            console.error(error);
          }
          delayRenderHandleRef.current = null;
        });

      return () => {
        canceled = true;
      };
    }, []);

    const chatTimeline = useMemo(
      () => WechatUI.timeline.buildTimeline(chatItems, fps),
      [chatItems, fps]
    );

    useEffect(() => {
      if (!mediaReady || remotionFrame !== null || typeof window === 'undefined') {
        return undefined;
      }
      if (previewFrame >= chatTimeline.totalFrames) {
        return undefined;
      }

      const timeoutId = window.setTimeout(() => {
        setPreviewFrame((prev) => Math.min(prev + 1, chatTimeline.totalFrames));
      }, 1000 / fps);

      return () => window.clearTimeout(timeoutId);
    }, [mediaReady, remotionFrame, previewFrame, chatTimeline.totalFrames, fps]);

    const currentFrame =
      remotionFrame !== null
        ? Math.min(remotionFrame, chatTimeline.totalFrames)
        : previewFrame;

    const visibleItems = chatItems
      .map((item, index) => ({ item, originalIndex: index }))
      .filter((entry) => {
        if (entry.item.type === 'timestamp') {
          return true;
        }

        const slot = chatTimeline.messageTimeline.get(entry.originalIndex);
        return slot ? currentFrame >= slot.startFrame : false;
      });

    useEffect(() => {
      if (!mediaReady) {
        return;
      }

      const messageListElement = messageListRef.current;
      if (!messageListElement) {
        return;
      }

      // Keep each frame deterministic by deriving scroll from rendered content only.
      messageListElement.scrollTop = messageListElement.scrollHeight;
    }, [mediaReady, currentFrame, visibleItems.length]);

    if (!mediaReady) {
      return (
        <div className="mx-auto relative" style={{ width: constants.SCREEN_WIDTH, height: constants.SCREEN_HEIGHT }}>
          <div
            className="ml-auto bg-[#ededed] font-sans text-gray-500 relative shadow-sm border-x border-gray-200 overflow-hidden flex items-center justify-center text-sm"
            style={{ width: constants.SCREEN_WIDTH, height: constants.SCREEN_HEIGHT }}
          >
            正在解析媒体比例...
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto relative" style={{ width: constants.SCREEN_WIDTH, height: constants.SCREEN_HEIGHT }}>
        <div
          className="ml-auto bg-[#ededed] font-sans text-gray-800 relative shadow-sm border-x border-gray-200 overflow-hidden"
          style={{ width: constants.SCREEN_WIDTH, height: constants.SCREEN_HEIGHT }}
        >
          <div
            ref={messageListRef}
            className="absolute inset-0 z-0 overflow-y-auto hide-scrollbar"
            style={{
              paddingTop: constants.HEADER_HEIGHT + 16,
              paddingBottom: constants.COMPOSER_HEIGHT + 16,
              paddingLeft: 16,
              paddingRight: 16
            }}
          >
            <div className="space-y-6">
              {visibleItems.map((entry) => (
                <React.Fragment key={`${entry.item.type}-${entry.originalIndex}`}>
                  {WechatUI.renderChatItem({
                    item: entry.item,
                    slot: chatTimeline.messageTimeline.get(entry.originalIndex),
                    currentFrame,
                    fps
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="absolute top-0 left-0 right-0 z-20">
            <WechatUI.components.layout.ChatHeader
              chatPartnerName={chatConfig.chatPartnerName}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20">
            <WechatUI.components.layout.ChatComposer />
          </div>
        </div>
      </div>
    );
  }

  WechatUI.ChatApp = App;
})();

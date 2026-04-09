(() => {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;
  const WechatUI = root.WechatUI || (root.WechatUI = {});
  const WECHAT_MEDIA_WIDTH_RULE = {
    min: 0.2778,
    square: 0.3731,
    max: 0.4991
  };
  const ORIENTATION_ASPECT_RATIO = {
    portrait: 9 / 16,
    square: 1,
    landscape: 16 / 9
  };

  const WIDTH_ANCHORS = [
    { aspect: 9 / 16, widthRatio: WECHAT_MEDIA_WIDTH_RULE.min },
    { aspect: 3 / 4, widthRatio: WECHAT_MEDIA_WIDTH_RULE.square },
    { aspect: 1, widthRatio: WECHAT_MEDIA_WIDTH_RULE.square },
    { aspect: 4 / 3, widthRatio: WECHAT_MEDIA_WIDTH_RULE.max },
    { aspect: 16 / 9, widthRatio: WECHAT_MEDIA_WIDTH_RULE.max }
  ];

  const aspectRatioPromiseCache = new Map();

  const getFallbackAspectRatio = (item) => {
    if (typeof item.aspectRatio === 'number' && item.aspectRatio > 0) {
      return item.aspectRatio;
    }

    return (
      ORIENTATION_ASPECT_RATIO[item.orientation] || ORIENTATION_ASPECT_RATIO.square
    );
  };

  const getMediaWidthRatio = (aspectRatio) => {
    const minAspect = WIDTH_ANCHORS[0].aspect;
    const maxAspect = WIDTH_ANCHORS[WIDTH_ANCHORS.length - 1].aspect;
    const safeAspectRatio =
      typeof aspectRatio === 'number' && Number.isFinite(aspectRatio) && aspectRatio > 0
        ? aspectRatio
        : ORIENTATION_ASPECT_RATIO.square;
    const normalizedAspectRatio = Math.min(Math.max(safeAspectRatio, minAspect), maxAspect);

    for (let i = 0; i < WIDTH_ANCHORS.length - 1; i += 1) {
      const left = WIDTH_ANCHORS[i];
      const right = WIDTH_ANCHORS[i + 1];

      if (normalizedAspectRatio > right.aspect) {
        continue;
      }

      const segmentSpan = right.aspect - left.aspect;
      if (segmentSpan === 0) {
        return left.widthRatio;
      }

      const progress = (normalizedAspectRatio - left.aspect) / segmentSpan;
      return left.widthRatio + (right.widthRatio - left.widthRatio) * progress;
    }

    return WIDTH_ANCHORS[WIDTH_ANCHORS.length - 1].widthRatio;
  };

  const applyMediaAspectRatioFallback = (items) =>
    items.map((item) => {
      if (item.type !== 'video') {
        return item;
      }

      return {
        ...item,
        aspectRatio: getFallbackAspectRatio(item)
      };
    });

  const resolveImageAspectRatio = (imageUrl) => {
    if (!imageUrl) {
      return Promise.resolve(null);
    }

    if (aspectRatioPromiseCache.has(imageUrl)) {
      return aspectRatioPromiseCache.get(imageUrl);
    }

    if (typeof Image === 'undefined') {
      const fallbackPromise = Promise.resolve(null);
      aspectRatioPromiseCache.set(imageUrl, fallbackPromise);
      return fallbackPromise;
    }

    const promise = new Promise((resolve) => {
      const image = new Image();

      image.onload = () => {
        const { naturalWidth, naturalHeight } = image;
        if (naturalWidth > 0 && naturalHeight > 0) {
          resolve(naturalWidth / naturalHeight);
          return;
        }

        resolve(null);
      };

      image.onerror = () => resolve(null);
      image.src = imageUrl;
    });

    aspectRatioPromiseCache.set(imageUrl, promise);
    return promise;
  };

  const resolveChatItemsMedia = async (items) => {
    const itemsWithFallback = applyMediaAspectRatioFallback(items);
    const uniqueVideoUrls = [
      ...new Set(
        itemsWithFallback
          .filter((item) => item.type === 'video' && item.coverUrl)
          .map((item) => item.coverUrl)
      )
    ];

    const resolvedEntries = await Promise.all(
      uniqueVideoUrls.map(async (coverUrl) => {
        const aspectRatio = await resolveImageAspectRatio(coverUrl);
        return [coverUrl, aspectRatio];
      })
    );

    const resolvedByUrl = new Map(resolvedEntries);

    return itemsWithFallback.map((item) => {
      if (item.type !== 'video' || !item.coverUrl) {
        return item;
      }

      const resolvedAspectRatio = resolvedByUrl.get(item.coverUrl);
      if (typeof resolvedAspectRatio !== 'number' || resolvedAspectRatio <= 0) {
        return item;
      }

      return {
        ...item,
        aspectRatio: resolvedAspectRatio
      };
    });
  };

  WechatUI.media = {
    getMediaWidthRatio,
    getFallbackAspectRatio,
    applyMediaAspectRatioFallback,
    resolveImageAspectRatio,
    resolveChatItemsMedia
  };
})();

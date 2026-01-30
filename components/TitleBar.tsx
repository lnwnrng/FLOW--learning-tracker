import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Minus, Pin, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useTranslation } from 'react-i18next';

const TitleBar: React.FC = () => {
  const { t } = useTranslation();
  const appWindow = useMemo(() => getCurrentWindow(), []);
  const [isPinned, setIsPinned] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let mounted = true;
    appWindow.isAlwaysOnTop()
      .then((value) => {
        if (mounted) setIsPinned(value);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [appWindow]);

  const handleTogglePin = async () => {
    if (isToggling) return;
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    setIsToggling(true);
    try {
      await appWindow.setAlwaysOnTop(nextPinned);
    } catch (error) {
      setIsPinned(!nextPinned);
    } finally {
      setIsToggling(false);
    }
  };

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.flow-titlebar-controls')) return;
    appWindow.startDragging().catch(() => undefined);
  }, [appWindow]);

  return (
    <header className="flow-titlebar" onPointerDown={handlePointerDown}>
      <div className="flow-titlebar-left">
        <span className="flow-titlebar-badge">
          {t('titlebar.appName')}
        </span>
        <span className="flow-titlebar-title">
          {t('titlebar.subtitle')}
        </span>
      </div>
      <div
        className="flow-titlebar-controls"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="flow-titlebar-button"
          data-active={isPinned}
          onClick={handleTogglePin}
          title={isPinned ? t('titlebar.unpin') : t('titlebar.pin')}
          aria-label={isPinned ? t('titlebar.unpin') : t('titlebar.pin')}
        >
          <Pin size={16} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className="flow-titlebar-button"
          onClick={() => {
            appWindow.minimize().catch(() => undefined);
          }}
          title={t('titlebar.minimize')}
          aria-label={t('titlebar.minimize')}
        >
          <Minus size={16} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className="flow-titlebar-button"
          data-variant="close"
          onClick={() => {
            appWindow.close().catch(() => undefined);
          }}
          title={t('titlebar.close')}
          aria-label={t('titlebar.close')}
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
};

export default TitleBar;

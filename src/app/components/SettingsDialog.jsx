import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/ui/Icon';

export function SettingsDialog({ open, onDismiss }) {
  const dialog = useRef(null);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  useLayoutEffect(() => {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
      );
    try {
      localStorage.setItem('electric-cards:theme', theme);
    } catch {
      // Appearance still works for this visit when storage is unavailable.
    }
  }, [dark]);
  useLayoutEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="settings-dialog"
      aria-labelledby="settings-title"
      onCancel={onDismiss}
      onClose={onDismiss}
    >
      <div className="settings-heading">
        <h2 id="settings-title">Configuraciones</h2>
        <button
          className="button button-quiet settings-button"
          aria-label="Cerrar configuraciones"
          autoFocus
          onClick={onDismiss}
        >
          <Icon name="close" />
        </button>
      </div>
      <button
        className="settings-toggle"
        role="switch"
        aria-checked={dark}
        aria-label="Modo oscuro"
        onClick={() => setDark((value) => !value)}
      >
        <span>
          <strong>Modo oscuro</strong>
          <small>Se aplica a toda la web.</small>
        </span>
        <span className="switch-indicator" aria-hidden="true" />
      </button>
    </dialog>
  );
}

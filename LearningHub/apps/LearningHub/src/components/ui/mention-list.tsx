'use client';

import {
  searchForumMembers,
  type MemberSuggestion,
} from '../../app/actions/forum.actions';

interface MentionListOptions {
  forumId: string;
}

const style = `
#tiptap-mention-dropdown {
  position: fixed;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  overflow: hidden;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
}
.mention-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: background 0.15s;
}
.mention-item.is-selected {
  background: #eef2ff;
  color: #4338ca;
}
.mention-avatar {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #4f46e5;
}
.mention-empty {
  padding: 8px 12px;
  font-size: 12px;
  color: #94a3b8;
}
`;

let styleInjected = false;

export function createMentionSuggestion(options: MentionListOptions) {
  if (!styleInjected) {
    const s = document.createElement('style');
    s.textContent = style;
    document.head.appendChild(s);
    styleInjected = true;
  }

  let popup: HTMLElement | null = null;
  let selectedIndex = 0;
  let items: MemberSuggestion[] = [];
  let unmount: (() => void) | null = null;

  function renderList() {
    if (!popup) return;
    popup.innerHTML = '<div class="mention-empty">Searching...</div>';
  }

  function buildItemHtml(item: MemberSuggestion, idx: number) {
    const sel = idx === selectedIndex ? ' is-selected' : '';
    return `<button class="mention-item${sel}" data-idx="${idx}">
      <span class="mention-avatar">${(item.username.charAt(0) || '?').toUpperCase()}</span>
      <span>${item.username}</span>
    </button>`;
  }

  function bindClicks(cmd: (item: Record<string, unknown>) => void) {
    if (!popup) return;
    popup
      .querySelectorAll<HTMLButtonElement>('.mention-item')
      .forEach((btn) => {
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.dataset.idx || '0');
          if (items[idx]) {
            cmd({ id: items[idx].userId, label: items[idx].username });
          }
        });
      });
  }

  return {
    onStart(props: any) {
      unmount?.();

      popup = document.createElement('div');
      popup.id = 'tiptap-mention-dropdown';
      document.body.appendChild(popup);

      unmount = props.mount(popup);
      renderList();
    },
    onUpdate(props: any) {
      if (abortRef) abortRef.abort();
      const controller = new AbortController();
      abortRef = controller;
      selectedIndex = 0;

      if (!options.forumId) {
        if (popup)
          popup.innerHTML = '<div class="mention-empty">No forum context</div>';
        return;
      }

      searchForumMembers(options.forumId, props.query, 5)
        .then((results) => {
          if (controller.signal.aborted) return;
          items = results;
          if (!popup) return;

          if (!items.length) {
            popup.innerHTML =
              '<div class="mention-empty">No members found</div>';
            return;
          }

          popup.innerHTML = items
            .map((item, i) => buildItemHtml(item, i))
            .join('');
          bindClicks(props.command);
        })
        .catch((err) => {
          console.warn('[mention] search failed:', err);
          if (!controller.signal.aborted && popup) {
            items = [];
            popup.innerHTML = '<div class="mention-empty">Search error</div>';
          }
        });
    },
    onKeyDown(props: any) {
      if (!items.length) return false;
      if (props.event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex + items.length - 1) % items.length;
        if (popup) {
          popup.innerHTML = items
            .map((item, i) => buildItemHtml(item, i))
            .join('');
          bindClicks(props.command || (() => undefined));
        }
        return true;
      }
      if (props.event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % items.length;
        if (popup) {
          popup.innerHTML = items
            .map((item, i) => buildItemHtml(item, i))
            .join('');
          bindClicks(props.command || (() => undefined));
        }
        return true;
      }
      if (props.event.key === 'Enter' || props.event.key === 'Tab') {
        const item = items[selectedIndex];
        if (item) {
          props.command({ id: item.userId, label: item.username });
          return true;
        }
      }
      if (props.event.key === 'Escape') return true;
      return false;
    },
    onExit() {
      abortRef?.abort();
      unmount?.();
      unmount = null;
      if (popup?.parentNode) popup.parentNode.removeChild(popup);
      popup = null;
    },
  };
}

let abortRef: AbortController | null = null;

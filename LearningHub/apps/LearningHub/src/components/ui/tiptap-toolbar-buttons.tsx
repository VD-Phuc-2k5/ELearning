import type { Editor } from '@tiptap/react';
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  UnderlineIcon,
  Undo2,
} from 'lucide-react';

interface ToolbarButtonConfig {
  icon: React.ReactNode;
  title: string;
  onClick: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
  disabled?: (editor: Editor) => boolean;
}

const baseButtons: ToolbarButtonConfig[] = [
  {
    icon: <Bold className="h-3.5 w-3.5" />,
    title: 'Bold (Ctrl+B)',
    onClick: () => undefined,
    isActive: (e) => e.isActive('bold'),
  },
  {
    icon: <Italic className="h-3.5 w-3.5" />,
    title: 'Italic (Ctrl+I)',
    onClick: () => undefined,
    isActive: (e) => e.isActive('italic'),
  },
  {
    icon: <UnderlineIcon className="h-3.5 w-3.5" />,
    title: 'Underline (Ctrl+U)',
    onClick: () => undefined,
    isActive: (e) => e.isActive('underline'),
  },
  {
    icon: <Strikethrough className="h-3.5 w-3.5" />,
    title: 'Strikethrough',
    onClick: () => undefined,
    isActive: (e) => e.isActive('strike'),
  },
];

const headingButtons: ToolbarButtonConfig[] = [
  {
    icon: <Heading1 className="h-3.5 w-3.5" />,
    title: 'Heading 1',
    onClick: (e) => e.chain().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive('heading', { level: 1 }),
  },
  {
    icon: <Heading2 className="h-3.5 w-3.5" />,
    title: 'Heading 2',
    onClick: (e) => e.chain().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive('heading', { level: 2 }),
  },
  {
    icon: <Heading3 className="h-3.5 w-3.5" />,
    title: 'Heading 3',
    onClick: (e) => e.chain().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive('heading', { level: 3 }),
  },
];

const listButtons: ToolbarButtonConfig[] = [
  {
    icon: <List className="h-3.5 w-3.5" />,
    title: 'Bullet list',
    onClick: (e) => e.chain().toggleBulletList().run(),
    isActive: (e) => e.isActive('bulletList'),
  },
  {
    icon: <ListOrdered className="h-3.5 w-3.5" />,
    title: 'Ordered list',
    onClick: (e) => e.chain().toggleOrderedList().run(),
    isActive: (e) => e.isActive('orderedList'),
  },
  {
    icon: <ListChecks className="h-3.5 w-3.5" />,
    title: 'Task list',
    onClick: (e) => e.chain().toggleTaskList().run(),
    isActive: (e) => e.isActive('taskList'),
  },
];

const blockButtons: ToolbarButtonConfig[] = [
  {
    icon: <Quote className="h-3.5 w-3.5" />,
    title: 'Blockquote',
    onClick: (e) => e.chain().toggleBlockquote().run(),
    isActive: (e) => e.isActive('blockquote'),
  },
  {
    icon: <Code2 className="h-3.5 w-3.5" />,
    title: 'Code block',
    onClick: (e) => e.chain().toggleCodeBlock().run(),
    isActive: (e) => e.isActive('codeBlock'),
  },
  {
    icon: <Minus className="h-3.5 w-3.5" />,
    title: 'Horizontal rule',
    onClick: (e) => e.chain().setHorizontalRule().run(),
    isActive: () => false,
  },
];

const insertButtons: ToolbarButtonConfig[] = [
  {
    icon: <LinkIcon className="h-3.5 w-3.5" />,
    title: 'Insert link',
    onClick: () => undefined,
    isActive: (e) => e.isActive('link'),
  },
  {
    icon: <ImageIcon className="h-3.5 w-3.5" />,
    title: 'Upload image',
    onClick: () => undefined,
    isActive: () => false,
  },
];

const historyButtons: ToolbarButtonConfig[] = [
  {
    icon: <Undo2 className="h-3.5 w-3.5" />,
    title: 'Undo (Ctrl+Z)',
    onClick: (e) => e.chain().undo().run(),
    isActive: () => false,
    disabled: (e) => !e.can().undo(),
  },
  {
    icon: <Redo2 className="h-3.5 w-3.5" />,
    title: 'Redo (Ctrl+Shift+Z)',
    onClick: (e) => e.chain().redo().run(),
    isActive: () => false,
    disabled: (e) => !e.can().redo(),
  },
];

export function getFullToolbarButtons(
  onBold: () => void,
  onItalic: () => void,
  onUnderline: () => void,
  onStrike: () => void,
  onOpenLink: () => void,
  onTriggerFilePicker: () => void,
): Array<ToolbarButtonConfig | 'divider'> {
  return [
    { ...baseButtons[0], onClick: () => onBold() },
    { ...baseButtons[1], onClick: () => onItalic() },
    { ...baseButtons[2], onClick: () => onUnderline() },
    { ...baseButtons[3], onClick: () => onStrike() },
    'divider' as const,
    ...headingButtons,
    'divider' as const,
    ...listButtons,
    'divider' as const,
    ...blockButtons,
    { ...insertButtons[0], onClick: () => onOpenLink() },
    { ...insertButtons[1], onClick: () => onTriggerFilePicker() },
    'divider' as const,
    ...historyButtons,
  ];
}

export function getBubbleToolbarButtons(
  onBold: () => void,
  onItalic: () => void,
  onUnderline: () => void,
  onStrike: () => void,
): ToolbarButtonConfig[] {
  return [
    { ...baseButtons[0], onClick: () => onBold() },
    { ...baseButtons[1], onClick: () => onItalic() },
    { ...baseButtons[2], onClick: () => onUnderline() },
    { ...baseButtons[3], onClick: () => onStrike() },
    {
      icon: <Code2 className="h-3.5 w-3.5" />,
      title: 'Inline code',
      onClick: (e) => e.chain().toggleMark('code').run(),
      isActive: (e) => e.isActive('code'),
    },
  ];
}

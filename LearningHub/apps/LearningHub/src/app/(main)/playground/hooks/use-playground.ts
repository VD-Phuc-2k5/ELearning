import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { executeCodeAction } from '../../../actions/sandbox.actions';
import { useConfirmModal } from '../../../../components/ui';
import { Language } from '../constants/languages';
import {
  DEFAULT_TEMPLATES,
  DEFAULT_WEB_TEMPLATE,
} from '../constants/templates';

export type WebFiles = typeof DEFAULT_WEB_TEMPLATE;

export function usePlayground() {
  const [language, setLanguageState] = useState<Language>('python');
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATES.python);
  const [webFiles, setWebFiles] = useState<WebFiles>(DEFAULT_WEB_TEMPLATE);
  const [stdin, setStdin] = useState<string>('World');
  // Bumped whenever code/webFiles are force-reset from outside the editor
  // (Reset button, confirmed language switch) so the (uncontrolled) editors
  // know to imperatively re-sync instead of on every keystroke.
  const [resetToken, setResetToken] = useState(0);
  const { modal, openConfirm } = useConfirmModal();

  const isDirty = () => {
    if (language === 'web') {
      return (
        webFiles.html !== DEFAULT_WEB_TEMPLATE.html ||
        webFiles.css !== DEFAULT_WEB_TEMPLATE.css ||
        webFiles.js !== DEFAULT_WEB_TEMPLATE.js
      );
    }
    return code !== DEFAULT_TEMPLATES[language];
  };

  const loadTemplate = (lang: Language) => {
    setLanguageState(lang);
    if (lang === 'web') {
      setWebFiles(DEFAULT_WEB_TEMPLATE);
    } else {
      setCode(DEFAULT_TEMPLATES[lang]);
    }
    setResetToken((t) => t + 1);
  };

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    if (isDirty()) {
      openConfirm(
        'Bạn đang có code chưa lưu. Chuyển ngôn ngữ sẽ xóa code hiện tại và tải lại template mới. Bạn có chắc muốn tiếp tục?',
        () => loadTemplate(lang),
        {
          confirmLabel: 'Chuyển ngôn ngữ',
          cancelLabel: 'Ở lại',
          variant: 'primary',
        },
      );
    } else {
      loadTemplate(lang);
    }
  };

  const resetCode = () => {
    if (language === 'web') {
      setWebFiles(DEFAULT_WEB_TEMPLATE);
    } else {
      setCode(DEFAULT_TEMPLATES[language]);
    }
    setResetToken((t) => t + 1);
  };

  // Mutation to execute code
  const executeMutation = useMutation({
    mutationFn: async () => {
      const res = await executeCodeAction({
        language,
        sourceCode: code,
        stdin,
      });
      if (res.success) return res.data;
      throw new Error(res.error);
    },
  });

  const handleRun = () => {
    // 'web' mode renders live in an iframe preview; there is nothing to run
    // through the Docker sandbox for it.
    if (language === 'web') return;
    executeMutation.mutate();
  };

  return {
    language,
    setLanguage,
    code,
    setCode,
    webFiles,
    setWebFiles,
    stdin,
    setStdin,
    executeMutation,
    handleRun,
    resetToken,
    resetCode,
    modal,
  };
}

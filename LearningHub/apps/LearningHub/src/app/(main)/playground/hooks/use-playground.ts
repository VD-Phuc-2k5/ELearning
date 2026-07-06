import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { executeCodeAction } from '../../../actions/sandbox.actions';
import { Language } from '../constants/languages';
import { DEFAULT_TEMPLATES } from '../constants/templates';

export function usePlayground() {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATES.python);
  const [stdin, setStdin] = useState<string>('World');

  // Change templates when language changes
  useEffect(() => {
    setCode(DEFAULT_TEMPLATES[language]);
  }, [language]);

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
    executeMutation.mutate();
  };

  return {
    language,
    setLanguage,
    code,
    setCode,
    stdin,
    setStdin,
    executeMutation,
    handleRun,
  };
}

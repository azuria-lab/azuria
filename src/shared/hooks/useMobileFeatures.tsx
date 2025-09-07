import { useEffect, useState } from 'react';

export const useMobileFeatures = () => {
  const [canShare, setCanShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar se é mobile
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    // Verificar se Web Share API está disponível
    setCanShare(!!navigator.share);
    checkMobile();
  }, []);

  const shareData = async (data: {
    title: string;
    text: string;
    url: string;
  }) => {
    if (!navigator.share) {
      throw new Error('Web Share API não suportada');
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return false; // User cancelled
      }
      throw error;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
  } catch (_error) {
      // Fallback para browsers mais antigos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  };

  return {
    canShare,
    isMobile,
    shareData,
    copyToClipboard
  };
};
export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
  tejaId?: string;
}

export async function shareTejaApp(payload: SharePayload = {}): Promise<{
  success: boolean;
  method: 'native' | 'clipboard' | 'whatsapp';
  message: string;
}> {
  const shareUrl = payload.url || window.location.origin;
  const idText = payload.tejaId ? `\nMy TEJA ID: ${payload.tejaId}` : '';
  const shareTitle = payload.title || 'TEJA Secure Messaging';
  const shareText =
    payload.text ||
    `Join me on TEJA: Zero-knowledge, phone-numberless, end-to-end encrypted messaging with Smart Privacy Blur.${idText}\n`;

  // Try Web Share API first
  if (navigator.share && navigator.canShare && navigator.canShare({ title: shareTitle, text: shareText, url: shareUrl })) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
      return { success: true, method: 'native', message: 'Shared successfully via system sheet.' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'native', message: 'Share cancelled.' };
      }
    }
  }

  // Fallback 1: Clipboard
  try {
    const fullText = `${shareText}\n${shareUrl}`;
    await navigator.clipboard.writeText(fullText);
    return {
      success: true,
      method: 'clipboard',
      message: 'Invitation link and TEJA ID copied to clipboard!'
    };
  } catch (clipErr) {
    // Fallback 2: WhatsApp
    const encoded = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      method: 'whatsapp',
      message: 'Opened WhatsApp share dialog.'
    };
  }
}

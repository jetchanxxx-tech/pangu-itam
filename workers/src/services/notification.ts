// Notification service — Feishu webhook + stubs for DingTalk/WeChat/SMS

export interface NotificationConfig {
  enabled: boolean;
  feishuWebhook: string;
  feishuSecret: string;
}

export class NotificationService {
  constructor(private config: NotificationConfig) {}

  async sendAlert(title: string, content: string): Promise<void> {
    if (!this.config.enabled) return;

    if (this.config.feishuWebhook) {
      await this.sendFeishu(title, content);
    }
  }

  private async sendFeishu(title: string, content: string): Promise<void> {
    const msg = {
      msg_type: 'text',
      content: { text: `[ITAM Alert] ${title}\n${content}` },
    };

    try {
      const resp = await fetch(this.config.feishuWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });

      if (!resp.ok) {
        console.error(`Feishu webhook failed: HTTP ${resp.status}`);
      }
    } catch (err) {
      console.error('Feishu webhook error:', err);
    }
  }
}

export function createNotificationService(env: {
  NOTIFICATION_ENABLE?: string;
  FEISHU_WEBHOOK?: string;
  FEISHU_SECRET?: string;
}): NotificationService {
  return new NotificationService({
    enabled: env.NOTIFICATION_ENABLE === 'true',
    feishuWebhook: env.FEISHU_WEBHOOK ?? '',
    feishuSecret: env.FEISHU_SECRET ?? '',
  });
}

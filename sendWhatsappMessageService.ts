import { injectable } from 'inversify'

import { MessageContracts } from '@domain/models/messages/contracts'

import { WhatsappClient } from '@infra/providers/whatsappApi'

@injectable()
export class SendWhatsappMessageService implements MessageContracts.SendMessage {
  constructor(
    private readonly whatsappClient: WhatsappClient,
    private readonly myPhoneNumber: string,
  ) { }

  async execute({ from, contactsNumbers, body, mediaId, mediaUrl }: MessageContracts.Inputs.ToSend): Promise<any> {
    const direction = this.myPhoneNumber === from
      ? 'outbound-api'
      : 'inbound'

    const textMessageContent = {
      body,
      preview_url: true
    };

    const mediaMessageContent = mediaId ? {
      id: mediaId,
    } : {
      link: mediaUrl,
    };

    const messageType = mediaId || mediaUrl ? 'image' : 'text';
    const messageContent = mediaId || mediaUrl ? mediaMessageContent : textMessageContent;

    const messagesPromises = contactsNumbers.map(async (contactsNumber: string) =>
      await this.whatsappClient.connection.post(
        `/${this.myPhoneNumber}/messages`,
        {
          messaging_product: 'whatsapp',
          to: contactsNumber,
          type: messageType,
          [messageType]: messageContent,
        },
      )
        .then(async (messageResponse) => {
          return await new Promise(resolve => setTimeout(() => resolve(messageResponse?.data), 1000));
        })
    );

    return await Promise.all(messagesPromises);
  }
}

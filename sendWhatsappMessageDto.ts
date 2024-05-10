import { array, object, string } from 'yup'

import { MessageModel } from '@domain/models/messages/models'

const matchPhone = /^\d{4}[\s-]?[\s9]?\d{4}-?\d{4}$/

const schema = object().shape({
  to: array().of(string().matches(matchPhone).required()).min(1, '"to" field cannot be an empty array.').required(),
  userId: string().required(),
  mediaId: string().required().optional(),
  mediaUrl: string().required().optional(),
  body: string().when(['mediaId', 'mediaUrl'], {
    is: (mediaId: string, mediaUrl: string) => 
      !mediaId && !mediaUrl,
    then: (schem) => schem.required(),
  }),
})

export class SendWhatsappMessageDto {
  constructor (
    public to: string[],
    public userId: string,
    public body?: string,
    public mediaId?: string,
    public mediaUrl?: string,
  ) {}

  static from (message: MessageModel.Base): SendWhatsappMessageDto {
    const { to, userId, body, mediaId, mediaUrl } = schema.validateSync(message)
    return new SendWhatsappMessageDto(to, userId, body, mediaId, mediaUrl)
  }
}

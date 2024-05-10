import { Response } from 'express'
import { inject } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'

import { domain } from '@domain/common/ioc'
import { MessageContracts } from '@domain/models/messages/contracts'

import { infra } from '@infra/common/ioc'
import { ServerErrorResponse, SuccessResponse } from '@infra/common/http'
import { Paths } from '@infra/common/base/controllerBasePaths'
import { BaseRequest } from '@infra/common/base'
import { SendMessageDto } from '@infra/dto/http/message/send'
import { ValidateMiddleware } from '@infra/middlewares/validation'
import { HeadersMiddleware } from '@infra/middlewares/headers'

@controller(Paths.whatsAppSend)
export class SendWhatsappMessageController {
  constructor (
    @inject(domain.services.whatsapp.send)
    private readonly sendMessage: MessageContracts.SendMessage,
    @inject(infra.environment.phoneNumber)
    private readonly myPhoneNumber: string
  ) {}

  @httpPost(
    '/',
    HeadersMiddleware.make(),
    ValidateMiddleware.withHeaders(SendMessageDto)
  )
  async handler ({ body }: BaseRequest<SendMessageDto>, response: Response) {
    try {
      const message = await this.sendMessage.execute({
        from: this.myPhoneNumber,
        to: body.to,
        body: body.body,
        mediaId: body.mediaId,
        mediaUrl: body.mediaUrl,
        userId: body.userId,
      })
      const successResponse = SuccessResponse.create({ body: message })
      return response.status(successResponse.status).json(successResponse.body)
    } catch (error) {
      const serverErrorResponse = ServerErrorResponse.create(error as Error)
      return response.status(serverErrorResponse.status).json(serverErrorResponse.body)
    }
    
  }
}

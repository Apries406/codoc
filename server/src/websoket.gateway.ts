import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebsocketProvider } from 'y-websocket';

import * as Y from 'yjs';
import * as WebSocket from 'ws';

@WebSocketGateway()
export class YjsGateway { 
  @WebSocketServer() server: PropertyDecorator
  yDoc = new Y.Doc()
  provider: WebsocketProvider

  constructor() { 
    this.provider = new WebsocketProvider('ws://localhost:7001', 'codoc', this.yDoc, {
      WebSocketPolyfill: WebSocket,
    })
  }

  @SubscribeMessage('connectUser') 
  handleConnection(client: any, payload: any):string {
    console.log('User connected', payload)

    return 'Connected to Yjs Websocket with Slate'
  }
  

  @SubscribeMessage('disconnectUser')
  handleDisconnection(client: any): string {
    console.log('User disconnected')

    return 'Disconnected from Yjs Websocket with Slate'
  }

}
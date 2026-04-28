import { io, Socket } from 'socket.io-client';

declare module 'socket.io-client' {
  interface Socket {
    on(event: string, callback: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    disconnect(): this;
    connect(): this;
  }
}

export { io, Socket };

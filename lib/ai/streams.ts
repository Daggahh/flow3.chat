import { createParser, type EventSourceParser, type ParserCallbacks, type EventSourceMessage } from 'eventsource-parser';


export class AIStream extends TransformStream {
  constructor(res: Response) {
    let encoder = new TextEncoder();
    let decoder = new TextDecoder();

    super({
      async start(controller) {
        // Handle non-streaming responses
        if (!res.body) {
          const text = await res.text();
          controller.enqueue(encoder.encode(text));
          controller.terminate();
          return;
        }

        const parser = createParser({
          onEvent(event: EventSourceMessage) {
            if (event.data) {
              controller.enqueue(encoder.encode(event.data + '\n'));
            }
          },
          onError(err) {
            controller.error(err);
          }
        });

        const reader = res.body.getReader();
        
          try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            parser.feed(text);
          }
        } catch (e) {
          console.error('Error reading from response:', e);
          controller.error(e);
        } finally {
          reader.releaseLock();
          controller.terminate();
        }
      },

      transform(chunk: Uint8Array, controller) {
        controller.enqueue(chunk);
      },
    });
  }

  static fromData(data: string | string[]) {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        if (Array.isArray(data)) {
          data.forEach((chunk) => {
            controller.enqueue(encoder.encode(chunk));
          });
        } else {
          controller.enqueue(encoder.encode(data));
        }
        controller.close();
      },
    });
  }

  static fromReadableStream(stream: ReadableStream<Uint8Array | string>) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    return new TransformStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (typeof value === 'string') {
              controller.enqueue(encoder.encode(value));
            } else {
              controller.enqueue(value);
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          reader.releaseLock();
          controller.terminate();
        }
      },
      transform(chunk: Uint8Array, controller) {
        controller.enqueue(chunk);
      },
    });
  }
}
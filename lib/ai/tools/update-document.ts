import { DataStreamWriter, tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById, saveDocument } from '@/lib/db/queries';
import {
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';
import { createTextDocumentHandler } from '@/artifacts/text/server';
import { createCodeDocumentHandler } from '@/artifacts/code/server';
import { createSheetDocumentHandler } from '@/artifacts/sheet/server';

interface UpdateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
  customApiKeys?: Record<string, string | undefined>;
  modelId?: string;
}

export const updateDocument = ({ session, dataStream, customApiKeys = {}, modelId = 'gpt-4o' }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: 'Document not found',
        };
      }

      dataStream.writeData({
        type: 'clear',
        content: document.title,
      });

      let documentHandler;
      if (document.kind === 'text') {
        documentHandler = createTextDocumentHandler(customApiKeys, modelId);
      } else if (document.kind === 'code') {
        documentHandler = createCodeDocumentHandler(customApiKeys, modelId);
      } else if (document.kind === 'sheet') {
        documentHandler = createSheetDocumentHandler(customApiKeys, modelId);
      } else {
        documentHandler = documentHandlersByArtifactKind.find(
          (documentHandlerByArtifactKind) =>
            documentHandlerByArtifactKind.kind === document.kind,
        );
      }

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }
      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream,
        session,
      });
      dataStream.writeData({ type: 'finish', content: '' });
      return {
        id,
        title: document.title,
        kind: document.kind,
        content: 'The document has been updated successfully.',
      };
    },
  });
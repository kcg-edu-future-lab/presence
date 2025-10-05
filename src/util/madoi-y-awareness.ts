import * as Y from 'yjs'
import * as authProtocol from 'y-protocols/auth';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import { EnterRoomAllowedDetail, Madoi } from 'madoi-client';
import { fromBase64, toBase64 } from './Util';

const messageSync = 0
const messageQueryAwareness = 3
const messageAwareness = 1
const messageAuth = 2

export class MadoiAwarenessAdapter{
    private _doc: Y.Doc;
    private _awareness: any;
    private _awarenessSynced = false;

    constructor(madoi: Madoi, doc: Y.Doc){
        this._doc = doc;
        this.awareness = new awarenessProtocol.Awareness(doc);
        this.awareness.on('update', ({ added, updated, removed }: any, _origin: any) => {
            const changedClients = added.concat(updated).concat(removed)
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, messageAwareness)
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
            );
            madoi.othercast("awareness", toBase64(encoding.toUint8Array(encoder)));
        });
        madoi.addReceiver("awareness", ({detail: {content}})=>{
          const encoder = readMessage(this, new Uint8Array(fromBase64(content as string)), true)
          if (encoding.length(encoder) > 1) {
            madoi.othercast("awareness", toBase64(encoding.toUint8Array(encoder)));
          }
        });
    }

    get doc(){
        return this._doc;
    }

    get awareness(){
        return this._awareness;
    }

    set awareness(v){
        this._awareness = v;
    }

    get awarenessSynced(){
        return this._awarenessSynced;
    }

    set awarenessSynced(v: boolean){
        this._awarenessSynced = v;
    }

    onEnterRoomAllowed(detail: EnterRoomAllowedDetail, madoi: Madoi){
        // always send sync step 1 when connected
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeSyncStep1(encoder, this.doc)
        madoi.othercast("awareness", toBase64(encoding.toUint8Array(encoder)))
        // broadcast local awareness state
        if (this.awareness.getLocalState() !== null) {
            const encoderAwarenessState = encoding.createEncoder()
            encoding.writeVarUint(encoderAwarenessState, messageAwareness)
            encoding.writeVarUint8Array(
              encoderAwarenessState,
              awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
                this.doc.clientID
              ])
            )
            madoi.othercast("awareness", toBase64(encoding.toUint8Array(encoderAwarenessState)))
        }
    }
}

const messageHandlers: Function[] = [];
messageHandlers[messageSync] = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  origin: MadoiAwarenessAdapter,
  emitSynced: any,
  _messageType: any
) => {
  encoding.writeVarUint(encoder, messageSync)
  const syncMessageType = syncProtocol.readSyncMessage(
    decoder,
    encoder,
    origin.doc,
    origin
  )
  if (
    emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2 &&
    !origin.awarenessSynced
  ) {
    origin.awarenessSynced = true
  }
};

messageHandlers[messageQueryAwareness] = (
  encoder: encoding.Encoder,
  _decoder: decoding.Decoder,
  origin: MadoiAwarenessAdapter,
  _emitSynced: any,
  _messageType: any
) => {
  encoding.writeVarUint(encoder, messageAwareness)
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      origin.awareness,
      Array.from(origin.awareness.getStates().keys())
    )
  )
};

messageHandlers[messageAwareness] = (
  _encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  origin: MadoiAwarenessAdapter,
  _emitSynced: any,
  _messageType: any
) => {
  awarenessProtocol.applyAwarenessUpdate(
    origin.awareness,
    decoding.readVarUint8Array(decoder),
    origin
  )
};

messageHandlers[messageAuth] = (
  _encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  origin: MadoiAwarenessAdapter,
  _emitSynced: any,
  _messageType: any
) => {
  authProtocol.readAuthMessage(
    decoder,
    origin.doc,
    (_ydoc, reason) => permissionDeniedHandler(origin, reason)
  )
}

const permissionDeniedHandler = (provider: any, reason: any) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`)

const readMessage = (origin: MadoiAwarenessAdapter, buf: Uint8Array<ArrayBufferLike>, emitSynced: any) => {
  const decoder = decoding.createDecoder(buf)
  const encoder = encoding.createEncoder()
  const messageType = decoding.readVarUint(decoder)
  const messageHandler = messageHandlers[messageType];
  if (/** @type {any} */ (messageHandler)) {
    messageHandler(encoder, decoder, origin, emitSynced, messageType)
  } else {
    console.error('Unable to compute message')
  }
  return encoder
}

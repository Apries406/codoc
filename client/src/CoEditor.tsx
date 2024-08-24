import { withYjs, YjsEditor } from '@slate-yjs/core'
import { useEffect, useMemo, useState } from 'react'
import {  createEditor, Editor, Transforms } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

const initialValue = [{
  type: 'text',
  children: [
    { text: 'This is editable text.' },
  ]
}]

const SlateEditor = ({ sharedType, provider }) => {
  
  const editor = useMemo(() => {
    const e = withReact(withYjs(createEditor(), sharedType))

    // Ensure editor always has at least 1 valid child
    const { normalizeNode } = e
    e.normalizeNode = entry => {
      const [node] = entry

      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry)
      }

      Transforms.insertNodes(editor, initialValue, { at: [0] })
    }

    return e
  }, [])


  useEffect(() => {
    YjsEditor.connect(editor)
    return () => YjsEditor.disconnect(editor)
  }, [editor])


  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  )
}

const CoEditor = () => {

  const [connected, setConnected] = useState(false)
  const [sharedType, setSharedType] = useState<Y.XmlText>()
  const [provider, setProvider] = useState<WebsocketProvider>()

  useEffect(() => {
    const yDoc = new Y.Doc()
    const sharedDoc = yDoc.get('shared', Y.XmlText)

    const yProvider = new WebsocketProvider('ws://localhost:7001', 'codoc', yDoc);
    
    yProvider.on('connect', setConnected)
    console.log('Connected -- [' + yProvider.wsconnected + ']\n')
    setSharedType(sharedDoc)
    setProvider(yProvider)

    return () => {
      yProvider?.off('connect', setConnected)
      yDoc?.destroy() 
      yProvider?.destroy()
    }
  },[])

  if (!connected || !provider || !sharedType) {
    return <div>Loading...</div>
  }

  return <SlateEditor sharedType={sharedType} provider={provider} />
}

export default CoEditor


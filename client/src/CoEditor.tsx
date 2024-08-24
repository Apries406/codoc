import { YjsEditor } from '@slate-yjs/core'
import { useEffect, useMemo, useState } from 'react'
import { BaseEditor, createEditor, Editor, Transforms } from 'slate'
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
  const [shareType, setShareType] = useState<Y.XmlText>()
  const [provider, setProvider] = useState<WebsocketProvider>()

  useEffect(() => {
    const yDoc = new Y.Doc()
    const sharedDoc = yDoc.get('shared', Y.XmlText)


    const yProvider = new WebsocketProvider('ws://localhost:7001', 'codoc', yDoc)
    
    yProvider.on('connectUser', setConnected)
    yProvider.
    setShareType(sharedDoc)
    setProvider(yProvider)

    return () => {
      yDoc?.destroy()
      yProvider?.off('disconnectUser', setConnected)
      yProvider?.destroy()
    }
  },[])

  if (!connected || !provider || !shareType) {
    return <div>Loading...</div>
  }

  return <SlateEditor sharedType={shareType} provider={provider} />
}

export default CoEditor


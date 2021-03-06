import { JumpFm, File } from 'jumpfm-api'
import * as path from 'path'
import Auth from './Auth'
import Gmail from './Gmail'


export const load = (jumpfm: JumpFm) => {
    const getAttachments = (obj: any): File[] => {
        if (obj.filename && obj.body && obj.body.attachmentId) {
            const id = obj.body.attachmentId
            return [{
                name: obj.filename
                , path: id
                , isDirectory: () => false
                , open: () => {
                    // TODO
                    console.log('open', id)
                }
            }]
        }

        if (obj.payload) return getAttachments(obj.payload)
        const res = []
        if (!obj.parts) return res
        obj.parts.forEach(part => {
            res.push.apply(res, getAttachments(part))
        })
        return res
    }

    jumpfm.panels.forEach(panel => {
        panel.onCd(() => {
            if (panel.getUrl().protocol != 'gmail') return
            const items = []
            new Auth().getToken()
                .then(auth => {
                    const gmail = new Gmail(auth)
                    gmail.query('filename:pdf', 10)
                        .then(msgs => {
                            Promise.all(msgs.map(msg => gmail.get(msg.id)))
                                .then(as => {
                                    as.forEach(a =>
                                        items.push.apply(items, getAttachments(a))
                                    )
                                    console.log('AS', as, items)
                                    panel.setItems(items)
                                })
                        })
                })
        })

        panel.bind('gmail', ['g'], () => {
            panel.cd({
                protocol: 'gmail'
                , path: '/'
                , query: {}
            })
        })
    })
}
// function listMail(auth) {
//     gmail.users.messages.list({
//         auth: auth
//         , userId: 'me'
//         , q: 'has:attachment AND filename:pdf'
//         , maxResults: 10
//     }, (err, res) => {
//         console.log(err, res)
//         const groups: Set<Set<string>> = new Set()
//         res.messages.forEach(msg => {
//             gmail.users.messages.get({
//                 auth: auth
//                 , userId: 'me'
//                 , id: msg.id
//                 , format: 'raw'
//             }, (err, res) => {
//                 simpleParser(base64url.decode(res.raw))
//                     .then(mail => {
//                         try {
//                             const emails: Set<string>
//                                 = new Set(mail.to.value.map(val => val.address))
//                             mail.from.value.forEach(val => emails.add(val.address))
//                             groups.add(emails)
//                             console.log(emails, groups.size)
//                         } catch (e) {
//                             console.log(e)
//                         }
//                     })
//             })
//         })
//     })
// }

import google = require('googleapis')

class Gmail {
    private readonly gmail = google.gmail('v1')
    private readonly auth

    constructor(auth) {
        this.auth = auth
    }

    query = (q, maxResults = 100) => new Promise<{ id: string }[]>((res, rej) => {
        this.gmail.users.messages.list({
            auth: this.auth
            , userId: 'me'
            , q: q
            , maxResults: maxResults
            , fields: 'messages/id'
        }, (err, result) => {
            if (err) return rej(err)
            res(result.messages)
        })
    })

    get = (id: string) => new Promise((res, rej) => {
        this.gmail.users.messages.get({
            auth: this.auth
            , userId: 'me'
            , id: id
            , fields: 'payload(body/attachmentId,filename,parts(body/attachmentId,filename,parts))'
        }, (err, result) => {
            if (err) return rej(err)
            res(result)
        })
    })
}

export default Gmail
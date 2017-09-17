import { JumpFm } from 'jumpfm-api'
import * as path from 'path'
import { gmail } from './gmail'


// function authorize(callback) {
//     try {
//         const token = require(pathToken)
//         oauth2Client.credentials = token
//         callback(oauth2Client)
//     } catch (e) {
//         console.log(e)
//         getNewToken(callback)
//     }
// }

// function sendMail(auth) {
//     const opts: SendMailOptions = {
//         from: 'gilad.kutiel@gmail.com'
//         , to: 'gilad.kutiel@gmail.com'
//         , subject: 'Test'
//         , attachments: [
//             {
//                 filename: 'README.txt'
//                 , content: 'Thank you for reading'
//             }
//         ]
//     }

//     const mail = new MailComposer(opts)

//     const stream = mail.compile().build((err, msg) => {
//         const req = gmail.users.messages.send({
//             auth: auth
//             , userId: 'me'
//             , resource: {
//                 raw: base64url.encode(msg)
//             }
//         })
//     })
// }

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


export const load = (jumpfm: JumpFm) => {
    const opn = (url: string) => () => jumpfm.electron.shell.openItem(url)
    const config = path.join(jumpfm.root, 'gmail_attachments.json')

    console.log('gmail')
    jumpfm.statusBar.buttonAdd(
        'fa-paperclip'
        , 'gmail attachments'
        , opn(config)
    )

    jumpfm.panels.forEach(panel => {
        panel.bind('gmail', ['g'], () => {
            console.log('gmail')
        })
    })

    console.log(gmail.getAuthUrl())
}
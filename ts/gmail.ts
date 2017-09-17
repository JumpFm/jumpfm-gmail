import * as path from 'path'
import * as http from 'http'
import * as url from 'url'
// import { SendMailOptions } from 'nodemailer'
// import base64url from "base64url"
// import * as MailComposer from 'nodemailer/lib/mail-composer'
// import * as mailparser from 'mailparser'
// import * as google from 'googleapis'
// import * as fs from 'fs'
// import * as readline from 'readline'
// import * as homedir from 'homedir'

// const simpleParser = mailparser.simpleParser
// const g = google.gmail('v1')

export module gmail {
    const folders = [
        {
            name: 'pdfs'
            , query: ''
            , fileName: ''
        }
    ]

    const port = 8979
    const pathRoot = path.join(__dirname, '..')
    const pathToken = path.join(pathRoot, 'token.json')

    const pathClient = require(path.join(pathRoot, 'client_secret.json'))
    const clientSecret = pathClient.installed.client_secret
    const clientId = pathClient.installed.client_id
    const redirectUrl = pathClient.installed.redirect_uris[0]
    const googleAuth = require('google-auth-library')
    const auth = new googleAuth()
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

    const server = http.createServer((req, res) => {
        const q = url.parse(req.url, true).query
        console.log(q.code)
        res.write('done')
        res.end()
    })

    server.listen(8979)
    export function getAuthUrl() {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline'
            , scope: [
                'https://www.googleapis.com/auth/gmail.readonly'
            ]
        })
    }
}
//     console.log('Authorize this app by visiting this url: ', authUrl)

//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     })

//     rl.question('Enter the code from that page here: ', (code) => {
//         rl.close()
//         oauth2Client.getToken(code, function (err, token) {
//             if (err) {
//                 console.log('Error while trying to retrieve access token', err)
//                 return
//             }
//             oauth2Client.credentials = token
//             fs.writeFile(pathToken, JSON.stringify(token, null, 4))
//             console.log('Token stored to ' + pathToken)
//             callback(oauth2Client)
//         })
//     })
// }

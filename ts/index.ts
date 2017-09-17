import { JumpFm } from 'jumpfm-api'
import { SendMailOptions } from 'nodemailer'
import base64url from "base64url"
import * as MailComposer from 'nodemailer/lib/mail-composer'
import * as mailparser from 'mailparser'
import * as google from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import * as homedir from 'homedir'

const simpleParser = mailparser.simpleParser
const googleAuth = require('google-auth-library')
const gmail = google.gmail('v1')

const pathRoot = path.join(__dirname, '..')
const pathToken = path.join(pathRoot, 'token.json')
const pathClient = require(path.join(pathRoot, 'client_secret.json'))

const clientSecret = pathClient.installed.client_secret
const clientId = pathClient.installed.client_id
const redirectUrl = pathClient.installed.redirect_uris[0]
const auth = new googleAuth()
const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

function authorize(callback) {
    try {
        const token = require(pathToken)
        oauth2Client.credentials = token
        callback(oauth2Client)
    } catch (e) {
        console.log(e)
        getNewToken(callback)
    }
}

function getNewToken(callback) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/gmail.readonly'
            , 'https://www.googleapis.com/auth/gmail.send'
        ]
    })
    console.log('Authorize this app by visiting this url: ', authUrl)

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err)
                return
            }
            oauth2Client.credentials = token
            fs.writeFile(pathToken, JSON.stringify(token, null, 4))
            console.log('Token stored to ' + pathToken)
            callback(oauth2Client)
        })
    })
}

function sendMail(auth) {
    const opts: SendMailOptions = {
        from: 'gilad.kutiel@gmail.com'
        , to: 'gilad.kutiel@gmail.com'
        , subject: 'Test'
        , attachments: [
            {
                filename: 'README.txt'
                , content: 'Thank you for reading'
            }
        ]
    }

    const mail = new MailComposer(opts)

    const stream = mail.compile().build((err, msg) => {
        const req = gmail.users.messages.send({
            auth: auth
            , userId: 'me'
            , resource: {
                raw: base64url.encode(msg)
            }
        })
    })
}

function listMail(auth) {
    gmail.users.messages.list({
        auth: auth
        , userId: 'me'
        , q: 'has:attachment AND filename:pdf'
        , maxResults: 10
    }, (err, res) => {
        console.log(err, res)
        const groups: Set<Set<string>> = new Set()
        res.messages.forEach(msg => {
            gmail.users.messages.get({
                auth: auth
                , userId: 'me'
                , id: msg.id
                , format: 'raw'
            }, (err, res) => {
                simpleParser(base64url.decode(res.raw))
                    .then(mail => {
                        try {
                            const emails: Set<string>
                                = new Set(mail.to.value.map(val => val.address))
                            mail.from.value.forEach(val => emails.add(val.address))
                            groups.add(emails)
                            console.log(emails, groups.size)
                        } catch (e) {
                            console.log(e)
                        }
                    })
            })
        })
    })
}

export const load = (jumpfm: JumpFm) => {
    console.log('gmail')
    jumpfm.panels.forEach(panel => {
        panel.bind('gmail', ['g'], () => {
            console.log('gmail')
        })
    })
}
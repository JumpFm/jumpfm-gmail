import { SendMailOptions } from 'nodemailer'
import base64url from "base64url"
import * as MailComposer from 'nodemailer/lib/mail-composer'
import * as google from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import * as homedir from 'homedir'

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
        const m = base64url(msg)
        console.log(m)

        const req = gmail.users.messages.send({
            auth: auth
            , userId: 'me'
            , resource: {
                raw: m
            }
        })
    })
}

function listMail(auth) {
    gmail.users.messages.list({
        auth: auth
        , userId: 'me'
    }, (err, res) => console.log(err, res))
}

authorize(listMail)
import googleAuth = require('google-auth-library')
import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs'
import * as path from 'path'


class Auth {
    readonly pathToken = path.join(__dirname, 'token.json')
    readonly port = 8979
    readonly auth = new googleAuth()
    readonly oauth2Client = new this.auth.OAuth2(
        '98275952631-kp818ufv70mq70om41stfd761jn6c5b2.apps.googleusercontent.com'
        , 'DWLUOVwAy8xtoexPPgB7L-Cg'
        , `http://127.0.0.1:${this.port}`
    )

    private getAuthUrl = () => {
        return this.oauth2Client.generateAuthUrl({
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly'
            ]
        })
    }

    saveToken = (token) => {
        fs.writeFileSync(this.pathToken, JSON.stringify(token, null, 2))
    }

    loadToken = () => {
        try {
            console.log('loading', this.pathToken)
            return require(this.pathToken)
        } catch (e) {
            console.log(e)
        }
    }

    getToken = () =>
        new Promise((res, rej) => {
            const token = this.loadToken()
            if (token) {
                this.oauth2Client.credentials = token
                return res(this.oauth2Client)
            }

            const server = http.createServer((req, response) => {
                response.end(`<html><script>window.close()</script></html>`)
                const code = url.parse(req.url, true).query.code
                this.oauth2Client.getToken(code, (err, token) => {
                    if (err) return rej(err)
                    this.saveToken(token)
                    this.oauth2Client.credentials = token
                    res(this.oauth2Client)
                })
                server.close()
            })

            server.listen(this.port)

            open(this.getAuthUrl())
        })
}

export default Auth
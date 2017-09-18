import googleAuth = require('google-auth-library')
import * as http from 'http'
import * as url from 'url'


class Auth {
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

    getToken = () =>
        new Promise<string>((ret, rej) => {
            const server = http.createServer((req, res) => {
                res.end(`<html><script>window.close()</script></html>`)
                const code = url.parse(req.url, true).query.code
                this.oauth2Client.getToken(code, (err, token) => {
                    (err && rej(err)) || ret(token)
                })
                server.close()
            })

            server.listen(this.port)

            open(this.getAuthUrl())
        })
}

export default Auth
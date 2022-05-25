import https from 'https'
import http from 'http'

class Mirror {
  #httpRequest (url) {
    return new Promise((resolve, reject) => {
      https.get(url, res => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`statusCode=${res.statusCode}`));
        }
        let response = []
        res.on('data', chunk => {
          response.push(chunk)
        })
        res.on('end', () => {
          try {
            response = Buffer.concat(response).toString()
          } catch (err) {
            reject(err)
          }
          resolve(response)
        })
      })
    })
  }

  #requestListener = async (req, res) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers)
      res.end()
      return
    }
    if (req.method === 'GET') {
      const response = await this.#httpRequest(process.env.TARGET)
      res.writeHead(200, headers)
      res.end(response)
      return
    }

    res.writeHead(405, headers)
    res.end(`${req.method} is not allowed for the request.`)
  }

  listener (port) {
    const server = http.createServer(this.#requestListener)
    server.listen(port, () => {
      process.stdout.write(`Server running on ${port}`)
    })
  }
}

const server = new Mirror()
server.listener(process.env.PORT)

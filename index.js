const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const http = require('http')

// SERVER
const PORT = 3300

const server = http.createServer((req, res) => {

  console.log(req.url, req.method)

  switch (req.url) {
    case '/':
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')

      authorize().then(readData).then(rows => {

        let persons = []
        rows.forEach(el => {
          let person = {}
          person.id = el[0]
          person.full_name = el[1]
          person.age = el[2]
          person.military = el[3]      
          person.place = el[4]
          person.profession = el[5]
          person.current = el[6]
          person.marital = el[7]    
          person.habits = el[8]
          person.extras = el[9]
          person.obschestroy = el[10]
          person.personal = el[11]      
          person.transport = el[12]
          person.devices = el[13]
          person.education = el[14]
          person.equipment = el[15]  
          person.motivation = el[16]
          person.trips = el[17]
          person.description = el[18]
          person.show = el[19]  
          
          persons.push(person)
        })

        res.write(JSON.stringify(persons))
        res.end()
      })      
      break;
    case '/create': {
      //POST
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {

      authorize().then(auth => {
          createData(auth, body, res)
        })
      })   
      break;
    }
    case '/update': {
      //POST
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {

      authorize().then(auth => {
          updateData(auth, body, res)
        })
      })   
      break;
    }
    default:
      console.log('Какая-то ерунда')
      res.end() 
      break;
  }
  
})

server.listen(PORT, 'localhost', (error) => {
  error ? console.log(error) : console.log(`Server is listening on port ${PORT}`)
})

function mapTable(item) {
  switch (item) {
    case 'id':
      return 'A'
    case 'full_name':
      return 'B'
    case 'age':
      return 'C'
    case 'military':
      return 'D'
    case 'place':
      return 'E'  
    case 'profession':
      return 'F'
    case 'current':
      return 'G'
    case 'marital':
      return 'H'
    case 'habits':
      return 'I' 
    case 'extras':
      return 'J'
    case 'obschestroy':
      return 'K'
    case 'personal':
      return 'L'
    case 'transport':
      return 'M'  
    case 'devices':
      return 'N'
    case 'education':
      return 'O'
    case 'equipment':
      return 'P'
    case 'motivation':
      return 'Q' 
    case 'trips':
      return 'R'
    case 'description':
      return 'S'
    case 'show':
      return 'T' 
    default:
      break;
  }
}



// END SERVER



// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1hVmPcwnSseczcMSkAgyDKhkdoA1gvrTbDKWKrQbeoa0/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

// READ

async function readData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '1hVmPcwnSseczcMSkAgyDKhkdoA1gvrTbDKWKrQbeoa0',
    range: 'A2:T',
  });
  const tempRows = res.data.values
  const rows = tempRows.filter(row => parseInt(row[19]) > 0)
  console.log(rows)
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  return rows
}

// CREATE

function createData(auth, body, res) {

  const sheets = google.sheets({ version: 'v4', auth });

  let newPerson = []

  const value = JSON.parse(body).value
  for (let key in value) {
    newPerson.push(value[key])
  }

  const values = [
    newPerson
  ]

  const sheetId = 'map!'
  const column = 'A'
  const range = sheetId + column + 1
  const resource = {
    values
  };

  sheets.spreadsheets.values.append(
    {
      spreadsheetId: '1hVmPcwnSseczcMSkAgyDKhkdoA1gvrTbDKWKrQbeoa0',
      range: range,
      valueInputOption: 'RAW',
      resource: resource,
    },
    (err, result) => {
      if (err) {
        // Handle error
        console.log(err)
      } else {
        
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
  
          res.write(result.status.toString())
          res.end()
        
      }
    }
  )

}

// UPDATE

function updateData(auth, body, res) {

  const sheets = google.sheets({ version: 'v4', auth });
  let values = [
    [`${JSON.parse(body).value}`],
    // Potential next row
  ];

  const sheetId = 'map!'
  const column = mapTable(JSON.parse(body).item)
  const range = sheetId + column + JSON.parse(body).str
  const resource = {
    values,
  };

  sheets.spreadsheets.values.update(
    {
      spreadsheetId: '1hVmPcwnSseczcMSkAgyDKhkdoA1gvrTbDKWKrQbeoa0',
      range: range,
      valueInputOption: 'RAW',
      resource: resource,
    },
    (err, result) => {
      if (err) {
        // Handle error
        console.log(err)
      } else {
        
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
  
          res.write(result.status.toString())
          res.end()
        
      }
    }
  )

}

//authorize().then(readData).catch(console.error);
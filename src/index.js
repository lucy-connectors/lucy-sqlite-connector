const process = require('process');
const {LucyConnector} = require('lucy-node-sdk');
const sqlite3 = require('sqlite3').verbose();

const ConnectorName='SqliteConnector';
let db = new sqlite3.Database('/tmp/building-data.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database');
});
async function executeQuery(query) {
    return new Promise((resolve,reject)=>{
        db.serialize(() => {
            let results = [];
            db.all(query, (err, rows) => {
                if (err) {
                    reject(err.message);
                }
                resolve(rows);
            });
        });
    });
}
async function processRequest(payload) {
    try {

        let obj = JSON.parse(payload);
        if (obj.function == 'sqlquery') {
            let queryResults = await executeQuery(obj.query);
            console.log('returning', queryResults);
            return { result: queryResults, count: queryResults.length };
        }
        throw 'Unknown function: ' + obj.function;
    } catch (e) {
        return { result: e }
    }

}
const connector = LucyConnector.fromInstallationKey(process.env.LUCY_CONNECTOR_KEY,ConnectorName,processRequest);
connector.init().then(()=>{

    console.log('Connector initialized');
});